import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

function parseStringArray(formData: FormData, key: string) {
	let values: string[] = [];

	const raw = formData.get(key);

	if (typeof raw === 'string' && raw.trim().startsWith('[')) {
		try {
			const parsed = JSON.parse(raw);

			if (Array.isArray(parsed)) {
				values = parsed.map((x) => String(x).trim()).filter(Boolean);
			}
		} catch {
			values = [];
		}
	}

	if (values.length === 0) {
		const multi = formData.getAll(key);

		if (multi.length) {
			values = multi.map((x) => String(x).trim()).filter(Boolean);
		}
	}

	if (values.length === 0) {
		const multiArr = formData.getAll(`${key}[]`);

		if (multiArr.length) {
			values = multiArr.map((x) => String(x).trim()).filter(Boolean);
		}
	}

	return values;
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
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
		const freeSpins = str('freespins');
		const logoURL = str('logoURL');
		const dealURL = str('dealURL');
		const wager = str('wager');
		const wagertype = str('wagertype');
		const promocode = str('promocode');
		const information = str('information');

		const merkurValue = str('merkur');
		const novolineValue = str('novoline');

		const merkur = merkurValue === 'true' || merkurValue === 'on';
		const novoline = novolineValue === 'true' || novolineValue === 'on';

		const features = parseStringArray(formData, 'features');
		const payments = parseStringArray(formData, 'payments');

		const values = {
			brand,
			bonus,
			bonustype,
			maxbet,
			maxbonus,
			freeSpins,
			logoURL,
			dealURL,
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

		const { error } = await locals.supabase.from('deals').insert([
			{
				brand,
				bonus,
				bonustype,
				maxbet,
				maxbonus,
				freespins: freeSpins,
				features,
				payments,
				logourl: logoURL,
				reflink: dealURL,
				wager,
				wagertype,
				promocode,
				information,
				merkur,
				novoline
			}
		]);

		if (error) {
			console.error('Supabase insert error:', error);

			return fail(500, {
				error: 'Fehler beim Speichern in der Datenbank.',
				values
			});
		}

		throw redirect(303, '/dashboard/deals');
	}
};
