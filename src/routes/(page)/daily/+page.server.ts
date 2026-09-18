import type { PageServerLoad } from './$types';

function getBerlinDate(date = new Date()) {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Berlin',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(date);
}

function getPreviousDate(dateString: string) {
	const [year, month, day] = dateString.split('-').map(Number);

	const date = new Date(Date.UTC(year, month - 1, day));
	date.setUTCDate(date.getUTCDate() - 1);

	return date.toISOString().slice(0, 10);
}

export const load: PageServerLoad = async ({ locals }) => {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	const today = getBerlinDate();
	const yesterday = getPreviousDate(today);

	/*
	 * Rewards dürfen auch Gäste sehen.
	 * Dadurch können wir Gästen das Tag-1-Wheel als Vorschau anzeigen.
	 */
	const { data: allRewards } = await locals.supabase
		.from('daily_wheel_rewards')
		.select('id, streak_day, reward_type, label, reward_value, weight, position')
		.eq('is_active', true)
		.order('streak_day')
		.order('position');

	/*
	 * GAST
	 *
	 * Kein Redirect mehr.
	 * Stattdessen bekommt der Gast neutrale Default-Werte
	 * und sieht das Wheel von Tag 1.
	 */
	if (!user) {
		const wheelDay = 1;

		const rewards = (allRewards ?? []).filter((reward) => reward.streak_day === wheelDay);

		return {
			user: null,

			isLoggedIn: false,

			points: 0,
			balance: 0,

			streakDay: 0,
			wheelDay,

			canSpin: false,

			totalSpins: 0,

			rewards
		};
	}

	/*
	 * EINGELOGGTER USER
	 */
	const [{ data: streak }, { data: profile }] = await Promise.all([
		locals.supabase
			.from('daily_streaks')
			.select('streak_day, last_spin_date, total_spins')
			.eq('user_id', user.id)
			.maybeSingle(),

		locals.supabase.from('profiles').select('points, balance').eq('id', user.id).single()
	]);

	const storedStreakDay = streak?.streak_day ?? 0;
	const lastSpinDate = streak?.last_spin_date ?? null;

	const alreadySpunToday = lastSpinDate === today;

	let displayStreak = 0;
	let wheelDay = 1;

	if (alreadySpunToday) {
		displayStreak = storedStreakDay;

		wheelDay = storedStreakDay || 1;
	} else if (lastSpinDate === yesterday) {
		displayStreak = storedStreakDay;

		wheelDay = storedStreakDay >= 7 ? 1 : storedStreakDay + 1;
	} else {
		displayStreak = 0;
		wheelDay = 1;
	}

	const rewards = (allRewards ?? []).filter((reward) => reward.streak_day === wheelDay);

	return {
		user: {
			id: user.id
		},

		isLoggedIn: true,

		points: profile?.points ?? 0,
		balance: Number(profile?.balance ?? 0),

		streakDay: displayStreak,
		wheelDay,

		canSpin: !alreadySpunToday,

		totalSpins: streak?.total_spins ?? 0,

		rewards
	};
};
