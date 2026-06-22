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

export const load: PageServerLoad = async ({ locals }) => {
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
		console.error('Add deal profile check error:', error);
		throw redirect(303, '/');
	}

	if (!profile || profile.role !== 'admin') {
		throw redirect(303, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();

		if (!session || !user) {
			throw redirect(303, '/');
		}

		const { data: profile, error: profileError } = await locals.supabase
			.from('profiles')
			.select('id, role')
			.eq('id', user.id)
			.maybeSingle();

		if (profileError) {
			console.error('Add deal profile error:', profileError);

			return fail(500, {
				error: 'Fehler beim Prüfen deiner Berechtigung.'
			});
		}

		if (!profile || profile.role !== 'admin') {
			throw redirect(303, '/');
		}

		const formData = await request.formData();

		const str = (key: string) => {
			const value = formData.get(key);
			return typeof value === 'string' ? value.trim() : '';
		};

		const brand = str('brand');
		const bonus = str('bonus');
		const bonustype = str('bonustype');
		const maxbet = str('maxbet');
		const maxbonus = str('maxbonus');
		const freespins = str('freespins');
		const logourl = str('logourl');
		const reflink = str('reflink');
		const wager = str('wager');
		const wagertype = str('wagertype');
		const promocode = str('promocode');
		const information = str('information');

		const merkurRaw = str('merkur');
		const novolineRaw = str('novoline');

		const merkur = merkurRaw === 'true' || merkurRaw === 'on';
		const novoline = novolineRaw === 'true' || novolineRaw === 'on';

		const features = parseStringArray(formData, 'features');
		const payments = parseStringArray(formData, 'payments');

		const values = {
			brand,
			bonus,
			bonustype,
			maxbet,
			maxbonus,
			freespins,
			logourl,
			reflink,
			wager,
			wagertype,
			features,
			payments,
			promocode,
			information,
			merkur,
			novoline
		};

		if (!brand || !bonus) {
			return fail(400, {
				error: 'Bitte Brand und Bonus ausfüllen.',
				values
			});
		}

		const insertData = {
			brand,
			bonus,
			bonustype: bonustype || null,
			maxbet: maxbet || null,
			maxbonus: maxbonus || null,
			freespins: freespins || null,
			logourl: logourl || null,
			reflink: reflink || null,
			wager: wager || null,
			wagertype: wagertype || null,
			features,
			payments,
			promocode: promocode || null,
			information: information || null,
			merkur,
			novoline
		};

		const { data, error } = await locals.supabase
			.from('deals')
			.insert(insertData)
			.select('id')
			.maybeSingle();

		if (error) {
			console.error('Supabase insert deal error:', error);

			return fail(500, {
				error: error.message || 'Fehler beim Speichern in der Datenbank.',
				values
			});
		}

		if (!data) {
			return fail(500, {
				error: 'Deal wurde nicht erstellt. Prüfe bitte deine Insert-Policy.',
				values
			});
		}

		throw redirect(303, '/dashboard/deals');
	}
};
