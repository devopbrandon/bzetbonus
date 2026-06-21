import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data, error } = await locals.supabase
		.from('deals')
		.select(`*`)
		.order('position', { ascending: true });

	if (error) {
		console.error('load deals error:', error);
		// nicht crashen -> leeres Array zurück
		return { deals: [] as unknown[] };
	}

	return {
		deals: data ?? []
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const dealId = formData.get('dealId');

		if (typeof dealId !== 'string') {
			return fail(400, { error: 'Invalid deal ID' });
		}
		const { error } = await locals.supabase.from('deals').delete().eq('id', parseInt(dealId));
		if (error) {
			console.error('delete deal error:', error);
			return fail(500, { error: 'Failed to delete deal' });
		}
		throw redirect(303, '/dashboard/deals');
	},

	reorder: async ({ request, locals }) => {
		const form = await request.formData();
		const raw = form.get('order');
		if (typeof raw !== 'string') return fail(400, { message: 'Bad payload' });

		let order: { id: string | number; position: number }[];
		try {
			order = JSON.parse(raw);
		} catch {
			return fail(400, { message: 'Invalid JSON' });
		}
		if (!Array.isArray(order) || order.length === 0) {
			return fail(400, { message: 'Empty order' });
		}

		// id ist bei dir offenbar numeric -> Number(...)
		const rows = order.map((r) => ({ id: Number(r.id), position: r.position }));

		const updates = rows.map((r) =>
			locals.supabase.from('deals').update({ position: r.position }).eq('id', r.id)
		);

		const results = await Promise.all(updates);
		const error = results.find((r) => r.error)?.error;
		if (error) {
			console.error('reorder update error:', error);
			return fail(500, { message: 'DB error' });
		}

		return { ok: true };
	}
};
