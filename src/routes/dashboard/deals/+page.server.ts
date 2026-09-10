import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { profile } = await parent();

	if (profile.role === 'moderator') {
		throw redirect(303, '/dashboard/user');
	}

	if (profile.role !== 'admin') {
		throw redirect(303, '/');
	}

	const { data, error } = await locals.supabase
		.from('deals')
		.select('*')
		.order('position', { ascending: true });

	if (error) {
		console.error('load deals error:', error);

		return {
			deals: [] as unknown[]
		};
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
			return fail(400, {
				error: 'Invalid deal ID'
			});
		}

		const parsedDealId = Number(dealId);

		if (!Number.isInteger(parsedDealId)) {
			return fail(400, {
				error: 'Invalid deal ID'
			});
		}

		const { error } = await locals.supabase.from('deals').delete().eq('id', parsedDealId);

		if (error) {
			console.error('delete deal error:', error);

			return fail(500, {
				error: 'Failed to delete deal'
			});
		}

		throw redirect(303, '/dashboard/deals');
	},

	toggleVisibility: async ({ request, locals }) => {
		const formData = await request.formData();
		const dealId = formData.get('dealId');

		if (typeof dealId !== 'string') {
			return fail(400, {
				error: 'Invalid deal ID'
			});
		}

		const parsedDealId = Number(dealId);

		if (!Number.isInteger(parsedDealId)) {
			return fail(400, {
				error: 'Invalid deal ID'
			});
		}

		const { data: deal, error: fetchError } = await locals.supabase
			.from('deals')
			.select('id, is_visible')
			.eq('id', parsedDealId)
			.single();

		if (fetchError || !deal) {
			console.error('load deal visibility error:', fetchError);

			return fail(404, {
				error: 'Deal not found'
			});
		}

		const newVisibility = !deal.is_visible;

		const { error: updateError } = await locals.supabase
			.from('deals')
			.update({
				is_visible: newVisibility
			})
			.eq('id', parsedDealId);

		if (updateError) {
			console.error('toggle deal visibility error:', updateError);

			return fail(500, {
				error: 'Failed to update deal visibility'
			});
		}

		return {
			ok: true,
			dealId: parsedDealId,
			is_visible: newVisibility
		};
	},

	reorder: async ({ request, locals }) => {
		const form = await request.formData();
		const raw = form.get('order');

		if (typeof raw !== 'string') {
			return fail(400, {
				message: 'Bad payload'
			});
		}

		let order: { id: string | number; position: number }[];

		try {
			order = JSON.parse(raw);
		} catch {
			return fail(400, {
				message: 'Invalid JSON'
			});
		}

		if (!Array.isArray(order) || order.length === 0) {
			return fail(400, {
				message: 'Empty order'
			});
		}

		const rows = order.map((row) => ({
			id: Number(row.id),
			position: row.position
		}));

		const updates = rows.map((row) =>
			locals.supabase
				.from('deals')
				.update({
					position: row.position
				})
				.eq('id', row.id)
		);

		const results = await Promise.all(updates);
		const error = results.find((result) => result.error)?.error;

		if (error) {
			console.error('reorder update error:', error);

			return fail(500, {
				message: 'DB error'
			});
		}

		return {
			ok: true
		};
	}
};
