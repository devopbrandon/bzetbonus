<script lang="ts">
	import Deals from '$lib/components/sections/Deals.svelte';
	import Hero from '$lib/components/sections/Hero.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Bonis die du lieben wirst! - Money4Duo.com</title>
</svelte:head>

<Hero />
<Deals deals={data.deals} />
