import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		console.error('OAUTH CALLBACK: No code received');
		throw redirect(303, '/?auth_error=missing_code');
	}

	const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

	if (error) {
		console.error('OAUTH CALLBACK ERROR:', error);
		throw redirect(303, '/?auth_error=callback');
	}

	throw redirect(303, '/');
};
