<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';

	import {
		Banknote,
		Check,
		ChevronDown,
		Clock3,
		Coins,
		Gift,
		History,
		PackageOpen,
		Search,
		User,
		X
	} from 'lucide-svelte';

	let { data, form } = $props();

	type Status = 'pending' | 'paid' | 'cancelled';

	type RewardType = 'item' | 'points' | 'balance';

	type Win = {
		id: string;
		user_id: string;

		case_name: string;

		item_name: string;
		item_image_url: string | null;
		item_rarity: string;
		item_value: number | null;

		reward_type: RewardType;
		reward_amount: number | null;

		points_spent: number;

		status: Status;

		admin_note: string | null;

		paid_at: string | null;
		cancelled_at: string | null;

		points_refunded: boolean;

		created_at: string;

		user: {
			id: string;
			username: string | null;
			email: string | null;
			avatar_url: string | null;
		} | null;
	};

	let selectedWin = $state<Win | null>(null);

	let selectedStatus = $state<Status>('pending');

	let adminNote = $state('');

	let saving = $state(false);

	let searchValue = $state(data.filters.search ?? '');

	function formatPoints(value: number | null | undefined) {
		return new Intl.NumberFormat('de-DE').format(value ?? 0);
	}

	function formatMoney(value: number | null | undefined) {
		if (value === null || value === undefined) {
			return '—';
		}

		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(value);
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

	function rarityText(rarity: string) {
		switch (rarity) {
			case 'legendary':
				return 'text-[#e7cf77]';

			case 'epic':
				return 'text-[#b9a8ff]';

			case 'rare':
				return 'text-[#8dc7ff]';

			case 'uncommon':
				return 'text-[#75d5a7]';

			default:
				return 'text-white/35';
		}
	}

	function rarityLine(rarity: string) {
		switch (rarity) {
			case 'legendary':
				return 'bg-[#d7b84c]';

			case 'epic':
				return 'bg-[#957df1]';

			case 'rare':
				return 'bg-[#72b9ec]';

			case 'uncommon':
				return 'bg-[#62c493]';

			default:
				return 'bg-white/20';
		}
	}

	function rewardLabel(win: Win) {
		if (win.reward_type === 'points') {
			return `${formatPoints(win.reward_amount)} Points`;
		}

		if (win.reward_type === 'balance') {
			return `${formatMoney(win.reward_amount)} Balance`;
		}

		if (win.item_value !== null) {
			return `Sachpreis · ${formatMoney(win.item_value)}`;
		}

		return 'Sachpreis';
	}

	function rewardTypeLabel(type: RewardType) {
		if (type === 'points') {
			return 'Points';
		}

		if (type === 'balance') {
			return 'Balance';
		}

		return 'Sachpreis';
	}

	function openWin(win: Win) {
		selectedWin = win;

		selectedStatus = win.status;

		adminNote = win.admin_note ?? '';
	}

	function closeWin() {
		if (saving) return;

		selectedWin = null;
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
	<title>Case History | BZETBONUS</title>
</svelte:head>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && selectedWin && !saving) {
			closeWin();
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
				class="flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-[#8dc7ff] uppercase"
			>
				<History size={13} />

				Community
			</div>

			<h1 class="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-white sm:text-[36px]">
				Case History
			</h1>

			<p class="mt-2 max-w-[680px] text-[13px] leading-5 text-white/35">
				Alle Case Openings der Community einsehen und offene Sachpreise bearbeiten.
			</p>
		</div>
	</div>

	<!-- FEEDBACK -->

	{#if form?.message}
		<div
			class={`mt-5 rounded-xl border px-4 py-3 text-[11px] font-semibold ${
				form?.success
					? 'border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300'
					: 'border-red-400/15 bg-red-400/[0.05] text-red-300'
			}`}
		>
			{form.message}
		</div>
	{/if}

	<!-- STATS -->

	<div
		class="mt-7 grid overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e1116] sm:grid-cols-4"
	>
		<div class="stat-box">
			<div class="stat-label">Gesamt</div>

			<div class="stat-number">
				{data.stats.total}
			</div>
		</div>

		<div class="stat-box">
			<div class="stat-label">Offen</div>

			<div class="stat-number text-amber-200">
				{data.stats.pending}
			</div>
		</div>

		<div class="stat-box">
			<div class="stat-label">Ausgezahlt</div>

			<div class="stat-number text-emerald-300">
				{data.stats.paid}
			</div>
		</div>

		<div class="stat-box">
			<div class="stat-label">Storniert</div>

			<div class="stat-number text-red-300">
				{data.stats.cancelled}
			</div>
		</div>
	</div>

	<!-- FILTERS -->

	<div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				onclick={() => setFilter('all')}
				class:filter-active={data.filters.status === 'all'}
				class="filter-button"
			>
				Alle
			</button>

			<button
				type="button"
				onclick={() => setFilter('pending')}
				class:filter-active={data.filters.status === 'pending'}
				class="filter-button"
			>
				Offen
			</button>

			<button
				type="button"
				onclick={() => setFilter('paid')}
				class:filter-active={data.filters.status === 'paid'}
				class="filter-button"
			>
				Ausgezahlt
			</button>

			<button
				type="button"
				onclick={() => setFilter('cancelled')}
				class:filter-active={data.filters.status === 'cancelled'}
				class="filter-button"
			>
				Storniert
			</button>
		</div>

		<form
			onsubmit={(event) => {
				event.preventDefault();
				submitSearch();
			}}
			class="relative w-full lg:w-[320px]"
		>
			<Search
				size={14}
				class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
			/>

			<input
				bind:value={searchValue}
				placeholder="User, Case oder Gewinn..."
				class="h-10 w-full rounded-xl border border-white/[0.07] bg-[#0d1015] pl-10 pr-4 text-[11px] font-medium text-white/70 outline-none transition placeholder:text-white/20 focus:border-[#8dc7ff]/25"
			/>
		</form>
	</div>

	<!-- HISTORY -->

	<section class="mt-5">
		{#if data.wins.length}
			<div class="overflow-hidden rounded-2xl border border-white/[0.065] bg-[#0d1015]">
				<div
					class="hidden grid-cols-[minmax(180px,1.1fr)_minmax(200px,1.4fr)_120px_100px_135px_120px] gap-4 border-b border-white/[0.055] bg-white/[0.015] px-5 py-3 lg:grid"
				>
					<div class="table-head">User</div>

					<div class="table-head">Gewinn</div>

					<div class="table-head">Typ</div>

					<div class="table-head">Einsatz</div>

					<div class="table-head">Zeitpunkt</div>

					<div class="table-head text-right">Status</div>
				</div>

				{#each data.wins as win, index}
					<button
						type="button"
						onclick={() => openWin(win)}
						class={`group grid w-full cursor-pointer gap-4 px-4 py-4 text-left transition hover:bg-white/[0.025] lg:grid-cols-[minmax(180px,1.1fr)_minmax(200px,1.4fr)_120px_100px_135px_120px] lg:items-center lg:px-5 ${
							index !== data.wins.length - 1 ? 'border-b border-white/[0.05]' : ''
						}`}
					>
						<!-- USER -->

						<div class="flex min-w-0 items-center gap-3">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.065] bg-[#080b0f]"
							>
								{#if win.user?.avatar_url}
									<img
										src={win.user.avatar_url}
										alt={win.user.username ?? ''}
										class="h-full w-full object-cover"
									/>
								{:else}
									<User size={15} class="text-white/22" />
								{/if}
							</div>

							<div class="min-w-0">
								<div class="truncate text-[11px] font-bold text-white/70">
									{win.user?.username ?? 'Unbekannter User'}
								</div>

								<div class="mt-0.5 truncate text-[8px] text-white/20">
									{win.user?.email ?? win.user_id}
								</div>
							</div>
						</div>

						<!-- WIN -->

						<div class="flex min-w-0 items-center gap-3">
							<div
								class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-[#080b0f]"
							>
								<div
									class={`absolute inset-x-0 bottom-0 h-[2px] ${rarityLine(win.item_rarity)}`}
								></div>

								{#if win.item_image_url}
									<img
										src={win.item_image_url}
										alt={win.item_name}
										class="max-h-8 max-w-8 object-contain"
									/>
								{:else if win.reward_type === 'points'}
									<Coins size={15} class="text-[#8dc7ff]/60" />
								{:else if win.reward_type === 'balance'}
									<Banknote size={15} class="text-emerald-300/60" />
								{:else}
									<Gift size={15} class="text-white/22" />
								{/if}
							</div>

							<div class="min-w-0">
								<div class="truncate text-[11px] font-bold text-white/70">
									{win.item_name}
								</div>

								<div class="mt-1 flex flex-wrap items-center gap-2">
									<span
										class={`text-[7px] font-bold tracking-[0.08em] uppercase ${rarityText(
											win.item_rarity
										)}`}
									>
										{win.item_rarity}
									</span>

									<span class="text-[8px] text-white/20">
										{win.case_name}
									</span>
								</div>
							</div>
						</div>

						<!-- TYPE -->

						<div>
							<div class="mobile-label">Typ</div>

							<div class="text-[10px] font-semibold text-white/45">
								{rewardTypeLabel(win.reward_type)}
							</div>

							<div class="mt-0.5 text-[8px] text-white/22">
								{rewardLabel(win)}
							</div>
						</div>

						<!-- COST -->

						<div>
							<div class="mobile-label">Einsatz</div>

							<div class="flex items-center gap-1 text-[10px] font-bold text-white/48">
								<Coins size={10} class="text-[#8dc7ff]" />

								{formatPoints(win.points_spent)}
							</div>
						</div>

						<!-- DATE -->

						<div>
							<div class="mobile-label">Zeitpunkt</div>

							<div class="flex items-center gap-1.5 text-[9px] text-white/30">
								<Clock3 size={10} />

								{formatDate(win.created_at)}
							</div>
						</div>

						<!-- STATUS -->

						<div class="flex lg:justify-end">
							<div
								class={`rounded-full border px-2.5 py-1 text-[8px] font-bold tracking-[0.08em] uppercase ${statusClass(
									win.status
								)}`}
							>
								{statusLabel(win.status)}
							</div>
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div
				class="rounded-2xl border border-dashed border-white/[0.07] bg-[#0d1015] px-5 py-16 text-center"
			>
				<PackageOpen size={32} class="mx-auto text-white/12" />

				<div class="mt-4 text-[13px] font-bold text-white/35">Keine Case Openings gefunden.</div>
			</div>
		{/if}
	</section>
</div>

<!-- EDIT MODAL -->

{#if selectedWin}
	<div
		class="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 p-4 backdrop-blur-[7px]"
	>
		<button type="button" onclick={closeWin} class="absolute inset-0" aria-label="Schließen"
		></button>

		<div
			class="relative z-10 w-full max-w-[580px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0c1016] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
		>
			<div class="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
				<div>
					<div class="text-[9px] font-bold tracking-[0.12em] text-[#8dc7ff] uppercase">
						Case Gewinn
					</div>

					<div class="mt-1 text-[16px] font-bold text-white">
						{selectedWin.item_name}
					</div>
				</div>

				<button
					type="button"
					onclick={closeWin}
					disabled={saving}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-white/30 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-30"
				>
					<X size={14} />
				</button>
			</div>

			<div class="p-5">
				<div class="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#090c11] p-4">
					<div
						class="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#06090d]"
					>
						<div
							class={`absolute inset-x-0 bottom-0 h-[2px] ${rarityLine(selectedWin.item_rarity)}`}
						></div>

						{#if selectedWin.item_image_url}
							<img
								src={selectedWin.item_image_url}
								alt={selectedWin.item_name}
								class="max-h-11 max-w-11 object-contain"
							/>
						{:else if selectedWin.reward_type === 'points'}
							<Coins size={20} class="text-[#8dc7ff]" />
						{:else if selectedWin.reward_type === 'balance'}
							<Banknote size={20} class="text-emerald-300" />
						{:else}
							<Gift size={20} class="text-white/30" />
						{/if}
					</div>

					<div class="min-w-0">
						<div class="text-[13px] font-bold text-white/75">
							{selectedWin.user?.username ?? 'Unbekannter User'}
						</div>

						<div class="mt-1 text-[9px] text-white/25">
							{selectedWin.case_name}
							·
							{rewardLabel(selectedWin)}
						</div>

						<div class="mt-1 text-[9px] text-white/20">
							{formatDate(selectedWin.created_at)}
						</div>
					</div>
				</div>

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
								selectedWin = null;

								await invalidateAll();
							}
						};
					}}
					class="mt-5"
				>
					<input type="hidden" name="win_id" value={selectedWin.id} />

					<input type="hidden" name="status" value={selectedStatus} />

					<div>
						<div class="field-label">Status</div>

						<div class="grid grid-cols-3 gap-2">
							<button
								type="button"
								onclick={() => (selectedStatus = 'pending')}
								class:status-choice-active={selectedStatus === 'pending'}
								class="status-choice"
							>
								<Clock3 size={14} />

								Offen
							</button>

							<button
								type="button"
								onclick={() => (selectedStatus = 'paid')}
								class:status-choice-active={selectedStatus === 'paid'}
								class="status-choice"
							>
								<Check size={14} />

								Ausgezahlt
							</button>

							<button
								type="button"
								onclick={() => (selectedStatus = 'cancelled')}
								class:status-choice-active={selectedStatus === 'cancelled'}
								class="status-choice"
							>
								<X size={14} />

								Storniert
							</button>
						</div>
					</div>

					<div class="mt-4">
						<label for="admin-note" class="field-label"> Interne Notiz </label>

						<textarea
							id="admin-note"
							name="admin_note"
							rows="4"
							bind:value={adminNote}
							placeholder="z. B. Gutschein per Discord geschickt..."
							class="field-input resize-none"></textarea>
					</div>

					<div class="mt-5 flex justify-end gap-2 border-t border-white/[0.06] pt-4">
						<button type="button" onclick={closeWin} disabled={saving} class="secondary-button">
							Abbrechen
						</button>

						<button type="submit" disabled={saving} class="primary-button">
							{#if saving}
								<span
									class="h-3 w-3 animate-spin rounded-full border-2 border-black/20 border-t-black"
								></span>

								Speichern...
							{:else}
								Status speichern
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.stat-box) {
		padding: 17px 19px;
		border-right: 1px solid rgba(255, 255, 255, 0.055);
	}

	:global(.stat-box:last-child) {
		border-right: 0;
	}

	:global(.stat-label) {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.2);
	}

	:global(.stat-number) {
		margin-top: 7px;
		font-size: 20px;
		font-weight: 800;
		color: white;
	}

	:global(.table-head) {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.19);
	}

	:global(.mobile-label) {
		display: block;
		margin-bottom: 4px;
		font-size: 7px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.16);
	}

	@media (min-width: 1024px) {
		:global(.mobile-label) {
			display: none;
		}
	}

	:global(.filter-button) {
		height: 36px;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.025);
		padding: 0 13px;
		font-size: 9px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.32);
		transition:
			background 150ms ease,
			border-color 150ms ease,
			color 150ms ease;
	}

	:global(.filter-button:hover) {
		border-color: rgba(141, 199, 255, 0.15);
		color: rgba(255, 255, 255, 0.65);
	}

	:global(.filter-button.filter-active) {
		border-color: rgba(141, 199, 255, 0.2);
		background: rgba(141, 199, 255, 0.07);
		color: #9dcef6;
	}

	:global(.field-label) {
		display: block;
		margin-bottom: 6px;
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.22);
	}

	:global(.field-input) {
		width: 100%;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		background: #080b10;
		padding: 10px 12px;
		font-size: 11px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.72);
		outline: none;
		transition: border-color 150ms ease;
	}

	:global(.field-input:focus) {
		border-color: rgba(141, 199, 255, 0.24);
	}

	:global(.field-input::placeholder) {
		color: rgba(255, 255, 255, 0.17);
	}

	:global(.status-choice) {
		display: flex;
		min-height: 52px;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.025);
		font-size: 9px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.32);
		transition:
			border-color 150ms ease,
			background 150ms ease,
			color 150ms ease;
	}

	:global(.status-choice:hover) {
		color: rgba(255, 255, 255, 0.7);
	}

	:global(.status-choice.status-choice-active) {
		border-color: rgba(141, 199, 255, 0.24);
		background: rgba(141, 199, 255, 0.07);
		color: #9dcef6;
	}

	:global(.primary-button) {
		display: flex;
		height: 40px;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		gap: 7px;
		border: 0;
		border-radius: 10px;
		background: white;
		padding: 0 16px;
		font-size: 10px;
		font-weight: 800;
		color: #080b10;
	}

	:global(.primary-button:disabled) {
		cursor: not-allowed;
		opacity: 0.5;
	}

	:global(.secondary-button) {
		height: 40px;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.025);
		padding: 0 16px;
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.38);
	}

	@media (max-width: 639px) {
		:global(.stat-box) {
			border-right: 0;
			border-bottom: 1px solid rgba(255, 255, 255, 0.055);
		}

		:global(.stat-box:last-child) {
			border-bottom: 0;
		}
	}
</style>
