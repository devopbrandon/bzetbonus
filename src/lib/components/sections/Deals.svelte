<script lang="ts">
	import Deal from '$lib/components/Deal.svelte';
	import { onMount } from 'svelte';

	type DealRow = {
		id: number;
		brand?: string | null;
		bonus?: string | null;
		maxbonus?: string | null;
		maxbet?: string | null;
		wager?: string | null;
		promocode?: string | null;
		logourl?: string | null;
		reflink?: string | null;
		information?: string | null;
		position?: number | null;
		bonustype?: string | null;
		freespins?: string | null;
		features?: string[] | null;
		wagertype?: string | null;
		payments?: string[] | null;
	};

	let { deals = [] }: { deals: DealRow[] } = $props();

	let showDeals = $state(false);

	onMount(() => {
		const timer = window.setTimeout(() => {
			showDeals = true;
		}, 1500);

		return () => {
			window.clearTimeout(timer);
		};
	});
</script>

<section class="mx-auto max-w-7xl px-4 pb-20 sm:px-0">
	{#if showDeals}
		<div class="space-y-4 sm:space-y-5">
			{#each deals as deal, index (deal.id)}
				<div class="deal-enter" style={`animation-delay: ${Math.min(index * 90, 700)}ms;`}>
					<Deal {deal} />
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
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
	}
</style>
