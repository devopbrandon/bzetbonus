import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();

	if (userError || !user) {
		return json(
			{
				success: false,
				message: 'Nicht eingeloggt.'
			},
			{
				status: 401
			}
		);
	}

	const { data, error } = await locals.supabase.rpc('spin_daily_wheel');

	if (error) {
		console.error('Daily wheel error:', error);

		if (error.message.includes('ALREADY_SPUN_TODAY')) {
			return json(
				{
					success: false,
					message: 'Du hast heute bereits gedreht.'
				},
				{
					status: 409
				}
			);
		}

		return json(
			{
				success: false,
				message: 'Beim Drehen ist etwas schiefgelaufen.'
			},
			{
				status: 500
			}
		);
	}

	const result = Array.isArray(data) ? data[0] : data;

	if (!result) {
		return json(
			{
				success: false,
				message: 'Kein Ergebnis erhalten.'
			},
			{
				status: 500
			}
		);
	}

	return json({
		success: true,

		reward: {
			id: result.reward_id,
			type: result.reward_type,
			label: result.reward_label,
			value: Number(result.reward_value),
			position: result.reward_position
		},

		streakDay: result.streak_day,
		points: Number(result.new_points),
		balance: Number(result.new_balance)
	});
};
