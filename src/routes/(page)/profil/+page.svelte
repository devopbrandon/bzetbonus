<script lang="ts">
	import {
		Banknote,
		CalendarDays,
		CircleUserRound,
		Copy,
		Crown,
		Hash,
		Mail,
		ShieldCheck,
		Sparkles,
		User,
		WalletCards
	} from 'lucide-svelte';

	let { data } = $props();

	let copied = $state(false);

	const money = new Intl.NumberFormat('de-DE', {
		style: 'currency',
		currency: 'EUR'
	});

	const points = new Intl.NumberFormat('de-DE');

	function formatDate(value: string) {
		return new Intl.DateTimeFormat('de-DE', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		}).format(new Date(value));
	}

	function roleLabel(role: string | null) {
		switch (role) {
			case 'admin':
				return 'Admin';

			case 'moderator':
				return 'Moderator';

			default:
				return 'Mitglied';
		}
	}

	function roleClasses(role: string | null) {
		switch (role) {
			case 'admin':
				return 'border-violet-400/15 bg-violet-400/[0.06] text-violet-300';

			case 'moderator':
				return 'border-sky-400/15 bg-sky-400/[0.06] text-sky-300';

			default:
				return 'border-white/[0.07] bg-white/[0.025] text-white/35';
		}
	}

	function roleIcon(role: string | null) {
		return role === 'admin' || role === 'moderator';
	}

	async function copyUserId() {
		try {
			await navigator.clipboard.writeText(data.profile.id);

			copied = true;

			setTimeout(() => {
				copied = false;
			}, 1500);
		} catch (error) {
			console.error('Could not copy user id:', error);
		}
	}
</script>

<svelte:head>
	<title>Profil | BZETBONUS.COM</title>

	<meta name="description" content="Dein BZETBONUS Profil und deine Accountinformationen." />
</svelte:head>

<div class="relative min-h-screen overflow-hidden bg-[#070b10] text-white">
	<!-- BACKGROUND GLOWS -->

	<div
		class="pointer-events-none absolute left-[15%] top-[-260px] h-[600px] w-[600px] rounded-full bg-sky-500/[0.04] blur-[130px]"
	></div>

	<div
		class="pointer-events-none absolute right-[-280px] top-[300px] h-[600px] w-[600px] rounded-full bg-blue-500/[0.025] blur-[120px]"
	></div>

	<div class="relative z-10 mx-auto w-full max-w-[1250px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
		<!-- HEADER -->

		<div class="border-b border-white/[0.06] pb-7">
			<div
				class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8dc7ff]"
			>
				<CircleUserRound size={13} />

				Mein Account
			</div>

			<h1 class="mt-2 text-[32px] font-extrabold tracking-[-0.04em] text-white sm:text-[38px]">
				Dein Profil
			</h1>

			<p class="mt-2 max-w-[620px] text-[13px] leading-5 text-white/35">
				Hier findest du deine Accountinformationen, Points und deine aktuelle BZETBONUS Balance.
			</p>
		</div>

		<!-- PROFILE HERO -->

		<section class="mt-7 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1015]">
			<div
				class="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between"
			>
				<div
					class="pointer-events-none absolute left-0 top-0 h-full w-[320px] bg-gradient-to-r from-[#8dc7ff]/[0.035] to-transparent"
				></div>

				<div class="relative flex min-w-0 items-center gap-4">
					<!-- AVATAR -->

					<div
						class="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080b0f] shadow-xl shadow-black/20"
					>
						{#if data.profile.avatar_url}
							<img
								src={data.profile.avatar_url}
								alt={data.profile.username ?? 'Profilbild'}
								class="h-full w-full object-cover"
							/>
						{:else}
							<User size={28} class="text-white/20" />
						{/if}
					</div>

					<div class="min-w-0">
						<div class="flex flex-wrap items-center gap-2">
							<h2 class="truncate text-[20px] font-extrabold tracking-[-0.025em] text-white">
								{data.profile.username ?? 'Unbekannter User'}
							</h2>

							<div
								class={[
									'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em]',
									roleClasses(data.profile.role)
								]}
							>
								{#if roleIcon(data.profile.role)}
									<ShieldCheck size={10} />
								{:else}
									<User size={10} />
								{/if}

								{roleLabel(data.profile.role)}
							</div>
						</div>

						<div class="mt-2 flex min-w-0 items-center gap-2 text-[10px] text-white/30">
							<Mail size={11} />

							<span class="truncate">
								{data.profile.email ?? 'Keine E-Mail hinterlegt'}
							</span>
						</div>

						<div class="mt-1.5 flex items-center gap-2 text-[9px] text-white/20">
							<CalendarDays size={10} />

							Mitglied seit
							{formatDate(data.profile.created_at)}
						</div>
					</div>
				</div>

				<!-- ROLE / BRAND -->

				<div class="relative hidden items-center gap-2 text-right lg:flex">
					<div>
						<div class="text-[8px] font-bold uppercase tracking-[0.13em] text-white/15">
							BZETBONUS
						</div>

						<div class="mt-1 text-[11px] font-bold text-white/40">Community Account</div>
					</div>

					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.05] text-[#8dc7ff]"
					>
						<Sparkles size={17} />
					</div>
				</div>
			</div>
		</section>

		<!-- STATS -->

		<div class="mt-4 grid gap-4 sm:grid-cols-2">
			<!-- BALANCE -->

			<section
				class="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1015] p-5"
			>
				<div
					class="pointer-events-none absolute right-[-60px] top-[-70px] h-[180px] w-[180px] rounded-full bg-emerald-400/[0.035] blur-[60px]"
				></div>

				<div class="relative flex items-start justify-between gap-4">
					<div>
						<div
							class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20"
						>
							<WalletCards size={12} />

							Balance
						</div>

						<div class="mt-3 text-[28px] font-extrabold tracking-[-0.04em] text-white">
							{money.format(data.profile.balance)}
						</div>

						<p class="mt-1 text-[9px] leading-4 text-white/25">
							Dein aktuell verfügbares Guthaben.
						</p>
					</div>

					<div
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-300"
					>
						<Banknote size={20} />
					</div>
				</div>

				<a
					href="/auszahlen"
					class="relative mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 text-[9px] font-bold text-white/40 transition hover:border-[#8dc7ff]/15 hover:bg-[#8dc7ff]/[0.04] hover:text-[#8dc7ff]"
				>
					Zur Auszahlung
				</a>
			</section>

			<!-- POINTS -->

			<section
				class="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1015] p-5"
			>
				<div
					class="pointer-events-none absolute right-[-60px] top-[-70px] h-[180px] w-[180px] rounded-full bg-[#8dc7ff]/[0.035] blur-[60px]"
				></div>

				<div class="relative flex items-start justify-between gap-4">
					<div>
						<div
							class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20"
						>
							<Crown size={12} />

							Points
						</div>

						<div class="mt-3 text-[28px] font-extrabold tracking-[-0.04em] text-white">
							{points.format(data.profile.points)}
						</div>

						<p class="mt-1 text-[9px] leading-4 text-white/25">
							Deine gesammelten BZETBONUS Points.
						</p>
					</div>

					<div
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.05] text-[#8dc7ff]"
					>
						<Crown size={20} />
					</div>
				</div>

				<a
					href="/case-opening"
					class="relative mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 text-[9px] font-bold text-white/40 transition hover:border-[#8dc7ff]/15 hover:bg-[#8dc7ff]/[0.04] hover:text-[#8dc7ff]"
				>
					Cases öffnen
				</a>
			</section>
		</div>

		<!-- ACCOUNT DATA -->

		<section class="mt-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1015]">
			<div class="flex items-center gap-3 border-b border-white/[0.055] px-5 py-4">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.05] text-[#8dc7ff]"
				>
					<CircleUserRound size={17} />
				</div>

				<div>
					<div class="text-[8px] font-bold uppercase tracking-[0.12em] text-[#8dc7ff]">Account</div>

					<h3 class="mt-0.5 text-[13px] font-bold text-white/75">Profildaten</h3>
				</div>
			</div>

			<div class="grid sm:grid-cols-2">
				<!-- USERNAME -->

				<div class="border-b border-white/[0.05] p-5 sm:border-r">
					<div
						class="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.11em] text-white/20"
					>
						<User size={11} />

						Username
					</div>

					<div class="mt-2.5 text-[11px] font-bold text-white/65">
						{data.profile.username ?? 'Nicht gesetzt'}
					</div>
				</div>

				<!-- EMAIL -->

				<div class="border-b border-white/[0.05] p-5">
					<div
						class="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.11em] text-white/20"
					>
						<Mail size={11} />

						E-Mail
					</div>

					<div class="mt-2.5 truncate text-[11px] font-bold text-white/65">
						{data.profile.email ?? 'Nicht hinterlegt'}
					</div>
				</div>

				<!-- ROLE -->

				<div class="border-b border-white/[0.05] p-5 sm:border-b-0 sm:border-r">
					<div
						class="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.11em] text-white/20"
					>
						<ShieldCheck size={11} />

						Rolle
					</div>

					<div class="mt-2.5">
						<div
							class={[
								'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em]',
								roleClasses(data.profile.role)
							]}
						>
							{roleLabel(data.profile.role)}
						</div>
					</div>
				</div>

				<!-- MEMBER -->

				<div class="p-5">
					<div
						class="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.11em] text-white/20"
					>
						<CalendarDays size={11} />

						Mitglied seit
					</div>

					<div class="mt-2.5 text-[11px] font-bold text-white/65">
						{formatDate(data.profile.created_at)}
					</div>
				</div>
			</div>
		</section>

		<!-- ACCOUNT ID -->

		<section class="mt-4 rounded-2xl border border-white/[0.06] bg-[#0d1015] p-5">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="min-w-0">
					<div
						class="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.11em] text-white/20"
					>
						<Hash size={11} />

						Account ID
					</div>

					<div class="mt-2 truncate font-mono text-[9px] text-white/30">
						{data.profile.id}
					</div>
				</div>

				<button
					type="button"
					onclick={copyUserId}
					class="flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-[9px] font-bold text-white/35 transition hover:bg-white/[0.045] hover:text-white/65"
				>
					<Copy size={12} />

					{copied ? 'Kopiert' : 'ID kopieren'}
				</button>
			</div>
		</section>
	</div>
</div>
