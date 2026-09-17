import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type PayoutStatus = 'pending' | 'paid' | 'cancelled';

export const load: PageServerLoad = async ({ locals, url }) => {
	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();

	if (userError || !user) {
		throw redirect(303, '/login');
	}

	// ------------------------------------------------------------
	// TEAM CHECK
	// ------------------------------------------------------------

	const { data: isTeam, error: teamError } = await locals.supabase.rpc('is_team');

	if (teamError) {
		console.error('is_team error:', teamError);

		throw error(500, 'Berechtigungen konnten nicht geprüft werden.');
	}

	if (!isTeam) {
		throw redirect(303, '/');
	}

	// ------------------------------------------------------------
	// FILTERS
	// ------------------------------------------------------------

	const rawStatus = url.searchParams.get('status') ?? 'all';
	const search = (url.searchParams.get('search') ?? '').trim();

	const status: 'all' | PayoutStatus =
		rawStatus === 'pending' || rawStatus === 'paid' || rawStatus === 'cancelled'
			? rawStatus
			: 'all';

	// ------------------------------------------------------------
	// PAYOUTS
	// ------------------------------------------------------------

	const { data: payoutRows, error: payoutError } = await locals.supabase
		.from('payout_requests')
		.select(
			`
				id,
				user_id,
				deal_id,
				casino_name,
				casino_email,
				amount,
				screenshot_path,
				status,
				moderator_note,
				reviewed_by,
				reviewed_at,
				created_at
			`
		)
		.order('created_at', { ascending: false })
		.limit(500);

	if (payoutError) {
		console.error('Payout load error:', payoutError);

		throw error(500, 'Auszahlungen konnten nicht geladen werden.');
	}

	const payouts = payoutRows ?? [];

	// ------------------------------------------------------------
	// USER PROFILES
	// ------------------------------------------------------------

	const userIds = [...new Set(payouts.map((payout) => payout.user_id).filter(Boolean))];

	const reviewerIds = [
		...new Set(
			payouts.map((payout) => payout.reviewed_by).filter((id): id is string => Boolean(id))
		)
	];

	const allProfileIds = [...new Set([...userIds, ...reviewerIds])];

	let profileMap = new Map<
		string,
		{
			id: string;
			username: string | null;
			email: string | null;
			avatar_url: string | null;
		}
	>();

	if (allProfileIds.length > 0) {
		const { data: profiles, error: profilesError } = await locals.supabase
			.from('profiles')
			.select(
				`
					id,
					username,
					email,
					avatar_url
				`
			)
			.in('id', allProfileIds);

		if (profilesError) {
			console.error('Profiles load error:', profilesError);

			throw error(500, 'Userdaten konnten nicht geladen werden.');
		}

		profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
	}

	// ------------------------------------------------------------
	// PRIVATE SCREENSHOT URLS
	// ------------------------------------------------------------

	const screenshotPaths = payouts
		.map((payout) => payout.screenshot_path)
		.filter((path): path is string => typeof path === 'string' && path.length > 0);

	const signedUrlMap = new Map<string, string>();

	if (screenshotPaths.length > 0) {
		const { data: signedUrls, error: signedUrlError } = await locals.supabase.storage
			.from('payout-proofs')
			.createSignedUrls(screenshotPaths, 60 * 30);

		if (signedUrlError) {
			console.error('Payout proof signed URLs:', signedUrlError);
		} else {
			for (const item of signedUrls ?? []) {
				if (item.path && item.signedUrl) {
					signedUrlMap.set(item.path, item.signedUrl);
				}
			}
		}
	}

	// ------------------------------------------------------------
	// NORMALIZE
	// ------------------------------------------------------------

	const normalized = payouts.map((payout) => ({
		id: payout.id,
		user_id: payout.user_id,
		deal_id: payout.deal_id,

		casino_name: payout.casino_name,
		casino_email: payout.casino_email,

		amount: Number(payout.amount),

		screenshot_path: payout.screenshot_path,
		screenshot_url: signedUrlMap.get(payout.screenshot_path) ?? null,

		status: payout.status as PayoutStatus,

		moderator_note: payout.moderator_note,

		reviewed_by: payout.reviewed_by,
		reviewed_at: payout.reviewed_at,

		created_at: payout.created_at,

		user: profileMap.get(payout.user_id) ?? null,

		reviewer: payout.reviewed_by ? (profileMap.get(payout.reviewed_by) ?? null) : null
	}));

	// ------------------------------------------------------------
	// STATS - immer über ALLE Requests
	// ------------------------------------------------------------

	const stats = {
		total: normalized.length,

		pending: normalized.filter((payout) => payout.status === 'pending').length,

		paid: normalized.filter((payout) => payout.status === 'paid').length,

		cancelled: normalized.filter((payout) => payout.status === 'cancelled').length,

		pendingAmount: normalized
			.filter((payout) => payout.status === 'pending')
			.reduce((sum, payout) => sum + payout.amount, 0)
	};

	// ------------------------------------------------------------
	// FILTER
	// ------------------------------------------------------------

	let filtered = normalized;

	if (status !== 'all') {
		filtered = filtered.filter((payout) => payout.status === status);
	}

	if (search) {
		const needle = search.toLowerCase();

		filtered = filtered.filter((payout) => {
			const searchable = [
				payout.casino_name,
				payout.casino_email,
				payout.user?.username,
				payout.user?.email,
				payout.user_id
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return searchable.includes(needle);
		});
	}

	return {
		payouts: filtered,

		stats,

		filters: {
			status,
			search
		}
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const {
			data: { user },
			error: userError
		} = await locals.supabase.auth.getUser();

		if (userError || !user) {
			throw redirect(303, '/login');
		}

		// --------------------------------------------------------
		// TEAM CHECK
		// --------------------------------------------------------

		const { data: isTeam, error: teamError } = await locals.supabase.rpc('is_team');

		if (teamError || !isTeam) {
			return fail(403, {
				success: false,
				message: 'Keine Berechtigung.'
			});
		}

		const formData = await request.formData();

		const payoutId = String(formData.get('payout_id') ?? '').trim();

		const action = String(formData.get('status') ?? '').trim();

		const note = String(formData.get('moderator_note') ?? '').trim();

		if (!payoutId) {
			return fail(400, {
				success: false,
				message: 'Auszahlungsanfrage wurde nicht gefunden.'
			});
		}

		if (action !== 'paid' && action !== 'cancelled') {
			return fail(400, {
				success: false,
				message: 'Bitte wähle Ausgezahlt oder Storniert.'
			});
		}

		if (note.length > 1000) {
			return fail(400, {
				success: false,
				message: 'Die Notiz darf maximal 1000 Zeichen lang sein.'
			});
		}

		// --------------------------------------------------------
		// RPC
		// --------------------------------------------------------

		const { error: reviewError } = await locals.supabase.rpc('review_payout_request', {
			p_request_id: payoutId,
			p_action: action,
			p_note: note || null
		});

		if (reviewError) {
			console.error('Review payout error:', reviewError);

			return fail(400, {
				success: false,
				message: reviewError.message || 'Die Auszahlung konnte nicht bearbeitet werden.'
			});
		}

		return {
			success: true,
			message:
				action === 'paid'
					? 'Die Auszahlung wurde als ausgezahlt markiert.'
					: 'Die Auszahlung wurde storniert und die Balance wurde zurückgebucht.'
		};
	}
};
