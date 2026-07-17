<script lang="ts">
	import './layout.css';

	import favicon from '$lib/assets/favicon.png';
	import Sidebar from '$lib/components/navigation/Sidebar.svelte';
	import Background from '$lib/components/ui/Background.svelte';
	import AdminNav from '$lib/components/navigation/AdminNav.svelte';

	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
		font-family: 'Inter';
		src: url('/fonts/Inter.woff2') format('woff2');
		font-weight: 400;
		font-style: normal;
	}

	@font-face {
		font-family: 'Sora';
		src: url('/fonts/Sora-Regular.ttf') format('TrueType');
		font-weight: 400;
		font-style: normal;
	}

	:global(html) {
		scroll-behavior: smooth;
	}
</style>
