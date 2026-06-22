<script lang="ts">
	import Deal from '$lib/components/Deal.svelte';
	import { ArrowLeft, Sparkles } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	type DealRow = {
		id: number;
		brand: string | null;
		bonus: string | null;
		bonustype: string | null;
		maxbet: string | null;
		maxbonus: string | null;
		freespins: string | null;
		logourl: string | null;
		reflink: string | null;
		wager: string | null;
		wagertype: string | null;
		features: string[] | null;
		promocode: string | null;
		created_at: string;
		position: number | null;
		information: string | null;
		payments: string[] | null;
	};

	let { data }: { data: { deal: DealRow } } = $props();

	const deal = data.deal;
</script>

<svelte:head>
	<title>{deal.brand ?? 'Deal'} - Bonus Deal</title>
	<meta name="description" content={`Alle Details zum ${deal.brand ?? 'Casino'} Bonus Deal.`} />
</svelte:head>

<section class="mx-auto max-w-7xl py-30 sm:px-0">
	<div class="deal-enter">
		<Deal {deal} />
	</div>
</section>
