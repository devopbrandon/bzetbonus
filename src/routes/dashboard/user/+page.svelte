<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		BadgeEuro,
		CalendarDays,
		Check,
		ChevronDown,
		CircleDollarSign,
		Coins,
		Minus,
		Plus,
		Search,
		Shield,
		UserRound,
		Users,
		X
	} from 'lucide-svelte';

	let { data, form } = $props();

	let search = $state('');
	let openUserId = $state<string | null>(null);
	let pointsAmount = $state<Record<string, number>>({});
	let balanceAmount = $state<Record<string, number>>({});

	const isAdmin = $derived(data.currentProfile?.role === 'admin');

	const filteredProfiles = $derived(
		data.profiles.filter((profile: any) => {
			const query = search.trim().toLowerCase();

			if (!query) return true;

			return (
				profile.username?.toLowerCase().includes(query) ||
				profile.email?.toLowerCase().includes(query) ||
				profile.role?.toLowerCase().includes(query) ||
				profile.id?.toLowerCase().includes(query)
			);
		})
	);

	const totalBalance = $derived(
		data.profiles.reduce((sum: number, profile: any) => {
			return sum + Number(profile.balance ?? 0);
		}, 0)
	);

	const totalPoints = $derived(
		data.profiles.reduce((sum: number, profile: any) => {
			return sum + Number(profile.points ?? 0);
		}, 0)
	);

	const teamCount = $derived(
		data.profiles.filter((profile: any) => ['admin', 'moderator'].includes(profile.role)).length
	);

	function keepFormValues() {
		return async ({ update }: any) => {
			await update({
				reset: false,
				invalidateAll: true
			});
		};
	}

	function formatBalance(value: number | string) {
		return Number(value ?? 0).toLocaleString('de-DE', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	function formatPoints(value: number | string) {
		return Number(value ?? 0).toLocaleString('de-DE');
	}

	function formatDate(value: string) {
		return new Intl.DateTimeFormat('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		}).format(new Date(value));
	}

	function getInitials(profile: any) {
		if (profile.username) {
			return profile.username.slice(0, 2).toUpperCase();
		}

		if (profile.email) {
			return profile.email.slice(0, 2).toUpperCase();
		}

		return 'U';
	}

	function getPointsAmount(id: string) {
		return Number(pointsAmount[id] ?? 100);
	}

	function getBalanceAmount(id: string) {
		return Number(balanceAmount[id] ?? 10);
	}

	function roleLabel(role: string) {
		switch (role) {
			case 'admin':
				return 'Admin';

			case 'moderator':
				return 'Moderator';

			default:
				return 'User';
		}
	}
</script>

<svelte:head>
	<title>User verwalten | BZETBONUS</title>
</svelte:head>

<div class="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:py-10">
	<!-- Header -->
	<div class="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
		<div>
			<div
				class="mb-3 inline-flex items-center gap-2 rounded-md border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.045] px-2.5 py-1.5 text-[10px] font-bold tracking-[0.14em] text-[#9fd0ff]/70 uppercase"
			>
				<Users size={13} strokeWidth={2} />

				User Management
			</div>

			<h1 class="text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">User verwalten</h1>

			<p class="mt-2 max-w-xl text-[13px] leading-6 text-white/40">
				Verwalte Accounts, Guthaben, Points und Berechtigungen deiner Community.
			</p>
		</div>

		<div
			class="flex items-center gap-2 self-start rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 lg:self-auto"
		>
			<Shield size={14} class="text-[#9fd0ff]" />

			<span class="text-[11px] text-white/40"> Angemeldet als </span>

			<span class="text-[11px] font-bold text-white/80">
				{roleLabel(data.currentProfile.role)}
			</span>
		</div>
	</div>

	<!-- Stats -->
	<div class="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
		<!-- Users -->
		<div class="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
			<div class="mb-4 flex items-center justify-between">
				<span class="text-[11px] font-semibold text-white/35"> User </span>

				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.035]"
				>
					<Users size={15} class="text-white/40" />
				</div>
			</div>

			<div class="text-2xl font-bold tracking-tight text-white">
				{data.profiles.length}
			</div>
		</div>

		<!-- Points -->
		<div class="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
			<div class="mb-4 flex items-center justify-between">
				<span class="text-[11px] font-semibold text-white/35"> Points </span>

				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.045]"
				>
					<Coins size={15} class="text-[#9fd0ff]/70" />
				</div>
			</div>

			<div class="text-2xl font-bold tracking-tight text-white">
				{formatPoints(totalPoints)}
			</div>
		</div>

		<!-- Balance -->
		<div class="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
			<div class="mb-4 flex items-center justify-between">
				<span class="text-[11px] font-semibold text-white/35"> Balance </span>

				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/10 bg-emerald-400/[0.045]"
				>
					<BadgeEuro size={15} class="text-emerald-300/70" />
				</div>
			</div>

			<div class="text-2xl font-bold tracking-tight text-white">
				{formatBalance(totalBalance)} €
			</div>
		</div>

		<!-- Team -->
		<div class="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
			<div class="mb-4 flex items-center justify-between">
				<span class="text-[11px] font-semibold text-white/35"> Team </span>

				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/10 bg-violet-400/[0.045]"
				>
					<Shield size={15} class="text-violet-300/70" />
				</div>
			</div>

			<div class="text-2xl font-bold tracking-tight text-white">
				{teamCount}
			</div>
		</div>
	</div>

	<!-- Message -->
	{#if form?.message}
		<div
			class={[
				'mb-5 flex items-center gap-2 rounded-lg border px-3.5 py-3 text-[12px] font-medium',
				form.success
					? 'border-emerald-400/10 bg-emerald-400/[0.045] text-emerald-300'
					: 'border-red-400/10 bg-red-400/[0.045] text-red-300'
			]}
		>
			{#if form.success}
				<Check size={15} />
			{:else}
				<X size={15} />
			{/if}

			{form.message}
		</div>
	{/if}

	<!-- Toolbar -->
	<div
		class="mb-3 flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-[#0c0f14]/70 p-3 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="relative w-full sm:max-w-sm">
			<Search
				size={15}
				class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
			/>

			<input
				bind:value={search}
				type="text"
				placeholder="Username, E-Mail oder Rolle..."
				class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/20 pl-10 pr-3 text-[12px] text-white outline-none transition placeholder:text-white/20 focus:border-[#8dc7ff]/20 focus:bg-[#8dc7ff]/[0.025]"
			/>
		</div>

		<div class="text-[11px] text-white/30">
			{filteredProfiles.length}
			{filteredProfiles.length === 1 ? 'Account' : 'Accounts'}
		</div>
	</div>

	<!-- Users -->
	<div class="space-y-2.5">
		{#each filteredProfiles as profile (profile.id)}
			{@const isOpen = openUserId === profile.id}

			<div
				class={[
					'overflow-hidden rounded-xl border transition-all duration-200',
					isOpen
						? 'border-[#8dc7ff]/[0.13] bg-[#8dc7ff]/[0.025] shadow-[0_18px_55px_rgba(0,0,0,0.18)]'
						: 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.028]'
				]}
			>
				<button
					type="button"
					onclick={() => (openUserId = isOpen ? null : profile.id)}
					class="flex w-full cursor-pointer items-center gap-3 p-3 text-left sm:p-4"
				>
					<!-- Avatar -->
					<div class="relative shrink-0">
						{#if profile.avatar_url}
							<img
								src={profile.avatar_url}
								alt={profile.username ?? 'User'}
								class="h-10 w-10 rounded-lg border border-white/[0.08] object-cover sm:h-11 sm:w-11"
							/>
						{:else}
							<div
								class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[11px] font-bold text-white/45 sm:h-11 sm:w-11"
							>
								{getInitials(profile)}
							</div>
						{/if}
					</div>

					<!-- Main -->
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span class="truncate text-[13px] font-bold text-white/85">
								{profile.username ?? 'Kein Username'}
							</span>

							<span
								class={[
									'rounded px-1.5 py-0.5 text-[8px] font-bold tracking-[0.08em] uppercase',
									profile.role === 'admin'
										? 'bg-red-400/[0.08] text-red-300/80'
										: profile.role === 'moderator'
											? 'bg-violet-400/[0.08] text-violet-300/80'
											: 'bg-white/[0.04] text-white/30'
								]}
							>
								{roleLabel(profile.role)}
							</span>
						</div>

						<div class="mt-1 truncate text-[10px] text-white/25">
							{profile.email ?? profile.id}
						</div>
					</div>

					<!-- Desktop Values -->
					<div class="hidden items-center gap-8 md:flex">
						<div class="min-w-[100px] text-right">
							<div class="text-[9px] font-semibold tracking-wide text-white/20 uppercase">
								Points
							</div>

							<div class="mt-1 text-[12px] font-bold text-[#9fd0ff]/80">
								{formatPoints(profile.points)}
							</div>
						</div>

						<div class="min-w-[100px] text-right">
							<div class="text-[9px] font-semibold tracking-wide text-white/20 uppercase">
								Balance
							</div>

							<div class="mt-1 text-[12px] font-bold text-emerald-300/80">
								{formatBalance(profile.balance)} €
							</div>
						</div>
					</div>

					<ChevronDown
						size={16}
						class={`ml-1 shrink-0 text-white/25 transition-transform duration-200 ${
							isOpen ? 'rotate-180 text-[#9fd0ff]/60' : ''
						}`}
					/>
				</button>

				{#if isOpen}
					<div class="border-t border-white/[0.055] p-3 sm:p-4">
						<!-- Mobile Stats -->
						<div class="mb-4 grid grid-cols-2 gap-2 md:hidden">
							<div class="rounded-lg border border-white/[0.06] bg-black/15 p-3">
								<div class="text-[9px] text-white/25 uppercase">Points</div>

								<div class="mt-1 font-bold text-[#9fd0ff]/80">
									{formatPoints(profile.points)}
								</div>
							</div>

							<div class="rounded-lg border border-white/[0.06] bg-black/15 p-3">
								<div class="text-[9px] text-white/25 uppercase">Balance</div>

								<div class="mt-1 font-bold text-emerald-300/80">
									{formatBalance(profile.balance)} €
								</div>
							</div>
						</div>

						<!-- Quick Actions -->
						<div class="mb-4 grid gap-3 lg:grid-cols-2">
							<!-- Points -->
							<div class="rounded-xl border border-white/[0.06] bg-black/15 p-3.5">
								<div class="mb-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<Coins size={14} class="text-[#9fd0ff]/70" />

										<span class="text-[11px] font-bold text-white/55"> Points anpassen </span>
									</div>

									<span class="text-[11px] font-bold text-[#9fd0ff]/70">
										{formatPoints(profile.points)}
									</span>
								</div>

								<div class="flex gap-2">
									<input
										type="number"
										min="1"
										bind:value={pointsAmount[profile.id]}
										placeholder="100"
										class="h-10 min-w-0 flex-1 rounded-lg border border-white/[0.07] bg-black/20 px-3 text-[12px] text-white outline-none placeholder:text-white/20 focus:border-[#8dc7ff]/20"
									/>

									<!-- Add Points -->
									<form method="POST" action="?/adjustPoints" use:enhance={keepFormValues}>
										<input type="hidden" name="user_id" value={profile.id} />

										<input type="hidden" name="amount" value={getPointsAmount(profile.id)} />

										<button
											type="submit"
											title="Points hinzufügen"
											class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-emerald-400/10 bg-emerald-400/[0.055] text-emerald-300/75 transition hover:bg-emerald-400/[0.10] hover:text-emerald-200"
										>
											<Plus size={15} />
										</button>
									</form>

									<!-- Remove Points -->
									<form method="POST" action="?/adjustPoints" use:enhance={keepFormValues}>
										<input type="hidden" name="user_id" value={profile.id} />

										<input type="hidden" name="amount" value={-getPointsAmount(profile.id)} />

										<button
											type="submit"
											title="Points entfernen"
											class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-red-400/10 bg-red-400/[0.045] text-red-300/65 transition hover:bg-red-400/[0.09] hover:text-red-200"
										>
											<Minus size={15} />
										</button>
									</form>
								</div>
							</div>

							<!-- Balance -->
							<div class="rounded-xl border border-white/[0.06] bg-black/15 p-3.5">
								<div class="mb-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<CircleDollarSign size={14} class="text-emerald-300/70" />

										<span class="text-[11px] font-bold text-white/55"> Balance anpassen </span>
									</div>

									<span class="text-[11px] font-bold text-emerald-300/70">
										{formatBalance(profile.balance)} €
									</span>
								</div>

								<div class="flex gap-2">
									<input
										type="number"
										min="0.01"
										step="0.01"
										bind:value={balanceAmount[profile.id]}
										placeholder="10.00"
										class="h-10 min-w-0 flex-1 rounded-lg border border-white/[0.07] bg-black/20 px-3 text-[12px] text-white outline-none placeholder:text-white/20 focus:border-emerald-400/20"
									/>

									<!-- Add Balance -->
									<form method="POST" action="?/adjustBalance" use:enhance={keepFormValues}>
										<input type="hidden" name="user_id" value={profile.id} />

										<input type="hidden" name="amount" value={getBalanceAmount(profile.id)} />

										<button
											type="submit"
											title="Balance hinzufügen"
											class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-emerald-400/10 bg-emerald-400/[0.055] text-emerald-300/75 transition hover:bg-emerald-400/[0.10] hover:text-emerald-200"
										>
											<Plus size={15} />
										</button>
									</form>

									<!-- Remove Balance -->
									<form method="POST" action="?/adjustBalance" use:enhance={keepFormValues}>
										<input type="hidden" name="user_id" value={profile.id} />

										<input type="hidden" name="amount" value={-getBalanceAmount(profile.id)} />

										<button
											type="submit"
											title="Balance entfernen"
											class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-red-400/10 bg-red-400/[0.045] text-red-300/65 transition hover:bg-red-400/[0.09] hover:text-red-200"
										>
											<Minus size={15} />
										</button>
									</form>
								</div>
							</div>
						</div>

						<!-- Profile Form -->
						<form method="POST" action="?/updateProfile" use:enhance={keepFormValues}>
							<input type="hidden" name="user_id" value={profile.id} />

							<div class="grid gap-3 sm:grid-cols-2">
								<!-- Username -->
								<label>
									<span
										class="mb-1.5 block text-[9px] font-bold tracking-[0.08em] text-white/25 uppercase"
									>
										Username
									</span>

									<div class="relative">
										<UserRound
											size={14}
											class="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
										/>

										<input
											name="username"
											value={profile.username ?? ''}
											class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/20 pl-9 pr-3 text-[12px] text-white outline-none transition focus:border-[#8dc7ff]/20"
										/>
									</div>
								</label>

								<!-- Email -->
								<label>
									<span
										class="mb-1.5 block text-[9px] font-bold tracking-[0.08em] text-white/25 uppercase"
									>
										E-Mail
									</span>

									<input
										name="email"
										type="email"
										value={profile.email ?? ''}
										class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/20 px-3 text-[12px] text-white outline-none transition focus:border-[#8dc7ff]/20"
									/>
								</label>

								<!-- Avatar -->
								<label class="sm:col-span-2">
									<span
										class="mb-1.5 block text-[9px] font-bold tracking-[0.08em] text-white/25 uppercase"
									>
										Avatar URL
									</span>

									<input
										name="avatar_url"
										value={profile.avatar_url ?? ''}
										placeholder="https://..."
										class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/20 px-3 text-[12px] text-white outline-none transition placeholder:text-white/15 focus:border-[#8dc7ff]/20"
									/>
								</label>

								<!-- Points -->
								<label>
									<span
										class="mb-1.5 block text-[9px] font-bold tracking-[0.08em] text-white/25 uppercase"
									>
										Points
									</span>

									<input
										name="points"
										type="number"
										min="0"
										value={profile.points}
										class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/20 px-3 text-[12px] text-white outline-none transition focus:border-[#8dc7ff]/20"
									/>
								</label>

								<!-- Balance -->
								<label>
									<span
										class="mb-1.5 block text-[9px] font-bold tracking-[0.08em] text-white/25 uppercase"
									>
										Balance
									</span>

									<div class="relative">
										<input
											name="balance"
											type="number"
											min="0"
											step="0.01"
											value={profile.balance}
											class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/20 px-3 pr-9 text-[12px] text-white outline-none transition focus:border-emerald-400/20"
										/>

										<span
											class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/20"
										>
											€
										</span>
									</div>
								</label>

								<!-- Role: Admin only -->
								{#if isAdmin}
									<label>
										<span
											class="mb-1.5 block text-[9px] font-bold tracking-[0.08em] text-white/25 uppercase"
										>
											Rolle
										</span>

										<select
											name="role"
											value={profile.role}
											class="h-10 w-full cursor-pointer rounded-lg border border-white/[0.07] bg-[#0b0d11] px-3 text-[12px] text-white outline-none transition focus:border-violet-400/20"
										>
											<option value="user"> User </option>

											<option value="moderator"> Moderator </option>

											<option value="admin"> Admin </option>
										</select>
									</label>
								{/if}

								<!-- Registered -->
								<div>
									<span
										class="mb-1.5 block text-[9px] font-bold tracking-[0.08em] text-white/25 uppercase"
									>
										Registriert
									</span>

									<div
										class="flex h-10 items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.018] px-3 text-[11px] text-white/30"
									>
										<CalendarDays size={13} />

										{formatDate(profile.created_at)}
									</div>
								</div>
							</div>

							<!-- Footer -->
							<div
								class="mt-4 flex flex-col gap-3 border-t border-white/[0.055] pt-4 sm:flex-row sm:items-center sm:justify-between"
							>
								<div class="min-w-0">
									<div class="text-[9px] text-white/20">User ID</div>

									<div class="mt-1 truncate font-mono text-[9px] text-white/25">
										{profile.id}
									</div>
								</div>

								<button
									type="submit"
									class="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8dc7ff]/[0.13] bg-[#8dc7ff]/[0.08] px-4 text-[11px] font-bold text-white/80 transition hover:-translate-y-px hover:border-[#8dc7ff]/20 hover:bg-[#8dc7ff]/[0.12] hover:text-white"
								>
									<Check size={14} />

									Änderungen speichern
								</button>
							</div>
						</form>
					</div>
				{/if}
			</div>
		{:else}
			<div
				class="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] px-5 text-center"
			>
				<Search size={22} class="mb-3 text-white/15" />

				<div class="text-[13px] font-semibold text-white/45">Keine User gefunden</div>

				<div class="mt-1 text-[11px] text-white/25">Ändere deine Suche und versuche es erneut.</div>
			</div>
		{/each}
	</div>
</div>
