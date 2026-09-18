<script lang="ts">
	import { page } from '$app/state';
	import {
		Bitcoin,
		BookOpen,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		Clapperboard,
		Image,
		LayoutDashboard,
		LockKeyhole,
		LogIn,
		LogOut,
		Menu,
		PackageOpen,
		ShieldCheck,
		ShipWheel,
		Shuffle,
		Star,
		Trophy,
		User,
		UsersRound,
		WalletCards,
		X
	} from 'lucide-svelte';
	import type { Component } from 'svelte';

	import AuthModal from '../modals/AuthModal.svelte';

	type NavItem = {
		label: string;
		href: string;
		icon: Component;
	};

	type SocialItem = {
		label: string;
		href: string;
		icon: string;
		color: string;
	};

	type Profile = {
		id?: string;
		username?: string | null;
		email?: string | null;
		avatar_url?: string | null;
		role?: string | null;
		balance?: number | null;
		points?: number | null;
	};

	let {
		collapsed = $bindable(false),
		profile = null
	}: {
		collapsed?: boolean;
		profile?: Profile | null;
	} = $props();

	let mobileOpen = $state(false);
	let authOpen = $state(false);
	let accountOpen = $state(false);
	let communityOpen = $state(false);
	let guideOpen = $state(false);

	const navItems: NavItem[] = [
		{
			label: 'Bonus Angebote',
			href: '/',
			icon: Star
		},
		{
			label: 'Tägliches Rad',
			href: '/daily',
			icon: ShipWheel
		},
		{
			label: 'Stream',
			href: '/stream',
			icon: Clapperboard
		}
	];

	const communityItems: NavItem[] = [
		// {
		// 	label: 'Gewinnbilder',
		// 	href: '/gewinnbilder',
		// 	icon: Image
		// },
		{
			label: 'Case Opening',
			href: '/case-opening',
			icon: PackageOpen
		},
		{
			label: 'Verlosungen',
			href: '/verlosungen',
			icon: Shuffle
		}
	];

	const guideItems: NavItem[] = [
		{
			label: 'Non-Sticky Bonus',
			href: '/ratgeber/non-sticky-bonus',
			icon: Star
		},
		{
			label: 'Sticky Bonus',
			href: '/ratgeber/sticky-bonus',
			icon: LockKeyhole
		},
		{
			label: 'Krypto Wallets',
			href: '/ratgeber/krypto-wallets',
			icon: WalletCards
		},
		{
			label: 'VPN für Online Casinos',
			href: '/ratgeber/vpn-online-casinos',
			icon: ShieldCheck
		}
	];

	const socialItems: SocialItem[] = [
		{
			label: 'Twitch',
			href: 'https://www.twitch.tv/bzetbros',
			icon: '/images/socials/twitch_white.svg',
			color: '#9146FF'
		},
		{
			label: 'Instagram',
			href: 'https://www.instagram.com/realbzet?igsi=eThpc3J6amZzeWlp',
			icon: '/images/socials/instagram.svg',
			color: '#E1306C'
		},
		{
			label: 'YouTube',
			href: 'https://youtube.com/@realbzet?si=d2JgJw1OHcyUk81t',
			icon: '/images/socials/youtube.svg',
			color: '#FF0000'
		},
		{
			label: 'Discord',
			href: 'https://discord.gg/RkUaKZnYY',
			icon: '/images/socials/discord.svg',
			color: '#5865F2'
		}
	];

	function isActive(href: string) {
		if (href === '/') {
			return page.url.pathname === '/';
		}

		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function toggleSidebar() {
		collapsed = !collapsed;

		if (collapsed) {
			accountOpen = false;
		}
	}

	function toggleGuide() {
		guideOpen = !guideOpen;
	}

	function toggleMobileSidebar() {
		mobileOpen = !mobileOpen;
	}

	function closeMobileSidebar() {
		mobileOpen = false;
		accountOpen = false;
	}

	function openAuth() {
		authOpen = true;
		closeMobileSidebar();
	}

	function toggleCommunity() {
		communityOpen = !communityOpen;
	}

	function toggleAccount() {
		accountOpen = !accountOpen;
	}

	function closeAccount() {
		accountOpen = false;
	}

	function getInitial() {
		const value = profile?.username || profile?.email || 'B';

		return value.charAt(0).toUpperCase();
	}

	let communityActive = $derived(communityItems.some((item) => isActive(item.href)));
	let guideActive = $derived(guideItems.some((item) => isActive(item.href)));
</script>

<!-- Mobile Toggle -->
<button
	type="button"
	onclick={toggleMobileSidebar}
	aria-label={mobileOpen ? 'Sidebar schließen' : 'Sidebar öffnen'}
	class="fixed right-4 top-4 z-70 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-[#111318]/95 text-white shadow-xl shadow-black/20 backdrop-blur-xl transition hover:bg-[#171a20] md:hidden"
>
	{#if mobileOpen}
		<X size={20} />
	{:else}
		<Menu size={20} />
	{/if}
</button>

<!-- Mobile Backdrop -->
{#if mobileOpen}
	<button
		type="button"
		onclick={closeMobileSidebar}
		aria-label="Sidebar schließen"
		class="fixed inset-0 z-50 cursor-pointer bg-black/65 backdrop-blur-[2px] md:hidden"
	></button>
{/if}

<aside
	class={[
		'fixed left-0 top-0 z-60 flex h-dvh flex-col overflow-visible border-r border-white/[0.08] bg-[#0d0f13] shadow-[14px_0_45px_rgba(0,0,0,0.28)] transition-all duration-300 md:z-40',
		collapsed ? 'md:w-[76px]' : 'md:w-[240px]',
		mobileOpen ? 'w-[270px] translate-x-0' : 'w-[270px] -translate-x-full md:translate-x-0'
	]}
>
	<!-- Ambient -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025)_0%,transparent_22%,transparent_75%,rgba(0,0,0,0.18)_100%)]"
		></div>

		<div
			class="absolute -left-20 top-[-100px] h-[260px] w-[260px] rounded-full bg-[#8dc7ff]/[0.025] blur-[80px]"
		></div>

		<div
			class="absolute right-0 top-0 h-full w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(141,199,255,0.13)_32%,rgba(255,255,255,0.04)_72%,transparent)]"
		></div>
	</div>

	<!-- Header -->
	<div class="relative z-10 flex h-[88px] shrink-0 items-center border-b border-white/[0.065] px-5">
		<a
			href="/"
			onclick={closeMobileSidebar}
			class={['flex min-w-0 items-center', collapsed ? 'md:w-full md:justify-center' : 'gap-3']}
		>
			<img
				src={collapsed ? '/icon.png' : '/logo.png'}
				alt="BZETBONUS"
				draggable="false"
				class={[
					'select-none object-contain transition duration-200',
					collapsed ? 'h-11 w-11' : 'h-10 w-auto'
				]}
			/>
		</a>
	</div>

	<!-- Navigation -->
	<nav class="relative z-10 flex-1 px-3 py-5">
		<ul class="space-y-1.5">
			{#each navItems as item (item.label)}
				{@const active = isActive(item.href)}

				<li>
					<a
						href={item.href}
						onclick={closeMobileSidebar}
						aria-current={active ? 'page' : undefined}
						class={[
							'group relative flex h-11 items-center overflow-visible rounded-lg text-sm font-semibold transition-all duration-200',
							collapsed ? 'justify-center md:px-0' : 'gap-3 px-3',
							active
								? 'bg-[#181d24] text-white shadow-[inset_0_0_0_1px_rgba(141,199,255,0.07)]'
								: 'text-white/48 hover:bg-white/[0.045] hover:text-white'
						]}
					>
						<div
							class={[
								'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-200',
								active
									? 'bg-[#8dc7ff]/[0.11] text-[#9fd0ff]'
									: 'text-white/38 group-hover:text-white/80'
							]}
						>
							<item.icon size={18} strokeWidth={active ? 2.15 : 1.9} />
						</div>

						{#if !collapsed}
							<span class="truncate">
								{item.label}
							</span>
						{/if}

						{#if collapsed}
							<span
								class="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-80 hidden -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-md border border-white/[0.09] bg-[#171a1f] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block"
							>
								{item.label}
							</span>
						{/if}
					</a>
				</li>
			{/each}

			<li class="relative pt-1">
				<button
					type="button"
					onclick={toggleCommunity}
					aria-expanded={communityOpen}
					class={[
						'group relative flex h-11 w-full cursor-pointer items-center overflow-visible rounded-lg text-sm font-semibold transition-all duration-200',
						collapsed ? 'justify-center md:px-0' : 'gap-3 px-3',
						communityActive || communityOpen
							? 'bg-[#181d24] text-white shadow-[inset_0_0_0_1px_rgba(141,199,255,0.07)]'
							: 'text-white/48 hover:bg-white/[0.045] hover:text-white'
					]}
				>
					<div
						class={[
							'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-200',
							communityActive || communityOpen
								? 'bg-[#8dc7ff]/[0.11] text-[#9fd0ff]'
								: 'text-white/38 group-hover:text-white/80'
						]}
					>
						<UsersRound size={18} strokeWidth={communityActive || communityOpen ? 2.15 : 1.9} />
					</div>

					{#if !collapsed}
						<span class="min-w-0 flex-1 truncate text-left">Community</span>

						<ChevronDown
							size={15}
							strokeWidth={1.9}
							class={`shrink-0 text-white/28 transition-transform duration-300 ${
								communityOpen ? 'rotate-180 text-[#9fd0ff]/70' : ''
							}`}
						/>
					{/if}

					{#if collapsed && !communityOpen}
						<span
							class="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-80 hidden -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-md border border-white/[0.09] bg-[#171a1f] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block"
						>
							Community
						</span>
					{/if}
				</button>

				{#if !collapsed}
					<div
						class={[
							'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
							communityOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
						]}
					>
						<div class="overflow-hidden">
							<div
								class="relative ml-[22px] mt-1.5 space-y-1 border-l border-white/[0.07] pb-1 pl-[18px]"
							>
								{#each communityItems as item, index (item.label)}
									{@const active = isActive(item.href)}

									<a
										href={item.href}
										onclick={closeMobileSidebar}
										aria-current={active ? 'page' : undefined}
										class={[
											'group/item relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[12px] font-semibold transition-all duration-200',
											active
												? 'bg-[#8dc7ff]/[0.08] text-[#b9ddff]'
												: 'text-white/34 hover:translate-x-0.5 hover:bg-white/[0.035] hover:text-white/78'
										]}
										style={`transition-delay: ${communityOpen ? index * 28 : 0}ms`}
									>
										<span
											class={[
												'absolute -left-[19px] top-1/2 h-px w-[12px] -translate-y-1/2 transition duration-200',
												active ? 'bg-[#8dc7ff]/45' : 'bg-white/[0.07] group-hover/item:bg-white/20'
											]}
										></span>

										<item.icon
											size={15}
											strokeWidth={active ? 2.1 : 1.8}
											class={active
												? 'text-[#9fd0ff]'
												: 'text-white/28 group-hover/item:text-white/60'}
										/>

										<span class="truncate">{item.label}</span>

										{#if active}
											<span
												class="ml-auto h-1.5 w-1.5 rounded-full bg-[#8dc7ff] shadow-[0_0_10px_rgba(141,199,255,0.5)]"
											></span>
										{/if}
									</a>
								{/each}
							</div>
						</div>
					</div>
				{:else if communityOpen}
					<div
						class="absolute left-[calc(100%+12px)] top-0 z-90 hidden w-[210px] overflow-hidden rounded-xl border border-white/[0.09] bg-[#14171c]/98 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl md:block"
					>
						<div class="mb-1 border-b border-white/[0.06] px-3 pb-2.5 pt-2">
							<p class="text-[11px] font-bold tracking-[0.08em] text-white/75 uppercase">
								Community
							</p>
						</div>

						{#each communityItems as item (item.label)}
							{@const active = isActive(item.href)}

							<a
								href={item.href}
								aria-current={active ? 'page' : undefined}
								class={[
									'flex h-10 items-center gap-2.5 rounded-lg px-3 text-[12px] font-semibold transition duration-200',
									active
										? 'bg-[#8dc7ff]/[0.08] text-[#b9ddff]'
										: 'text-white/48 hover:bg-white/[0.055] hover:text-white'
								]}
							>
								<item.icon size={15} strokeWidth={active ? 2.1 : 1.8} />
								{item.label}
							</a>
						{/each}
					</div>
				{/if}
			</li>

			<li class="relative">
				<button
					type="button"
					onclick={toggleGuide}
					aria-expanded={guideOpen}
					class={[
						'group relative flex h-11 w-full cursor-pointer items-center overflow-visible rounded-lg text-sm font-semibold transition-all duration-200',
						collapsed ? 'justify-center md:px-0' : 'gap-3 px-3',
						guideActive || guideOpen
							? 'bg-[#181d24] text-white shadow-[inset_0_0_0_1px_rgba(141,199,255,0.07)]'
							: 'text-white/48 hover:bg-white/[0.045] hover:text-white'
					]}
				>
					<div
						class={[
							'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-200',
							guideActive || guideOpen
								? 'bg-[#8dc7ff]/[0.11] text-[#9fd0ff]'
								: 'text-white/38 group-hover:text-white/80'
						]}
					>
						<BookOpen size={18} strokeWidth={guideActive || guideOpen ? 2.15 : 1.9} />
					</div>

					{#if !collapsed}
						<span class="min-w-0 flex-1 truncate text-left"> Ratgeber </span>

						<ChevronDown
							size={15}
							strokeWidth={1.9}
							class={`shrink-0 text-white/28 transition-transform duration-300 ${
								guideOpen ? 'rotate-180 text-[#9fd0ff]/70' : ''
							}`}
						/>
					{/if}

					{#if collapsed && !guideOpen}
						<span
							class="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-80 hidden -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-md border border-white/[0.09] bg-[#171a1f] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block"
						>
							Ratgeber
						</span>
					{/if}
				</button>

				{#if !collapsed}
					<div
						class={[
							'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
							guideOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
						]}
					>
						<div class="overflow-hidden">
							<div
								class="relative ml-[22px] mt-1.5 space-y-1 border-l border-white/[0.07] pb-1 pl-[18px]"
							>
								{#each guideItems as item, index (item.label)}
									{@const active = isActive(item.href)}

									<a
										href={item.href}
										onclick={closeMobileSidebar}
										aria-current={active ? 'page' : undefined}
										class={[
											'group/item relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[12px] font-semibold transition-all duration-200',
											active
												? 'bg-[#8dc7ff]/[0.08] text-[#b9ddff]'
												: 'text-white/34 hover:translate-x-0.5 hover:bg-white/[0.035] hover:text-white/78'
										]}
										style={`transition-delay: ${guideOpen ? index * 28 : 0}ms`}
									>
										<span
											class={[
												'absolute -left-[19px] top-1/2 h-px w-[12px] -translate-y-1/2 transition duration-200',
												active ? 'bg-[#8dc7ff]/45' : 'bg-white/[0.07] group-hover/item:bg-white/20'
											]}
										></span>

										<item.icon
											size={15}
											strokeWidth={active ? 2.1 : 1.8}
											class={active
												? 'text-[#9fd0ff]'
												: 'text-white/28 group-hover/item:text-white/60'}
										/>

										<span class="truncate">
											{item.label}
										</span>

										{#if active}
											<span
												class="ml-auto h-1.5 w-1.5 rounded-full bg-[#8dc7ff] shadow-[0_0_10px_rgba(141,199,255,0.5)]"
											></span>
										{/if}
									</a>
								{/each}
							</div>
						</div>
					</div>
				{:else if guideOpen}
					<div
						class="absolute left-[calc(100%+12px)] top-0 z-90 hidden w-[230px] overflow-hidden rounded-xl border border-white/[0.09] bg-[#14171c]/98 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl md:block"
					>
						<div class="mb-1 border-b border-white/[0.06] px-3 pb-2.5 pt-2">
							<p class="text-[11px] font-bold tracking-[0.08em] text-white/75 uppercase">
								Ratgeber
							</p>
						</div>

						{#each guideItems as item (item.label)}
							{@const active = isActive(item.href)}

							<a
								href={item.href}
								aria-current={active ? 'page' : undefined}
								class={[
									'flex h-10 items-center gap-2.5 rounded-lg px-3 text-[12px] font-semibold transition duration-200',
									active
										? 'bg-[#8dc7ff]/[0.08] text-[#b9ddff]'
										: 'text-white/48 hover:bg-white/[0.055] hover:text-white'
								]}
							>
								<item.icon size={15} strokeWidth={active ? 2.1 : 1.8} />

								{item.label}
							</a>
						{/each}
					</div>
				{/if}
			</li>
		</ul>
	</nav>

	<!-- Collapse -->
	<div class="relative z-10 hidden px-3 md:block">
		<button
			type="button"
			onclick={toggleSidebar}
			aria-label={collapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
			class={[
				'group flex h-10 w-full cursor-pointer items-center text-white/28 transition duration-200 hover:bg-white/[0.035] hover:text-white/65',
				collapsed ? 'justify-center rounded-lg' : 'gap-3 rounded-lg px-3'
			]}
		>
			{#if collapsed}
				<ChevronRight size={17} />
			{:else}
				<ChevronLeft size={17} />
				<span class="text-xs font-medium">Sidebar einklappen</span>
			{/if}
		</button>
	</div>

	<!-- Bottom -->
	<div class="relative z-20 px-3 pb-4 pt-3">
		<div class="mb-3 border-t border-white/[0.065]"></div>

		<!-- Socials -->
		<div
			class={[
				'mb-3 flex',
				collapsed ? 'flex-col items-center gap-1' : 'items-center justify-between px-1'
			]}
		>
			{#each socialItems as social (social.label)}
				<a
					href={social.href}
					target="_blank"
					rel="noreferrer"
					aria-label={social.label}
					class="group relative flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition duration-200 hover:bg-[var(--social-color)] hover:text-white"
					style={`--social-color: ${social.color}`}
				>
					<img
						src={social.icon}
						alt=""
						draggable="false"
						class="h-[18px] w-[18px] select-none object-contain opacity-45 grayscale transition duration-200 group-hover:scale-[1.06] group-hover:opacity-100 group-hover:grayscale-0"
					/>

					{#if collapsed}
						<span
							class="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-80 hidden -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-md border border-white/[0.09] bg-[#171a1f] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block"
						>
							{social.label}
						</span>
					{/if}
				</a>
			{/each}
		</div>

		{#if profile}
			<!-- Account -->
			<div class="relative">
				<!-- Dropdown -->
				{#if accountOpen}
					<div
						class={[
							'absolute bottom-[calc(100%+8px)] overflow-hidden rounded-xl border border-white/[0.09] bg-[#14171c]/98 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl',
							collapsed ? 'left-[calc(100%+12px)] w-[200px]' : 'left-0 w-full'
						]}
					>
						<!-- Account info -->
						<div class="mb-1 border-b border-white/[0.06] px-3 pb-3 pt-2">
							<p class="truncate text-[12px] font-bold text-white">
								{profile.username ?? 'BZET User'}
							</p>

							{#if profile.email}
								<p class="mt-0.5 truncate text-[10px] text-white/30">
									{profile.email}
								</p>
							{/if}
						</div>

						<a
							href="/profil"
							onclick={() => {
								closeAccount();
								closeMobileSidebar();
							}}
							class="flex h-10 items-center gap-2.5 rounded-lg px-3 text-[12px] font-semibold text-white/55 transition hover:bg-white/[0.055] hover:text-white"
						>
							<User size={16} strokeWidth={1.9} />
							Profil
						</a>

						<a
							href="/auszahlen"
							onclick={() => {
								closeAccount();
								closeMobileSidebar();
							}}
							class="flex h-10 items-center gap-2.5 rounded-lg px-3 text-[12px] font-semibold text-white/55 transition hover:bg-white/[0.055] hover:text-white"
						>
							<Bitcoin size={16} strokeWidth={1.9} />
							Auszahlen
						</a>

						{#if profile.role === 'admin' || profile.role === 'moderator'}
							<a
								href="/dashboard"
								onclick={() => {
									closeAccount();
									closeMobileSidebar();
								}}
								class="flex h-10 items-center gap-2.5 rounded-lg px-3 text-[12px] font-semibold text-[#9fd0ff]/70 transition hover:bg-[#8dc7ff]/[0.07] hover:text-[#b9ddff]"
							>
								<LayoutDashboard size={16} strokeWidth={1.9} />
								Dashboard
							</a>
						{/if}

						<div class="my-1 h-px bg-white/[0.06]"></div>

						<form method="POST" action="/logout">
							<button
								type="submit"
								class="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-left text-[12px] font-semibold text-red-400/65 transition hover:bg-red-500/[0.07] hover:text-red-300"
							>
								<LogOut size={16} strokeWidth={1.9} />
								Ausloggen
							</button>
						</form>
					</div>
				{/if}

				<!-- Account trigger -->
				<button
					type="button"
					onclick={toggleAccount}
					class={[
						'group relative flex h-[52px] w-full cursor-pointer items-center rounded-xl border border-white/[0.07] bg-white/[0.025] transition duration-200 hover:border-white/[0.11] hover:bg-white/[0.045]',
						collapsed ? 'justify-center px-0' : 'gap-3 px-2.5'
					]}
				>
					<!-- Avatar -->
					<div
						class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#181c22] text-[12px] font-black text-[#9fd0ff]"
					>
						{#if profile.avatar_url}
							<img
								src={profile.avatar_url}
								alt={profile.username ?? 'Profil'}
								draggable="false"
								class="h-full w-full object-cover"
							/>
						{:else}
							{getInitial()}
						{/if}
					</div>

					{#if !collapsed}
						<div class="min-w-0 flex-1 text-left">
							<p class="truncate text-[12px] font-bold text-white/90">
								{profile.username ?? 'BZET User'}
							</p>

							<div class="mt-0.5 flex items-center gap-2 text-[10px] font-semibold">
								<span class="text-[#9fd0ff]/75">
									{Number(profile.balance ?? 0).toLocaleString('de-DE', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})} €
								</span>

								<span class="h-1 w-1 rounded-full bg-white/15"></span>

								<span class="text-white/35">
									{Number(profile.points ?? 0).toLocaleString('de-DE')} Points
								</span>
							</div>
						</div>

						<ChevronDown
							size={15}
							strokeWidth={1.9}
							class={`shrink-0 text-white/25 transition-transform duration-200 ${
								accountOpen ? 'rotate-180' : ''
							}`}
						/>
					{/if}

					{#if collapsed && !accountOpen}
						<span
							class="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-80 hidden -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-md border border-white/[0.09] bg-[#171a1f] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block"
						>
							{profile.username ?? 'Profil'}
						</span>
					{/if}
				</button>
			</div>
		{:else}
			<!-- Login -->
			<button
				type="button"
				onclick={openAuth}
				class={[
					'group relative flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-white font-bold text-[#0b0c0e] shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition duration-200 hover:bg-[#edf5ff]',
					collapsed ? 'px-0' : 'gap-2 px-4 text-[13px]'
				]}
			>
				<LogIn size={17} strokeWidth={2.2} />

				{#if !collapsed}
					<span>Anmelden</span>
				{/if}

				{#if collapsed}
					<span
						class="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-80 hidden -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-md border border-white/[0.09] bg-[#171a1f] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 md:block"
					>
						Anmelden
					</span>
				{/if}
			</button>
		{/if}

		{#if !collapsed}
			<p class="mt-3 text-center text-[10px] font-medium text-white/16">© 2026 BZETBONUS.COM</p>
		{/if}
	</div>
</aside>

<AuthModal bind:open={authOpen} />
