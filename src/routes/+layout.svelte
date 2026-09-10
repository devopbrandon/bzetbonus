<script lang="ts">
	import './layout.css';

	import favicon from '$lib/assets/favicon.png';
	import Sidebar from '$lib/components/navigation/Sidebar.svelte';
	import Background from '$lib/components/ui/Background.svelte';
	import AdminNav from '$lib/components/navigation/AdminNav.svelte';

	import { page } from '$app/state';

	let { children, data } = $props();

	let sidebarCollapsed = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if page.url.pathname.startsWith('/dashboard')}
	<div class="min-h-screen bg-[#090a0c] font-[Inter]">
		<AdminNav role={data.profile?.role} />

		<main class="min-w-0 flex-1">
			{@render children()}
		</main>
	</div>
{:else}
	<div class="relative min-h-screen overflow-x-hidden bg-[#090a0c] font-[Inter]">
		<Background />

		<Sidebar bind:collapsed={sidebarCollapsed} profile={data.profile} />

		<main
			class={[
				'relative z-10 min-h-screen min-w-0 transition-[margin] duration-300 ease-out',
				sidebarCollapsed ? 'md:ml-[76px]' : 'md:ml-[240px]'
			]}
		>
			{@render children()}
		</main>
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
