<script lang="ts">
	import { ChevronLeft, ChevronRight, Copyright, Gift, Menu, Rocket, X } from 'lucide-svelte';
	import type { Component } from 'svelte';

	type NavItem = {
		label: string;
		href: string;
		icon: Component;
	};

	type SocialItem = {
		label: string;
		href: string;
		icon: string;
	};

	let collapsed = $state(false);
	let mobileOpen = $state(false);

	const navItems: NavItem[] = [
		{ label: 'Bonus', href: '/', icon: Rocket }
		// { label: 'Gratis Freispiele', href: '/gratis', icon: Gift }
	];

	const socialItems: SocialItem[] = [
		{
			label: 'Instagram',
			href: 'https://instagram.com/',
			icon: '/images/socials/instagram.svg'
		},
		{
			label: 'Discord',
			href: 'https://discord.gg/',
			icon: '/images/socials/discord.svg'
		},
		{
			label: 'YouTube',
			href: 'https://youtube.com/',
			icon: '/images/socials/youtube.svg'
		}
	];

	function toggleSidebar() {
		collapsed = !collapsed;
	}

	function toggleMobileSidebar() {
		mobileOpen = !mobileOpen;
	}

	function closeMobileSidebar() {
		mobileOpen = false;
	}
</script>

<!-- Mobile Toggle -->
<button
	type="button"
	onclick={toggleMobileSidebar}
	aria-label={mobileOpen ? 'Sidebar schließen' : 'Sidebar öffnen'}
	class="fixed right-4 top-4 z-70 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-[#203266]/85 text-white shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:border-white/20 hover:bg-[#263b76] md:hidden"
>
	{#if mobileOpen}
		<X size={21} />
	{:else}
		<Menu size={21} />
	{/if}
</button>

<!-- Mobile Backdrop -->
{#if mobileOpen}
	<button
		type="button"
		aria-label="Sidebar schließen"
		onclick={closeMobileSidebar}
		class="fixed inset-0 z-55 cursor-pointer bg-black/55 backdrop-blur-[2px] md:hidden"
	></button>
{/if}

<aside
	class={[
		'fixed left-0 top-0 z-60 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-white/5 bg-[#203266]/90 py-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 ease-out md:z-40 md:bg-[#203266]/50 md:shadow-none',
		collapsed ? 'md:w-20' : 'md:w-64',
		mobileOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:translate-x-0'
	]}
>
	<!-- Top -->
	<div
		class="flex items-center px-4"
		class:justify-center={collapsed}
		class:justify-between={!collapsed}
	>
		<a href="/" class="group flex items-center" onclick={closeMobileSidebar}>
			<img
				src="/logo.png"
				alt="samet777"
				class={[
					'select-none transition-all duration-300 group-hover:scale-105',
					collapsed ? 'md:w-12' : 'w-24'
				]}
				draggable="false"
			/>
		</a>

		{#if !collapsed}
			<button
				type="button"
				onclick={toggleSidebar}
				aria-label="Sidebar einklappen"
				class="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/4 text-white/75 transition hover:border-white/20 hover:bg-white/8 hover:text-white md:inline-flex"
			>
				<ChevronLeft size={18} />
			</button>
		{/if}
	</div>

	{#if collapsed}
		<div class="mt-5 hidden justify-center md:flex">
			<button
				type="button"
				onclick={toggleSidebar}
				aria-label="Sidebar ausklappen"
				class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/4 text-white/75 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
			>
				<ChevronRight size={18} />
			</button>
		</div>
	{/if}

	<!-- Navigation -->
	<nav class="mt-8 px-3">
		<ul class="flex flex-col gap-2">
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						onclick={closeMobileSidebar}
						class={[
							'group relative flex h-12 cursor-pointer items-center rounded-2xl border border-transparent text-sm font-bold text-white/72 transition duration-200 hover:border-white/10 hover:bg-white/[0.07] hover:text-white',
							collapsed ? 'md:justify-center md:px-0' : 'gap-3 px-4'
						]}
					>
						<item.icon size={21} class="shrink-0 transition duration-200 group-hover:scale-110" />

						<span class={['truncate', collapsed ? 'md:hidden' : '']}>{item.label}</span>

						{#if collapsed}
							<span
								class="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#142247] px-3 py-2 text-xs font-bold text-white opacity-0 shadow-2xl transition duration-200 group-hover:translate-x-1 group-hover:opacity-100 md:block"
							>
								{item.label}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Bottom Social Links -->
	<div class="mt-auto px-3">
		<div class="mb-3 h-px bg-white/10"></div>

		<div
			class={[
				'flex w-full items-center justify-center gap-2',
				collapsed ? 'md:flex-col md:items-center' : ''
			]}
		>
			{#each socialItems as social}
				<a
					href={social.href}
					target="_blank"
					rel="noreferrer"
					aria-label={social.label}
					class={[
						'group relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-white/20 hover:bg-white/[0.08]',
						!collapsed ? 'md:h-10 md:w-10' : ''
					]}
				>
					<img
						src={social.icon}
						alt={social.label}
						class="block h-5 w-5 select-none object-contain opacity-80 transition group-hover:scale-110 group-hover:opacity-100"
						draggable="false"
					/>

					{#if collapsed}
						<span
							class="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#142247] px-3 py-2 text-xs font-bold text-white opacity-0 shadow-2xl transition duration-200 group-hover:translate-x-1 group-hover:opacity-100 md:block"
						>
							{social.label}
						</span>
					{/if}
				</a>
			{/each}
		</div>

		{#if !collapsed}
			<p
				class="mt-4 hidden items-center gap-1.5 px-1 text-[11px] font-semibold text-white/35 md:flex"
			>
				<Copyright size={13} class="shrink-0" />
				<span>Samet777</span>
			</p>
		{/if}
	</div>
</aside>
