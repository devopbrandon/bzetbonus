import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const redirectTo = `${url.origin}/callback`;

	const { data, error } = await locals.supabase.auth.signInWithOAuth({
		provider: 'discord',
		options: {
			redirectTo,
			scopes: 'identify email'
		}
	});

	if (error || !data.url) {
		console.error('Discord OAuth error:', error?.message);
		throw redirect(303, '/?error=discord');
	}

	throw redirect(303, data.url);
};
