import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type DealRow = {
	id: number;
	brand: string | null;
	bonus: string | null;
	bonustype: string | null;
	maxbet: string | null;
	maxbonus: string | null;
	freespins: string | null;
	logourl: string | null;
	reflink: string | null;
	wager: string | null;
	wagertype: string | null;
	features: string[] | null;
	promocode: string | null;
	created_at: string;
	position: number | null;
	information: string | null;
	payments: string[] | null;
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const brandParam = decodeURIComponent(params.brand ?? '').trim();

	if (!brandParam) {
		throw redirect(302, '/');
	}

	const { data: deal, error: dealError } = await locals.supabase
		.from('deals')
		.select(
			`
			id,
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
			promocode,
			created_at,
			position,
			information,
			payments
		`
		)
		.ilike('brand', brandParam)
		.limit(1)
		.maybeSingle<DealRow>();

	if (dealError) {
		throw redirect(303, '/');
	}

	if (!deal) {
		throw redirect(303, '/');
	}

	return {
		deal
	};
};
