<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import {
		ArrowRight,
		Check,
		ChevronDown,
		Copy,
		CreditCard,
		Eye,
		EyeOff,
		Flag,
		Info,
		Pencil,
		ShieldCheck,
		Sparkles,
		TicketPercent,
		Wallet,
		Zap
	} from 'lucide-svelte';
	import ConfirmDelete from './ConfirmDelete.svelte';
	import { slide } from 'svelte/transition';

	export interface Deal {
		id: number;
		brand: string | null;
		bonus: string | null;
		bonustype: string | null;
		maxbet: string | null;
		maxbonus: string | null;
		freespins: string | null;
		features: string[] | null;
		logourl: string | null;
		reflink: string | null;
		wager: string | null;
		wagertype: string | null;
		promocode: string | null;
		information: string | null;
		payments: string[] | null;
		is_visible: boolean;
	}

	const defaultDeal: Deal = {
		id: 0,
		brand: 'Example Casino',
		bonus: '—',
		bonustype: 'Bonus',
		maxbet: '—',
		maxbonus: '—',
		freespins: '—',
		features: [],
		logourl: '',
		reflink: '#',
		wager: '—',
		wagertype: '',
		promocode: '',
		information: '',
		payments: [],
		is_visible: true
	};

	let { deal = defaultDeal }: { deal?: Deal } = $props();

	let copied = $state(false);
	let copying = $state(false);
	let expanded = $state(false);
	let detailsEl = $state<HTMLDivElement | null>(null);

	const fmt = (value: string | null | undefined) => {
		if (!value || value.trim() === '' || value === '_') return '—';
		return value.trim();
	};

	const features = $derived(deal.features?.filter((item) => item && item.trim().length) ?? []);
	const payments = $derived(deal.payments?.filter((item) => item && item.trim().length) ?? []);
	const hasPromo = $derived(Boolean(deal.promocode && deal.promocode.trim().length));
	const hasDetails = $derived(Boolean(deal.information?.trim()) || payments.length > 0);

	function paymentImage(payment: string) {
		return `/images/payments/${payment.trim()}.webp`;
	}

	function paymentLabel(payment: string) {
		return payment.trim().replace(/[-_]/g, ' ');
	}

	$effect(() => {
		if (!browser || !payments.length) return;

		for (const payment of payments) {
			const img = new Image();
			img.src = paymentImage(payment);
		}
	});

	async function copyCode() {
		if (!deal.promocode) return;

		copying = true;

		try {
			if (navigator?.clipboard?.writeText) {
				await navigator.clipboard.writeText(deal.promocode);
			} else {
				const ta = document.createElement('textarea');
				ta.value = deal.promocode;
				ta.style.position = 'fixed';
				ta.style.opacity = '0';
				document.body.appendChild(ta);
				ta.select();
				document.execCommand('copy');
				document.body.removeChild(ta);
			}

			copied = true;

			setTimeout(() => {
				copied = false;
			}, 1400);
		} finally {
			copying = false;
		}
	}

	async function toggleDetails() {
		expanded = !expanded;

		if (!expanded || !browser) return;

		await tick();

		requestAnimationFrame(() => {
			if (!detailsEl) return;

			const rect = detailsEl.getBoundingClientRect();

			const panelTop = window.scrollY + rect.top;
			const panelBottom = window.scrollY + rect.bottom;

			const topTarget = panelTop - 120;
			const bottomTarget = panelBottom - window.innerHeight + 120;

			window.scrollTo({
				top: Math.max(topTarget, bottomTarget),
				behavior: 'smooth'
			});
		});
	}
</script>

<article
	class:deal-is-hidden={!deal.is_visible && page.url.pathname === '/dashboard/deals'}
	class="deal-card group"
>
	<div class="deal-visual-clip" aria-hidden="true">
		<div class="deal-top-line"></div>
		<div class="deal-shine"></div>
		<div class="deal-orb deal-orb-left"></div>
		<div class="deal-orb deal-orb-right"></div>
		<div class="deal-sweep"></div>
	</div>

	<div class="relative z-10">
		<div class="deal-layout">
			<div class="brand-panel">
				<div class="brand-glow"></div>

				<div class="logo-frame">
					{#if deal.logourl}
						<img
							src={deal.logourl}
							alt={`${fmt(deal.brand)} logo`}
							class="brand-logo"
							loading="lazy"
						/>
					{:else}
						<span class="text-[10px] font-black tracking-[0.22em] text-white/35 uppercase">
							Logo
						</span>
					{/if}
				</div>

				<div class="brand-content min-w-0 text-center xl:text-left">
					<div class="brand-badges">
						<span class="mini-badge">
							<Sparkles class="h-3 w-3" />
							Exklusiv
						</span>

						{#if fmt(deal.freespins) !== '—'}
							<span class="mini-badge mini-badge-blue">
								{fmt(deal.freespins)} FS ohne Einzahlung
							</span>
						{/if}
					</div>
				</div>
			</div>

			<div class="deal-content">
				<div class="stats-grid">
					<div class="stat-card stat-main">
						<div class="stat-head">
							<p class="stat-label">{fmt(deal.bonustype)}</p>
							<TicketPercent class="stat-icon text-white/70" />
						</div>

						<p class="stat-value">{fmt(deal.bonus)}</p>
					</div>

					<div class="stat-card">
						<div class="stat-head">
							<p class="stat-label">Max Bonus</p>
							<Sparkles class="stat-icon text-white/45" />
						</div>

						<p class="stat-value">{fmt(deal.maxbonus)}</p>
					</div>

					<div class="stat-card">
						<div class="stat-head">
							<p class="stat-label">Max Bet</p>
							<ShieldCheck class="stat-icon text-white/45" />
						</div>

						<p class="stat-value">{fmt(deal.maxbet)}</p>
					</div>

					<div class="stat-card">
						<div class="stat-head">
							<p class="stat-label">Wager</p>
							<Zap class="stat-icon text-white/45" />
						</div>

						<p class="stat-value">
							{fmt(deal.wager)}
							{#if fmt(deal.wagertype) !== '—'}
								<span class="stat-type">({fmt(deal.wagertype)})</span>
							{/if}
						</p>
					</div>
				</div>

				<div class="bottom-layout">
					<div class="min-w-0 flex-1 space-y-3">
						{#if features.length}
							<ul class="features-list">
								{#each features as feature}
									<li class="feature-pill">
										{feature}
									</li>
								{/each}
							</ul>
						{/if}

						<div class="promo-box">
							<div class="promo-content">
								<p class="promo-label">Promo Code</p>

								{#if hasPromo}
									<p class="promo-code">
										{deal.promocode}
									</p>
								{:else}
									<p class="promo-empty">Kein Code benötigt</p>
								{/if}
							</div>

							{#if hasPromo}
								<button
									type="button"
									onclick={copyCode}
									class="copy-button"
									aria-live="polite"
									aria-label={copied ? 'Promo code copied' : 'Copy promo code'}
									disabled={copying}
								>
									{#if copied}
										<Check class="h-4 w-4" />
										Copied
									{:else}
										<Copy class="h-4 w-4" />
										Copy
									{/if}
								</button>
							{/if}
						</div>
					</div>

					<div class="actions-row">
						{#if page.url.pathname === '/dashboard/deals'}
							<form method="POST" action="?/toggleVisibility">
								<input type="hidden" name="dealId" value={deal.id} />

								<button
									type="submit"
									class:visibility-hidden={!deal.is_visible}
									class="icon-action"
									aria-label={deal.is_visible ? 'Deal verstecken' : 'Deal anzeigen'}
									title={deal.is_visible ? 'Deal verstecken' : 'Deal anzeigen'}
								>
									{#if deal.is_visible}
										<Eye class="h-4 w-4" />
									{:else}
										<EyeOff class="h-4 w-4" />
									{/if}
								</button>
							</form>

							<button
								type="button"
								onclick={() => goto(`/dashboard/deals/edit/${deal.id}`)}
								class="icon-action"
								aria-label="Deal bearbeiten"
								title="Deal bearbeiten"
							>
								<Pencil class="h-4 w-4" />
							</button>

							<div class="delete-action">
								<ConfirmDelete dealId={deal.id} />
							</div>
						{/if}

						{#if hasDetails}
							<button
								type="button"
								onclick={toggleDetails}
								class="details-button"
								aria-expanded={expanded}
							>
								<span>{expanded ? 'Close' : 'Details'}</span>
								<ChevronDown
									class={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
								/>
							</button>
						{/if}

						<a
							href={deal.reflink || '#'}
							target="_blank"
							rel="noopener noreferrer"
							class="play-button"
							aria-label={`Open ${fmt(deal.brand)} deal`}
						>
							<span class="relative z-10 flex items-center gap-2">
								Jetzt Spielen
								<ArrowRight
									class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
								/>
							</span>
						</a>
					</div>
				</div>
			</div>
		</div>

		{#if expanded && hasDetails}
			<div out:slide={{ duration: 200 }} class="details-panel" bind:this={detailsEl}>
				<div class="details-grid">
					{#if deal.information?.trim()}
						<section class="details-section">
							<div class="mb-3 flex items-center gap-2">
								<span class="section-icon">
									<Flag class="h-4 w-4" />
								</span>

								<h4 class="section-title">Features</h4>
							</div>

							<p class="details-text">
								{deal.information}
							</p>
						</section>
					{/if}

					{#if payments.length}
						<section class="details-section">
							<div class="mb-4 flex items-center gap-2">
								<span class="section-icon">
									<Wallet class="h-4 w-4" />
								</span>

								<h4 class="section-title">Payments</h4>
							</div>

							<ul class="payment-list">
								{#each payments as payment}
									<li class="payment-chip">
										<img
											src={paymentImage(payment)}
											alt={paymentLabel(payment)}
											title={paymentLabel(payment)}
											class="payment-image"
											loading="eager"
										/>
									</li>
								{/each}
							</ul>
						</section>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</article>

<style>
	.deal-card {
		position: relative;
		overflow: visible;
		isolation: isolate;
		border-radius: 30px;
		border: 1px solid rgba(255, 255, 255, 0.11);
		background:
			linear-gradient(180deg, rgba(20, 36, 80, 0.72), rgba(6, 14, 35, 0.9)),
			linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.015));
		padding: 18px;
		color: white;
		box-shadow:
			0 22px 80px -46px rgba(255, 255, 255, 0.45),
			inset 0 1px 0 rgba(255, 255, 255, 0.12),
			inset 0 -1px 0 rgba(0, 0, 0, 0.35);
		transition:
			transform 260ms ease,
			border-color 260ms ease,
			box-shadow 260ms ease;
	}

	.deal-card::before {
		content: '';
		position: absolute;
		inset: 1px;
		z-index: 0;
		border-radius: 29px;
		pointer-events: none;
		background:
			linear-gradient(
				115deg,
				rgba(255, 255, 255, 0.22),
				transparent 18%,
				transparent 74%,
				rgba(255, 255, 255, 0.08)
			),
			radial-gradient(circle at 50% -10%, rgba(255, 255, 255, 0.16), transparent 32%);
		opacity: 0.75;
		mask:
			linear-gradient(#000, #000) content-box,
			linear-gradient(#000, #000);
		-webkit-mask:
			linear-gradient(#000, #000) content-box,
			linear-gradient(#000, #000);
		padding: 1px;
		-webkit-mask-composite: xor;
		mask-composite: exclude;
	}

	.deal-is-hidden {
		opacity: 0.55;
		filter: grayscale(0.55);
	}

	.visibility-hidden {
		border-color: rgba(248, 113, 113, 0.25);
		background: rgba(248, 113, 113, 0.08);
		color: rgba(252, 165, 165, 0.9);
	}

	.visibility-hidden:hover {
		border-color: rgba(248, 113, 113, 0.45);
		background: rgba(248, 113, 113, 0.14);
		color: white;
	}

	.deal-card:hover {
		transform: translateY(-4px);
		border-color: rgba(255, 255, 255, 0.22);
		box-shadow:
			0 30px 100px -48px rgba(255, 255, 255, 0.62),
			0 0 42px -28px rgba(147, 197, 253, 0.9),
			inset 0 1px 0 rgba(255, 255, 255, 0.16),
			inset 0 -1px 0 rgba(0, 0, 0, 0.35);
	}

	.deal-layout {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.deal-content {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 16px;
	}

	.deal-visual-clip {
		position: absolute;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		border-radius: inherit;
		pointer-events: none;
	}

	.deal-sweep {
		position: absolute;
		top: -80%;
		left: -35%;
		width: 28%;
		height: 260%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.18),
			rgba(255, 255, 255, 0.42),
			rgba(255, 255, 255, 0.13),
			transparent
		);
		transform: rotate(18deg);
		opacity: 0;
		transition:
			left 850ms ease,
			opacity 300ms ease;
	}

	.deal-card:hover .deal-sweep {
		left: 125%;
		opacity: 1;
	}

	.deal-top-line {
		position: absolute;
		top: 0;
		left: 22px;
		right: 22px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.72), transparent);
		opacity: 0.5;
	}

	.deal-shine {
		position: absolute;
		inset: 0;
		background-image:
			radial-gradient(circle at 17% 22%, rgba(255, 255, 255, 0.14) 0 1px, transparent 2px),
			radial-gradient(circle at 82% 12%, rgba(255, 255, 255, 0.12) 0 1px, transparent 2px),
			radial-gradient(circle at 74% 74%, rgba(255, 255, 255, 0.08) 0 1px, transparent 2px);
		opacity: 0.85;
	}

	.deal-orb {
		position: absolute;
		border-radius: 999px;
		filter: blur(34px);
		opacity: 0.55;
		transition: opacity 260ms ease;
	}

	.deal-card:hover .deal-orb {
		opacity: 0.82;
	}

	.deal-orb-left {
		left: -90px;
		top: 20px;
		width: 180px;
		height: 180px;
		background: rgba(92, 127, 207, 0.28);
	}

	.deal-orb-right {
		right: -120px;
		bottom: -80px;
		width: 230px;
		height: 230px;
		background: rgba(255, 255, 255, 0.13);
	}

	.brand-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 14px;
		min-height: 210px;
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background:
			linear-gradient(
				155deg,
				rgba(255, 255, 255, 0.09),
				rgba(255, 255, 255, 0.025) 42%,
				rgba(0, 0, 0, 0.16)
			),
			radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.13), transparent 48%);
		padding: 20px;
		overflow: hidden;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.11),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.brand-panel::before {
		content: '';
		position: absolute;
		left: -25%;
		top: 18px;
		width: 150%;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
		transform: rotate(-8deg);
	}

	.brand-panel::after {
		content: ' ';
		position: absolute;
		right: 18px;
		bottom: 12px;
		font-size: 54px;
		line-height: 1;
		font-weight: 1000;
		letter-spacing: -0.08em;
		color: rgba(255, 255, 255, 0.035);
		-webkit-text-stroke: 1px rgba(255, 255, 255, 0.08);
	}

	.brand-glow {
		position: absolute;
		inset: auto auto -50px 50%;
		width: 170px;
		height: 90px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.13);
		filter: blur(28px);
		transform: translateX(-50%);
	}

	.logo-frame {
		position: relative;
		display: grid;
		width: 128px;
		height: 92px;
		place-items: center;
		z-index: 1;
	}

	.logo-frame::after {
		content: '';
		position: absolute;
		inset: 9px;
		border-radius: 17px;
		pointer-events: none;
	}

	.brand-logo {
		max-height: 70px;
		max-width: 140px;
		object-fit: contain;
		filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.65));
	}

	.brand-badges {
		margin-bottom: 8px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.brand-title {
		max-width: 250px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 30px;
		line-height: 1;
		font-weight: 1000;
		letter-spacing: -0.05em;
		color: #f8fafc;
		text-shadow:
			0 2px 0 rgba(0, 0, 0, 0.5),
			0 0 18px rgba(255, 255, 255, 0.14);
	}

	.brand-subtitle {
		margin-top: 4px;
		font-size: 12px;
		font-weight: 1000;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.4);
	}

	.mini-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.055);
		padding: 6px 9px;
		font-size: 12px;
		font-weight: 1000;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.7);
	}

	.mini-badge-blue {
		border-color: rgba(147, 197, 253, 0.22);
		background: rgba(96, 165, 250, 0.4);
		color: rgba(219, 234, 254, 0.9);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}

	.stat-card {
		position: relative;
		overflow: hidden;
		min-height: 102px;
		border-radius: 19px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025)),
			rgba(0, 0, 0, 0.12);
		padding: 14px;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
		transition:
			transform 220ms ease,
			border-color 220ms ease,
			background 220ms ease;
	}

	.stat-card::after {
		content: '';
		position: absolute;
		right: -28px;
		top: -42px;
		width: 88px;
		height: 88px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		filter: blur(2px);
	}

	.deal-card:hover .stat-card {
		border-color: rgba(255, 255, 255, 0.14);
	}

	.stat-card:hover {
		transform: translateY(-2px);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)),
			rgba(0, 0, 0, 0.13);
	}

	.stat-main {
		border-color: rgba(255, 255, 255, 0.16);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(147, 197, 253, 0.055)),
			rgba(0, 0, 0, 0.13);
	}

	.stat-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.stat-label {
		font-family: 'Montserrat', sans-serif;
		font-size: 10px;
		font-weight: bolder;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.42);
	}

	.stat-value {
		position: relative;
		z-index: 1;
		margin-top: 16px;
		font-size: 21px;
		line-height: 1;
		font-weight: 1000;
		letter-spacing: -0.04em;
		color: white;
		text-shadow: 0 1px 0 rgba(0, 0, 0, 0.55);
	}

	.stat-type {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.4);
	}

	.bottom-layout {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.features-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.feature-pill {
		border-radius: 13px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(255, 255, 255, 0.045);
		padding: 9px 11px;
		font-size: 12px;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.68);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
		transition:
			transform 200ms ease,
			border-color 200ms ease,
			background 200ms ease,
			color 200ms ease;
	}

	.feature-pill:hover {
		transform: translateY(-1px);
		border-color: rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.075);
		color: white;
	}

	.promo-box {
		display: flex;
		flex-direction: column;
		gap: 12px;
		border-radius: 20px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background:
			linear-gradient(90deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025)),
			rgba(0, 0, 0, 0.16);
		padding: 13px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.07),
			0 14px 40px -34px rgba(0, 0, 0, 0.9);
	}

	.promo-content {
		min-width: 0;
	}

	.promo-label {
		font-size: 10px;
		font-weight: 1000;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.35);
	}

	.promo-code {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 18px;
		font-weight: 1000;
		letter-spacing: 0.025em;
		color: white;
	}

	.promo-empty {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 14px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.45);
	}

	.actions-row {
		position: relative;
		z-index: 200;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.copy-button,
	.details-button,
	.icon-action,
	.delete-action {
		display: inline-flex;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border-radius: 15px;
		border: 1px solid rgba(255, 255, 255, 0.11);
		background: rgba(255, 255, 255, 0.055);
		padding: 11px 14px;
		font-size: 13px;
		font-weight: 1000;
		color: rgba(255, 255, 255, 0.76);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
		transition:
			transform 200ms ease,
			border-color 200ms ease,
			background 200ms ease,
			color 200ms ease;
	}

	.copy-button:hover,
	.details-button:hover,
	.icon-action:hover,
	.delete-action:hover {
		transform: translateY(-1px);
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.085);
		color: white;
	}

	.copy-button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.icon-action,
	.delete-action {
		position: relative;
		min-height: 46px;
		min-width: 46px;
		padding: 0;
		overflow: visible;
	}

	.delete-action {
		z-index: 500;
	}

	.play-button {
		position: relative;
		display: inline-flex;
		min-height: 63px;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		gap: 8px;
		overflow: hidden;
		border-radius: 15px;
		border: 1px solid rgba(255, 255, 255, 0.55);
		background: linear-gradient(180deg, #ffffff 0%, #d8dce2 44%, #8d949f 100%);
		padding: 12px 20px;
		font-size: 13px;
		font-weight: 1000;
		letter-spacing: 0.02em;
		color: #071026;
		box-shadow:
			0 0 22px rgba(255, 255, 255, 0.22),
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			inset 0 -1px 0 rgba(0, 0, 0, 0.28);
		transition:
			transform 220ms ease,
			box-shadow 220ms ease,
			filter 220ms ease;
	}

	.play-button::before {
		content: '';
		position: absolute;
		inset: 2px;
		border-radius: 13px;
		border-top: 1px solid rgba(255, 255, 255, 0.9);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), transparent 46%);
		pointer-events: none;
	}

	.play-button::after {
		content: '';
		position: absolute;
		top: -50%;
		left: -80%;
		width: 42%;
		height: 200%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85), transparent);
		transform: rotate(18deg);
		transition: left 650ms ease;
		pointer-events: none;
	}

	.play-button:hover {
		transform: translateY(-2px);
		filter: brightness(1.06);
		box-shadow:
			0 0 32px rgba(255, 255, 255, 0.36),
			0 0 50px -28px rgba(147, 197, 253, 0.9),
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.play-button:hover::after {
		left: 140%;
	}

	.details-panel {
		position: relative;
		margin-top: 16px;
		overflow: hidden;
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018)),
			rgba(0, 0, 0, 0.18);
		padding: 14px;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
		animation: openDetails 240ms ease both;
	}

	.details-panel::before {
		content: '';
		position: absolute;
		top: 0;
		left: 18px;
		right: 18px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent);
	}

	.details-grid {
		display: grid;
		gap: 12px;
	}

	.details-section {
		border-radius: 18px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.035);
		padding: 15px;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.details-text {
		white-space: pre-line;
		font-size: 14px;
		line-height: 1.75;
		color: rgba(255, 255, 255, 0.7);
	}

	.section-icon {
		display: inline-grid;
		width: 30px;
		height: 30px;
		place-items: center;
		border-radius: 11px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.7);
	}

	.section-title {
		font-size: 12px;
		font-weight: 1000;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.62);
	}

	.payment-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.payment-chip {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 3px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03)),
			rgba(0, 0, 0, 0.1);
		padding: 4px;
		opacity: 0.86;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
		transition:
			transform 190ms ease,
			opacity 190ms ease,
			border-color 190ms ease,
			background 190ms ease;
	}

	.payment-chip:hover {
		transform: translateY(-2px) scale(1.025);
		opacity: 1;
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
	}

	.payment-image {
		height: 28px;
		width: auto;
		max-width: 96px;
		object-fit: contain;
		border-radius: 2px;
	}

	@keyframes openDetails {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (min-width: 640px) {
		.promo-box {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}

		.actions-row {
			flex-direction: row;
		}
	}

	@media (min-width: 1024px) {
		.stats-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.details-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.deal-layout {
			flex-direction: row;
			align-items: stretch;
		}

		.brand-panel {
			width: 260px;
			flex-shrink: 0;
		}

		.bottom-layout {
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
		}
	}

	@media (max-width: 640px) {
		.deal-card {
			border-radius: 18px;
			padding: 9px;
			box-shadow:
				0 14px 46px -38px rgba(255, 255, 255, 0.45),
				inset 0 1px 0 rgba(255, 255, 255, 0.1),
				inset 0 -1px 0 rgba(0, 0, 0, 0.35);
		}

		.deal-card::before {
			border-radius: 17px;
			opacity: 0.55;
		}

		.deal-card:hover {
			transform: none;
		}

		.deal-layout {
			gap: 9px;
		}

		.deal-content {
			gap: 9px;
		}

		.deal-top-line {
			left: 14px;
			right: 14px;
		}

		.deal-shine {
			opacity: 0.55;
		}

		.deal-orb {
			filter: blur(28px);
			opacity: 0.4;
		}

		.deal-orb-left {
			left: -105px;
			top: -35px;
			width: 145px;
			height: 145px;
		}

		.deal-orb-right {
			right: -125px;
			bottom: -95px;
			width: 175px;
			height: 175px;
		}

		.brand-panel {
			min-height: 92px;
			gap: 7px;
			border-radius: 15px;
			padding: 9px;
		}

		.brand-panel::before {
			top: 10px;
			opacity: 0.65;
		}

		.brand-panel::after {
			right: 10px;
			bottom: 8px;
			font-size: 34px;
		}

		.brand-glow {
			bottom: -38px;
			width: 110px;
			height: 58px;
			filter: blur(21px);
		}

		.logo-frame {
			width: 78px;
			height: 52px;
			border-radius: 13px;
		}

		.logo-frame::after {
			inset: 6px;
			border-radius: 9px;
		}

		.brand-logo {
			max-height: 34px;
			max-width: 64px;
			filter: drop-shadow(0 5px 12px rgba(0, 0, 0, 0.6));
		}

		.brand-content {
			width: 100%;
		}

		.brand-badges {
			margin-bottom: 0;
			gap: 6px;
		}

		.brand-title,
		.brand-subtitle {
			display: none;
		}

		.mini-badge {
			gap: 4px;
			padding: 3px 6px;
			font-size: 7px;
			letter-spacing: 0.1em;
		}

		.mini-badge :global(svg) {
			width: 9px;
			height: 9px;
		}

		.stats-grid {
			gap: 7px;
		}

		.stat-card {
			min-height: 62px;
			border-radius: 12px;
			padding: 8px;
		}

		.stat-card::after {
			right: -40px;
			top: -48px;
			width: 68px;
			height: 68px;
			opacity: 0.75;
		}

		.stat-card:hover {
			transform: none;
		}

		.stat-head {
			gap: 5px;
		}

		.stat-label {
			font-size: 7px;
			letter-spacing: 0.1em;
		}

		.stat-value {
			margin-top: 9px;
			font-size: 14px;
			letter-spacing: -0.03em;
		}

		.stat-type {
			display: block;
			margin-top: 2px;
			font-size: 8px;
			line-height: 1;
		}

		.bottom-layout {
			gap: 8px;
		}

		.features-list {
			gap: 6px;
		}

		.feature-pill {
			border-radius: 9px;
			padding: 5px 7px;
			font-size: 9px;
			line-height: 1;
		}

		.feature-pill:hover {
			transform: none;
		}

		.promo-box {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
			gap: 8px;
			border-radius: 13px;
			padding: 8px;
		}

		.promo-label {
			font-size: 7px;
			letter-spacing: 0.13em;
		}

		.promo-code {
			margin-top: 1px;
			font-size: 13px;
			line-height: 1.05;
		}

		.promo-empty {
			font-size: 11px;
		}

		.copy-button {
			width: auto;
			min-height: 32px;
			border-radius: 10px;
			padding: 7px 9px;
			font-size: 10px;
			gap: 5px;
		}

		.copy-button :global(svg) {
			width: 12px;
			height: 12px;
		}

		.actions-row {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 7px;
		}

		.details-button,
		.icon-action,
		.delete-action,
		.play-button {
			width: 100%;
			min-height: 36px;
			border-radius: 11px;
			padding: 8px 10px;
			font-size: 11px;
		}

		.details-button :global(svg),
		.icon-action :global(svg),
		.play-button :global(svg) {
			width: 13px;
			height: 13px;
		}

		.copy-button:hover,
		.details-button:hover,
		.icon-action:hover,
		.delete-action:hover,
		.play-button:hover {
			transform: none;
		}

		.icon-action,
		.delete-action {
			min-width: 36px;
			padding: 0;
		}

		.play-button {
			grid-column: auto;
		}

		.play-button::before {
			border-radius: 9px;
		}

		.details-panel {
			margin-top: 9px;
			border-radius: 15px;
			padding: 9px;
		}

		.details-panel::before {
			left: 12px;
			right: 12px;
		}

		.details-grid {
			gap: 8px;
		}

		.details-section {
			border-radius: 12px;
			padding: 10px;
		}

		.section-icon {
			width: 24px;
			height: 24px;
			border-radius: 8px;
		}

		.section-icon :global(svg) {
			width: 12px;
			height: 12px;
		}

		.section-title {
			font-size: 9px;
			letter-spacing: 0.12em;
		}

		.details-text {
			font-size: 11px;
			line-height: 1.55;
		}

		.payment-list {
			gap: 6px;
		}

		.payment-chip {
			padding: 3px;
		}

		.payment-image {
			height: 20px;
			max-width: 68px;
		}
	}
</style>
