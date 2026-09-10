import { fail, redirect } from '@sveltejs/kit';
import { randomInt } from 'node:crypto';
import type { Actions, PageServerLoad } from './$types';

async function requireTeam(locals: App.Locals) {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (!user) {
		throw redirect(303, '/');
	}

	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('id, username, email, avatar_url, role')
		.eq('id', user.id)
		.single();

	if (error || !profile || !['admin', 'moderator'].includes(profile.role ?? '')) {
		throw redirect(303, '/');
	}

	return {
		user,
		profile
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await requireTeam(locals);

	const { data: verlosungen, error: verlosungenError } = await locals.supabase
		.from('verlosungen')
		.select(
			`
				id,
				title,
				prize,
				description,
				start_at,
				end_at,
				max_winners,
				created_by,
				updated_by,
				created_at,
				updated_at
			`
		)
		.order('created_at', { ascending: false });

	if (verlosungenError) {
		console.error('Verlosungen konnten nicht geladen werden:', verlosungenError);

		return {
			currentProfile: profile,
			verlosungen: [],
			error: 'Verlosungen konnten nicht geladen werden.'
		};
	}

	const verlosungIds = (verlosungen ?? []).map((verlosung) => verlosung.id);

	let participants: any[] = [];
	let winners: any[] = [];

	if (verlosungIds.length > 0) {
		const { data: participantData, error: participantError } = await locals.supabase
			.from('verlosung_participants')
			.select(
				`
					id,
					verlosung_id,
					user_id,
					created_at
				`
			)
			.in('verlosung_id', verlosungIds)
			.order('created_at', { ascending: true });

		if (participantError) {
			console.error('Teilnehmer konnten nicht geladen werden:', participantError);
		} else {
			participants = participantData ?? [];
		}

		const { data: winnerData, error: winnerError } = await locals.supabase
			.from('verlosung_winners')
			.select(
				`
					id,
					verlosung_id,
					user_id,
					position,
					drawn_by,
					drawn_at
				`
			)
			.in('verlosung_id', verlosungIds)
			.order('position', { ascending: true });

		if (winnerError) {
			console.error('Gewinner konnten nicht geladen werden:', winnerError);
		} else {
			winners = winnerData ?? [];
		}
	}

	const profileIds = new Set<string>();

	for (const verlosung of verlosungen ?? []) {
		if (verlosung.created_by) {
			profileIds.add(verlosung.created_by);
		}

		if (verlosung.updated_by) {
			profileIds.add(verlosung.updated_by);
		}
	}

	for (const participant of participants) {
		if (participant.user_id) {
			profileIds.add(participant.user_id);
		}
	}

	for (const winner of winners) {
		if (winner.user_id) {
			profileIds.add(winner.user_id);
		}

		if (winner.drawn_by) {
			profileIds.add(winner.drawn_by);
		}
	}

	let profiles: any[] = [];

	if (profileIds.size > 0) {
		const { data: profileData, error: profilesError } = await locals.supabase
			.from('profiles')
			.select(
				`
					id,
					username,
					email,
					avatar_url,
					role
				`
			)
			.in('id', [...profileIds]);

		if (profilesError) {
			console.error('Profile konnten nicht geladen werden:', profilesError);
		} else {
			profiles = profileData ?? [];
		}
	}

	const profilesById = new Map(profiles.map((item) => [item.id, item]));

	const preparedVerlosungen = (verlosungen ?? []).map((verlosung) => {
		const giveawayParticipants = participants
			.filter((participant) => participant.verlosung_id === verlosung.id)
			.map((participant) => ({
				...participant,
				profile: profilesById.get(participant.user_id) ?? null
			}));

		const giveawayWinners = winners
			.filter((winner) => winner.verlosung_id === verlosung.id)
			.map((winner) => ({
				...winner,

				profile: profilesById.get(winner.user_id) ?? null,

				drawnByProfile: profilesById.get(winner.drawn_by) ?? null
			}));

		return {
			...verlosung,

			participants: giveawayParticipants,
			winners: giveawayWinners,

			createdByProfile: profilesById.get(verlosung.created_by) ?? null,

			updatedByProfile: verlosung.updated_by
				? (profilesById.get(verlosung.updated_by) ?? null)
				: null
		};
	});

	return {
		currentProfile: profile,
		verlosungen: preparedVerlosungen,
		error: null
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { user } = await requireTeam(locals);

		const formData = await request.formData();

		const title = String(formData.get('title') ?? '').trim();

		const prize = String(formData.get('prize') ?? '').trim();

		const description = String(formData.get('description') ?? '').trim();

		const startAtIso = String(formData.get('start_at_iso') ?? '').trim();

		const endAtIso = String(formData.get('end_at_iso') ?? '').trim();

		const maxWinners = Number(formData.get('max_winners'));

		if (!title) {
			return fail(400, {
				action: 'create',
				message: 'Bitte einen Titel angeben.'
			});
		}

		if (!prize) {
			return fail(400, {
				action: 'create',
				message: 'Bitte einen Preis angeben.'
			});
		}

		if (!startAtIso || !endAtIso) {
			return fail(400, {
				action: 'create',
				message: 'Bitte Start- und Endzeit angeben.'
			});
		}

		const startAt = new Date(startAtIso);
		const endAt = new Date(endAtIso);

		if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
			return fail(400, {
				action: 'create',
				message: 'Ungültige Zeitangabe.'
			});
		}

		if (endAt <= startAt) {
			return fail(400, {
				action: 'create',
				message: 'Die Endzeit muss nach der Startzeit liegen.'
			});
		}

		if (!Number.isInteger(maxWinners) || maxWinners < 1) {
			return fail(400, {
				action: 'create',
				message: 'Die Anzahl der Gewinner muss mindestens 1 sein.'
			});
		}

		const { error } = await locals.supabase.from('verlosungen').insert({
			title,
			prize,
			description: description || null,

			start_at: startAt.toISOString(),
			end_at: endAt.toISOString(),

			max_winners: maxWinners,

			created_by: user.id,
			updated_by: user.id
		});

		if (error) {
			console.error('Verlosung konnte nicht erstellt werden:', error);

			return fail(500, {
				action: 'create',
				message: 'Verlosung konnte nicht erstellt werden.'
			});
		}

		return {
			action: 'create',
			success: true,
			message: 'Verlosung wurde erstellt.'
		};
	},

	update: async ({ request, locals }) => {
		const { user } = await requireTeam(locals);

		const formData = await request.formData();

		const id = String(formData.get('id') ?? '').trim();

		const title = String(formData.get('title') ?? '').trim();

		const prize = String(formData.get('prize') ?? '').trim();

		const description = String(formData.get('description') ?? '').trim();

		const startAtIso = String(formData.get('start_at_iso') ?? '').trim();

		const endAtIso = String(formData.get('end_at_iso') ?? '').trim();

		const maxWinners = Number(formData.get('max_winners'));

		if (!id) {
			return fail(400, {
				action: 'update',
				message: 'Verlosungs-ID fehlt.'
			});
		}

		if (!title) {
			return fail(400, {
				action: 'update',
				message: 'Bitte einen Titel angeben.'
			});
		}

		if (!prize) {
			return fail(400, {
				action: 'update',
				message: 'Bitte einen Preis angeben.'
			});
		}

		if (!startAtIso || !endAtIso) {
			return fail(400, {
				action: 'update',
				message: 'Bitte Start- und Endzeit angeben.'
			});
		}

		const startAt = new Date(startAtIso);
		const endAt = new Date(endAtIso);

		if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
			return fail(400, {
				action: 'update',
				message: 'Start- oder Endzeit ist ungültig.'
			});
		}

		if (endAt <= startAt) {
			return fail(400, {
				action: 'update',
				message: 'Die Endzeit muss nach der Startzeit liegen.'
			});
		}

		if (!Number.isInteger(maxWinners) || maxWinners < 1) {
			return fail(400, {
				action: 'update',
				message: 'Die Anzahl der Gewinner muss mindestens 1 sein.'
			});
		}

		const { count: winnerCount, error: winnerCountError } = await locals.supabase
			.from('verlosung_winners')
			.select('*', {
				count: 'exact',
				head: true
			})
			.eq('verlosung_id', id);

		if (winnerCountError) {
			console.error('Gewinnerzahl konnte nicht geprüft werden:', winnerCountError);

			return fail(500, {
				action: 'update',
				message: 'Gewinnerzahl konnte nicht geprüft werden.'
			});
		}

		if ((winnerCount ?? 0) > maxWinners) {
			return fail(400, {
				action: 'update',
				message: `Es wurden bereits ${winnerCount} Gewinner gezogen. Die Gewinnerzahl kann nicht auf ${maxWinners} reduziert werden.`
			});
		}

		const { error } = await locals.supabase
			.from('verlosungen')
			.update({
				title,
				prize,
				description: description || null,

				start_at: startAt.toISOString(),
				end_at: endAt.toISOString(),

				max_winners: maxWinners,
				updated_by: user.id
			})
			.eq('id', id);

		if (error) {
			console.error('Verlosung konnte nicht aktualisiert werden:', error);

			return fail(500, {
				action: 'update',
				message: 'Verlosung konnte nicht gespeichert werden.'
			});
		}

		return {
			action: 'update',
			success: true,
			message: 'Verlosung wurde aktualisiert.'
		};
	},

	delete: async ({ request, locals }) => {
		await requireTeam(locals);

		const formData = await request.formData();

		const id = String(formData.get('id') ?? '').trim();

		if (!id) {
			return fail(400, {
				action: 'delete',
				message: 'Verlosungs-ID fehlt.'
			});
		}

		const { error } = await locals.supabase.from('verlosungen').delete().eq('id', id);

		if (error) {
			console.error('Verlosung konnte nicht gelöscht werden:', error);

			return fail(500, {
				action: 'delete',
				message: 'Verlosung konnte nicht gelöscht werden.'
			});
		}

		return {
			action: 'delete',
			success: true,
			message: 'Verlosung wurde gelöscht.'
		};
	},

	removeParticipant: async ({ request, locals }) => {
		await requireTeam(locals);

		const formData = await request.formData();

		const participantId = String(formData.get('participant_id') ?? '').trim();

		if (!participantId) {
			return fail(400, {
				action: 'removeParticipant',
				message: 'Teilnehmer-ID fehlt.'
			});
		}

		const { data: participant, error: participantError } = await locals.supabase
			.from('verlosung_participants')
			.select(
				`
					id,
					verlosung_id,
					user_id
				`
			)
			.eq('id', participantId)
			.single();

		if (participantError || !participant) {
			return fail(404, {
				action: 'removeParticipant',
				message: 'Teilnehmer wurde nicht gefunden.'
			});
		}

		const { data: winner } = await locals.supabase
			.from('verlosung_winners')
			.select('id')
			.eq('verlosung_id', participant.verlosung_id)
			.eq('user_id', participant.user_id)
			.maybeSingle();

		if (winner) {
			return fail(400, {
				action: 'removeParticipant',
				message:
					'Dieser Teilnehmer wurde bereits als Gewinner gezogen und kann nicht mehr entfernt werden.'
			});
		}

		const { error } = await locals.supabase
			.from('verlosung_participants')
			.delete()
			.eq('id', participantId);

		if (error) {
			console.error('Teilnehmer konnte nicht entfernt werden:', error);

			return fail(500, {
				action: 'removeParticipant',
				message: 'Teilnehmer konnte nicht entfernt werden.'
			});
		}

		return {
			action: 'removeParticipant',
			success: true,
			message: 'Teilnehmer wurde entfernt.'
		};
	},

	drawWinner: async ({ request, locals }) => {
		const { user } = await requireTeam(locals);

		const formData = await request.formData();

		const verlosungId = String(formData.get('verlosung_id') ?? '').trim();

		if (!verlosungId) {
			return fail(400, {
				action: 'drawWinner',
				message: 'Verlosungs-ID fehlt.'
			});
		}

		const { data: verlosung, error: verlosungError } = await locals.supabase
			.from('verlosungen')
			.select(
				`
					id,
					title,
					end_at,
					max_winners
				`
			)
			.eq('id', verlosungId)
			.single();

		if (verlosungError || !verlosung) {
			return fail(404, {
				action: 'drawWinner',
				message: 'Verlosung wurde nicht gefunden.'
			});
		}

		if (Date.now() < new Date(verlosung.end_at).getTime()) {
			return fail(400, {
				action: 'drawWinner',
				message: 'Die Verlosung ist noch nicht beendet.'
			});
		}

		const { data: existingWinners, error: winnersError } = await locals.supabase
			.from('verlosung_winners')
			.select(
				`
					id,
					user_id,
					position
				`
			)
			.eq('verlosung_id', verlosungId)
			.order('position', {
				ascending: true
			});

		if (winnersError) {
			console.error('Gewinner konnten nicht geprüft werden:', winnersError);

			return fail(500, {
				action: 'drawWinner',
				message: 'Gewinner konnten nicht geprüft werden.'
			});
		}

		const currentWinnerCount = existingWinners?.length ?? 0;

		if (currentWinnerCount >= verlosung.max_winners) {
			return fail(400, {
				action: 'drawWinner',
				message: 'Alle Gewinner wurden bereits gezogen.'
			});
		}

		const winnerUserIds = new Set((existingWinners ?? []).map((winner) => winner.user_id));

		const { data: participants, error: participantsError } = await locals.supabase
			.from('verlosung_participants')
			.select(
				`
					id,
					user_id
				`
			)
			.eq('verlosung_id', verlosungId);

		if (participantsError) {
			console.error('Teilnehmer konnten nicht geladen werden:', participantsError);

			return fail(500, {
				action: 'drawWinner',
				message: 'Teilnehmer konnten nicht geladen werden.'
			});
		}

		const availableParticipants = (participants ?? []).filter(
			(participant) => !winnerUserIds.has(participant.user_id)
		);

		if (!availableParticipants.length) {
			return fail(400, {
				action: 'drawWinner',
				message: 'Es gibt keine weiteren Teilnehmer, die gezogen werden können.'
			});
		}

		const selectedWinner = availableParticipants[randomInt(availableParticipants.length)];

		const position = currentWinnerCount + 1;

		const { error: insertError } = await locals.supabase.from('verlosung_winners').insert({
			verlosung_id: verlosungId,
			user_id: selectedWinner.user_id,
			position,
			drawn_by: user.id
		});

		if (insertError) {
			console.error('Gewinner konnte nicht gespeichert werden:', insertError);

			return fail(500, {
				action: 'drawWinner',
				message: 'Gewinner konnte nicht gespeichert werden.'
			});
		}

		const { error: updateError } = await locals.supabase
			.from('verlosungen')
			.update({
				updated_by: user.id
			})
			.eq('id', verlosungId);

		if (updateError) {
			console.error('Verlosung updated_by konnte nicht aktualisiert werden:', updateError);
		}

		return {
			action: 'drawWinner',
			success: true,
			message: `Gewinner ${position} von ${verlosung.max_winners} wurde gezogen.`
		};
	}
};
