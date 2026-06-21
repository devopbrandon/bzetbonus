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

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = Number(params.id);

	if (!Number.isInteger(id)) {
		throw redirect(302, '/dashboard/deals');
	}

	const { data, error } = await locals.supabase.from('deals').select('*').eq('id', id).single();

	if (error || !data) {
		throw redirect(302, '/dashboard/deals');
	}

	return {
		deal: data
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
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

		const positionRaw = formData.get('position');
		const position =
			typeof positionRaw === 'string' && positionRaw.trim() !== '' ? Number(positionRaw) : null;

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
			position
		};

		if (!brand || !bonus) {
			return fail(400, {
				error: 'Bitte Brand und Bonus ausfüllen.',
				values
			});
		}

		const updateData: Record<string, unknown> = {
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
			information
		};

		if (position !== null && Number.isFinite(position)) {
			updateData.position = position;
		}

		const { data, error } = await locals.supabase
			.from('deals')
			.update(updateData)
			.eq('id', id)
			.select()
			.maybeSingle();

		if (error) {
			console.error('Supabase update error:', error);

			return fail(500, {
				error: 'Fehler beim Speichern in der Datenbank.',
				values: {
					...updateData,
					id
				}
			});
		}

		if (!data) {
			return fail(404, {
				error: 'Deal nicht gefunden oder keine Berechtigung zum Bearbeiten.',
				values: {
					...updateData,
					id
				}
			});
		}

		throw redirect(303, '/dashboard/deals');
	}
};
