<script lang="ts">
	import { ChevronLeft, ChevronRight, Gift, Rocket } from 'lucide-svelte';
	import type { Component } from 'svelte';

	type NavItem = {
		label: string;
		href: string;
		icon: Component;
	};

	let collapsed = $state(false);

	const navItems: NavItem[] = [
		{ label: 'Bonus', href: '/', icon: Rocket },
		{ label: 'Gratis Freispiele', href: '/gratis', icon: Gift }
	];

	function toggleSidebar() {
		collapsed = !collapsed;
	}
</script>

<aside
	class={[
		'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-white/5 bg-[#203266]/50 py-6 backdrop-blur-xl transition-all duration-300 ease-out md:flex',
		collapsed ? 'w-20' : 'w-64'
	]}
>
	<!-- Top -->
	<div
		class="flex items-center px-4"
		class:justify-center={collapsed}
		class:justify-between={!collapsed}
	>
		<a href="/" class="group flex items-center">
			<img
				src="/logo.png"
				alt="samet777"
				class={[
					'select-none transition-all duration-300 group-hover:scale-105',
					collapsed ? 'w-12' : 'w-24'
				]}
				draggable="false"
			/>
		</a>

		{#if !collapsed}
			<button
				type="button"
				onclick={toggleSidebar}
				aria-label="Sidebar einklappen"
				class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
			>
				<ChevronLeft size={18} />
			</button>
		{/if}
	</div>

	{#if collapsed}
		<div class="mt-5 flex justify-center">
			<button
				type="button"
				onclick={toggleSidebar}
				aria-label="Sidebar ausklappen"
				class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
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
						class={[
							'group relative flex h-12 cursor-pointer items-center rounded-2xl border border-transparent text-sm font-bold text-white/72 transition duration-200 hover:border-white/10 hover:bg-white/[0.07] hover:text-white',
							collapsed ? 'justify-center px-0' : 'gap-3 px-4'
						]}
					>
						<svelte:component
							this={item.icon}
							size={21}
							class="shrink-0 transition duration-200 group-hover:scale-110"
						/>

						{#if !collapsed}
							<span class="truncate">{item.label}</span>
						{:else}
							<span
								class="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#142247] px-3 py-2 text-xs font-bold text-white opacity-0 shadow-2xl transition duration-200 group-hover:translate-x-1 group-hover:opacity-100"
							>
								{item.label}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
