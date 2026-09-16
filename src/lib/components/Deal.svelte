<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import {
		ArrowLeft,
		ArrowRight,
		Check,
		Copy,
		Gift,
		Info,
		Landmark,
		Pencil,
		ShieldCheck,
		Sparkles,
		Wallet,
		X
	} from 'lucide-svelte';

	import ConfirmDelete from './ConfirmDelete.svelte';

	export interface Deal {
		id: number;
		created_at: string | null;

		brand: string | null;
		tagline: string | null;
		licence: string | null;

		bonus: string | null;
		bonustype: string | null;

		maxbet: string | null;
		maxbonus: string | null;

		freespins: string | null;
		freespins_code: string | null;

		deposit_amount?: string | null;
		play_amount?: string | null;

		features: string[] | null;
		payments: string[] | null;

		logourl: string | null;
		reflink: string | null;

		wager: string | null;
		wagertype: string | null;

		promocode: string | null;
		information: string | null;

		position?: number | null;
		is_visible?: boolean | null;
	}

	const defaultDeal: Deal = {
		id: 0,
		created_at: null,

		brand: 'Casino',
		tagline: '',
		licence: '',

		bonus: '—',
		bonustype: '',

		maxbet: '—',
		maxbonus: '—',

		freespins: '',
		freespins_code: '',

		deposit_amount: '50€',
		play_amount: '',

		features: [],
		payments: [],

		logourl: '',
		reflink: '#',

		wager: '—',
		wagertype: '',

		promocode: '',
		information: ''
	};

	let {
		deal = defaultDeal
	}: {
		deal?: Deal;
		position?: number;
	} = $props();

	let detailsOpen = $state(false);

	let copiedPromo = $state(false);
	let copiedFs = $state(false);

	let cardEl = $state<HTMLElement | null>(null);

	let glowActive = $state(false);
	let mouseX = $state(50);
	let mouseY = $state(50);

	const features = $derived(deal.features?.filter((item) => item?.trim()) ?? []);

	const payments = $derived(deal.payments?.filter((item) => item?.trim()) ?? []);

	const hasPromo = $derived(Boolean(deal.promocode?.trim()));
	const hasFreeSpins = $derived(Boolean(deal.freespins?.trim()));
	const hasFsCode = $derived(Boolean(deal.freespins_code?.trim()));
	const hasLicence = $derived(Boolean(deal.licence?.trim()));
	const hasTagline = $derived(Boolean(deal.tagline?.trim()));
	const hasInformation = $derived(Boolean(deal.information?.trim()));

	const hasDetails = $derived(hasInformation || payments.length > 0);

	const isNew = $derived.by(() => {
		if (!deal.created_at) return false;

		const created = new Date(deal.created_at).getTime();

		if (Number.isNaN(created)) return false;

		const thirtyDays = 30 * 24 * 60 * 60 * 1000;

		const age = Date.now() - created;

		return age >= 0 && age <= thirtyDays;
	});

	function fmt(value: string | null | undefined) {
		if (!value || !value.trim() || value.trim() === '_') {
			return '—';
		}

		return value.trim();
	}

	function numericValue(value: string | null | undefined) {
		if (!value) return null;

		let cleaned = value.replace(/\s/g, '').replace(/€/g, '').replace(/\$/g, '').replace(/%/g, '');

		/*
		 * 10.000 -> 10000
		 * 1.000,50 -> 1000.50
		 */
		if (cleaned.includes('.') && cleaned.includes(',')) {
			cleaned = cleaned.replace(/\./g, '').replace(',', '.');
		} else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
			cleaned = cleaned.replace(/\./g, '');
		} else {
			cleaned = cleaned.replace(',', '.');
		}

		const parsed = Number.parseFloat(cleaned);

		return Number.isFinite(parsed) ? parsed : null;
	}

	function euro(value: number) {
		return `${new Intl.NumberFormat('de-DE', {
			maximumFractionDigits: Number.isInteger(value) ? 0 : 2
		}).format(value)}€`;
	}

	const depositAmount = $derived.by(() => {
		return numericValue(deal.deposit_amount) ?? 50;
	});

	const calculatedPlayAmount = $derived.by(() => {
		/*
		 * Manuell gesetzter play_amount-Wert hat Vorrang.
		 * Falls leer, berechnen wir ihn aus Deposit + Bonus.
		 */
		const manualPlay = numericValue(deal.play_amount);

		if (manualPlay !== null) {
			return manualPlay;
		}

		const bonusPercent = numericValue(deal.bonus);

		if (bonusPercent === null) {
			return depositAmount;
		}

		let bonusMoney = depositAmount * (bonusPercent / 100);

		const maxBonus = numericValue(deal.maxbonus);

		if (maxBonus !== null) {
			bonusMoney = Math.min(bonusMoney, maxBonus);
		}

		return depositAmount + bonusMoney;
	});

	function paymentImage(payment: string) {
		return `/images/payments/${payment.trim()}.webp`;
	}

	function paymentLabel(payment: string) {
		return payment.trim().replace(/[-_]/g, ' ');
	}

	function handlePointerMove(event: PointerEvent) {
		if (!cardEl) return;

		const rect = cardEl.getBoundingClientRect();

		mouseX = ((event.clientX - rect.left) / rect.width) * 100;

		mouseY = ((event.clientY - rect.top) / rect.height) * 100;
	}

	async function copyValue(value: string | null, type: 'promo' | 'fs') {
		if (!browser || !value) return;

		try {
			await navigator.clipboard.writeText(value);

			if (type === 'promo') {
				copiedPromo = true;

				window.setTimeout(() => {
					copiedPromo = false;
				}, 1300);
			} else {
				copiedFs = true;

				window.setTimeout(() => {
					copiedFs = false;
				}, 1300);
			}
		} catch (error) {
			console.error('COPY ERROR:', error);
		}
	}
</script>

<article
	bind:this={cardEl}
	class="relative isolate w-full overflow-hidden rounded-[18px] border-2 border-white/15 hover:border-white/30 duration-150 bg-[#111219] text-[#f5f7fb] shadow-[0_20px_46px_rgba(0,0,0,0.38)] hover:shadow-white/15"
	onpointermove={handlePointerMove}
	onpointerenter={() => (glowActive = true)}
	onpointerleave={() => (glowActive = false)}
>
	<div
		class="deal-glow pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-200 motion-reduce:hidden"
		class:active={glowActive}
		style={`--mx:${mouseX}%; --my:${mouseY}%;`}
	></div>

	<div
		class="pointer-events-none absolute -left-[5%] -top-[30%] z-0 h-[260px] w-[650px] rounded-full bg-[#5cc8ff]/[0.05] blur-[100px]"
	></div>

	{#if isNew}
		<div
			class="absolute left-0 top-0 z-20 flex h-[30px] items-center gap-1.5
			border-b border-r border-[#5cc8ff]/20
			bg-[#5cc8ff]/10 px-3
			text-[#9fdcff]"
		>
			<span class="text-[15px] font-bold uppercase tracking-[0.08em]"> Brandneu </span>
		</div>
	{/if}

	<div
		class="relative z-[2] grid min-h-[222px] grid-cols-[196px_minmax(560px,1.6fr)_minmax(265px,0.72fr)_185px]
			max-[1250px]:grid-cols-[180px_minmax(500px,1fr)_245px_170px]
			max-[1000px]:grid-cols-[170px_minmax(0,1fr)]
			max-[640px]:block"
	>
		<!-- BRAND -->
		<section
			class="flex flex-col justify-center gap-[13px] border-r border-white/[0.08] px-6 pb-[22px] pt-[27px]
				max-[640px]:flex-row max-[640px]:flex-wrap max-[640px]:items-center max-[640px]:gap-x-[18px] max-[640px]:gap-y-[10px]
				max-[640px]:border-b max-[640px]:border-r-0 max-[640px]:px-[18px] max-[640px]:pb-4 max-[640px]:pt-[42px]"
		>
			<div class="flex h-14 items-center justify-start max-[640px]:h-12 max-[640px]:w-full">
				{#if deal.logourl}
					<img
						src={deal.logourl}
						alt={`${fmt(deal.brand)} Logo`}
						class="max-h-[52px] max-w-[150px] object-contain max-[640px]:max-h-11 max-[640px]:max-w-[130px]"
						loading="lazy"
					/>
				{:else}
					<div
						class="flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-white/[0.05] text-[17px] font-extrabold text-white/55"
					>
						{fmt(deal.brand).slice(0, 2)}
					</div>
				{/if}
			</div>

			<div
				class="flex items-center gap-2 text-[12px] font-semibold text-white/[0.62] max-[640px]:text-[11px]"
			>
				<ShieldCheck size={15} strokeWidth={2} class="shrink-0 text-[#5cc8ff]" />

				<span> Von Bzet ausgewählt </span>
			</div>
		</section>

		<!-- BONUS + FREE SPINS -->
		<section
			class="flex flex-col justify-center border-r border-white/[0.08] px-7 pb-[17px] pt-[26px]
				max-[1250px]:px-6
				max-[1000px]:border-r-0
				max-[640px]:border-b max-[640px]:px-[18px] max-[640px]:pb-[15px] max-[640px]:pt-[19px]"
		>
			<div
				class="grid grid-cols-[minmax(220px,0.78fr)_minmax(270px,1fr)] items-center gap-[30px]
					max-[1250px]:grid-cols-[minmax(200px,0.75fr)_minmax(235px,0.9fr)] max-[1250px]:gap-6
					max-[640px]:grid-cols-[minmax(0,0.85fr)_minmax(155px,1fr)] max-[640px]:gap-[15px]
					max-[430px]:grid-cols-[minmax(0,0.75fr)_145px] max-[430px]:gap-[11px]"
			>
				<div class="min-w-0">
					<p class="text-[12px] font-semibold uppercase tracking-[0.02em] text-[#5cc8ff]">
						{fmt(deal.bonustype)}
					</p>

					<p
						class="mt-[5px] bg-linear-to-r from-[#eaf6ff] from-35% to-[#5cc8ff] bg-clip-text text-[52px] font-black leading-[0.88] tracking-[-0.01em] text-transparent
							max-[640px]:text-[41px]
							max-[430px]:text-[37px]"
					>
						{fmt(deal.bonus)}
					</p>

					{#if fmt(deal.maxbonus) !== '—'}
						<p class="mt-2 text-[14px] font-medium text-white/[0.58]">
							bis zu {fmt(deal.maxbonus)}
						</p>
					{/if}
				</div>

				{#if hasFreeSpins}
					<div
						class="min-w-0 border-l border-white/[0.08] pl-[30px]
							max-[1250px]:pl-6
							max-[640px]:pl-[15px]
							max-[430px]:pl-[11px]"
					>
						<div class="flex items-center gap-[14px] max-[640px]:gap-[9px]">
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5cc8ff]/[0.09] text-[#5cc8ff]
									max-[640px]:h-[35px] max-[640px]:w-[35px]
									max-[430px]:hidden"
							>
								<Gift size={20} strokeWidth={1.8} />
							</div>

							<div class="min-w-0">
								<strong
									class="block text-[34px] font-extrabold leading-[0.9] text-[#f5f7fb]
										max-[1250px]:text-[31px]
										max-[640px]:text-[27px]
										max-[430px]:text-[25px]"
								>
									{fmt(deal.freespins)}
								</strong>

								<span
									class="mt-[5px] block text-[11px] font-semibold leading-[1.25] text-white/[0.58] max-[640px]:text-[9px]"
								>
									Kostenlose Freispiele
								</span>
							</div>
						</div>

						{#if hasFsCode}
							<div
								class="mt-[17px] flex items-center justify-between gap-[14px] border-t border-white/[0.08] pt-3
									max-[640px]:mt-[11px] max-[640px]:pt-[9px]"
							>
								<div class="min-w-0">
									<span
										class="block text-[13px] font-semibold text-white/[0.31] max-[640px]:text-[8px]"
									>
										Code für Freispiele
									</span>

									<strong
										class="mt-[3px] block truncate text-[18px] font-bold text-[#f5f7fb] max-[640px]:text-[14px]"
									>
										{deal.freespins_code}
									</strong>
								</div>

								<button
									type="button"
									onclick={() => copyValue(deal.freespins_code, 'fs')}
									aria-label="Free Spins Code kopieren"
									class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/[0.58] transition
										hover:border-[#5cc8ff]/35 hover:bg-[#5cc8ff]/[0.08] hover:text-[#5cc8ff]
										max-[430px]:h-[31px] max-[430px]:w-[31px]"
								>
									{#if copiedFs}
										<Check size={16} strokeWidth={2.3} />
									{:else}
										<Copy size={16} strokeWidth={1.8} />
									{/if}
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<div
				class="mt-[17px] grid grid-cols-2 border-t border-white/[0.08] pt-3 max-[640px]:mt-[14px]"
			>
				<div>
					<span class="block text-[10px] font-semibold text-white/[0.31]"> Wager </span>

					<strong class="mt-1 block text-[17px] font-bold text-[#f5f7fb] max-[640px]:text-[15px]">
						{fmt(deal.wager)}

						{#if fmt(deal.wagertype) !== '—'}
							<small class="text-[11px] font-medium text-white/[0.58]">
								({fmt(deal.wagertype)})
							</small>
						{/if}
					</strong>
				</div>

				<div class="border-l border-white/[0.08] pl-4">
					<span class="block text-[10px] font-semibold text-white/[0.31]"> Max Bet </span>

					<strong class="mt-1 block text-[17px] font-bold text-[#f5f7fb] max-[640px]:text-[15px]">
						{fmt(deal.maxbet)}
					</strong>
				</div>
			</div>

			<div
				class="mt-[13px] flex items-center justify-between gap-3 border-t border-white/[0.08] pt-[10px]"
			>
				<div class="min-w-0">
					<span class="block text-[12px] font-semibold uppercase text-white/[0.31]">
						Promocode
					</span>

					<strong class="mt-[3px] block truncate text-[17px] font-bold text-[#f5f7fb]">
						{hasPromo ? deal.promocode : 'Kein Code benötigt'}
					</strong>
				</div>

				{#if hasPromo}
					<button
						type="button"
						onclick={() => copyValue(deal.promocode, 'promo')}
						aria-label="Promocode kopieren"
						class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/[0.58] transition
							hover:border-[#5cc8ff]/35 hover:bg-[#5cc8ff]/[0.08] hover:text-[#5cc8ff]"
					>
						{#if copiedPromo}
							<Check size={16} strokeWidth={2.3} />
						{:else}
							<Copy size={16} strokeWidth={1.8} />
						{/if}
					</button>
				{/if}
			</div>
		</section>

		<!-- DEPOSIT / VALUE -->
		<section
			class="flex flex-col justify-center border-r border-white/[0.08] px-[20px] py-[18px]
				max-[1000px]:col-span-full max-[1000px]:grid max-[1000px]:grid-cols-[250px_minmax(0,1fr)] max-[1000px]:items-center max-[1000px]:gap-8
				max-[1000px]:border-r-0 max-[1000px]:border-t
				max-[640px]:block max-[640px]:border-b max-[640px]:px-[18px] max-[640px]:py-[18px]"
		>
			<div class="mb-[17px] max-[1000px]:mb-0 max-[640px]:mb-4">
				<p
					class="text-[15px] font-semibold leading-none text-white/[0.5]
			max-[640px]:text-[14px]"
				>
					Bei
					<strong class="font-extrabold text-white/[0.92]">
						{euro(depositAmount)}
					</strong>
					Einzahlung
				</p>

				<p
					class="mt-[8px] bg-linear-to-r from-[#7cc8ff] via-[#b9e2ff] to-[#eaf6ff] bg-clip-text
		text-[48px] font-black leading-[0.82] tracking-[-0.04em] text-transparent
		drop-shadow-[0_0_14px_rgba(124,200,255,0.14)]
		max-[1250px]:text-[44px]
		max-[640px]:text-[40px]"
				>
					{euro(calculatedPlayAmount)}
				</p>

				<p
					class="mt-[8px] text-[14px] font-semibold leading-[1.2] text-white/[0.55]
			max-[640px]:text-[13px]"
				>
					Für die erste Einzahlung
				</p>
			</div>

			{#if features.length}
				<div class="flex flex-col gap-2">
					{#each features.slice(0, 4) as feature}
						<div
							class="flex items-center gap-[9px] text-[14px] font-medium leading-[1.25] text-white/[0.61] max-[640px]:text-[11px]"
						>
							<span
								class="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5cc8ff] shadow-[0_0_8px_rgba(92,200,255,0.22)]"
							></span>

							<span>
								{feature}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- ACTIONS -->
		<section
			class="flex flex-col
		max-[1000px]:col-span-full max-[1000px]:grid max-[1000px]:grid-cols-[220px_minmax(0,1fr)] max-[1000px]:border-t max-[1000px]:border-white/[0.08]
		max-[640px]:block"
		>
			{#if hasTagline}
				<div
					class="relative flex min-h-[46px] items-center justify-center overflow-hidden border-b border-white/[0.08]
			bg-linear-to-r from-[#5cc8ff]/[0.12] to-[#5cc8ff]/[0.035]
			py-2 pl-[17px] pr-[13px]
			max-[1000px]:h-full max-[1000px]:border-b-0 max-[1000px]:border-r

			max-[640px]:absolute
			max-[640px]:right-0
			max-[640px]:top-0
			max-[640px]:z-30
			max-[640px]:h-[30px]
			max-[640px]:min-h-0
			max-[640px]:w-auto
			max-[640px]:max-w-[calc(100%-86px)]
			max-[640px]:border-b
			max-[640px]:border-l
			max-[640px]:border-r-0
			max-[640px]:border-white/[0.08]
			max-[640px]:bg-[#5cc8ff]/[0.09]
			max-[640px]:px-4
			max-[640px]:py-0"
				>
					<span
						class="line-clamp-2 text-[13px] font-bold leading-[1.3] text-[#c8eaff]
				max-[640px]:line-clamp-1
				max-[640px]:whitespace-nowrap
				max-[640px]:text-[11px]
				max-[640px]:leading-none"
					>
						{deal.tagline}
					</span>
				</div>
			{/if}

			<div
				class="flex flex-1 flex-col justify-end gap-2 px-3 pb-[14px] pt-[11px]
					max-[1000px]:grid max-[1000px]:grid-cols-[minmax(200px,0.65fr)_minmax(0,1fr)] max-[1000px]:items-center max-[1000px]:p-[9px]
					max-[640px]:grid-cols-2 max-[640px]:gap-[7px]"
			>
				{#if hasLicence}
					<div
						class="flex items-center gap-[10px] rounded-[10px] bg-[#5cc8ff]/[0.035] px-[10px] py-[9px]
							max-[1000px]:col-start-1 max-[1000px]:row-span-2
							max-[640px]:col-span-full max-[640px]:row-auto"
					>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5cc8ff]/[0.08] text-[#5cc8ff]"
						>
							<Landmark size={17} strokeWidth={1.8} />
						</div>

						<div class="min-w-0">
							<span class="block text-[10px] font-semibold leading-none text-white/[0.36]">
								Lizenz
							</span>

							<strong class="mt-[5px] block text-[11px] font-bold leading-[1.3] text-white/[0.72]">
								{deal.licence}
							</strong>
						</div>
					</div>
				{/if}

				{#if page.url.pathname === '/dashboard/deals'}
					<div class="grid grid-cols-2 gap-1.5 max-[640px]:col-span-full">
						<button
							type="button"
							onclick={() => goto(`/dashboard/deals/edit/${deal.id}`)}
							aria-label="Deal bearbeiten"
							class="flex h-[34px] cursor-pointer items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/[0.58] transition hover:bg-white/[0.05] hover:text-white"
						>
							<Pencil size={16} strokeWidth={1.8} />
						</button>

						<div
							class="relative z-50 flex h-[34px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]"
						>
							<ConfirmDelete dealId={deal.id} />
						</div>
					</div>
				{/if}

				{#if hasDetails}
					<button
						type="button"
						onclick={() => (detailsOpen = true)}
						class="flex h-10 cursor-pointer items-center justify-between rounded-full border border-white/[0.08] bg-transparent px-[15px] text-[11px] font-semibold text-white/[0.58] transition
							hover:border-white/20 hover:bg-white/[0.025] hover:text-white
							max-[1000px]:col-start-2
							max-[640px]:col-start-1 max-[640px]:h-[42px]"
					>
						<span> Mehr erfahren </span>

						<ArrowRight size={15} strokeWidth={1.8} />
					</button>
				{/if}

				<a
					href={deal.reflink || '#'}
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-[47px] items-center justify-between rounded-full bg-white px-[14px] pl-[17px] text-[12px] font-extrabold text-[#0b0c11] transition
						hover:-translate-y-px hover:bg-[#eaf6ff]
						max-[1000px]:col-start-2
						max-[640px]:col-start-2 max-[640px]:h-[42px]"
				>
					<span> Jetzt Spielen </span>

					<ArrowRight size={18} strokeWidth={2.2} />
				</a>
			</div>
		</section>
	</div>

	<!-- FULL WIDTH DRAWER -->
	<div
		class={[
			'absolute inset-0 z-[100] bg-linear-to-br from-[#111219] to-[#0d0f15] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
			detailsOpen ? 'translate-x-0' : 'translate-x-[101%]'
		]}
	>
		<div class="flex h-full w-full flex-col">
			<div
				class="grid h-[52px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-white/[0.08] px-[18px]
					max-[640px]:h-12 max-[640px]:grid-cols-[1fr_auto] max-[640px]:px-[14px]"
			>
				<button
					type="button"
					onclick={() => (detailsOpen = false)}
					class="inline-flex w-fit cursor-pointer items-center gap-2 bg-transparent text-[11px] font-semibold text-white/[0.58] transition hover:text-white"
				>
					<ArrowLeft size={17} strokeWidth={1.9} />

					<span> Zurück zum Deal </span>
				</button>

				<div class="flex items-center justify-center max-[640px]:hidden">
					{#if deal.logourl}
						<img src={deal.logourl} alt="" class="max-h-[26px] max-w-[90px] object-contain" />
					{/if}
				</div>

				<button
					type="button"
					onclick={() => (detailsOpen = false)}
					aria-label="Details schließen"
					class="flex h-8 w-8 cursor-pointer items-center justify-center justify-self-end rounded-full bg-white/[0.03] text-white/[0.58] transition hover:bg-white/[0.07] hover:text-white"
				>
					<X size={19} strokeWidth={1.9} />
				</button>
			</div>

			<div
				class="grid h-[calc(100%-52px)] grid-cols-[minmax(0,1.25fr)_minmax(240px,0.75fr)_200px] items-center gap-9 px-[30px] py-[22px]
					max-[1000px]:grid-cols-2 max-[1000px]:gap-[26px]
					max-[640px]:flex max-[640px]:h-[calc(100%-48px)] max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-[26px] max-[640px]:overflow-y-auto max-[640px]:px-[18px] max-[640px]:py-[22px]"
			>
				{#if hasInformation}
					<section>
						<h4
							class="flex items-center gap-[9px] text-[19px] font-bold text-[#f5f7fb] max-[640px]:text-[17px]"
						>
							<Info size={16} strokeWidth={1.9} class="text-[#5cc8ff]" />

							Wichtige Informationen
						</h4>

						<p
							class="mt-3 max-w-[700px] whitespace-pre-line text-[13px] leading-[1.65] text-white/[0.58] max-[640px]:text-[12px]"
						>
							{deal.information}
						</p>
					</section>
				{/if}

				{#if payments.length}
					<section>
						<h4
							class="flex items-center gap-[9px] text-[19px] font-bold text-[#f5f7fb] max-[640px]:text-[17px]"
						>
							<Wallet size={16} strokeWidth={1.9} class="text-[#5cc8ff]" />

							Zahlungsmethoden
						</h4>

						<p class="mt-1.5 text-[12px] text-white/[0.31]">
							Verfügbare Ein- und Auszahlungsmethoden
						</p>

						<div class="mt-4 flex flex-wrap items-center gap-[13px] max-[640px]:gap-[11px]">
							{#each payments as payment}
								<img
									src={paymentImage(payment)}
									alt={paymentLabel(payment)}
									title={paymentLabel(payment)}
									class="block h-7 w-auto max-w-[84px] rounded object-contain max-[640px]:h-[26px] max-[640px]:max-w-[78px]"
									loading="lazy"
								/>
							{/each}
						</div>
					</section>
				{/if}

				<div
					class="flex flex-col gap-[13px]
						max-[1000px]:col-span-full max-[1000px]:flex-row max-[1000px]:items-center max-[1000px]:justify-between
						max-[640px]:mt-auto"
				>
					<div>
						<span class="block text-[29px] font-extrabold leading-none">
							{fmt(deal.bonus)}
						</span>

						<small class="mt-[5px] block text-[11px] uppercase font-medium text-white/[0.31]">
							{fmt(deal.bonustype)}
						</small>
					</div>

					<a
						href={deal.reflink || '#'}
						target="_blank"
						rel="noopener noreferrer"
						class="flex h-[50px] items-center justify-between rounded-full bg-white px-[15px] text-[12px] font-extrabold text-[#0b0c11]
							max-[1000px]:w-[200px]
							max-[640px]:w-auto max-[640px]:flex-1"
					>
						Jetzt Spielen

						<ArrowRight size={18} strokeWidth={2.2} />
					</a>
				</div>
			</div>
		</div>
	</div>
</article>

<style>
	.deal-glow {
		background: radial-gradient(
			320px circle at var(--mx) var(--my),
			rgba(92, 200, 255, 0.06),
			rgba(92, 200, 255, 0.015) 42%,
			transparent 72%
		);
	}

	.deal-glow.active {
		opacity: 1;
	}
</style>
