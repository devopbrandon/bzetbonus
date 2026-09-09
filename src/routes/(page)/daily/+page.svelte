<script lang="ts">
	import {
		CalendarDays,
		Check,
		Coins,
		Flame,
		Gift,
		LockKeyhole,
		Trophy,
		WalletCards,
		Zap
	} from 'lucide-svelte';

	import { onMount, tick } from 'svelte';

	let { data } = $props();

	type Reward = {
		id: string;
		streak_day: number;
		reward_type: 'nothing' | 'points' | 'balance';
		label: string;
		reward_value: number;
		weight: number;
		position: number;
	};

	type SpinResult = {
		success: boolean;
		message?: string;

		reward?: {
			id: string;
			type: 'nothing' | 'points' | 'balance';
			label: string;
			value: number;
			position: number;
		};

		streakDay?: number;
		points?: number;
		balance?: number;
	};

	const SPIN_DURATION = 5600;

	let spinning = $state(false);
	let canSpin = $state(data.canSpin);

	let streakDay = $state(data.streakDay);
	let wheelDay = $state(data.wheelDay);

	let points = $state(data.points);
	let balance = $state(data.balance);

	let wheelRotation = $state(0);

	let result = $state<SpinResult['reward'] | null>(null);

	let showResult = $state(false);
	let errorMessage = $state('');

	let wheelElement: HTMLDivElement | undefined;

	let tickAudio: HTMLAudioElement | null = null;
	let winAudio: HTMLAudioElement | null = null;

	let tickAnimationFrame: number | null = null;
	let lastPointerSegment: number | null = null;

	const rewards = $derived(data.rewards as Reward[]);

	const totalWeight = $derived(rewards.reduce((total, reward) => total + reward.weight, 0));

	const segments = $derived.by(() => {
		let currentWeight = 0;

		return rewards.map((reward, index) => {
			const start = (currentWeight / totalWeight) * 360;

			currentWeight += reward.weight;

			const end = (currentWeight / totalWeight) * 360;
			const middle = start + (end - start) / 2;

			return {
				...reward,
				start,
				end,
				middle,
				index
			};
		});
	});

	const wheelGradient = $derived.by(() => {
		if (!segments.length) {
			return '#11151d';
		}

		const blues = ['#111720', '#151c26', '#101821', '#17212c', '#121a24', '#19232d'];

		const parts = segments.map((segment, index) => {
			let color = blues[index % blues.length];

			if (segment.reward_type === 'nothing') {
				color = '#0d1117';
			}

			if (segment.reward_type === 'balance') {
				color = '#19324a';
			}

			return `${color} ${segment.start}deg ${segment.end}deg`;
		});

		return `conic-gradient(from 0deg, ${parts.join(', ')})`;
	});

	onMount(() => {
		tickAudio = new Audio('/sounds/tick.mp3');
		tickAudio.preload = 'auto';
		tickAudio.volume = 0.24;

		winAudio = new Audio('/sounds/win.mp3');
		winAudio.preload = 'auto';
		winAudio.volume = 0.62;

		return () => {
			stopTickTracking();
		};
	});

	function formatBalance(value: number) {
		return new Intl.NumberFormat('de-DE', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(value);
	}

	function normalizeAngle(angle: number) {
		return ((angle % 360) + 360) % 360;
	}

	function playTick() {
		if (!tickAudio) return;

		try {
			const sound = tickAudio.cloneNode() as HTMLAudioElement;

			sound.volume = 0.24;

			sound.play().catch(() => {});
		} catch {
			// nur audio feedback
		}
	}

	function playWin() {
		if (!winAudio) return;

		winAudio.currentTime = 0;
		winAudio.play().catch(() => {});
	}

	function getRenderedWheelRotation() {
		if (!wheelElement) {
			return normalizeAngle(wheelRotation);
		}

		const transform = getComputedStyle(wheelElement).transform;

		if (!transform || transform === 'none') {
			return normalizeAngle(wheelRotation);
		}

		try {
			const matrix = new DOMMatrixReadOnly(transform);

			const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);

			return normalizeAngle(angle);
		} catch {
			return normalizeAngle(wheelRotation);
		}
	}

	function getPointerSegmentIndex() {
		if (!segments.length) {
			return null;
		}

		const renderedRotation = getRenderedWheelRotation();

		const pointerAngle = normalizeAngle(360 - renderedRotation);

		const segment = segments.find((item) => pointerAngle >= item.start && pointerAngle < item.end);

		return segment?.index ?? 0;
	}

	function startTickTracking() {
		stopTickTracking();

		lastPointerSegment = getPointerSegmentIndex();

		const monitor = () => {
			const currentSegment = getPointerSegmentIndex();

			if (
				currentSegment !== null &&
				lastPointerSegment !== null &&
				currentSegment !== lastPointerSegment
			) {
				playTick();

				lastPointerSegment = currentSegment;
			}

			if (spinning) {
				tickAnimationFrame = requestAnimationFrame(monitor);
			}
		};

		tickAnimationFrame = requestAnimationFrame(monitor);
	}

	function stopTickTracking() {
		if (tickAnimationFrame !== null) {
			cancelAnimationFrame(tickAnimationFrame);

			tickAnimationFrame = null;
		}

		lastPointerSegment = null;
	}

	function getTargetRotation(rewardId: string) {
		const segment = segments.find((item) => item.id === rewardId);

		if (!segment) {
			return wheelRotation + 7 * 360;
		}

		const segmentSize = segment.end - segment.start;

		const safePadding = Math.min(Math.max(segmentSize * 0.18, 1), 5);

		const min = segment.start + safePadding;

		const max = segment.end - safePadding;

		const landingAngle = max > min ? min + Math.random() * (max - min) : segment.middle;

		const currentNormalized = normalizeAngle(wheelRotation);

		const desiredNormalized = normalizeAngle(360 - landingAngle);

		let correction = desiredNormalized - currentNormalized;

		if (correction < 0) {
			correction += 360;
		}

		return wheelRotation + 7 * 360 + correction;
	}

	async function spinWheel() {
		if (spinning || !canSpin || !rewards.length) {
			return;
		}

		spinning = true;

		errorMessage = '';
		result = null;
		showResult = false;

		try {
			const response = await fetch('/api/open-wheel', {
				method: 'POST'
			});

			const payload: SpinResult = await response.json();

			if (!response.ok || !payload.success || !payload.reward) {
				throw new Error(payload.message ?? 'Spin fehlgeschlagen.');
			}

			const targetRotation = getTargetRotation(payload.reward.id);

			await tick();

			startTickTracking();

			requestAnimationFrame(() => {
				wheelRotation = targetRotation;
			});

			await new Promise<void>((resolve) => {
				setTimeout(resolve, SPIN_DURATION + 120);
			});

			stopTickTracking();

			result = payload.reward;

			if (payload.streakDay !== undefined) {
				streakDay = payload.streakDay;
			}

			if (payload.points !== undefined) {
				points = payload.points;
			}

			if (payload.balance !== undefined) {
				balance = payload.balance;
			}

			canSpin = false;

			await new Promise<void>((resolve) => {
				setTimeout(resolve, 180);
			});

			playWin();

			showResult = true;
		} catch (error) {
			stopTickTracking();

			errorMessage =
				error instanceof Error ? error.message : 'Beim Drehen ist etwas schiefgelaufen.';
		} finally {
			spinning = false;
		}
	}
</script>

<svelte:head>
	<title>Tägliches Rad | BZETBONUS</title>

	<meta
		name="description"
		content="Drehe täglich am BZETBONUS Wheel und baue deine 7-Tage-Streak auf."
	/>
</svelte:head>

<section class="min-h-screen px-4 pb-24 pt-12 text-white sm:px-6 lg:px-10">
	<div class="mx-auto max-w-[1180px]">
		<!-- PAGE HEADER -->
		<header
			class="page-enter page-enter-1 mb-8 flex flex-col gap-5 border-b border-white/[0.055] pb-7 md:flex-row md:items-end md:justify-between"
		>
			<div>
				<div
					class="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8dc7ff]/70"
				>
					<Zap size={13} strokeWidth={2} />

					Tägliches Rad
				</div>

				<h1 class="text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl">Daily Streak</h1>

				<p class="mt-2 max-w-xl text-[13px] leading-6 text-white/38">
					Drehe einmal pro Tag und baue deine Streak auf. Mit jedem Tag werden die möglichen Rewards
					besser.
				</p>
			</div>

			<div
				class="flex items-center gap-2 rounded-lg border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.045] px-3.5 py-2.5"
			>
				<Trophy size={15} class="text-[#8dc7ff]" />

				<div>
					<div class="text-[9px] font-bold uppercase tracking-[0.11em] text-white/25">Tag 7</div>

					<div class="text-[11px] font-bold text-white/70">
						Chance auf
						<span class="text-[#8dc7ff]"> 25€ </span>
					</div>
				</div>
			</div>
		</header>

		<!-- STATS -->
		<div class="page-enter page-enter-2 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
			<div class="stat">
				<div class="stat-icon">
					<Flame size={14} />
				</div>

				<div>
					<div class="stat-label">Streak</div>

					<div class="stat-value">
						{streakDay}/7
					</div>
				</div>
			</div>

			<div class="stat">
				<div class="stat-icon">
					<Coins size={14} />
				</div>

				<div>
					<div class="stat-label">Points</div>

					<div class="stat-value">
						{points.toLocaleString('de-DE')}
					</div>
				</div>
			</div>

			<div class="stat">
				<div class="stat-icon">
					<WalletCards size={14} />
				</div>

				<div>
					<div class="stat-label">Balance</div>

					<div class="stat-value">
						{formatBalance(balance)}€
					</div>
				</div>
			</div>

			<div class="stat">
				<div class="stat-icon">
					<CalendarDays size={14} />
				</div>

				<div>
					<div class="stat-label">Heute</div>

					<div class="stat-value">
						Tag {wheelDay}
					</div>
				</div>
			</div>
		</div>

		<!-- DAYS -->
		<div class="page-enter page-enter-3 mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
			{#each Array(7) as _, index}
				{@const day = index + 1}

				{@const completed = day <= streakDay}

				{@const active = canSpin && day === wheelDay}

				{@const jackpot = day === 7}

				<div
					class={[
						'day-card',
						completed ? 'day-completed' : active ? 'day-active' : '',
						jackpot ? 'day-jackpot' : ''
					]}
					style={`animation-delay: ${180 + index * 45}ms`}
				>
					<div class={['day-icon', active ? 'day-icon-active' : '']}>
						{#if completed}
							<Check size={14} strokeWidth={3} class="text-[#8dc7ff]" />
						{:else if active}
							<Flame size={14} class="text-[#8dc7ff]" />
						{:else if jackpot}
							<Trophy size={14} class="text-[#8dc7ff]/80" />
						{:else}
							<LockKeyhole size={13} class="text-white/18" />
						{/if}
					</div>

					<div
						class="mt-2 text-[9px] font-bold uppercase tracking-[0.08em] text-white/38 sm:text-[10px]"
					>
						Tag {day}
					</div>

					{#if jackpot}
						<div class="mt-0.5 hidden text-[8px] font-bold text-[#8dc7ff]/65 sm:block">
							25€ Chance
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- MAIN -->
		<div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
			<!-- WHEEL PANEL -->
			<div
				class="page-enter page-enter-4 rounded-xl border border-white/[0.065] bg-[#0e1117] p-4 sm:p-6"
			>
				<div class="mb-5 flex items-center justify-between border-b border-white/[0.05] pb-4">
					<div>
						<div class="text-[9px] font-bold uppercase tracking-[0.13em] text-white/25">
							Dein heutiger Spin
						</div>

						<div class="mt-1 text-lg font-bold tracking-[-0.025em] text-white">
							Wheel · Tag
							{wheelDay}
						</div>
					</div>

					<div
						class={[
							'rounded-md border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em]',
							canSpin
								? 'border-[#8dc7ff]/15 bg-[#8dc7ff]/[0.055] text-[#8dc7ff]'
								: 'border-white/[0.06] bg-white/[0.025] text-white/25'
						]}
					>
						{canSpin ? 'Bereit' : 'Erledigt'}
					</div>
				</div>

				<div class="relative mx-auto aspect-square w-full max-w-[500px]">
					<!-- POINTER WRAPPER: POSITION BLEIBT IMMER FIX -->
					<div class="absolute left-1/2 top-[-6px] z-40 -translate-x-1/2">
						<div class={`pointer-tip ${spinning ? 'pointer-tip-spinning' : ''}`}>
							<div
								class="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-[#8dc7ff] sm:border-l-[14px] sm:border-r-[14px] sm:border-t-[25px]"
							></div>
						</div>
					</div>

					<!-- OUTER WHEEL -->
					<div class={`wheel-shell ${spinning ? 'wheel-shell-spinning' : ''}`}>
						<div class="absolute inset-[5px] rounded-full border border-white/[0.035]"></div>

						<div
							bind:this={wheelElement}
							class="relative h-full w-full overflow-hidden rounded-full border border-white/[0.06] will-change-transform"
							style:background={wheelGradient}
							style:transform={`rotate(${wheelRotation}deg)`}
							style:transition={spinning
								? `transform ${SPIN_DURATION}ms cubic-bezier(0.08, 0.7, 0.08, 1)`
								: 'none'}
						>
							<!-- SEGMENT LINES -->
							{#each segments as segment}
								<div
									class="pointer-events-none absolute left-1/2 top-1/2 z-10 h-px w-1/2 origin-left bg-white/[0.10]"
									style:transform={`rotate(${segment.start - 90}deg)`}
								></div>
							{/each}

							<!-- LABELS -->
							{#each segments as segment}
								<div
									class="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[45%] origin-left"
									style:transform={`rotate(${segment.middle - 90}deg) translateY(-50%)`}
								>
									<div class="flex justify-end pr-[15%]">
										<span
											class={[
												'block max-w-[85px] text-center text-[8px] font-bold leading-[1.1] uppercase tracking-[0.025em] sm:max-w-[110px] sm:text-[10px]',
												segment.reward_type === 'balance'
													? 'text-[#8dc7ff]'
													: segment.reward_type === 'nothing'
														? 'text-white/28'
														: 'text-white/68'
											]}
											style:transform={`rotate(${90 - segment.middle}deg)`}
										>
											{segment.label}
										</span>
									</div>
								</div>
							{/each}

							<!-- SUBTLE INNER SHADE -->
							<div
								class="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,transparent_0%,transparent_50%,rgba(0,0,0,0.22)_100%)]"
							></div>
						</div>
					</div>

					<!-- CENTER -->
					<div class={`wheel-center ${spinning ? 'wheel-center-spinning' : ''}`}>
						<div class="absolute inset-[6px] rounded-full border border-white/[0.04]"></div>

						<Gift size={27} strokeWidth={1.7} class="relative text-white/60" />
					</div>
				</div>

				<div class="mx-auto mt-7 max-w-sm">
					<button
						type="button"
						onclick={spinWheel}
						disabled={!canSpin || spinning}
						class={[
							'flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.055em] transition duration-200 disabled:cursor-not-allowed',
							canSpin
								? 'bg-white text-[#10141b] hover:bg-[#e9edf2]'
								: 'border border-white/[0.06] bg-white/[0.025] text-white/25'
						]}
					>
						{#if spinning}
							<div
								class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/15 border-t-black/70"
							></div>

							Wheel dreht...
						{:else if canSpin}
							<Zap size={15} strokeWidth={2.3} />

							Jetzt drehen
						{:else}
							<Check size={15} />

							Heute bereits gedreht
						{/if}
					</button>

					{#if !canSpin}
						<p class="mt-2.5 text-center text-[10px] text-white/22">
							Der nächste Spin ist morgen ab 00:00 Uhr verfügbar.
						</p>
					{/if}

					{#if errorMessage}
						<div
							class="mt-3 rounded-lg border border-red-400/10 bg-red-400/[0.045] px-3 py-2.5 text-center text-[11px] text-red-300"
						>
							{errorMessage}
						</div>
					{/if}
				</div>
			</div>

			<!-- RIGHT COLUMN -->
			<aside class="space-y-3">
				<div
					class="page-enter page-enter-5 overflow-hidden rounded-xl border border-white/[0.065] bg-[#0e1117]"
				>
					<div class="border-b border-white/[0.05] px-4 py-3.5">
						<div class="flex items-center gap-2.5">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-md border border-[#8dc7ff]/12 bg-[#8dc7ff]/[0.045]"
							>
								<Trophy size={15} class="text-[#8dc7ff]" />
							</div>

							<div>
								<div class="text-[12px] font-bold text-white/85">Tag 7</div>

								<div class="text-[8px] font-bold uppercase tracking-[0.12em] text-white/22">
									Jackpot Day
								</div>
							</div>
						</div>
					</div>

					<div class="p-4">
						<div class="rounded-lg border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.035] p-4">
							<div class="text-[8px] font-bold uppercase tracking-[0.12em] text-[#8dc7ff]/55">
								Hauptgewinn
							</div>

							<div class="mt-1 text-3xl font-black tracking-[-0.05em] text-white">
								25<span class="text-[#8dc7ff]"> € </span>
							</div>

							<div class="mt-1 text-[10px] text-white/26">BZETBONUS Guthaben</div>
						</div>
					</div>
				</div>

				<div
					class="page-enter page-enter-6 rounded-xl border border-white/[0.065] bg-[#0e1117] p-4"
				>
					<div class="text-[9px] font-bold uppercase tracking-[0.13em] text-white/22">
						So funktioniert's
					</div>

					<div class="mt-4 space-y-4">
						<div class="info-row">
							<div class="info-number">01</div>

							<p>Jeden Tag einmal kostenlos drehen.</p>
						</div>

						<div class="info-row">
							<div class="info-number">02</div>

							<p>Die möglichen Points steigen mit deiner Streak.</p>
						</div>

						<div class="info-row">
							<div class="info-number">03</div>

							<p>Verpasst du einen Tag, startest du wieder bei Tag 1.</p>
						</div>

						<div class="info-row">
							<div class="info-number info-number-special">07</div>

							<p>
								An Tag 7 hast du die Chance auf
								<strong class="font-semibold text-[#8dc7ff]"> 25€ Balance. </strong>
							</p>
						</div>
					</div>
				</div>
			</aside>
		</div>
	</div>

	{#if showResult && result}
		<div
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
		>
			<button
				type="button"
				class="absolute inset-0 cursor-default"
				aria-label="Schließen"
				onclick={() => {
					showResult = false;
				}}
			></button>

			<div
				class="reward-modal relative w-full max-w-[360px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#10141b] shadow-[0_25px_80px_rgba(0,0,0,0.65)]"
			>
				<div class="border-b border-white/[0.055] px-5 py-4">
					<div class="text-[9px] font-bold uppercase tracking-[0.13em] text-white/25">
						Spin abgeschlossen
					</div>
				</div>

				<div class="p-6 text-center">
					<div
						class={[
							'reward-icon mx-auto flex h-14 w-14 items-center justify-center rounded-lg border',
							result.type === 'balance'
								? 'border-[#8dc7ff]/15 bg-[#8dc7ff]/[0.05] text-[#8dc7ff]'
								: result.type === 'points'
									? 'border-white/[0.08] bg-white/[0.03] text-white/70'
									: 'border-white/[0.06] bg-white/[0.02] text-white/25'
						]}
					>
						{#if result.type === 'balance'}
							<WalletCards size={24} />
						{:else if result.type === 'points'}
							<Coins size={24} />
						{:else}
							<Gift size={24} />
						{/if}
					</div>

					<div class="mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-white/22">
						{result.type === 'nothing' ? 'Dein Ergebnis' : 'Gewonnen'}
					</div>

					<h3
						class={[
							'mt-1 text-2xl font-black tracking-[-0.04em]',
							result.type === 'balance' ? 'text-[#8dc7ff]' : 'text-white'
						]}
					>
						{result.label}
					</h3>

					{#if result.type === 'nothing'}
						<p class="mx-auto mt-2 max-w-[250px] text-[12px] leading-5 text-white/30">
							Diesmal leider nichts. Morgen geht deine Streak weiter.
						</p>
					{:else}
						<p class="mx-auto mt-2 max-w-[250px] text-[12px] leading-5 text-white/30">
							Dein Gewinn wurde deinem Account gutgeschrieben.
						</p>
					{/if}

					<button
						type="button"
						onclick={() => {
							showResult = false;
						}}
						class="mt-5 h-11 w-full cursor-pointer rounded-lg bg-white text-[10px] font-bold uppercase tracking-[0.06em] text-[#10141b] transition hover:bg-[#e9edf2]"
					>
						Weiter
					</button>
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	.page-enter {
		opacity: 0;
		transform: translateY(10px);
		animation: pageEntrance 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.page-enter-1 {
		animation-delay: 20ms;
	}

	.page-enter-2 {
		animation-delay: 70ms;
	}

	.page-enter-3 {
		animation-delay: 120ms;
	}

	.page-enter-4 {
		animation-delay: 170ms;
	}

	.page-enter-5 {
		animation-delay: 220ms;
	}

	.page-enter-6 {
		animation-delay: 270ms;
	}

	.stat {
		display: flex;
		min-height: 67px;
		align-items: center;
		gap: 12px;
		border: 1px solid rgb(255 255 255 / 0.055);
		border-radius: 10px;
		background: #0e1117;
		padding: 12px 14px;
		transition:
			border-color 160ms ease,
			background 160ms ease;
	}

	.stat:hover {
		border-color: rgb(141 199 255 / 0.12);
		background: #10141b;
	}

	.stat-icon {
		display: flex;
		height: 32px;
		width: 32px;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(141 199 255 / 0.08);
		border-radius: 7px;
		background: rgb(141 199 255 / 0.035);
		color: rgb(141 199 255 / 0.65);
	}

	.stat-label {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: rgb(255 255 255 / 0.22);
	}

	.stat-value {
		margin-top: 2px;
		font-size: 17px;
		font-weight: 800;
		letter-spacing: -0.025em;
		color: rgb(255 255 255 / 0.88);
	}

	.day-card {
		opacity: 0;
		min-height: 75px;
		border: 1px solid rgb(255 255 255 / 0.045);
		border-radius: 9px;
		background: #0c0f14;
		padding: 11px 4px 9px;
		text-align: center;
		transform: translateY(7px);
		animation: dayEntrance 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		transition:
			border-color 160ms ease,
			background 160ms ease;
	}

	.day-active {
		border-color: rgb(141 199 255 / 0.22);
		background: rgb(141 199 255 / 0.045);
	}

	.day-completed {
		border-color: rgb(141 199 255 / 0.1);
		background: rgb(141 199 255 / 0.025);
	}

	.day-jackpot {
		border-color: rgb(141 199 255 / 0.09);
	}

	.day-icon {
		display: flex;
		height: 28px;
		width: 28px;
		margin: 0 auto;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(255 255 255 / 0.055);
		border-radius: 6px;
		background: rgb(255 255 255 / 0.018);
	}

	.day-icon-active {
		border-color: rgb(141 199 255 / 0.14);
		background: rgb(141 199 255 / 0.055);
	}

	.wheel-shell {
		position: absolute;
		inset: 0;
		border: 1px solid rgb(255 255 255 / 0.07);
		border-radius: 9999px;
		background: #090d12;
		padding: 9px;
		box-shadow:
			0 18px 45px rgb(0 0 0 / 0.28),
			inset 0 1px 0 rgb(255 255 255 / 0.025);
		transition:
			border-color 250ms ease,
			box-shadow 250ms ease;
	}

	.wheel-shell-spinning {
		border-color: rgb(141 199 255 / 0.14);
		box-shadow:
			0 18px 55px rgb(0 0 0 / 0.35),
			0 0 0 1px rgb(141 199 255 / 0.025);
	}

	.wheel-center {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 30;
		display: flex;
		height: 22%;
		width: 22%;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(255 255 255 / 0.07);
		border-radius: 9999px;
		background: #0b1017;
		box-shadow:
			0 8px 24px rgb(0 0 0 / 0.45),
			inset 0 1px 0 rgb(255 255 255 / 0.025);
		transform: translate(-50%, -50%);
		transition:
			border-color 250ms ease,
			box-shadow 250ms ease;
	}

	.wheel-center-spinning {
		border-color: rgb(141 199 255 / 0.13);
		box-shadow:
			0 8px 28px rgb(0 0 0 / 0.5),
			0 0 25px rgb(141 199 255 / 0.035);
	}

	/*
		Der Wrapper außen übernimmt die
		Positionierung.

		Diese Animation verändert deshalb
		NUR den inneren Pfeil und kann ihn
		nicht mehr nach links verschieben.
	*/
	.pointer-tip {
		transform-origin: 50% 0%;
	}

	.pointer-tip-spinning {
		animation: pointerTick 0.34s ease-in-out infinite alternate;
	}

	.info-row {
		display: flex;
		gap: 10px;
	}

	.info-row p {
		padding-top: 1px;
		font-size: 10px;
		line-height: 1.6;
		font-weight: 500;
		color: rgb(255 255 255 / 0.3);
	}

	.info-number {
		display: flex;
		height: 25px;
		width: 25px;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(255 255 255 / 0.055);
		border-radius: 6px;
		background: rgb(255 255 255 / 0.018);
		font-size: 8px;
		font-weight: 800;
		color: rgb(255 255 255 / 0.45);
	}

	.info-number-special {
		border-color: rgb(141 199 255 / 0.12);
		background: rgb(141 199 255 / 0.035);
		color: #8dc7ff;
	}

	.reward-modal {
		animation: modalEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.reward-icon {
		animation: rewardIconEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both;
	}

	@keyframes pageEntrance {
		from {
			opacity: 0;
			transform: translateY(10px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes dayEntrance {
		from {
			opacity: 0;
			transform: translateY(7px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pointerTick {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(2.5deg);
		}
	}

	@keyframes modalEnter {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.98);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes rewardIconEnter {
		from {
			opacity: 0;
			transform: scale(0.8);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (min-width: 640px) {
		.wheel-shell {
			padding: 11px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.page-enter,
		.day-card,
		.pointer-tip-spinning,
		.reward-modal,
		.reward-icon {
			animation: none !important;
			opacity: 1;
			transform: none;
		}
	}
</style>
