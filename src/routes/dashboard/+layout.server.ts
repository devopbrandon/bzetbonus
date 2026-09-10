import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw redirect(303, '/');
	}

	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('id, role')
		.eq('id', user.id)
		.maybeSingle();

	if (error) {
		console.error('Dashboard admin check error:', error);
		throw redirect(303, '/');
	}

	if (!profile || !['admin', 'moderator'].includes(profile.role)) {
		throw redirect(303, '/');
	}

	return {
		profile
	};
};
