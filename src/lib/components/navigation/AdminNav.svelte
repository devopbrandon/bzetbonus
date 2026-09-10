<script lang="ts">
	import { page } from '$app/state';
	import { Box, LayoutDashboard, LogOut, Shuffle, Users, Watch } from 'lucide-svelte';

	let { role = 'user' }: { role?: string } = $props();

	const navItems = [
		{
			label: 'Deals',
			href: '/dashboard/deals',
			icon: LayoutDashboard,
			roles: ['admin']
		},
		{
			label: 'Verlosungen',
			href: '/dashboard/verlosungen',
			icon: Shuffle,
			roles: ['admin', 'moderator']
		},
		{
			label: 'User',
			href: '/dashboard/user',
			icon: Users,
			roles: ['admin', 'moderator']
		},
		{
			label: 'Cases',
			href: '/dashboard/cases',
			icon: Box,
			roles: ['admin']
		},
		{
			label: 'Openings',
			href: '/dashboard/case-history',
			icon: Watch,
			roles: ['admin', 'moderator']
		}
	];

	const visibleNavItems = $derived(navItems.filter((item) => item.roles.includes(role)));

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<div
	class="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0b0d11]/90 shadow-[0_10px_35px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
>
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#9fd0ff]/20 to-transparent"
	></div>

	<div class="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6">
		<div class="flex min-w-0 items-center gap-4">
			<!-- Admin badge -->
			<div
				class="hidden items-center gap-2 rounded-lg border border-[#8dc7ff]/[0.10] bg-[#8dc7ff]/[0.045] px-3 py-2 sm:flex"
			>
				<img src="/logo.png" alt="bzetbonus" class="w-36" />
			</div>

			<!-- Navigation -->
			<nav>
				<ul class="flex items-center gap-1.5">
					{#each visibleNavItems as item (item.label)}
						{@const active = isActive(item.href)}

						<li>
							<a
								href={item.href}
								aria-current={active ? 'page' : undefined}
								class={[
									'group flex h-10 items-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-all duration-200',
									active
										? 'border-[#8dc7ff]/[0.13] bg-[#8dc7ff]/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(141,199,255,0.025)]'
										: 'border-transparent text-white/42 hover:border-white/[0.06] hover:bg-white/[0.035] hover:text-white/80'
								]}
							>
								<item.icon
									size={16}
									strokeWidth={active ? 2.1 : 1.9}
									class={active ? 'text-[#9fd0ff]' : 'text-white/30'}
								/>

								<span>{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>

		<!-- Logout -->
		<button
			type="button"
			onclick={() => (window.location.href = '/')}
			class="group flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3.5 text-[12px] font-semibold text-white/45 transition-all duration-200 hover:border-red-400/15 hover:bg-red-500/[0.06] hover:text-red-300"
		>
			<LogOut
				size={15}
				strokeWidth={1.9}
				class="text-white/30 transition group-hover:text-red-300"
			/>

			<span class="hidden sm:inline">Zur Seite</span>
		</button>
	</div>
</div>
