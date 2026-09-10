import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type Status = 'pending' | 'paid' | 'cancelled';

const ALLOWED_STATUSES: Status[] = ['pending', 'paid', 'cancelled'];

async function requireTeam(locals: App.Locals) {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (!user) {
		throw redirect(303, '/');
	}

	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('id, username, email, avatar_url, role')
		.eq('id', user.id)
		.single();

	if (error || !profile || !['admin', 'moderator'].includes(profile.role ?? '')) {
		throw redirect(303, '/');
	}

	return {
		user,
		profile
	};
}

function cleanString(value: FormDataEntryValue | null) {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const { profile } = await requireTeam(locals);

	const status = url.searchParams.get('status') ?? 'all';
	const search = url.searchParams.get('search')?.trim() ?? '';

	/*
		Wir holen erst die Wins und anschließend die User-Profile.

		Das ist absichtlich getrennt, damit wir nicht von einer
		exakten Supabase Foreign-Key-Relation zwischen
		case_wins.user_id und profiles abhängig sind.
	*/
	let query = locals.supabase
		.from('case_wins')
		.select(
			`
			id,
			user_id,
			case_id,
			item_id,

			case_name,
			item_name,
			item_image_url,
			item_rarity,
			item_value,

			reward_type,
			reward_amount,

			points_spent,

			status,
			admin_note,

			paid_at,
			cancelled_at,
			points_refunded,

			created_at
		`
		)
		.order('created_at', {
			ascending: false
		})
		.limit(500);

	if (status !== 'all' && ALLOWED_STATUSES.includes(status as Status)) {
		query = query.eq('status', status);
	}

	const { data: winsData, error: winsError } = await query;

	if (winsError) {
		console.error('Case history load error:', winsError);
	}

	const wins = winsData ?? [];

	const userIds = [...new Set(wins.map((win) => win.user_id).filter(Boolean))];

	let profiles: Array<{
		id: string;
		username: string | null;
		email: string | null;
		avatar_url: string | null;
	}> = [];

	if (userIds.length) {
		const { data: profileData, error: profilesError } = await locals.supabase
			.from('profiles')
			.select('id, username, email, avatar_url')
			.in('id', userIds);

		if (profilesError) {
			console.error('Case history profiles error:', profilesError);
		} else {
			profiles = profileData ?? [];
		}
	}

	const profileMap = new Map(profiles.map((userProfile) => [userProfile.id, userProfile]));

	let enrichedWins = wins.map((win) => ({
		...win,
		user: profileMap.get(win.user_id) ?? null
	}));

	if (search) {
		const normalizedSearch = search.toLowerCase();

		enrichedWins = enrichedWins.filter((win) => {
			const username = win.user?.username?.toLowerCase() ?? '';

			const email = win.user?.email?.toLowerCase() ?? '';

			const caseName = win.case_name?.toLowerCase() ?? '';

			const itemName = win.item_name?.toLowerCase() ?? '';

			return (
				username.includes(normalizedSearch) ||
				email.includes(normalizedSearch) ||
				caseName.includes(normalizedSearch) ||
				itemName.includes(normalizedSearch)
			);
		});
	}

	const stats = {
		total: wins.length,

		pending: wins.filter((win) => win.status === 'pending').length,

		paid: wins.filter((win) => win.status === 'paid').length,

		cancelled: wins.filter((win) => win.status === 'cancelled').length
	};

	return {
		profile,
		wins: enrichedWins,
		stats,

		filters: {
			status,
			search
		}
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		await requireTeam(locals);

		const formData = await request.formData();

		const winId = cleanString(formData.get('win_id'));

		const status = cleanString(formData.get('status')) as Status;

		const adminNote = cleanString(formData.get('admin_note')) || null;

		if (!winId) {
			return fail(400, {
				success: false,
				action: 'updateStatus',
				message: 'Ungültiger Gewinn.'
			});
		}

		if (!ALLOWED_STATUSES.includes(status)) {
			return fail(400, {
				success: false,
				action: 'updateStatus',
				message: 'Ungültiger Status.'
			});
		}

		const updateData: {
			status: Status;
			admin_note: string | null;
			paid_at: string | null;
			cancelled_at: string | null;
		} = {
			status,
			admin_note: adminNote,
			paid_at: null,
			cancelled_at: null
		};

		if (status === 'paid') {
			updateData.paid_at = new Date().toISOString();
		}

		if (status === 'cancelled') {
			updateData.cancelled_at = new Date().toISOString();
		}

		const { error } = await locals.supabase.from('case_wins').update(updateData).eq('id', winId);

		if (error) {
			console.error('Update case win status error:', error);

			return fail(500, {
				success: false,
				action: 'updateStatus',
				message: 'Der Status konnte nicht gespeichert werden.'
			});
		}

		return {
			success: true,
			action: 'updateStatus',
			message: 'Gewinn wurde aktualisiert.'
		};
	}
};
