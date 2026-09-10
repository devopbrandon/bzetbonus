import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (!user) {
		throw redirect(303, '/');
	}

	const { data: currentProfile, error: profileError } = await locals.supabase
		.from('profiles')
		.select('id, username, email, avatar_url, role, points, balance, created_at')
		.eq('id', user.id)
		.single();

	if (
		profileError ||
		!currentProfile ||
		!['admin', 'moderator'].includes(currentProfile.role ?? '')
	) {
		throw redirect(303, '/');
	}

	const { data: profiles, error } = await locals.supabase
		.from('profiles')
		.select('id, created_at, username, email, avatar_url, role, points, balance')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Profiles konnten nicht geladen werden:', error);
	}

	return {
		currentProfile,
		profiles: profiles ?? []
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (!user) {
			return fail(401, {
				success: false,
				message: 'Nicht eingeloggt.'
			});
		}

		const { data: actor } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (!actor || !['admin', 'moderator'].includes(actor.role ?? '')) {
			return fail(403, {
				success: false,
				message: 'Keine Berechtigung.'
			});
		}

		const formData = await request.formData();

		const userId = String(formData.get('user_id') ?? '');
		const username = String(formData.get('username') ?? '').trim();
		const email = String(formData.get('email') ?? '').trim();
		const avatarUrl = String(formData.get('avatar_url') ?? '').trim();
		const pointsRaw = String(formData.get('points') ?? '0');
		const balanceRaw = String(formData.get('balance') ?? '0');
		const role = String(formData.get('role') ?? '').trim();

		if (!userId) {
			return fail(400, {
				success: false,
				message: 'User ID fehlt.'
			});
		}

		const points = Number.parseInt(pointsRaw, 10);
		const balance = Number.parseFloat(balanceRaw);

		if (!Number.isFinite(points) || points < 0) {
			return fail(400, {
				success: false,
				message: 'Ungültige Points.'
			});
		}

		if (!Number.isFinite(balance) || balance < 0) {
			return fail(400, {
				success: false,
				message: 'Ungültige Balance.'
			});
		}

		if (actor.role === 'admin' && role && !['user', 'moderator', 'admin'].includes(role)) {
			return fail(400, {
				success: false,
				message: 'Ungültige Rolle.'
			});
		}

		const { error } = await locals.supabase.rpc('team_update_profile', {
			p_user_id: userId,
			p_username: username || null,
			p_email: email || null,
			p_avatar_url: avatarUrl || null,
			p_points: points,
			p_balance: balance,
			p_role: actor.role === 'admin' ? role || null : null
		});

		if (error) {
			console.error('Profile update error:', error);

			return fail(400, {
				success: false,
				message: error.message
			});
		}

		return {
			success: true,
			message: 'Profil gespeichert.'
		};
	},

	adjustPoints: async ({ request, locals }) => {
		const formData = await request.formData();

		const userId = String(formData.get('user_id') ?? '');
		const amount = Number.parseInt(String(formData.get('amount') ?? '0'), 10);

		if (!userId || !Number.isFinite(amount) || amount === 0) {
			return fail(400, {
				success: false,
				message: 'Ungültige Points-Änderung.'
			});
		}

		const { error } = await locals.supabase.rpc('team_adjust_points', {
			p_user_id: userId,
			p_amount: amount
		});

		if (error) {
			return fail(400, {
				success: false,
				message: error.message
			});
		}

		return {
			success: true,
			message:
				amount > 0
					? `${amount.toLocaleString('de-DE')} Points hinzugefügt.`
					: `${Math.abs(amount).toLocaleString('de-DE')} Points entfernt.`
		};
	},

	adjustBalance: async ({ request, locals }) => {
		const formData = await request.formData();

		const userId = String(formData.get('user_id') ?? '');
		const amount = Number.parseFloat(String(formData.get('amount') ?? '0'));

		if (!userId || !Number.isFinite(amount) || amount === 0) {
			return fail(400, {
				success: false,
				message: 'Ungültige Balance-Änderung.'
			});
		}

		const { error } = await locals.supabase.rpc('team_adjust_balance', {
			p_user_id: userId,
			p_amount: amount
		});

		if (error) {
			return fail(400, {
				success: false,
				message: error.message
			});
		}

		return {
			success: true,
			message:
				amount > 0
					? `${amount.toLocaleString('de-DE', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})} € hinzugefügt.`
					: `${Math.abs(amount).toLocaleString('de-DE', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})} € entfernt.`
		};
	}
};
