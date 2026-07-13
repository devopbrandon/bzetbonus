<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import Sidebar from '$lib/components/navigation/Sidebar.svelte';
	import Background from '$lib/components/ui/Background.svelte';
	import { page } from '$app/state';
	import AdminNav from '$lib/components/navigation/AdminNav.svelte';
	import { PUBLIC_GA_MEASUREMENT_ID } from '$env/static/public';

	let { children } = $props();
</script>

<svelte:head
	><link rel="icon" href={favicon} />
	<script
		async
		src={`https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_MEASUREMENT_ID}`}
	></script>

	<script>
		{
			`
			window.dataLayer = window.dataLayer || [];

			function gtag() {
				window.dataLayer.push(arguments);
			}

			window.gtag = gtag;

			gtag('js', new Date());
			gtag('config', '${PUBLIC_GA_MEASUREMENT_ID}');
		`;
		}
	</script>
</svelte:head>

{#if page.url.pathname.startsWith('/dashboard')}
	<div class="min-h-screen bg-linear-to-b from-[#131F42] via-[#16244D] to-[#0D172E] font-[Inter]">
		<AdminNav />
		<main class="min-w-0 flex-1">
			{@render children()}
		</main>
	</div>
{:else}
	<div
		class="relative flex min-h-screen overflow-hidden bg-linear-to-b from-[#131F42] via-[#16244D] to-[#0D172E] font-[Inter]"
	>
		<Background />

		<div class="relative z-10 flex min-h-screen w-full">
			<Sidebar />

			<main class="min-w-0 flex-1 sm:ml-72">
				{@render children()}
			</main>
		</div>
	</div>
{/if}

<style>
	@font-face {
		font-family: 'varsity';
		src: url('/fonts/varsity.ttf') format('TrueType');
		font-weight: 400;
		font-style: normal;
	}
	@font-face {
		font-family: 'Inter';
		src: url('/fonts/Inter.woff2') format('woff2');
		font-weight: 400;
		font-style: normal;
	}

	:global(html) {
		scroll-behavior: smooth;
	}
</style>
