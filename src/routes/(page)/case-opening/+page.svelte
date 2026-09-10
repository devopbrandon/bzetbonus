<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	import {
		Banknote,
		Box,
		Check,
		ChevronRight,
		Clock3,
		Coins,
		Gift,
		LockKeyhole,
		PackageOpen,
		ShieldCheck,
		Sparkles,
		Trophy,
		X
	} from 'lucide-svelte';

	let { data, form } = $props();

	type RewardType = 'item' | 'points' | 'balance';

	type CaseItem = {
		id: string;
		case_id: string;

		name: string;
		description: string | null;

		image_url: string | null;

		chance: number | string;

		rarity: string;

		value: number | null;

		reward_type: RewardType;
		reward_amount: number | null;

		created_at: string;
	};

	type Case = {
		id: string;

		name: string;
		description: string | null;

		image_url: string | null;

		price_points: number;

		position: number;

		created_at: string;

		case_items: CaseItem[];
	};

	type OpeningResult = {
		win_id: string;

		case_id: string;
		case_name: string;

		price_points: number;

		remaining_points: number;
		remaining_balance: number;

		status: string;

		item: CaseItem;
	};

	let selectedCase = $state<Case | null>(null);

	let opening = $state(false);

	let openingResult = $state<OpeningResult | null>(null);

	let reelItems = $state<CaseItem[]>([]);

	let reelOffset = $state(0);

	let revealWin = $state(false);

	let errorMessage = $state('');

	let tickAudio: HTMLAudioElement | null = null;

	let winAudio: HTMLAudioElement | null = null;

	let animationFrame: number | null = null;

	const ITEM_WIDTH = 150;
	const ITEM_GAP = 12;

	const ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_GAP;

	const WIN_INDEX = 42;

	const rarityLabels: Record<string, string> = {
		common: 'Common',
		uncommon: 'Uncommon',
		rare: 'Rare',
		epic: 'Epic',
		legendary: 'Legendary'
	};

	function formatPoints(value: number | null | undefined) {
		return new Intl.NumberFormat('de-DE').format(value ?? 0);
	}

	function formatMoney(value: number | null | undefined) {
		if (value === null || value === undefined) {
			return '—';
		}

		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(value);
	}

	function formatChance(value: number | string) {
		return Number(value).toLocaleString('de-DE', {
			maximumFractionDigits: 5
		});
	}

	function formatDate(value: string) {
		return new Intl.DateTimeFormat('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(value));
	}

	function rarityText(rarity: string) {
		switch (rarity) {
			case 'legendary':
				return 'text-[#e7cf77]';

			case 'epic':
				return 'text-[#b9a8ff]';

			case 'rare':
				return 'text-[#8dc7ff]';

			case 'uncommon':
				return 'text-[#75d5a7]';

			default:
				return 'text-white/40';
		}
	}

	function rarityLine(rarity: string) {
		switch (rarity) {
			case 'legendary':
				return 'bg-[#d7b84c]';

			case 'epic':
				return 'bg-[#957df1]';

			case 'rare':
				return 'bg-[#72b9ec]';

			case 'uncommon':
				return 'bg-[#62c493]';

			default:
				return 'bg-white/20';
		}
	}

	function rewardTypeLabel(type: RewardType) {
		if (type === 'points') {
			return 'Points';
		}

		if (type === 'balance') {
			return 'Balance';
		}

		return 'Sachpreis';
	}

	function rewardDisplay(item: CaseItem) {
		if (item.reward_type === 'points') {
			return `${formatPoints(item.reward_amount)} Points`;
		}

		if (item.reward_type === 'balance') {
			return `${formatMoney(item.reward_amount)} Balance`;
		}

		return item.name;
	}

	function statusLabel(status: string) {
		if (status === 'paid') {
			return 'Ausgezahlt';
		}

		if (status === 'cancelled') {
			return 'Storniert';
		}

		return 'Offen';
	}

	function statusClass(status: string) {
		if (status === 'paid') {
			return 'border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300';
		}

		if (status === 'cancelled') {
			return 'border-red-400/15 bg-red-400/[0.05] text-red-300';
		}

		return 'border-white/[0.07] bg-white/[0.025] text-white/35';
	}

	function randomItem(items: CaseItem[]) {
		return items[Math.floor(Math.random() * items.length)];
	}

	function createReel(items: CaseItem[], winner: CaseItem) {
		const generated: CaseItem[] = [];

		for (let i = 0; i < 70; i++) {
			generated.push(randomItem(items));
		}

		generated[WIN_INDEX] = winner;

		return generated;
	}

	function chooseCase(caseItem: Case) {
		if (opening) {
			return;
		}

		selectedCase = caseItem;

		openingResult = null;

		reelItems = [];

		reelOffset = 0;

		revealWin = false;

		errorMessage = '';
	}

	function closeCase() {
		if (opening) {
			return;
		}

		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);

			animationFrame = null;
		}

		selectedCase = null;

		openingResult = null;

		reelItems = [];

		reelOffset = 0;

		revealWin = false;

		errorMessage = '';
	}

	function playTick() {
		if (!tickAudio) {
			return;
		}

		try {
			/*
				Clone verhindert, dass schnelle
				Ticks sich gegenseitig abschneiden.
			*/
			const sound = tickAudio.cloneNode(true) as HTMLAudioElement;

			sound.volume = 0.18;

			void sound.play();
		} catch {
			//
		}
	}

	function playWin() {
		if (!winAudio) {
			return;
		}

		try {
			winAudio.pause();

			winAudio.currentTime = 0;

			winAudio.volume = 0.5;

			void winAudio.play();
		} catch {
			//
		}
	}

	/*
		Spin-Easing.

		Sehr schnell am Anfang,
		dann sauber ausrollend.
	*/
	function easeOutQuint(progress: number) {
		return 1 - Math.pow(1 - progress, 5);
	}

	function animateReel(targetOffset: number, duration: number) {
		return new Promise<void>((resolve) => {
			const startTime = performance.now();

			const startOffset = 0;

			let lastPassedIndex = -1;

			function frame(now: number) {
				const elapsed = now - startTime;

				const progress = Math.min(elapsed / duration, 1);

				const eased = easeOutQuint(progress);

				const currentOffset = startOffset + (targetOffset - startOffset) * eased;

				reelOffset = currentOffset;

				/*
						Der Marker sitzt exakt
						in der Mitte.

						-offset entspricht der
						Position im Reel unter
						dem Marker.
					*/
				const markerPosition = -currentOffset;

				const currentIndex = Math.max(
					0,
					Math.round((markerPosition - ITEM_WIDTH / 2) / ITEM_FULL_WIDTH)
				);

				/*
						Sobald ein neues Item
						unter den Marker kommt,
						spielt der Tick.
					*/
				if (currentIndex !== lastPassedIndex && currentIndex > 0) {
					lastPassedIndex = currentIndex;

					playTick();
				}

				if (progress < 1) {
					animationFrame = requestAnimationFrame(frame);

					return;
				}

				reelOffset = targetOffset;

				animationFrame = null;

				resolve();
			}

			animationFrame = requestAnimationFrame(frame);
		});
	}

	async function startOpening(result: OpeningResult) {
		if (!selectedCase) {
			return;
		}

		const items = selectedCase.case_items;

		if (!items.length) {
			opening = false;

			errorMessage = 'Dieses Case enthält keine Drops.';

			return;
		}

		openingResult = result;

		revealWin = false;

		reelItems = createReel(items, result.item);

		reelOffset = 0;

		await new Promise((resolve) => requestAnimationFrame(resolve));

		await new Promise((resolve) => requestAnimationFrame(resolve));

		/*
			Center des Gewinner-Items
			landet exakt auf dem Marker.
		*/
		const winnerCenter = WIN_INDEX * ITEM_FULL_WIDTH + ITEM_WIDTH / 2;

		const targetOffset = -winnerCenter;

		/*
			6.2 Sekunden Opening.
			Der Tick wird jetzt direkt
			aus der tatsächlichen
			Reel-Position berechnet.
		*/
		await animateReel(targetOffset, 6200);

		await new Promise((resolve) => setTimeout(resolve, 130));

		playWin();

		await new Promise((resolve) => setTimeout(resolve, 220));

		/*
			Kein zusätzlicher Block mehr:
			der Gewinner ersetzt jetzt
			direkt den Reel-Bereich.
		*/
		revealWin = true;

		opening = false;

		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Case Opening | BZETBONUS.COM</title>

	<meta
		name="description"
		content="Sammle Points, öffne BZETBONUS Cases und gewinne Points, Balance oder besondere Preise."
	/>
</svelte:head>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && selectedCase && !opening) {
			closeCase();
		}
	}}
/>

<audio bind:this={tickAudio} src="/sounds/tick.mp3" preload="auto"></audio>

<audio bind:this={winAudio} src="/sounds/win.mp3" preload="auto"></audio>

<div class="mx-auto w-full max-w-[1380px] px-5 pb-24 pt-12 sm:px-7 lg:px-10 lg:pt-16">
	<!-- PAGE INTRO -->

	<section
		class="flex flex-col gap-7 border-b border-white/[0.055] pb-8 lg:flex-row lg:items-end lg:justify-between"
	>
		<div>
			<div
				class="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#8dc7ff] uppercase"
			>
				<PackageOpen size={13} />

				Community
			</div>

			<h1
				class="mt-3 text-[38px] font-extrabold leading-none tracking-[-0.045em] text-white sm:text-[48px]"
			>
				Case Opening
			</h1>

			<p class="mt-4 max-w-[620px] text-[13px] leading-6 text-white/36 sm:text-[14px]">
				Sammle Points über BZETBONUS, öffne Cases und ziehe einen der hinterlegten Gewinne.
			</p>

			<div class="mt-5 flex flex-wrap gap-x-5 gap-y-2">
				<div class="flex items-center gap-1.5 text-[10px] font-medium text-white/25">
					<ShieldCheck size={12} class="text-[#8dc7ff]" />

					Faire Preise
				</div>

				<div class="flex items-center gap-1.5 text-[10px] font-medium text-white/25">
					<Check size={12} class="text-[#8dc7ff]" />

					Transparente Chancen
				</div>
			</div>
		</div>

		<div
			class="grid min-w-[260px] grid-cols-2 overflow-hidden rounded-xl border border-white/[0.065] bg-[#0e1116]"
		>
			<div class="px-4 py-3.5">
				<div class="text-[8px] font-bold tracking-[0.12em] text-white/20 uppercase">Points</div>

				<div class="mt-1 flex items-center gap-1.5 text-[15px] font-bold text-white">
					<Coins size={13} class="text-[#8dc7ff]" />

					{#if data.profile}
						{formatPoints(data.profile.points)}
					{:else}
						—
					{/if}
				</div>
			</div>

			<div class="border-l border-white/[0.055] px-4 py-3.5">
				<div class="text-[8px] font-bold tracking-[0.12em] text-white/20 uppercase">Balance</div>

				<div class="mt-1 flex items-center gap-1.5 text-[15px] font-bold text-white">
					<Banknote size={13} class="text-emerald-300" />

					{#if data.profile}
						{formatMoney(data.profile.balance)}
					{:else}
						—
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- CASES -->

	<section class="mt-9">
		<div class="mb-4 flex items-end justify-between">
			<div>
				<div class="text-[9px] font-bold tracking-[0.13em] text-white/22 uppercase">Alle Cases</div>

				<h2 class="mt-1 text-[19px] font-bold tracking-[-0.025em] text-white">Wähle dein Case</h2>
			</div>

			<div class="text-[10px] text-white/22">
				{data.cases.length}
				{data.cases.length === 1 ? ' Case' : ' Cases'}
			</div>
		</div>

		{#if data.cases.length}
			<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				{#each data.cases as caseItem}
					<button
						type="button"
						onclick={() => chooseCase(caseItem)}
						class="case-card group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.065] bg-[#0e1116] text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#8dc7ff]/20 hover:bg-[#10141a]"
					>
						<div
							class="relative flex h-[185px] items-center justify-center overflow-hidden border-b border-white/[0.055] bg-[#090c10]"
						>
							<div
								class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(141,199,255,0.055),transparent_60%)]"
							></div>

							{#if caseItem.image_url}
								<img
									src={caseItem.image_url}
									alt={caseItem.name}
									class="relative z-10 max-h-[135px] max-w-[70%] object-contain transition duration-300 group-hover:scale-[1.035]"
								/>
							{:else}
								<Box size={58} strokeWidth={1} class="relative z-10 text-white/12" />
							{/if}
						</div>

						<div class="p-4">
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0">
									<div class="truncate text-[16px] font-bold tracking-[-0.02em] text-white">
										{caseItem.name}
									</div>

									<p
										class="mt-1.5 line-clamp-2 min-h-[36px] text-[11px] leading-[18px] text-white/30"
									>
										{caseItem.description ??
											'Öffne das Case und sichere dir einen der verfügbaren Drops.'}
									</p>
								</div>

								<div
									class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-white/20 transition group-hover:border-[#8dc7ff]/15 group-hover:text-[#8dc7ff]"
								>
									<ChevronRight size={14} />
								</div>
							</div>

							<div class="mt-4 flex items-end justify-between border-t border-white/[0.055] pt-3.5">
								<div>
									<div class="text-[8px] font-bold tracking-[0.11em] text-white/20 uppercase">
										Öffnen für
									</div>

									<div class="mt-1 flex items-center gap-1.5 text-[14px] font-bold text-white">
										<Coins size={12} class="text-[#8dc7ff]" />

										{formatPoints(caseItem.price_points)}

										<span class="text-[9px] text-white/25"> PTS </span>
									</div>
								</div>

								<div class="text-right">
									<div class="text-[8px] font-bold tracking-[0.11em] text-white/20 uppercase">
										Drops
									</div>

									<div class="mt-1 text-[13px] font-bold text-white/50">
										{caseItem.case_items.length}
									</div>
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div
				class="rounded-2xl border border-dashed border-white/[0.07] bg-[#0d1015] px-5 py-14 text-center"
			>
				<PackageOpen size={32} class="mx-auto text-white/12" />

				<div class="mt-4 text-[13px] font-bold text-white/35">
					Aktuell sind keine Cases verfügbar.
				</div>
			</div>
		{/if}
	</section>

	<!-- WINS -->

	{#if data.user}
		<section class="mt-14">
			<div class="mb-4">
				<div class="text-[9px] font-bold tracking-[0.13em] text-white/22 uppercase">Inventar</div>

				<h2 class="mt-1 text-[19px] font-bold tracking-[-0.025em] text-white">
					Meine letzten Gewinne
				</h2>
			</div>

			{#if data.wins.length}
				<div class="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d1015]">
					{#each data.wins as win, index}
						<div
							class={`grid gap-3 px-4 py-3.5 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center ${
								index !== data.wins.length - 1 ? 'border-b border-white/[0.05]' : ''
							}`}
						>
							<div
								class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-[#080b0f]"
							>
								<div
									class={`absolute bottom-0 h-[2px] w-full ${rarityLine(win.item_rarity)}`}
								></div>

								{#if win.item_image_url}
									<img
										src={win.item_image_url}
										alt={win.item_name}
										class="max-h-8 max-w-8 object-contain"
									/>
								{:else if win.reward_type === 'points'}
									<Coins size={15} class="text-[#8dc7ff]/60" />
								{:else if win.reward_type === 'balance'}
									<Banknote size={15} class="text-emerald-300/60" />
								{:else}
									<Gift size={15} class="text-white/20" />
								{/if}
							</div>

							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<div class="truncate text-[12px] font-bold text-white/70">
										{win.item_name}
									</div>

									<div
										class={`text-[8px] font-bold tracking-[0.08em] uppercase ${rarityText(
											win.item_rarity
										)}`}
									>
										{rarityLabels[win.item_rarity] ?? win.item_rarity}
									</div>
								</div>

								<div
									class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-white/22"
								>
									<span>
										{win.case_name}
									</span>

									<span class="flex items-center gap-1">
										<Clock3 size={9} />

										{formatDate(win.created_at)}
									</span>

									<span>
										{win.reward_type === 'points'
											? `${formatPoints(win.reward_amount)} Points`
											: win.reward_type === 'balance'
												? `${formatMoney(win.reward_amount)} Balance`
												: win.item_value !== null
													? `Wert ${formatMoney(win.item_value)}`
													: 'Sachpreis'}
									</span>
								</div>
							</div>

							<div
								class={`w-fit rounded-full border px-2.5 py-1 text-[8px] font-bold tracking-[0.08em] uppercase ${statusClass(
									win.status
								)}`}
							>
								{statusLabel(win.status)}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-2xl border border-dashed border-white/[0.07] bg-[#0d1015] px-5 py-12 text-center"
				>
					<Trophy size={28} class="mx-auto text-white/12" />

					<div class="mt-3 text-[12px] font-semibold text-white/30">Noch keine Gewinne.</div>
				</div>
			{/if}
		</section>
	{/if}
</div>

<!-- OPENING MODAL -->

{#if selectedCase}
	<div
		class="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-3 backdrop-blur-[7px] sm:p-5"
	>
		<button type="button" onclick={closeCase} class="absolute inset-0" aria-label="Case schließen"
		></button>

		<div
			class="opening-modal relative z-10 max-h-[95vh] w-full max-w-[1080px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0b0e13] shadow-[0_35px_120px_rgba(0,0,0,0.65)]"
		>
			<!-- HEADER -->

			<div
				class="flex items-center justify-between border-b border-white/[0.055] px-4 py-3.5 sm:px-5"
			>
				<div class="flex min-w-0 items-center gap-3">
					<div
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025]"
					>
						<PackageOpen size={14} class="text-[#8dc7ff]" />
					</div>

					<div class="min-w-0">
						<div class="truncate text-[13px] font-bold text-white">
							{selectedCase.name}
						</div>

						<div class="mt-0.5 text-[8px] font-bold tracking-[0.09em] text-white/20 uppercase">
							{selectedCase.case_items.length}
							Drops
						</div>
					</div>
				</div>

				<button
					type="button"
					onclick={closeCase}
					disabled={opening}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/30 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
				>
					<X size={14} />
				</button>
			</div>

			<!-- CASE INFO -->

			<div class="grid border-b border-white/[0.055] lg:grid-cols-[230px_1fr]">
				<div
					class="relative flex min-h-[170px] items-center justify-center border-b border-white/[0.055] bg-[#080b0f] p-5 lg:border-b-0 lg:border-r"
				>
					<div
						class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(141,199,255,0.055),transparent_60%)]"
					></div>

					{#if selectedCase.image_url}
						<img
							src={selectedCase.image_url}
							alt={selectedCase.name}
							class="relative z-10 max-h-[130px] max-w-[170px] object-contain"
						/>
					{:else}
						<Box size={55} strokeWidth={1} class="relative z-10 text-white/12" />
					{/if}
				</div>

				<div class="flex flex-col justify-center px-5 py-6 sm:px-7">
					<div class="text-[8px] font-bold tracking-[0.14em] text-[#8dc7ff] uppercase">
						BZETBONUS Case
					</div>

					<h2 class="mt-2 text-[26px] font-extrabold tracking-[-0.035em] text-white sm:text-[30px]">
						{selectedCase.name}
					</h2>

					{#if selectedCase.description}
						<p class="mt-2 max-w-[560px] text-[11px] leading-5 text-white/30">
							{selectedCase.description}
						</p>
					{/if}

					<div class="mt-5 flex flex-wrap gap-3">
						<div class="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
							<div class="info-label">Case Preis</div>

							<div class="info-value">
								<Coins size={12} class="text-[#8dc7ff]" />

								{formatPoints(selectedCase.price_points)}
								PTS
							</div>
						</div>

						<div class="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
							<div class="info-label">Deine Points</div>

							<div class="info-value">
								{formatPoints(data.profile?.points)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="p-4 sm:p-5">
				<!-- REEL / WIN -->

				<div class="relative overflow-hidden rounded-xl border border-white/[0.065] bg-[#070a0e]">
					<div
						class={`pointer-events-none absolute left-1/2 top-0 z-40 h-full w-px -translate-x-1/2 bg-[#a7d7ff]/80 shadow-[0_0_12px_rgba(141,199,255,0.3)] transition-opacity ${
							revealWin ? 'opacity-0' : 'opacity-100'
						}`}
					></div>

					<div
						class={`pointer-events-none absolute left-1/2 top-0 z-50 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-[#abd8ff] transition-opacity ${
							revealWin ? 'opacity-0' : 'opacity-100'
						}`}
					></div>

					<div
						class={`pointer-events-none absolute bottom-0 left-1/2 z-50 -translate-x-1/2 rotate-180 border-x-[6px] border-t-[8px] border-x-transparent border-t-[#abd8ff] transition-opacity ${
							revealWin ? 'opacity-0' : 'opacity-100'
						}`}
					></div>

					<div
						class={`pointer-events-none absolute inset-y-0 left-0 z-30 w-20 bg-linear-to-r from-[#070a0e] to-transparent transition-opacity sm:w-32 ${
							revealWin ? 'opacity-0' : 'opacity-100'
						}`}
					></div>

					<div
						class={`pointer-events-none absolute inset-y-0 right-0 z-30 w-20 bg-linear-to-l from-[#070a0e] to-transparent transition-opacity sm:w-32 ${
							revealWin ? 'opacity-0' : 'opacity-100'
						}`}
					></div>

					<div class="relative h-[185px] overflow-hidden">
						{#if openingResult && revealWin}
							<div
								class="win-reveal absolute inset-0 flex items-center justify-center overflow-hidden bg-[#0b1118]"
							>
								<div
									class="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8dc7ff]/[0.055] blur-[55px]"
								></div>

								<div
									class="relative z-10 flex w-full items-center justify-center gap-5 px-5 sm:gap-7"
								>
									<div
										class="relative flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#090d12] sm:h-[106px] sm:w-[106px]"
									>
										<div
											class={`absolute inset-x-0 bottom-0 h-[2px] ${rarityLine(
												openingResult.item.rarity
											)}`}
										></div>

										{#if openingResult.item.image_url}
											<img
												src={openingResult.item.image_url}
												alt={openingResult.item.name}
												class="max-h-[78px] max-w-[78px] object-contain sm:max-h-[88px] sm:max-w-[88px]"
											/>
										{:else if openingResult.item.reward_type === 'points'}
											<Coins size={40} strokeWidth={1.2} class="text-[#8dc7ff]" />
										{:else if openingResult.item.reward_type === 'balance'}
											<Banknote size={40} strokeWidth={1.2} class="text-emerald-300" />
										{:else}
											<Gift size={40} strokeWidth={1.2} class="text-white/50" />
										{/if}
									</div>

									<div class="min-w-0">
										<div
											class="flex items-center gap-1.5 text-[8px] font-bold tracking-[0.14em] text-[#8dc7ff] uppercase"
										>
											<Sparkles size={11} />

											Gewonnen
										</div>

										<div
											class="mt-2 max-w-[420px] truncate text-[22px] font-extrabold tracking-[-0.035em] text-white sm:text-[27px]"
										>
											{rewardDisplay(openingResult.item)}
										</div>

										<div class="mt-2 flex flex-wrap items-center gap-2">
											<span
												class={`text-[8px] font-bold tracking-[0.09em] uppercase ${rarityText(
													openingResult.item.rarity
												)}`}
											>
												{rarityLabels[openingResult.item.rarity] ?? openingResult.item.rarity}
											</span>

											<span class="text-white/15"> • </span>

											<span class="text-[9px] text-white/28">
												{formatChance(openingResult.item.chance)}% Chance
											</span>
										</div>

										<div class="mt-3 flex flex-wrap gap-2">
											<div
												class="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1.5"
											>
												<div class="text-[7px] font-bold tracking-[0.08em] text-white/18 uppercase">
													Points
												</div>

												<div class="mt-0.5 text-[10px] font-bold text-white/55">
													{formatPoints(openingResult.remaining_points)}
												</div>
											</div>

											<div
												class="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1.5"
											>
												<div class="text-[7px] font-bold tracking-[0.08em] text-white/18 uppercase">
													Balance
												</div>

												<div class="mt-0.5 text-[10px] font-bold text-white/55">
													{formatMoney(openingResult.remaining_balance)}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						{:else if reelItems.length}
							<div
								class="absolute left-1/2 top-1/2 flex gap-3 will-change-transform"
								style={`
									transform:
										translateX(${reelOffset}px)
										translateY(-50%);
								`}
							>
								{#each reelItems as item}
									<div
										class="relative flex h-[136px] w-[150px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d1015] px-3"
									>
										<div
											class={`absolute inset-x-0 bottom-0 h-[2px] ${rarityLine(item.rarity)}`}
										></div>

										<div class="flex h-[75px] items-center justify-center">
											{#if item.image_url}
												<img
													src={item.image_url}
													alt={item.name}
													class="max-h-[68px] max-w-[105px] object-contain"
												/>
											{:else if item.reward_type === 'points'}
												<Coins size={31} strokeWidth={1.25} class="text-[#8dc7ff]/60" />
											{:else if item.reward_type === 'balance'}
												<Banknote size={31} strokeWidth={1.25} class="text-emerald-300/60" />
											{:else}
												<Gift size={31} strokeWidth={1.25} class="text-white/20" />
											{/if}
										</div>

										<div
											class="mt-2 w-full truncate text-center text-[10px] font-bold text-white/65"
										>
											{item.name}
										</div>

										<div
											class={`mt-1 text-[7px] font-bold tracking-[0.09em] uppercase ${rarityText(
												item.rarity
											)}`}
										>
											{rarityLabels[item.rarity] ?? item.rarity}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="flex h-full items-center justify-center text-center">
								<div>
									<div class="text-[9px] font-bold tracking-[0.12em] text-white/20 uppercase">
										Opening bereit
									</div>

									<div class="mt-2 text-[13px] font-semibold text-white/45">Starte dein Case</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- ERROR -->

				{#if errorMessage || (form?.message && !form?.success)}
					<div
						class="mt-3 rounded-lg border border-red-400/15 bg-red-400/[0.04] px-3.5 py-2.5 text-[11px] font-medium text-red-300"
					>
						{errorMessage || form?.message}
					</div>
				{/if}

				<!-- OPEN BUTTON -->

				<div class="mt-3">
					{#if !data.user}
						<div
							class="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0d1015] px-4 py-3"
						>
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025]"
							>
								<LockKeyhole size={14} class="text-white/30" />
							</div>

							<div>
								<div class="text-[11px] font-bold text-white/55">Login erforderlich</div>

								<div class="mt-0.5 text-[9px] text-white/22">
									Melde dich an, um Cases zu öffnen.
								</div>
							</div>
						</div>
					{:else}
						<form
							method="POST"
							action="?/open"
							use:enhance={() => {
								if (opening) {
									return async () => {};
								}

								opening = true;

								revealWin = false;

								openingResult = null;

								errorMessage = '';

								reelItems = [];

								reelOffset = 0;

								return async ({ result, update }) => {
									if (result.type === 'success') {
										const response = result.data as {
											success?: boolean;
											opening?: OpeningResult;
										};

										if (response.opening) {
											await startOpening(response.opening);
										} else {
											opening = false;

											errorMessage = 'Es konnte kein Gewinn ermittelt werden.';
										}
									} else if (result.type === 'failure') {
										opening = false;

										const response = result.data as {
											message?: string;
										};

										errorMessage = response.message ?? 'Das Case konnte nicht geöffnet werden.';
									} else {
										opening = false;
									}

									await update({
										reset: false,
										invalidateAll: false
									});
								};
							}}
						>
							<input type="hidden" name="case_id" value={selectedCase.id} />

							<button
								type="submit"
								disabled={opening || (data.profile?.points ?? 0) < selectedCase.price_points}
								class="flex h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-[11px] font-extrabold text-[#080b10] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#edf6ff] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-white/15 disabled:text-white/25 disabled:shadow-none"
							>
								{#if opening}
									<span
										class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black"
									></span>

									Case wird geöffnet...
								{:else if (data.profile?.points ?? 0) < selectedCase.price_points}
									<LockKeyhole size={14} />

									Nicht genügend Points
								{:else}
									<PackageOpen size={14} />

									Jetzt öffnen

									<span class="text-black/20"> • </span>

									{formatPoints(selectedCase.price_points)}

									PTS
								{/if}
							</button>
						</form>
					{/if}
				</div>

				<!-- DROPS -->

				<div class="mt-6">
					<div class="mb-3 flex items-end justify-between gap-3">
						<div>
							<div class="text-[8px] font-bold tracking-[0.12em] text-white/20 uppercase">
								Case Inhalt
							</div>

							<div class="mt-1 text-[14px] font-bold text-white/65">Mögliche Gewinne</div>
						</div>

						<div
							class="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[8px] font-semibold text-white/22"
						>
							<Check size={10} class="text-[#8dc7ff]" />

							Chancen sichtbar
						</div>
					</div>

					<div class="grid overflow-hidden rounded-xl border border-white/[0.055] md:grid-cols-2">
						{#each [...selectedCase.case_items].sort((a, b) => Number(a.chance) - Number(b.chance)) as item, index}
							<div
								class={`relative flex items-center gap-3 bg-[#0d1015] px-3.5 py-3 ${
									index < selectedCase.case_items.length - 2 ? 'border-b border-white/[0.045]' : ''
								} ${index % 2 === 0 ? 'md:border-r md:border-white/[0.045]' : ''}`}
							>
								<div
									class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.055] bg-[#080b0f]"
								>
									<div class={`absolute bottom-0 h-[2px] w-full ${rarityLine(item.rarity)}`}></div>

									{#if item.image_url}
										<img
											src={item.image_url}
											alt={item.name}
											class="max-h-8 max-w-8 object-contain"
										/>
									{:else if item.reward_type === 'points'}
										<Coins size={15} class="text-[#8dc7ff]/60" />
									{:else if item.reward_type === 'balance'}
										<Banknote size={15} class="text-emerald-300/60" />
									{:else}
										<Gift size={15} class="text-white/20" />
									{/if}
								</div>

								<div class="min-w-0 flex-1">
									<div class="truncate text-[10px] font-bold text-white/65">
										{item.name}
									</div>

									<div class="mt-1 flex flex-wrap items-center gap-2">
										<span
											class={`text-[7px] font-bold tracking-[0.08em] uppercase ${rarityText(
												item.rarity
											)}`}
										>
											{rarityLabels[item.rarity] ?? item.rarity}
										</span>

										<span class="text-[8px] text-white/20">
											{rewardTypeLabel(item.reward_type)}
										</span>
									</div>
								</div>

								<div class="shrink-0 text-right">
									<div class="text-[11px] font-bold text-white/60">
										{formatChance(item.chance)}%
									</div>

									<div
										class="mt-0.5 text-[7px] font-bold tracking-[0.08em] text-white/17 uppercase"
									>
										Chance
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.case-card {
		box-shadow:
			0 14px 35px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.015);
	}

	.opening-modal {
		animation: opening-modal-in 180ms ease-out both;
	}

	.win-reveal {
		animation: win-reveal-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	:global(.info-label) {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.18);
	}

	:global(.info-value) {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 4px;
		font-size: 12px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.62);
	}

	@keyframes opening-modal-in {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.994);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes win-reveal-in {
		0% {
			opacity: 0;
			transform: scale(0.97);
		}

		60% {
			opacity: 1;
			transform: scale(1.01);
		}

		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.opening-modal,
		.win-reveal,
		.case-card {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
