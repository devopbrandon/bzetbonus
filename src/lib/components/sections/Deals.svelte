<script lang="ts">
	import Deal from '$lib/components/Deal.svelte';
	import { onMount } from 'svelte';
	import { Banknote, Minus, Plus } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	type DealRow = {
		id: string;
		created_at?: string | null;

		brand?: string | null;
		tagline?: string | null;
		licence?: string | null;

		bonus?: string | null;
		bonustype?: string | null;

		maxbonus?: string | null;
		maxbet?: string | null;

		wager?: string | null;
		wagertype?: string | null;

		promocode?: string | null;

		freespins?: string | null;
		freespins_code?: string | null;

		deposit_amount?: string | null;
		play_amount?: string | null;

		logourl?: string | null;
		reflink?: string | null;

		information?: string | null;

		features?: string[] | null;
		payments?: string[] | null;

		position?: number | null;
		is_visible?: boolean | null;
	};

	let {
		deals = []
	}: {
		deals: DealRow[];
	} = $props();

	const MIN_DEPOSIT = 50;
	const MAX_DEPOSIT = 1000;
	const DEPOSIT_STEP = 50;

	let showDeals = $state(false);

	let depositAmount = $state(50);

	const sliderValue = $derived(Math.min(MAX_DEPOSIT, Math.max(MIN_DEPOSIT, depositAmount)));

	const visibleDeals = $derived(deals.filter((deal) => deal.is_visible));

	const sliderProgress = $derived(
		((sliderValue - MIN_DEPOSIT) / (MAX_DEPOSIT - MIN_DEPOSIT)) * 100
	);

	onMount(() => {
		const timer = window.setTimeout(() => {
			showDeals = true;
		}, 450);

		return () => {
			window.clearTimeout(timer);
		};
	});

	function updateSlider(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		depositAmount = Number(input.value);
	}

	function updateManualDeposit(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		const value = Number(input.value);

		if (!Number.isFinite(value) || value < 0) {
			return;
		}

		depositAmount = value;
	}

	function normalizeDeposit() {
		if (!Number.isFinite(depositAmount) || depositAmount < MIN_DEPOSIT) {
			depositAmount = MIN_DEPOSIT;
		}
	}

	function decreaseDeposit() {
		depositAmount = Math.max(MIN_DEPOSIT, depositAmount - DEPOSIT_STEP);
	}

	function increaseDeposit() {
		depositAmount += DEPOSIT_STEP;
	}

	function dealWithDeposit(deal: DealRow) {
		return {
			...deal,

			created_at: deal.created_at ?? null,

			brand: deal.brand ?? null,

			tagline: deal.tagline ?? null,

			licence: deal.licence ?? null,

			bonus: deal.bonus ?? null,

			bonustype: deal.bonustype ?? null,

			maxbet: deal.maxbet ?? null,

			maxbonus: deal.maxbonus ?? null,

			freespins: deal.freespins ?? null,

			freespins_code: deal.freespins_code ?? null,

			wager: deal.wager ?? null,

			wagertype: deal.wagertype ?? null,

			promocode: deal.promocode ?? null,

			logourl: deal.logourl ?? null,

			reflink: deal.reflink ?? null,

			information: deal.information ?? null,

			features: deal.features ?? [],

			payments: deal.payments ?? [],

			/*
			 * Der global ausgewählte Betrag
			 * überschreibt den Deal-Wert.
			 */
			deposit_amount: `${depositAmount}€`,

			/*
			 * Wichtig:
			 * Deal.svelte soll den Spielbetrag
			 * anhand von Bonus + maxbonus
			 * selbst berechnen.
			 */
			play_amount: null
		};
	}
</script>

<section id="deals" class="mx-auto w-full max-w-7xl scroll-mt-24 px-4 pb-20 sm:px-0">
	{#if showDeals}
		<!-- =====================================================
		     DEPOSIT CALCULATOR
		===================================================== -->
		<div in:fly={{ y: 20, duration: 150 }} class="calculator-enter mb-5 sm:mb-6">
			<div
				class="overflow-hidden rounded-[16px] border-2 border-white/15 hover:border-white/30
					bg-[#101117] shadow-[0_18px_45px_rgba(0,0,0,0.22)] duration-150"
			>
				<div
					class="flex flex-col gap-5 px-5 py-5
						sm:px-6
						lg:flex-row lg:items-center lg:gap-7 lg:px-7 lg:py-[22px]"
				>
					<!-- LEFT -->
					<div class="flex shrink-0 items-center gap-3 lg:w-[245px]">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px]
								bg-[#5cc8ff]/[0.08] text-[#5cc8ff]"
						>
							<Banknote size={19} strokeWidth={1.8} />
						</div>

						<div>
							<p class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5cc8ff]">
								Bonus berechnen
							</p>

							<h2 class="mt-0.5 text-[15px] font-bold tracking-[-0.02em] text-white">
								Deine Einzahlung
							</h2>
						</div>
					</div>

					<!-- SLIDER -->
					<div class="min-w-0 flex-1">
						<div class="mb-3 flex items-center justify-between">
							<span class="text-[11px] font-medium text-white/35">
								{MIN_DEPOSIT}€
							</span>

							<div class="flex items-baseline gap-1">
								<strong class="text-[25px] font-black leading-none tracking-[-0.04em] text-white">
									{depositAmount.toLocaleString('de-DE')}
								</strong>

								<span class="text-[13px] font-bold text-[#5cc8ff]"> € </span>
							</div>

							<span class="text-[11px] font-medium text-white/35">
								{MAX_DEPOSIT.toLocaleString('de-DE')}€
							</span>
						</div>

						<div class="relative flex h-5 items-center">
							<div
								class="pointer-events-none absolute left-0 right-0 h-[3px] overflow-hidden rounded-full bg-white/[0.08]"
							>
								<div
									class="h-full rounded-full bg-[#5cc8ff] shadow-[0_0_12px_rgba(92,200,255,0.32)]"
									style={`width:${sliderProgress}%`}
								></div>
							</div>

							<input
								type="range"
								min={MIN_DEPOSIT}
								max={MAX_DEPOSIT}
								step={DEPOSIT_STEP}
								value={sliderValue}
								oninput={updateSlider}
								aria-label="Einzahlungsbetrag"
								class="deposit-range relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent"
							/>
						</div>

						<div class="mt-2 hidden items-center justify-between px-[2px] sm:flex">
							{#each [50, 250, 500, 750, 1000] as amount}
								<button
									type="button"
									onclick={() => (depositAmount = amount)}
									class={[
										'cursor-pointer text-[10px] font-semibold transition',
										depositAmount === amount
											? 'text-[#8fd7ff]'
											: 'text-white/25 hover:text-white/50'
									]}
								>
									{amount.toLocaleString('de-DE')}€
								</button>
							{/each}
						</div>
					</div>

					<!-- MANUAL INPUT -->
					<div class="flex shrink-0 items-center gap-2 lg:w-[235px] lg:justify-end">
						<button
							type="button"
							onclick={decreaseDeposit}
							aria-label="50 Euro weniger"
							class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl
								border border-white/[0.08] bg-white/[0.025]
								text-white/45 transition
								hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
						>
							<Minus size={16} strokeWidth={2} />
						</button>

						<div class="relative min-w-0 flex-1">
							<input
								type="number"
								min={MIN_DEPOSIT}
								step={DEPOSIT_STEP}
								value={depositAmount}
								oninput={updateManualDeposit}
								onblur={normalizeDeposit}
								aria-label="Eigene Einzahlung eingeben"
								class="h-11 w-full rounded-xl border border-white/[0.09]
									bg-black/20
									pl-3 pr-9
									text-right text-[15px] font-bold text-white
									outline-none transition
									placeholder:text-white/20
									focus:border-[#5cc8ff]/35
									focus:bg-[#5cc8ff]/[0.025]"
							/>

							<span
								class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
									text-[12px] font-bold text-[#5cc8ff]"
							>
								€
							</span>
						</div>

						<button
							type="button"
							onclick={increaseDeposit}
							aria-label="50 Euro mehr"
							class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl
								border border-white/[0.08] bg-white/[0.025]
								text-white/45 transition
								hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
						>
							<Plus size={16} strokeWidth={2} />
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- =====================================================
		     DEALS
		===================================================== -->
		<div class="space-y-4 sm:space-y-5">
			{#each visibleDeals as deal, index (deal.id)}
				<div class="deal-enter" style={`animation-delay: ${100 + Math.min(index * 65, 450)}ms;`}>
					<Deal deal={dealWithDeposit(deal)} />
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	/* ============================================================
	   RANGE
	============================================================ */

	.deposit-range::-webkit-slider-runnable-track {
		height: 3px;
		background: transparent;
	}

	.deposit-range::-webkit-slider-thumb {
		width: 17px;
		height: 17px;
		margin-top: -7px;

		appearance: none;
		-webkit-appearance: none;

		border: 3px solid #111219;
		border-radius: 999px;

		background: #8ed9ff;

		box-shadow:
			0 0 0 1px rgba(92, 200, 255, 0.45),
			0 0 15px rgba(92, 200, 255, 0.2);

		transition:
			transform 150ms ease,
			box-shadow 150ms ease;
	}

	.deposit-range:hover::-webkit-slider-thumb {
		transform: scale(1.08);

		box-shadow:
			0 0 0 1px rgba(92, 200, 255, 0.65),
			0 0 18px rgba(92, 200, 255, 0.28);
	}

	.deposit-range:active::-webkit-slider-thumb {
		transform: scale(0.95);
	}

	.deposit-range::-moz-range-track {
		height: 3px;

		background: transparent;
	}

	.deposit-range::-moz-range-thumb {
		width: 13px;
		height: 13px;

		border: 3px solid #111219;
		border-radius: 999px;

		background: #8ed9ff;

		box-shadow:
			0 0 0 1px rgba(92, 200, 255, 0.45),
			0 0 15px rgba(92, 200, 255, 0.2);
	}

	/* remove number arrows */

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		margin: 0;

		appearance: none;
		-webkit-appearance: none;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}

	/* ============================================================
	   DEAL ENTRANCE
	============================================================ */

	.deal-enter {
		opacity: 0;

		transform: translateY(28px) scale(0.985);

		filter: blur(8px);

		animation: dealReveal 620ms cubic-bezier(0.16, 1, 0.3, 1) forwards;

		will-change: transform, opacity, filter;
	}

	@keyframes dealReveal {
		0% {
			opacity: 0;

			transform: translateY(28px) scale(0.985);

			filter: blur(8px);
		}

		55% {
			opacity: 1;

			filter: blur(0);
		}

		100% {
			opacity: 1;

			transform: translateY(0) scale(1);

			filter: blur(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.deal-enter {
			opacity: 1;

			transform: none;

			filter: none;

			animation: none;

			will-change: auto;
		}

		.deposit-range::-webkit-slider-thumb {
			transition: none;
		}
	}
</style>
