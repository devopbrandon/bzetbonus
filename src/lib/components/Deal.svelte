<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Copy, Check, Pencil, ArrowRight } from 'lucide-svelte';
	import ConfirmDelete from './ConfirmDelete.svelte';

	export interface Deal {
		brand: string;
		bonus: string;
		bonustype: string;
		maxbet: string;
		maxbonus: string;
		freespins: string;
		features: string[];
		logourl: string;
		reflink: string;
		wager: string;
		wagertype: string;
		promocode: string;
		id: number;
		merkur: boolean;
		novoline: boolean;
	}

	const defaultDeal: Deal = {
		brand: 'Example Casino',
		bonus: '—',
		bonustype: '',
		maxbet: '—',
		maxbonus: '—',
		freespins: '—',
		features: [],
		logourl: '',
		reflink: '#',
		wager: '_',
		wagertype: '_',
		promocode: '',
		id: 0,
		merkur: false,
		novoline: false
	};

	let { deal = defaultDeal }: { deal?: Deal } = $props();

	const fmt = (v: string) => (v && v !== '' ? v : '—');

	let copied = $state(false);
	let copying = $state(false);

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
			setTimeout(() => (copied = false), 1400);
		} catch {
			// ignore
		} finally {
			copying = false;
		}
	}
</script>

<article
	class="group relative overflow-hidden rounded-2xl border border-white/10
		bg-[#0a0a0f]/80 p-5 text-white shadow-[0_0_40px_-20px_rgba(129,140,248,0.22)] backdrop-blur
		transition-all duration-300 hover:-translate-y-0.5
		hover:shadow-[0_0_60px_-18px_rgba(129,140,248,0.35)] sm:p-6"
>
	<div
		class="pointer-events-none absolute -inset-20 -z-10 opacity-0 blur-2xl transition group-hover:opacity-100"
		style="background: radial-gradient(50% 40% at 50% 0%, rgba(129,140,248,0.16), transparent 70%);"
	></div>

	<header class="flex items-start justify-between gap-4">
		<div class="flex items-center gap-4">
			{#if deal.logourl}
				<img
					src={deal.logourl}
					alt={`${deal.brand} logo`}
					class="h-12 w-12 rounded-xl bg-black/30 object-contain ring-1 ring-white/10"
					loading="lazy"
				/>
			{:else}
				<div class="grid h-12 w-12 place-items-center rounded-xl bg-black/30 ring-1 ring-white/10">
					<span class="text-xs text-white/60">Logo</span>
				</div>
			{/if}

			<div>
				<h3 class="text-lg font-extrabold tracking-tight text-white sm:text-xl">
					{deal.brand}
				</h3>
			</div>
		</div>

		{#if page.url.pathname === '/dashboard/deals'}
			<div class="absolute top-7 right-32 flex items-center gap-5">
				<button
					on:click={() => goto(`/dashboard/deals/edit/${deal.id}`)}
					class="cursor-pointer text-zinc-400 transition hover:text-indigo-400"
					aria-label="Edit deal"
				>
					<Pencil size={20} />
				</button>
				<ConfirmDelete dealId={deal.id} />
			</div>
		{/if}

		<div
			class="relative hidden rounded-xl bg-linear-to-r from-indigo-400 via-indigo-400 to-indigo-300 px-3 py-1.5
			text-sm font-extrabold text-white shadow-[0_0_24px_rgba(129,140,248,0.28)] select-none sm:block"
		>
			{deal.freespins && deal.freespins !== '—' ? `${deal.freespins} FS` : 'Exclusive'}
		</div>
	</header>

	<div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
		<ul class="grid grid-cols-2 gap-3 sm:grid-cols-4 md:col-span-7">
			<li class="rounded-xl border border-indigo-400/25 bg-indigo-400/10 p-3 ring-1 ring-white/5">
				<span class="block text-xs text-indigo-400 uppercase">{fmt(deal.bonustype)}</span>
				<span class="mt-0.5 block font-semibold text-white">{fmt(deal.bonus)}</span>
			</li>

			<li class="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
				<span class="block text-xs text-white/60">Max Bonus</span>
				<span class="mt-0.5 block font-semibold">{fmt(deal.maxbonus)}</span>
			</li>

			<li class="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
				<span class="block text-xs text-white/60">Max Bet</span>
				<span class="mt-0.5 block font-semibold">{fmt(deal.maxbet)}</span>
			</li>

			<li class="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
				<span class="block text-xs text-white/60">Wager</span>
				<span class="mt-0.5 block font-semibold">
					{fmt(deal.wager)}{deal.wagertype ? ` (${deal.wagertype})` : ''}
				</span>
			</li>
		</ul>

		<div class="flex flex-col gap-3 md:col-span-5">
			{#if deal.features && deal.features.length}
				<ul class="flex flex-wrap gap-2">
					{#each deal.features as f}
						<li
							class="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/90 ring-1 ring-white/10
							transition-colors duration-200 group-hover:bg-indigo-400/10 group-hover:text-indigo-300"
						>
							{f}
						</li>
					{/each}
				</ul>
			{/if}

			{#if deal.promocode}
				<div
					class="flex items-center justify-between gap-3 rounded-xl border border-indigo-400/25
					bg-indigo-400/10 px-3 py-2 ring-1 ring-white/5"
				>
					<div class="min-w-0">
						<p class="text-[10px] tracking-wider text-indigo-400 uppercase">Promo Code</p>
						<p class="truncate font-bold text-white">{deal.promocode}</p>
					</div>

					<button
						type="button"
						on:click={copyCode}
						class="relative inline-flex cursor-pointer items-center gap-2 rounded-lg
						border border-indigo-400/40 bg-indigo-400/15 px-3 py-2 text-sm
						font-semibold text-white transition-all hover:bg-indigo-400/25
						focus:ring-2 focus:ring-indigo-400/50 focus:outline-none disabled:opacity-60"
						aria-live="polite"
						aria-label={copied ? 'Promo code copied' : 'Copy promo code'}
						disabled={copying}
					>
						{#if copied}
							<Check class="h-4 w-4 text-indigo-300" /> Copied
						{:else}
							<Copy class="h-4 w-4" /> Copy
						{/if}
					</button>
				</div>
			{:else}
				<div
					class="flex items-center justify-between gap-3 rounded-xl border border-indigo-400/25
					bg-indigo-400/10 px-3 py-2 ring-1 ring-white/5"
				>
					<div class="min-w-0">
						<p class="text-[10px] tracking-wider text-indigo-400 uppercase">Promo Code</p>
						<p class="truncate font-bold text-zinc-400">No code required</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="text-center text-sm text-white/60 sm:text-left">
			Verified by Roberto | T&amp;Cs Apply
		</div>

		<div class="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
			{#if deal.merkur || deal.novoline}
				<div class="flex items-center gap-3">
					{#if deal.merkur}
						<img
							src="/images/merkur.png"
							alt="Merkur"
							class="h-8 w-auto object-contain transition-transform duration-100 hover:scale-110 sm:h-10"
							loading="lazy"
						/>
					{/if}

					{#if deal.novoline}
						<img
							src="/images/novoline.webp"
							alt="Novoline"
							class="h-4 w-auto object-contain transition-transform duration-100 hover:scale-105 sm:h-5"
							loading="lazy"
						/>
					{/if}
				</div>
			{/if}

			<a
				href={deal.reflink || '#'}
				target="_blank"
				rel="noopener noreferrer"
				class="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl
				bg-linear-to-r from-indigo-400 via-indigo-400 to-indigo-300
				px-6 py-2.5 font-extrabold tracking-wide text-white
				shadow-[0_0_22px_rgba(129,140,248,0.35)] ring-1 ring-indigo-400/30
				transition-all duration-300 hover:-translate-y-0.5
				hover:shadow-[0_0_36px_rgba(129,140,248,0.5)]
				active:translate-y-px active:scale-[0.98]
				sm:w-auto sm:shrink-0"
				aria-label="Open deal"
			>
				<span
					class="flex items-center gap-2 text-white transition-transform duration-300 group-hover:scale-[1.03]"
				>
					Play Now
					<ArrowRight
						class="h-5 w-5 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:scale-110"
					/>
				</span>

				<span
					class="pointer-events-none absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
				>
					<span
						class="absolute top-0 -left-full h-full w-[40%] skew-x-12
						animate-[shine_1.2s_ease-in-out] bg-linear-to-r from-transparent via-white/40 to-transparent"
					></span>
				</span>
			</a>
		</div>
	</div>

	<div
		aria-hidden="true"
		class="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 opacity-10"
		style="background:
		radial-gradient(circle at 10px 10px, rgba(255,255,255,0.2) 2px, transparent 3px) 0 0 / 20px 20px;"
	></div>
</article>

<style>
	@keyframes shine {
		0% {
			left: -100%;
		}
		100% {
			left: 200%;
		}
	}
</style>
