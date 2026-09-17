import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const MIN_PAYOUT = 30;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function isUuid(value: string) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function extensionFromMime(type: string) {
	switch (type) {
		case 'image/png':
			return 'png';

		case 'image/webp':
			return 'webp';

		case 'image/jpeg':
		default:
			return 'jpg';
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();

	if (userError || !user) {
		throw redirect(303, '/login');
	}

	const [profileResult, dealsResult, payoutsResult] = await Promise.all([
		locals.supabase.from('profiles').select('balance').eq('id', user.id).single(),

		locals.supabase
			.from('deals')
			.select('id, brand, logourl')
			.order('position', { ascending: true }),

		locals.supabase
			.from('payout_requests')
			.select(
				`
				id,
				deal_id,
				casino_name,
				casino_email,
				amount,
				status,
				moderator_note,
				reviewed_at,
				created_at
			`
			)
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(10)
	]);

	if (profileResult.error) {
		console.error('Profile error:', profileResult.error);

		throw error(500, 'Dein Profil konnte nicht geladen werden.');
	}

	if (dealsResult.error) {
		console.error('Deals error:', dealsResult.error);

		throw error(500, 'Die Casinos konnten nicht geladen werden.');
	}

	if (payoutsResult.error) {
		console.error('Payouts error:', payoutsResult.error);

		throw error(500, 'Deine Auszahlungen konnten nicht geladen werden.');
	}

	return {
		balance: Number(profileResult.data?.balance ?? 0),

		deals: dealsResult.data ?? [],

		payouts: (payoutsResult.data ?? []).map((payout) => ({
			...payout,
			amount: Number(payout.amount)
		}))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const {
			data: { user },
			error: userError
		} = await locals.supabase.auth.getUser();

		if (userError || !user) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();

		const dealId = String(formData.get('deal_id') ?? '').trim();
		const casinoEmail = String(formData.get('casino_email') ?? '').trim();

		const rawAmount = String(formData.get('amount') ?? '').trim();

		const screenshot = formData.get('screenshot');

		// ---------------------------------------------------------
		// CASINO
		// ---------------------------------------------------------

		if (!dealId || !isUuid(dealId)) {
			return fail(400, {
				message: 'Bitte wähle ein gültiges Casino aus.'
			});
		}

		// ---------------------------------------------------------
		// EMAIL
		// ---------------------------------------------------------

		if (!casinoEmail || !isEmail(casinoEmail)) {
			return fail(400, {
				message: 'Bitte gib die E-Mail-Adresse an, mit der du beim Casino registriert bist.'
			});
		}

		// ---------------------------------------------------------
		// AMOUNT
		// ---------------------------------------------------------

		const amount = Number(rawAmount);

		if (!Number.isFinite(amount)) {
			return fail(400, {
				message: 'Bitte gib einen gültigen Auszahlungsbetrag ein.'
			});
		}

		const roundedAmount = Math.round(amount * 100) / 100;

		if (roundedAmount < MIN_PAYOUT) {
			return fail(400, {
				message: `Der Mindestbetrag für eine Auszahlung beträgt ${MIN_PAYOUT} €.`
			});
		}

		// ---------------------------------------------------------
		// FILE
		// ---------------------------------------------------------

		if (!(screenshot instanceof File) || screenshot.size === 0) {
			return fail(400, {
				message: 'Bitte lade einen Screenshot als Nachweis hoch.'
			});
		}

		if (!ALLOWED_FILE_TYPES.includes(screenshot.type)) {
			return fail(400, {
				message: 'Als Screenshot sind nur JPG, PNG oder WebP erlaubt.'
			});
		}

		if (screenshot.size > MAX_FILE_SIZE) {
			return fail(400, {
				message: 'Der Screenshot darf maximal 5 MB groß sein.'
			});
		}

		// ---------------------------------------------------------
		// SCREENSHOT UPLOAD
		// ---------------------------------------------------------

		const extension = extensionFromMime(screenshot.type);

		const screenshotPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

		const { error: uploadError } = await locals.supabase.storage
			.from('payout-proofs')
			.upload(screenshotPath, screenshot, {
				contentType: screenshot.type,
				cacheControl: '3600',
				upsert: false
			});

		if (uploadError) {
			console.error('Payout screenshot upload:', uploadError);

			return fail(500, {
				message: 'Der Screenshot konnte nicht hochgeladen werden. Bitte versuche es erneut.'
			});
		}

		// ---------------------------------------------------------
		// PAYOUT RPC
		// ---------------------------------------------------------

		const { data: payoutId, error: payoutError } = await locals.supabase.rpc(
			'create_payout_request',
			{
				p_deal_id: dealId,
				p_email: casinoEmail,
				p_amount: roundedAmount,
				p_screenshot_path: screenshotPath
			}
		);

		if (payoutError) {
			console.error('Create payout error:', payoutError);

			// Upload entfernen, weil keine Auszahlung erstellt wurde
			const { error: cleanupError } = await locals.supabase.storage
				.from('payout-proofs')
				.remove([screenshotPath]);

			if (cleanupError) {
				console.error('Payout screenshot cleanup:', cleanupError);
			}

			return fail(400, {
				message: payoutError.message || 'Die Auszahlung konnte nicht erstellt werden.'
			});
		}

		return {
			success: true,
			payoutId,
			message:
				'Deine Auszahlung wurde erfolgreich angefragt und wird jetzt von unserem Team geprüft.'
		};
	}
};
