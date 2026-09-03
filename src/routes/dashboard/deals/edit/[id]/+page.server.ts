import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function parseStringArray(formData: FormData, key: string) {
	let values: string[] = [];

	const raw = formData.get(key);

	if (typeof raw === 'string' && raw.trim().startsWith('[')) {
		try {
			const parsed = JSON.parse(raw);

			if (Array.isArray(parsed)) {
				values = parsed.map((item) => String(item).trim()).filter(Boolean);
			}
		} catch {
			values = [];
		}
	}

	if (values.length === 0) {
		const multi = formData.getAll(key);

		if (multi.length) {
			values = multi.map((item) => String(item).trim()).filter(Boolean);
		}
	}

	if (values.length === 0) {
		const multiArr = formData.getAll(`${key}[]`);

		if (multiArr.length) {
			values = multiArr.map((item) => String(item).trim()).filter(Boolean);
		}
	}

	return values;
}

async function requireAdmin(locals: App.Locals) {
	const { data: claimsData, error: claimsError } = await locals.supabase.auth.getClaims();

	const userId = claimsData?.claims?.sub;

	if (claimsError || !userId) {
		throw redirect(303, '/');
	}

	const { data: profile, error: profileError } = await locals.supabase
		.from('profiles')
		.select('id, role')
		.eq('id', userId)
		.maybeSingle();

	if (profileError) {
		console.error('Edit deal admin check error:', profileError);

		throw redirect(303, '/');
	}

	if (!profile || profile.role !== 'admin') {
		throw redirect(303, '/');
	}

	return {
		userId,
		profile
	};
}

export const load: PageServerLoad = async ({ params, locals }) => {
	await requireAdmin(locals);

	const id = Number(params.id);

	if (!Number.isInteger(id)) {
		throw redirect(303, '/dashboard/deals');
	}

	const { data, error } = await locals.supabase
		.from('deals')
		.select('*')
		.eq('id', id)
		.maybeSingle();

	if (error) {
		console.error('Load deal error:', error);

		throw redirect(303, '/dashboard/deals');
	}

	if (!data) {
		throw redirect(303, '/dashboard/deals');
	}

	return {
		deal: data
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		await requireAdmin(locals);

		const id = Number(params.id);

		if (!Number.isInteger(id)) {
			return fail(400, {
				error: 'Ungültige Deal ID.'
			});
		}

		const formData = await request.formData();

		const str = (key: string) => {
			const value = formData.get(key);

			return typeof value === 'string' ? value.trim() : '';
		};

		const brand = str('brand');
		const tagline = str('tagline');
		const licence = str('licence');

		const bonus = str('bonus');
		const bonustype = str('bonustype');

		const maxbet = str('maxbet');
		const maxbonus = str('maxbonus');

		const freespins = str('freespins');
		const freespinsCode = str('freespins_code');

		const wager = str('wager');
		const wagertype = str('wagertype');

		const promocode = str('promocode');
		const reflink = str('reflink');

		const logourl = str('logourl');
		const information = str('information');

		const features = parseStringArray(formData, 'features');
		const payments = parseStringArray(formData, 'payments');

		const values = {
			id,

			brand,
			tagline,
			licence,

			bonus,
			bonustype,

			maxbet,
			maxbonus,

			freespins,
			freespins_code: freespinsCode,

			wager,
			wagertype,

			promocode,
			reflink,

			logourl,

			features,
			payments,

			information
		};

		if (!brand || !bonus) {
			return fail(400, {
				error: 'Bitte Casino und Bonus ausfüllen.',
				values
			});
		}

		const updateData = {
			brand,

			tagline: tagline || null,
			licence: licence || null,

			bonus,
			bonustype: bonustype || null,

			maxbet: maxbet || null,
			maxbonus: maxbonus || null,

			freespins: freespins || null,
			freespins_code: freespinsCode || null,

			wager: wager || null,
			wagertype: wagertype || null,

			promocode: promocode || null,
			reflink: reflink || null,

			logourl: logourl || null,

			features,
			payments,

			information: information || null
		};

		const { data, error } = await locals.supabase
			.from('deals')
			.update(updateData)
			.eq('id', id)
			.select('id')
			.maybeSingle();

		if (error) {
			console.error('Update deal error:', error);

			return fail(500, {
				error: error.message || 'Fehler beim Speichern des Deals.',
				values
			});
		}

		if (!data) {
			return fail(404, {
				error: 'Deal nicht gefunden oder keine Berechtigung zum Bearbeiten.',
				values
			});
		}

		throw redirect(303, '/dashboard/deals');
	}
};
