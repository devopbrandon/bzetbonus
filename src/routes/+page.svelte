<script lang="ts">
	import Deals from '$lib/components/sections/Deals.svelte';
	import Hero from '$lib/components/sections/Hero.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Bonus Angebote, die Du nicht ablehnen kannst - Samet777.com</title>
</svelte:head>

<Hero />
<Deals deals={data.deals} />
