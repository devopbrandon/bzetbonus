import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();

	if (userError || !user) {
		throw redirect(303, '/login');
	}

	const { data: profile, error: profileError } = await locals.supabase
		.from('profiles')
		.select(
			`
			id,
			created_at,
			username,
			email,
			avatar_url,
			role,
			points,
			balance
		`
		)
		.eq('id', user.id)
		.single();

	if (profileError) {
		console.error('Profile load error:', profileError);

		throw error(500, 'Dein Profil konnte nicht geladen werden.');
	}

	return {
		profile: {
			...profile,

			// Sicherheitshalber Auth-Mail als Fallback
			email: profile.email ?? user.email ?? null,

			points: Number(profile.points ?? 0),
			balance: Number(profile.balance ?? 0)
		}
	};
};
