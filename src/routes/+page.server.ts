import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: deals, error } = await locals.supabase
		.from('deals')
		.select('*')
		.order('position', { ascending: true });

	if (error) {
		console.error(error);
		return {
			deals: []
		};
	}

	return {
		deals
	};
};
