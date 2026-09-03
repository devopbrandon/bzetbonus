import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	discord: async ({ locals, url }) => {
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'discord',
			options: {
				redirectTo: `${url.origin}/callback`
			}
		});

		if (error) {
			console.error('DISCORD LOGIN ERROR:', error);

			return fail(500, {
				message: 'Discord Login konnte nicht gestartet werden.'
			});
		}

		if (!data.url) {
			return fail(500, {
				message: 'Discord Login URL konnte nicht erstellt werden.'
			});
		}

		throw redirect(303, data.url);
	},

	twitch: async ({ locals, url }) => {
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'twitch',
			options: {
				redirectTo: `${url.origin}/callback`
			}
		});

		if (error) {
			console.error('TWITCH LOGIN ERROR:', error);

			return fail(500, {
				message: 'Twitch Login konnte nicht gestartet werden.'
			});
		}

		if (!data.url) {
			return fail(500, {
				message: 'Twitch Login URL konnte nicht erstellt werden.'
			});
		}

		throw redirect(303, data.url);
	}
};
