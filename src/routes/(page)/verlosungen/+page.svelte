<script lang="ts">
	import {
		CalendarDays,
		Check,
		Clock3,
		Crown,
		Gift,
		LockKeyhole,
		Sparkles,
		Trophy,
		UserRound,
		X
	} from 'lucide-svelte';

	let { data, form } = $props();

	type Tab = 'live' | 'expired';

	let activeTab = $state<Tab>('live');
	let now = $state(Date.now());

	$effect(() => {
		const interval = window.setInterval(() => {
			now = Date.now();
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	});

	let liveVerlosungen = $derived(
		data.verlosungen.filter((verlosung: any) => new Date(verlosung.end_at).getTime() >= now)
	);

	let expiredVerlosungen = $derived(
		data.verlosungen.filter((verlosung: any) => new Date(verlosung.end_at).getTime() < now)
	);

	let visibleVerlosungen = $derived(activeTab === 'live' ? liveVerlosungen : expiredVerlosungen);

	function formatDate(value: string | null | undefined) {
		if (!value) return '—';

		return new Intl.DateTimeFormat('de-DE', {
			timeZone: 'Europe/Berlin',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(value));
	}

	function profileName(profile: any) {
		return profile?.username ?? 'Unbekannter Nutzer';
	}

	function getState(verlosung: any) {
		const start = new Date(verlosung.start_at).getTime();

		const end = new Date(verlosung.end_at).getTime();

		if (now < start) {
			return 'upcoming';
		}

		if (now <= end) {
			return 'active';
		}

		return 'expired';
	}

	function getTimeLeft(verlosung: any) {
		const state = getState(verlosung);

		const target =
			state === 'upcoming'
				? new Date(verlosung.start_at).getTime()
				: new Date(verlosung.end_at).getTime();

		let difference = Math.max(0, target - now);

		const days = Math.floor(difference / 86_400_000);

		difference %= 86_400_000;

		const hours = Math.floor(difference / 3_600_000);

		difference %= 3_600_000;

		const minutes = Math.floor(difference / 60_000);

		const seconds = Math.floor((difference % 60_000) / 1000);

		if (days > 0) {
			return `${days}T ${hours}Std ${minutes}Min`;
		}

		if (hours > 0) {
			return `${hours}Std ${minutes}Min ${seconds}Sek`;
		}

		return `${minutes}Min ${seconds}Sek`;
	}

	function remainingWinners(verlosung: any) {
		return Math.max(0, verlosung.max_winners - (verlosung.winners?.length ?? 0));
	}
</script>

<svelte:head>
	<title>Verlosungen | BZETBONUS</title>

	<meta
		name="description"
		content="Nimm an aktuellen BZETBONUS Verlosungen teil und sieh dir vergangene Gewinner an."
	/>
</svelte:head>

<section class="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-7 lg:px-10 lg:py-14">
	<!-- HEADER -->
	<div
		class="flex flex-col gap-6 border-b border-white/[0.07] pb-8 lg:flex-row lg:items-end lg:justify-between"
	>
		<div class="max-w-2xl">
			<div
				class="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-[#9dcfff]/70"
			>
				<Gift size={16} />

				Community
			</div>

			<h1 class="text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">Verlosungen</h1>

			<p class="mt-4 max-w-xl text-base leading-7 text-white/50">
				Nimm kostenlos an unseren aktuellen Verlosungen teil und sichere dir die Chance auf einen
				der Gewinne.
			</p>
		</div>

		<div class="flex w-fit items-center rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
			<button
				type="button"
				onclick={() => (activeTab = 'live')}
				class={[
					'flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-bold transition duration-200',
					activeTab === 'live'
						? 'bg-white text-[#101827] shadow-[0_5px_20px_rgba(0,0,0,0.18)]'
						: 'text-white/45 hover:bg-white/[0.04] hover:text-white/75'
				]}
			>
				<span
					class={[
						'size-2 rounded-full',
						activeTab === 'live' ? 'bg-emerald-500' : 'bg-emerald-400/40'
					]}
				></span>

				Live

				<span
					class={[
						'rounded-md px-1.5 py-0.5 text-xs',
						activeTab === 'live' ? 'bg-black/[0.07] text-black/55' : 'bg-white/[0.05] text-white/30'
					]}
				>
					{liveVerlosungen.length}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'expired')}
				class={[
					'flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-bold transition duration-200',
					activeTab === 'expired'
						? 'bg-white text-[#101827] shadow-[0_5px_20px_rgba(0,0,0,0.18)]'
						: 'text-white/45 hover:bg-white/[0.04] hover:text-white/75'
				]}
			>
				Expired

				<span
					class={[
						'rounded-md px-1.5 py-0.5 text-xs',
						activeTab === 'expired'
							? 'bg-black/[0.07] text-black/55'
							: 'bg-white/[0.05] text-white/30'
					]}
				>
					{expiredVerlosungen.length}
				</span>
			</button>
		</div>
	</div>

	<!-- FORM MESSAGE -->
	{#if form?.message}
		<div
			class={[
				'mt-6 flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-medium',
				form?.success
					? 'border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-200'
					: 'border-red-400/15 bg-red-400/[0.06] text-red-200'
			]}
		>
			{#if form?.success}
				<Check size={17} />
			{:else}
				<X size={17} />
			{/if}

			{form.message}
		</div>
	{/if}

	<!-- CARDS -->
	{#if visibleVerlosungen.length === 0}
		<div
			class="mt-7 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 text-center"
		>
			<div
				class="mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-white/35"
			>
				<Gift size={22} />
			</div>

			<h2 class="text-lg font-bold text-white/75">
				{activeTab === 'live' ? 'Aktuell keine Verlosungen' : 'Noch keine vergangenen Verlosungen'}
			</h2>

			<p class="mt-2 max-w-md text-sm leading-6 text-white/35">
				{activeTab === 'live'
					? 'Sobald eine neue Verlosung startet, findest du sie hier.'
					: 'Beendete Verlosungen und deren Gewinner werden hier angezeigt.'}
			</p>
		</div>
	{:else}
		<div class="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each visibleVerlosungen as verlosung}
				{@const state = getState(verlosung)}

				<article
					class="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.075] bg-white/[0.025] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-white/[0.035]"
				>
					<!-- TOP -->
					<div class="flex-1 p-5 sm:p-6">
						<div class="mb-4 flex items-start justify-between gap-3">
							<div class="flex flex-wrap items-center gap-2">
								{#if state === 'active'}
									<span
										class="flex items-center gap-1.5 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-xs font-bold text-emerald-300"
									>
										<span class="size-1.5 rounded-full bg-emerald-400"></span>

										Live
									</span>
								{:else if state === 'upcoming'}
									<span
										class="rounded-lg border border-sky-400/15 bg-sky-400/[0.07] px-2.5 py-1 text-xs font-bold text-sky-300"
									>
										Geplant
									</span>
								{:else}
									<span
										class="rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-xs font-bold text-white/40"
									>
										Beendet
									</span>
								{/if}

								<span
									class="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-black/10 px-2.5 py-1 text-xs font-semibold text-white/40"
								>
									<Crown size={13} />

									{verlosung.max_winners}

									{verlosung.max_winners === 1 ? 'Gewinner' : 'Gewinner'}
								</span>
							</div>

							<div
								class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-[#9dcfff]"
							>
								<Gift size={18} />
							</div>
						</div>

						<h2 class="text-xl font-bold tracking-[-0.025em] text-white sm:text-[22px]">
							{verlosung.title}
						</h2>

						<div class="mt-3 flex items-center gap-2">
							<Trophy size={17} class="shrink-0 text-[#9dcfff]" />

							<span class="text-base font-bold text-[#cbe6ff]">
								{verlosung.prize}
							</span>
						</div>

						{#if verlosung.description}
							<p class="mt-4 line-clamp-3 text-sm leading-6 text-white/45">
								{verlosung.description}
							</p>
						{/if}

						<!-- TIME -->
						<div class="mt-5 grid grid-cols-2 gap-2">
							<div class="rounded-xl border border-white/[0.06] bg-black/10 p-3">
								<div class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/30">
									<CalendarDays size={13} />

									Start
								</div>

								<div class="text-sm font-semibold leading-5 text-white/65">
									{formatDate(verlosung.start_at)}
								</div>
							</div>

							<div class="rounded-xl border border-white/[0.06] bg-black/10 p-3">
								<div class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/30">
									<Clock3 size={13} />
									Ende
								</div>

								<div class="text-sm font-semibold leading-5 text-white/65">
									{formatDate(verlosung.end_at)}
								</div>
							</div>
						</div>

						<!-- COUNTDOWN -->
						{#if state !== 'expired'}
							<div
								class="mt-3 flex items-center justify-between rounded-xl border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.035] px-3.5 py-3"
							>
								<span class="text-sm font-medium text-white/40">
									{state === 'upcoming' ? 'Startet in' : 'Endet in'}
								</span>

								<span class="font-mono text-sm font-bold text-[#b9dcff]">
									{getTimeLeft(verlosung)}
								</span>
							</div>
						{/if}

						<!-- WINNERS EXPIRED -->
						{#if state === 'expired'}
							<div class="mt-5 border-t border-white/[0.06] pt-4">
								<div class="mb-3 flex items-center justify-between gap-3">
									<div class="flex items-center gap-2 text-sm font-bold text-white/65">
										<Crown size={15} class="text-amber-300/80" />

										Gewinner
									</div>

									<span class="text-xs font-semibold text-white/30">
										{verlosung.winners.length}
										/
										{verlosung.max_winners}
									</span>
								</div>

								{#if verlosung.winners.length > 0}
									<div class="space-y-2">
										{#each verlosung.winners as winner}
											<div
												class="flex items-center gap-3 rounded-xl border border-white/[0.055] bg-black/10 p-2.5"
											>
												<div
													class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-300/10 bg-amber-300/[0.05] text-xs font-black text-amber-200"
												>
													#{winner.position}
												</div>

												{#if winner.profile?.avatar_url}
													<img
														src={winner.profile.avatar_url}
														alt=""
														class="size-8 shrink-0 rounded-full object-cover"
													/>
												{:else}
													<div
														class="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-white/30"
													>
														<UserRound size={14} />
													</div>
												{/if}

												<div class="min-w-0">
													<div class="truncate text-sm font-bold text-white/65">
														{profileName(winner.profile)}
													</div>
												</div>
											</div>
										{/each}
									</div>
								{:else if remainingWinners(verlosung) > 0}
									<div
										class="rounded-xl border border-white/[0.05] bg-black/10 px-3.5 py-3 text-sm text-white/35"
									>
										Die Gewinner wurden noch nicht gezogen.
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<!-- CTA -->
					{#if state !== 'expired'}
						<div class="border-t border-white/[0.06] bg-black/[0.08] p-4">
							{#if state === 'upcoming'}
								<button
									type="button"
									disabled
									class="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] text-sm font-bold text-white/30"
								>
									<Clock3 size={16} />

									Noch nicht gestartet
								</button>
							{:else if verlosung.isParticipating}
								<div
									class="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] text-sm font-bold text-emerald-200"
								>
									<Check size={17} />

									Du nimmst teil
								</div>
							{:else if !data.user}
								<a
									href="/login"
									class="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] text-sm font-bold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
								>
									<LockKeyhole size={16} />

									Einloggen zum Teilnehmen
								</a>
							{:else}
								<form method="POST" action="?/participate">
									<input type="hidden" name="verlosung_id" value={verlosung.id} />

									<button
										type="submit"
										class="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#101827] shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/90"
									>
										<Sparkles size={16} />

										Jetzt teilnehmen
									</button>
								</form>
							{/if}
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</section>
