import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	let currentProfile: any = null;

	if (user) {
		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('id, username, email, avatar_url, role')
			.eq('id', user.id)
			.maybeSingle();

		currentProfile = profile ?? null;
	}

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
				created_at
			`
		)
		.order('start_at', { ascending: false });

	if (verlosungenError) {
		console.error('Verlosungen konnten nicht geladen werden:', verlosungenError);

		return {
			user: user
				? {
						id: user.id
					}
				: null,
			currentProfile,
			verlosungen: [],
			error: 'Verlosungen konnten nicht geladen werden.'
		};
	}

	const verlosungIds = (verlosungen ?? []).map((verlosung) => verlosung.id);

	// ---------------------------------------------------------
	// EIGENE TEILNAHMEN
	// ---------------------------------------------------------

	let myParticipations: any[] = [];

	if (user && verlosungIds.length > 0) {
		const { data, error } = await locals.supabase
			.from('verlosung_participants')
			.select(
				`
				id,
				verlosung_id,
				user_id,
				created_at
			`
			)
			.eq('user_id', user.id)
			.in('verlosung_id', verlosungIds);

		if (error) {
			console.error('Eigene Teilnahmen konnten nicht geladen werden:', error);
		} else {
			myParticipations = data ?? [];
		}
	}

	const participationByVerlosung = new Map(
		myParticipations.map((participation) => [participation.verlosung_id, participation])
	);

	// ---------------------------------------------------------
	// GEWINNER
	// ---------------------------------------------------------

	let winners: any[] = [];

	if (verlosungIds.length > 0) {
		const { data, error } = await locals.supabase
			.from('verlosung_winners')
			.select(
				`
				id,
				verlosung_id,
				user_id,
				position,
				drawn_at
			`
			)
			.in('verlosung_id', verlosungIds)
			.order('position', { ascending: true });

		if (error) {
			console.error('Gewinner konnten nicht geladen werden:', error);
		} else {
			winners = data ?? [];
		}
	}

	// ---------------------------------------------------------
	// PROFILE DER GEWINNER
	// ---------------------------------------------------------

	const winnerUserIds = [...new Set(winners.map((winner) => winner.user_id).filter(Boolean))];

	let winnerProfiles: any[] = [];

	if (winnerUserIds.length > 0) {
		const { data, error } = await locals.supabase
			.from('profiles')
			.select(
				`
				id,
				username,
				avatar_url
			`
			)
			.in('id', winnerUserIds);

		if (error) {
			console.error('Gewinner-Profile konnten nicht geladen werden:', error);
		} else {
			winnerProfiles = data ?? [];
		}
	}

	const profilesById = new Map(winnerProfiles.map((profile) => [profile.id, profile]));

	const preparedVerlosungen = (verlosungen ?? []).map((verlosung) => {
		const giveawayWinners = winners
			.filter((winner) => winner.verlosung_id === verlosung.id)
			.map((winner) => ({
				...winner,
				profile: profilesById.get(winner.user_id) ?? null
			}));

		const participation = participationByVerlosung.get(verlosung.id) ?? null;

		return {
			...verlosung,
			winners: giveawayWinners,
			isParticipating: Boolean(participation),
			participation
		};
	});

	return {
		user: user
			? {
					id: user.id
				}
			: null,

		currentProfile,
		verlosungen: preparedVerlosungen,
		error: null
	};
};

export const actions: Actions = {
	participate: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (!user) {
			return fail(401, {
				action: 'participate',
				message: 'Du musst eingeloggt sein, um an einer Verlosung teilzunehmen.'
			});
		}

		const formData = await request.formData();

		const verlosungId = String(formData.get('verlosung_id') ?? '').trim();

		if (!verlosungId) {
			return fail(400, {
				action: 'participate',
				message: 'Verlosungs-ID fehlt.'
			});
		}

		const { data: verlosung, error: verlosungError } = await locals.supabase
			.from('verlosungen')
			.select(
				`
					id,
					title,
					start_at,
					end_at
				`
			)
			.eq('id', verlosungId)
			.maybeSingle();

		if (verlosungError || !verlosung) {
			return fail(404, {
				action: 'participate',
				message: 'Diese Verlosung wurde nicht gefunden.'
			});
		}

		const now = Date.now();

		const startAt = new Date(verlosung.start_at).getTime();

		const endAt = new Date(verlosung.end_at).getTime();

		if (now < startAt) {
			return fail(400, {
				action: 'participate',
				message: 'Diese Verlosung hat noch nicht begonnen.'
			});
		}

		if (now > endAt) {
			return fail(400, {
				action: 'participate',
				message: 'Diese Verlosung ist bereits beendet.'
			});
		}

		const { data: existingParticipation } = await locals.supabase
			.from('verlosung_participants')
			.select('id')
			.eq('verlosung_id', verlosungId)
			.eq('user_id', user.id)
			.maybeSingle();

		if (existingParticipation) {
			return fail(400, {
				action: 'participate',
				message: 'Du nimmst bereits an dieser Verlosung teil.'
			});
		}

		const { error: insertError } = await locals.supabase.from('verlosung_participants').insert({
			verlosung_id: verlosungId,
			user_id: user.id
		});

		if (insertError) {
			console.error('Teilnahme konnte nicht gespeichert werden:', insertError);

			if (insertError.code === '23505') {
				return fail(400, {
					action: 'participate',
					message: 'Du nimmst bereits an dieser Verlosung teil.'
				});
			}

			return fail(500, {
				action: 'participate',
				message: 'Teilnahme konnte nicht gespeichert werden.'
			});
		}

		return {
			action: 'participate',
			success: true,
			message: `Du nimmst jetzt an „${verlosung.title}“ teil.`
		};
	}
};
