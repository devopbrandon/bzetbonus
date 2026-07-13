<script lang="ts">
	import './layout.css';

	import favicon from '$lib/assets/favicon.png';
	import Sidebar from '$lib/components/navigation/Sidebar.svelte';
	import Background from '$lib/components/ui/Background.svelte';
	import AdminNav from '$lib/components/navigation/AdminNav.svelte';

	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { PUBLIC_GA_MEASUREMENT_ID } from '$env/static/public';

	let { children } = $props();

	type Gtag = (
		command: 'js' | 'config' | 'event',
		target: Date | string,
		parameters?: Record<string, unknown>
	) => void;

	declare global {
		interface Window {
			dataLayer?: unknown[][];
			gtag?: Gtag;
		}
	}

	onMount(() => {
		const measurementId = PUBLIC_GA_MEASUREMENT_ID;

		if (!measurementId) {
			console.warn('Google Analytics Measurement ID fehlt.');
			return;
		}

		window.dataLayer ??= [];

		window.gtag ??= (...args: unknown[]) => {
			window.dataLayer?.push(args);
		};

		const existingScript = document.querySelector('script[data-google-analytics="true"]');

		if (!existingScript) {
			const script = document.createElement('script');

			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
				measurementId
			)}`;
			script.dataset.googleAnalytics = 'true';

			document.head.appendChild(script);
		}

		window.gtag('js', new Date());
		window.gtag('config', measurementId);
	});
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
		font-family: 'varsity';
		src: url('/fonts/varsity.ttf') format('truetype');
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
