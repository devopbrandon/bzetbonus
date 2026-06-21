import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		throw redirect(303, '/?error=missing_code');
	}

	const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

	if (error) {
		console.error('OAuth callback error:', error.message);
		throw redirect(303, '/?error=auth_callback');
	}

	throw redirect(303, '/');
};
