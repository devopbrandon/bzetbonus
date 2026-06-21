<script lang="ts">
	import Deals from '$lib/components/sections/Deals.svelte';
	import Hero from '$lib/components/sections/Hero.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Ein Spin kann dein Leben verändern - Samet777.com</title>
</svelte:head>

<Hero />
<Deals deals={data.deals} />
