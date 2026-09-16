<script lang="ts">
	import Deals from '$lib/components/sections/Deals.svelte';
	import Hero from '$lib/components/sections/Hero.svelte';
	import Socials from '$lib/components/sections/Socials.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Die besten Casino Boni für die Community - Bzetbonus.com</title>
</svelte:head>

<Hero />
<Deals deals={data.deals} />
<Socials />
