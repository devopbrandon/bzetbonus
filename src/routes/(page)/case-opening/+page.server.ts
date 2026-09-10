import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	let profile = null;

	if (user) {
		const { data: profileData, error: profileError } = await locals.supabase
			.from('profiles')
			.select('id, username, avatar_url, points, balance')
			.eq('id', user.id)
			.single();

		if (profileError) {
			console.error('Profile load error:', profileError);
		}

		profile = profileData ?? null;
	}

	const { data: cases, error: casesError } = await locals.supabase
		.from('cases')
		.select(
			`
			id,
			name,
			description,
			image_url,
			price_points,
			position,
			created_at,

			case_items (
				id,
				case_id,
				name,
				description,
				image_url,
				chance,
				rarity,
				value,
				reward_type,
				reward_amount,
				created_at
			)
		`
		)
		.eq('is_active', true)
		.order('position', {
			ascending: true
		});

	if (casesError) {
		console.error('Cases load error:', casesError);
	}

	const normalizedCases = (cases ?? []).map((caseItem) => ({
		...caseItem,
		case_items: [...(caseItem.case_items ?? [])].sort((a, b) => Number(a.chance) - Number(b.chance))
	}));

	let wins: any[] = [];

	if (user) {
		const { data: winsData, error: winsError } = await locals.supabase
			.from('case_wins')
			.select(
				`
				id,
				case_name,
				item_name,
				item_image_url,
				item_rarity,
				item_value,
				reward_type,
				reward_amount,
				points_spent,
				status,
				created_at
			`
			)
			.eq('user_id', user.id)
			.order('created_at', {
				ascending: false
			})
			.limit(12);

		if (winsError) {
			console.error('Wins load error:', winsError);
		}

		wins = winsData ?? [];
	}

	return {
		user: user
			? {
					id: user.id,
					email: user.email
				}
			: null,

		profile,
		cases: normalizedCases,
		wins
	};
};

export const actions: Actions = {
	open: async ({ request, locals }) => {
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (!user) {
			return fail(401, {
				success: false,
				message: 'Du musst eingeloggt sein, um Cases zu öffnen.'
			});
		}

		const formData = await request.formData();

		const caseId = formData.get('case_id');

		if (!caseId || typeof caseId !== 'string') {
			return fail(400, {
				success: false,
				message: 'Ungültiges Case.'
			});
		}

		const { data, error } = await locals.supabase.rpc('open_case', {
			p_case_id: caseId
		});

		if (error) {
			console.error('Open case error:', error);

			const message = error.message ?? '';

			if (message.includes('NOT_ENOUGH_POINTS')) {
				return fail(400, {
					success: false,
					message: 'Du hast nicht genügend Points.'
				});
			}

			if (message.includes('CASE_NOT_FOUND')) {
				return fail(404, {
					success: false,
					message: 'Dieses Case ist aktuell nicht verfügbar.'
				});
			}

			if (message.includes('INVALID_CASE_CHANCES')) {
				return fail(500, {
					success: false,
					message: 'Die Drop-Chancen dieses Cases sind fehlerhaft.'
				});
			}

			if (message.includes('NO_CASE_ITEMS')) {
				return fail(500, {
					success: false,
					message: 'Dieses Case enthält keine Drops.'
				});
			}

			if (message.includes('PROFILE_NOT_FOUND')) {
				return fail(404, {
					success: false,
					message: 'Dein Profil konnte nicht gefunden werden.'
				});
			}

			return fail(500, {
				success: false,
				message: 'Beim Öffnen ist ein Fehler aufgetreten.'
			});
		}

		return {
			success: true,
			opening: data
		};
	}
};
