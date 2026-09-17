<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';

	import {
		Banknote,
		Check,
		Clock3,
		ExternalLink,
		Eye,
		FileImage,
		Mail,
		RotateCcw,
		Search,
		ShieldCheck,
		User,
		X,
		XCircle
	} from 'lucide-svelte';

	let { data, form } = $props();

	type Status = 'pending' | 'paid' | 'cancelled';

	type Payout = {
		id: string;

		user_id: string;
		deal_id: string;

		casino_name: string;
		casino_email: string;

		amount: number;

		screenshot_path: string;
		screenshot_url: string | null;

		status: Status;

		moderator_note: string | null;

		reviewed_by: string | null;
		reviewed_at: string | null;

		created_at: string;

		user: {
			id: string;
			username: string | null;
			email: string | null;
			avatar_url: string | null;
		} | null;

		reviewer: {
			id: string;
			username: string | null;
			email: string | null;
			avatar_url: string | null;
		} | null;
	};

	let selectedPayout = $state<Payout | null>(null);

	let selectedStatus = $state<'paid' | 'cancelled'>('paid');

	let moderatorNote = $state('');

	let saving = $state(false);

	let searchValue = $state(data.filters.search ?? '');

	const money = new Intl.NumberFormat('de-DE', {
		style: 'currency',
		currency: 'EUR'
	});

	function formatMoney(value: number | null | undefined) {
		return money.format(value ?? 0);
	}

	function formatDate(value: string) {
		return new Intl.DateTimeFormat('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(value));
	}

	function statusLabel(status: Status) {
		if (status === 'paid') {
			return 'Ausgezahlt';
		}

		if (status === 'cancelled') {
			return 'Storniert';
		}

		return 'Offen';
	}

	function statusClass(status: Status) {
		if (status === 'paid') {
			return 'border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300';
		}

		if (status === 'cancelled') {
			return 'border-red-400/15 bg-red-400/[0.06] text-red-300';
		}

		return 'border-amber-400/15 bg-amber-400/[0.055] text-amber-200';
	}

	function openPayout(payout: Payout) {
		selectedPayout = payout;

		selectedStatus = 'paid';

		moderatorNote = payout.moderator_note ?? '';
	}

	function closePayout() {
		if (saving) return;

		selectedPayout = null;
	}

	function setFilter(status: string) {
		const url = new URL(window.location.href);

		if (status === 'all') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', status);
		}

		goto(`${url.pathname}${url.search}`);
	}

	function submitSearch() {
		const url = new URL(window.location.href);

		const value = searchValue.trim();

		if (value) {
			url.searchParams.set('search', value);
		} else {
			url.searchParams.delete('search');
		}

		goto(`${url.pathname}${url.search}`);
	}
</script>

<svelte:head>
	<title>Auszahlungen | BZETBONUS</title>
</svelte:head>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && selectedPayout && !saving) {
			closePayout();
		}
	}}
/>

<div class="mx-auto w-full max-w-[1500px] px-5 pb-24 pt-8 sm:px-7 lg:px-10">
	<!-- HEADER -->

	<div
		class="flex flex-col gap-5 border-b border-white/[0.06] pb-7 lg:flex-row lg:items-end lg:justify-between"
	>
		<div>
			<div
				class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8dc7ff]"
			>
				<Banknote size={13} />

				Finanzen
			</div>

			<h1 class="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-white sm:text-[36px]">
				Auszahlungen
			</h1>

			<p class="mt-2 max-w-[680px] text-[13px] leading-5 text-white/35">
				Auszahlungsanfragen der Community prüfen, Nachweise einsehen und Anfragen auszahlen oder
				stornieren.
			</p>
		</div>
	</div>

	<!-- FEEDBACK -->

	{#if form?.message}
		<div
			class={[
				'mt-5 rounded-xl border px-4 py-3 text-[11px] font-semibold',
				form?.success
					? 'border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300'
					: 'border-red-400/15 bg-red-400/[0.05] text-red-300'
			]}
		>
			{form.message}
		</div>
	{/if}

	<!-- STATS -->

	<div
		class="mt-7 grid overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e1116] sm:grid-cols-2 xl:grid-cols-5"
	>
		<div class="border-b border-white/[0.055] px-[19px] py-[17px] sm:border-b-0 sm:border-r">
			<div class="text-[8px] font-bold uppercase tracking-[0.11em] text-white/20">Gesamt</div>

			<div class="mt-[7px] text-[20px] font-extrabold text-white">
				{data.stats.total}
			</div>
		</div>

		<div class="border-b border-white/[0.055] px-[19px] py-[17px] sm:border-b-0 sm:border-r">
			<div class="text-[8px] font-bold uppercase tracking-[0.11em] text-white/20">Offen</div>

			<div class="mt-[7px] text-[20px] font-extrabold text-amber-200">
				{data.stats.pending}
			</div>
		</div>

		<div class="border-b border-white/[0.055] px-[19px] py-[17px] sm:border-b-0 sm:border-r">
			<div class="text-[8px] font-bold uppercase tracking-[0.11em] text-white/20">Ausgezahlt</div>

			<div class="mt-[7px] text-[20px] font-extrabold text-emerald-300">
				{data.stats.paid}
			</div>
		</div>

		<div
			class="border-b border-white/[0.055] px-[19px] py-[17px] sm:border-b-0 xl:border-b-0 xl:border-r"
		>
			<div class="text-[8px] font-bold uppercase tracking-[0.11em] text-white/20">Storniert</div>

			<div class="mt-[7px] text-[20px] font-extrabold text-red-300">
				{data.stats.cancelled}
			</div>
		</div>

		<div class="px-[19px] py-[17px]">
			<div class="text-[8px] font-bold uppercase tracking-[0.11em] text-white/20">
				Offener Betrag
			</div>

			<div class="mt-[7px] text-[20px] font-extrabold text-[#8dc7ff]">
				{formatMoney(data.stats.pendingAmount)}
			</div>
		</div>
	</div>

	<!-- FILTERS -->

	<div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex flex-wrap gap-2">
			{#each [{ value: 'all', label: 'Alle' }, { value: 'pending', label: 'Offen' }, { value: 'paid', label: 'Ausgezahlt' }, { value: 'cancelled', label: 'Storniert' }] as filter}
				<button
					type="button"
					onclick={() => setFilter(filter.value)}
					class={[
						'h-9 cursor-pointer rounded-[10px] border px-[13px] text-[9px] font-bold transition',
						data.filters.status === filter.value
							? 'border-[#8dc7ff]/20 bg-[#8dc7ff]/[0.07] text-[#9dcef6]'
							: 'border-white/[0.07] bg-white/[0.025] text-white/30 hover:border-[#8dc7ff]/15 hover:text-white/65'
					]}
				>
					{filter.label}
				</button>
			{/each}
		</div>

		<form
			onsubmit={(event) => {
				event.preventDefault();
				submitSearch();
			}}
			class="relative w-full lg:w-[340px]"
		>
			<Search
				size={14}
				class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
			/>

			<input
				bind:value={searchValue}
				placeholder="User, E-Mail oder Casino..."
				class="h-10 w-full rounded-xl border border-white/[0.07] bg-[#0d1015] pl-10 pr-4 text-[11px] font-medium text-white/70 outline-none transition placeholder:text-white/20 focus:border-[#8dc7ff]/25"
			/>
		</form>
	</div>

	<!-- TABLE -->

	<section class="mt-5">
		{#if data.payouts.length}
			<div class="overflow-hidden rounded-2xl border border-white/[0.065] bg-[#0d1015]">
				<div
					class="hidden grid-cols-[minmax(190px,1.2fr)_minmax(170px,1fr)_minmax(180px,1.1fr)_110px_145px_115px] gap-4 border-b border-white/[0.055] bg-white/[0.015] px-5 py-3 lg:grid"
				>
					<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">User</div>

					<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">Casino</div>

					<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">
						Casino E-Mail
					</div>

					<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">Betrag</div>

					<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">Zeitpunkt</div>

					<div class="text-right text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">
						Status
					</div>
				</div>

				{#each data.payouts as payout, index}
					<button
						type="button"
						onclick={() => openPayout(payout)}
						class={[
							'group grid w-full cursor-pointer gap-4 px-4 py-4 text-left transition hover:bg-white/[0.025] lg:grid-cols-[minmax(190px,1.2fr)_minmax(170px,1fr)_minmax(180px,1.1fr)_110px_145px_115px] lg:items-center lg:px-5',
							index !== data.payouts.length - 1 ? 'border-b border-white/[0.05]' : ''
						]}
					>
						<!-- USER -->

						<div class="flex min-w-0 items-center gap-3">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.065] bg-[#080b0f]"
							>
								{#if payout.user?.avatar_url}
									<img
										src={payout.user.avatar_url}
										alt={payout.user.username ?? ''}
										class="h-full w-full object-cover"
									/>
								{:else}
									<User size={15} class="text-white/20" />
								{/if}
							</div>

							<div class="min-w-0">
								<div class="truncate text-[11px] font-bold text-white/70">
									{payout.user?.username ?? 'Unbekannter User'}
								</div>

								<div class="mt-0.5 truncate text-[8px] text-white/20">
									{payout.user?.email ?? payout.user_id}
								</div>
							</div>
						</div>

						<!-- CASINO -->

						<div>
							<div
								class="mb-1 text-[7px] font-bold uppercase tracking-[0.08em] text-white/15 lg:hidden"
							>
								Casino
							</div>

							<div class="text-[11px] font-bold text-white/55">
								{payout.casino_name}
							</div>
						</div>

						<!-- CASINO EMAIL -->

						<div class="min-w-0">
							<div
								class="mb-1 text-[7px] font-bold uppercase tracking-[0.08em] text-white/15 lg:hidden"
							>
								Casino E-Mail
							</div>

							<div class="flex min-w-0 items-center gap-1.5 text-[9px] text-white/35">
								<Mail size={10} class="shrink-0" />

								<span class="truncate">
									{payout.casino_email}
								</span>
							</div>
						</div>

						<!-- AMOUNT -->

						<div>
							<div
								class="mb-1 text-[7px] font-bold uppercase tracking-[0.08em] text-white/15 lg:hidden"
							>
								Betrag
							</div>

							<div class="text-[11px] font-extrabold text-[#8dc7ff]">
								{formatMoney(payout.amount)}
							</div>
						</div>

						<!-- DATE -->

						<div>
							<div
								class="mb-1 text-[7px] font-bold uppercase tracking-[0.08em] text-white/15 lg:hidden"
							>
								Zeitpunkt
							</div>

							<div class="flex items-center gap-1.5 text-[9px] text-white/30">
								<Clock3 size={10} />

								{formatDate(payout.created_at)}
							</div>
						</div>

						<!-- STATUS -->

						<div class="flex lg:justify-end">
							<div
								class={[
									'rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em]',
									statusClass(payout.status)
								]}
							>
								{statusLabel(payout.status)}
							</div>
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div
				class="rounded-2xl border border-dashed border-white/[0.07] bg-[#0d1015] px-5 py-16 text-center"
			>
				<Banknote size={32} class="mx-auto text-white/10" />

				<div class="mt-4 text-[13px] font-bold text-white/35">Keine Auszahlungen gefunden.</div>
			</div>
		{/if}
	</section>
</div>

<!-- ========================================================= -->
<!-- PAYOUT MODAL -->
<!-- ========================================================= -->

{#if selectedPayout}
	<div
		class="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 p-4 backdrop-blur-[7px]"
	>
		<button type="button" onclick={closePayout} class="absolute inset-0" aria-label="Schließen"
		></button>

		<div
			class="relative z-10 max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-2xl border border-white/[0.09] bg-[#0c1016] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
		>
			<!-- MODAL HEADER -->

			<div class="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
				<div>
					<div class="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8dc7ff]">
						Auszahlungsanfrage
					</div>

					<div class="mt-1 flex items-center gap-2">
						<div class="text-[16px] font-bold text-white">
							{selectedPayout.casino_name}
						</div>

						<div
							class={[
								'rounded-full border px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em]',
								statusClass(selectedPayout.status)
							]}
						>
							{statusLabel(selectedPayout.status)}
						</div>
					</div>
				</div>

				<button
					type="button"
					onclick={closePayout}
					disabled={saving}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/30 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-30"
				>
					<X size={14} />
				</button>
			</div>

			<div class="p-5">
				<!-- USER -->

				<div
					class="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-[#090c11] p-4"
				>
					<div class="flex min-w-0 items-center gap-3">
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#06090d]"
						>
							{#if selectedPayout.user?.avatar_url}
								<img
									src={selectedPayout.user.avatar_url}
									alt=""
									class="h-full w-full object-cover"
								/>
							{:else}
								<User size={18} class="text-white/25" />
							{/if}
						</div>

						<div class="min-w-0">
							<div class="truncate text-[12px] font-bold text-white/75">
								{selectedPayout.user?.username ?? 'Unbekannter User'}
							</div>

							<div class="mt-1 truncate text-[9px] text-white/25">
								{selectedPayout.user?.email ?? selectedPayout.user_id}
							</div>
						</div>
					</div>

					<div class="text-right">
						<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">Betrag</div>

						<div class="mt-1 text-[20px] font-extrabold text-[#8dc7ff]">
							{formatMoney(selectedPayout.amount)}
						</div>
					</div>
				</div>

				<!-- DETAILS -->

				<div class="mt-4 grid gap-3 sm:grid-cols-2">
					<div class="rounded-xl border border-white/[0.055] bg-[#090c11] p-4">
						<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">Casino</div>

						<div class="mt-2 text-[11px] font-bold text-white/70">
							{selectedPayout.casino_name}
						</div>
					</div>

					<div class="rounded-xl border border-white/[0.055] bg-[#090c11] p-4">
						<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">
							Registrierte E-Mail
						</div>

						<div class="mt-2 flex items-center gap-2 text-[10px] font-medium text-white/55">
							<Mail size={12} class="text-[#8dc7ff]" />

							{selectedPayout.casino_email}
						</div>
					</div>

					<div class="rounded-xl border border-white/[0.055] bg-[#090c11] p-4">
						<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">
							Angefragt am
						</div>

						<div class="mt-2 flex items-center gap-2 text-[10px] font-medium text-white/55">
							<Clock3 size={12} class="text-[#8dc7ff]" />

							{formatDate(selectedPayout.created_at)}
						</div>
					</div>

					<div class="rounded-xl border border-white/[0.055] bg-[#090c11] p-4">
						<div class="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">
							Request ID
						</div>

						<div class="mt-2 truncate font-mono text-[8px] text-white/30">
							{selectedPayout.id}
						</div>
					</div>
				</div>

				<!-- SCREENSHOT -->

				<div class="mt-5">
					<div class="mb-2 flex items-center justify-between">
						<div
							class="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.1em] text-white/25"
						>
							<FileImage size={12} />

							Nachweis
						</div>

						{#if selectedPayout.screenshot_url}
							<a
								href={selectedPayout.screenshot_url}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-1.5 text-[8px] font-bold text-[#8dc7ff]/70 transition hover:text-[#8dc7ff]"
							>
								<ExternalLink size={10} />

								Original öffnen
							</a>
						{/if}
					</div>

					{#if selectedPayout.screenshot_url}
						<a
							href={selectedPayout.screenshot_url}
							target="_blank"
							rel="noopener noreferrer"
							class="group relative flex min-h-[260px] max-h-[440px] items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#06090d]"
						>
							<img
								src={selectedPayout.screenshot_url}
								alt="Auszahlungsnachweis"
								class="max-h-[440px] w-full object-contain"
							/>

							<div
								class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100"
							>
								<div
									class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/70 text-white"
								>
									<Eye size={17} />
								</div>
							</div>
						</a>
					{:else}
						<div
							class="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-[#090c11] text-center"
						>
							<FileImage size={27} class="text-white/10" />

							<div class="mt-3 text-[10px] font-bold text-white/30">
								Nachweis konnte nicht geladen werden.
							</div>
						</div>
					{/if}
				</div>

				<!-- ALREADY REVIEWED -->

				{#if selectedPayout.status !== 'pending'}
					<div class="mt-5 rounded-xl border border-white/[0.06] bg-[#090c11] p-4">
						<div class="flex items-center gap-2">
							{#if selectedPayout.status === 'paid'}
								<Check size={14} class="text-emerald-300" />
							{:else}
								<RotateCcw size={14} class="text-red-300" />
							{/if}

							<div class="text-[10px] font-bold text-white/60">
								Diese Anfrage wurde bereits bearbeitet.
							</div>
						</div>

						{#if selectedPayout.reviewed_at}
							<div class="mt-2 text-[9px] text-white/25">
								{statusLabel(selectedPayout.status)}
								am
								{formatDate(selectedPayout.reviewed_at)}

								{#if selectedPayout.reviewer?.username}
									· von
									{selectedPayout.reviewer.username}
								{/if}
							</div>
						{/if}

						{#if selectedPayout.moderator_note}
							<div class="mt-3 border-t border-white/[0.05] pt-3">
								<div class="text-[7px] font-bold uppercase tracking-[0.1em] text-white/20">
									Notiz
								</div>

								<p class="mt-1.5 whitespace-pre-wrap text-[9px] leading-4 text-white/40">
									{selectedPayout.moderator_note}
								</p>
							</div>
						{/if}
					</div>
				{:else}
					<!-- REVIEW FORM -->

					<form
						method="POST"
						action="?/updateStatus"
						use:enhance={() => {
							saving = true;

							return async ({ result, update }) => {
								await update({
									reset: false,
									invalidateAll: false
								});

								saving = false;

								if (result.type === 'success') {
									selectedPayout = null;

									await invalidateAll();
								}
							};
						}}
						class="mt-5 border-t border-white/[0.06] pt-5"
					>
						<input type="hidden" name="payout_id" value={selectedPayout.id} />

						<input type="hidden" name="status" value={selectedStatus} />

						<div>
							<div class="mb-2 text-[8px] font-bold uppercase tracking-[0.1em] text-white/25">
								Aktion
							</div>

							<div class="grid grid-cols-2 gap-2">
								<button
									type="button"
									onclick={() => (selectedStatus = 'paid')}
									class={[
										'flex min-h-[54px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border text-[9px] font-bold transition',
										selectedStatus === 'paid'
											? 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300'
											: 'border-white/[0.07] bg-white/[0.025] text-white/30 hover:text-white/70'
									]}
								>
									<Check size={14} />

									Ausgezahlt
								</button>

								<button
									type="button"
									onclick={() => (selectedStatus = 'cancelled')}
									class={[
										'flex min-h-[54px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border text-[9px] font-bold transition',
										selectedStatus === 'cancelled'
											? 'border-red-400/25 bg-red-400/[0.07] text-red-300'
											: 'border-white/[0.07] bg-white/[0.025] text-white/30 hover:text-white/70'
									]}
								>
									<XCircle size={14} />

									Stornieren
								</button>
							</div>
						</div>

						{#if selectedStatus === 'cancelled'}
							<div
								class="mt-3 flex items-start gap-2.5 rounded-xl border border-red-400/10 bg-red-400/[0.035] p-3"
							>
								<RotateCcw size={14} class="mt-0.5 shrink-0 text-red-300" />

								<p class="text-[9px] leading-4 text-red-200/45">
									Beim Stornieren wird
									{formatMoney(selectedPayout.amount)}
									automatisch wieder der Balance des Users gutgeschrieben.
								</p>
							</div>
						{:else}
							<div
								class="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-3"
							>
								<ShieldCheck size={14} class="mt-0.5 shrink-0 text-emerald-300" />

								<p class="text-[9px] leading-4 text-emerald-200/40">
									Nur als ausgezahlt markieren, wenn die Auszahlung tatsächlich durchgeführt wurde.
								</p>
							</div>
						{/if}

						<div class="mt-4">
							<label
								for="moderator_note"
								class="mb-1.5 block text-[8px] font-bold uppercase tracking-[0.1em] text-white/25"
							>
								Moderator Notiz
							</label>

							<textarea
								id="moderator_note"
								name="moderator_note"
								rows="4"
								maxlength="1000"
								bind:value={moderatorNote}
								placeholder="z. B. Casino Account geprüft / Grund für Stornierung..."
								class="w-full resize-none rounded-[10px] border border-white/[0.07] bg-[#080b10] px-3 py-2.5 text-[11px] font-medium text-white/70 outline-none transition placeholder:text-white/15 focus:border-[#8dc7ff]/25"
							></textarea>
						</div>

						<div class="mt-5 flex justify-end gap-2 border-t border-white/[0.06] pt-4">
							<button
								type="button"
								onclick={closePayout}
								disabled={saving}
								class="h-10 cursor-pointer rounded-[10px] border border-white/[0.07] bg-white/[0.025] px-4 text-[10px] font-bold text-white/40 transition hover:bg-white/[0.04] hover:text-white/65 disabled:opacity-40"
							>
								Abbrechen
							</button>

							<button
								type="submit"
								disabled={saving}
								class={[
									'flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-[10px] font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50',
									selectedStatus === 'cancelled'
										? 'bg-red-400 text-[#160607] hover:bg-red-300'
										: 'bg-white text-[#080b10] hover:bg-white/90'
								]}
							>
								{#if saving}
									<span
										class="h-3 w-3 animate-spin rounded-full border-2 border-current/20 border-t-current"
									></span>

									Speichern...
								{:else if selectedStatus === 'cancelled'}
									<RotateCcw size={13} />

									Auszahlung stornieren
								{:else}
									<Check size={13} />

									Als ausgezahlt markieren
								{/if}
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</div>
{/if}
