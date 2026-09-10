<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Banknote,
		Box,
		Check,
		ChevronDown,
		Coins,
		Gift,
		Image,
		PackageOpen,
		Pencil,
		Plus,
		Save,
		Trash2,
		Upload,
		X
	} from 'lucide-svelte';

	let { data, form } = $props();

	type RewardType = 'item' | 'points' | 'balance';

	type CaseItem = {
		id: string;
		case_id: string;
		name: string;
		description: string | null;
		image_url: string | null;

		chance: number | string;

		rarity: string;

		value: number | null;

		reward_type: RewardType;
		reward_amount: number | null;

		created_at: string;
	};

	type Case = {
		id: string;
		name: string;
		description: string | null;
		image_url: string | null;

		price_points: number;

		is_active: boolean;

		position: number;

		created_at: string;

		case_items: CaseItem[];
	};

	let createCaseOpen = $state(false);

	let editingCase = $state<Case | null>(null);

	let addingItemCase = $state<Case | null>(null);

	let editingItem = $state<CaseItem | null>(null);

	let deleteCaseTarget = $state<Case | null>(null);

	let deleteItemTarget = $state<CaseItem | null>(null);

	let expandedCases = $state<string[]>([]);

	let caseImagePreview = $state<string | null>(null);

	let itemImagePreview = $state<string | null>(null);

	let newRewardType = $state<RewardType>('item');

	let editRewardType = $state<RewardType>('item');

	const rarities = [
		{
			value: 'common',
			label: 'Common'
		},
		{
			value: 'uncommon',
			label: 'Uncommon'
		},
		{
			value: 'rare',
			label: 'Rare'
		},
		{
			value: 'epic',
			label: 'Epic'
		},
		{
			value: 'legendary',
			label: 'Legendary'
		}
	];

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

	function formatChance(value: number) {
		return value.toLocaleString('de-DE', {
			maximumFractionDigits: 5
		});
	}

	function totalChance(caseItem: Case) {
		return caseItem.case_items.reduce((total, item) => total + Number(item.chance), 0);
	}

	function chanceComplete(caseItem: Case) {
		return Math.abs(totalChance(caseItem) - 100) < 0.001;
	}

	function toggleCase(id: string) {
		if (expandedCases.includes(id)) {
			expandedCases = expandedCases.filter((value) => value !== id);

			return;
		}

		expandedCases = [...expandedCases, id];
	}

	function isExpanded(id: string) {
		return expandedCases.includes(id);
	}

	function openCreateCase() {
		createCaseOpen = true;

		caseImagePreview = null;
	}

	function openEditCase(caseItem: Case) {
		editingCase = caseItem;

		caseImagePreview = null;
	}

	function openAddItem(caseItem: Case) {
		addingItemCase = caseItem;

		newRewardType = 'item';

		itemImagePreview = null;
	}

	function openEditItem(item: CaseItem) {
		editingItem = item;

		editRewardType = item.reward_type ?? 'item';

		itemImagePreview = null;
	}

	function previewFile(event: Event, type: 'case' | 'item') {
		const input = event.currentTarget as HTMLInputElement;

		const file = input.files?.[0];

		if (!file) {
			return;
		}

		const url = URL.createObjectURL(file);

		if (type === 'case') {
			if (caseImagePreview) {
				URL.revokeObjectURL(caseImagePreview);
			}

			caseImagePreview = url;

			return;
		}

		if (itemImagePreview) {
			URL.revokeObjectURL(itemImagePreview);
		}

		itemImagePreview = url;
	}

	function closeModals() {
		createCaseOpen = false;

		editingCase = null;
		addingItemCase = null;
		editingItem = null;

		deleteCaseTarget = null;
		deleteItemTarget = null;

		if (caseImagePreview) {
			URL.revokeObjectURL(caseImagePreview);
		}

		if (itemImagePreview) {
			URL.revokeObjectURL(itemImagePreview);
		}

		caseImagePreview = null;
		itemImagePreview = null;
	}

	function rarityText(rarity: string) {
		switch (rarity) {
			case 'legendary':
				return 'text-[#d8c895]';

			case 'epic':
				return 'text-[#c0b5e5]';

			case 'rare':
				return 'text-[#8dc7ff]';

			case 'uncommon':
				return 'text-[#82cfaa]';

			default:
				return 'text-white/35';
		}
	}

	function rarityLine(rarity: string) {
		switch (rarity) {
			case 'legendary':
				return 'bg-[#c4ae67]';

			case 'epic':
				return 'bg-[#9889d0]';

			case 'rare':
				return 'bg-[#78b9e9]';

			case 'uncommon':
				return 'bg-[#72b692]';

			default:
				return 'bg-white/18';
		}
	}

	function rewardTypeLabel(type: RewardType) {
		switch (type) {
			case 'points':
				return 'Points';

			case 'balance':
				return 'Balance';

			default:
				return 'Sachpreis';
		}
	}

	function rewardValueLabel(item: CaseItem) {
		if (item.reward_type === 'points') {
			return `${formatPoints(item.reward_amount)} Points`;
		}

		if (item.reward_type === 'balance') {
			return formatMoney(item.reward_amount);
		}

		if (item.value !== null) {
			return `ca. ${formatMoney(item.value)}`;
		}

		return 'Sachpreis';
	}
</script>

<svelte:head>
	<title>Cases verwalten | BZETBONUS</title>
</svelte:head>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			closeModals();
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
				<PackageOpen size={13} />

				Admin
			</div>

			<h1 class="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-white sm:text-[36px]">
				Cases verwalten
			</h1>

			<p class="mt-2 max-w-[650px] text-[13px] leading-5 text-white/35">
				Verwalte Case-Preise, Bilder, Sachpreise, Points, Balance und die jeweiligen Drop-Chancen.
			</p>
		</div>

		<button
			type="button"
			onclick={openCreateCase}
			class="flex h-11 cursor-pointer items-center justify-center gap-2 border border-white bg-white px-5 text-[12px] font-extrabold text-[#080b10] transition hover:bg-[#edf6ff]"
		>
			<Plus size={15} strokeWidth={2.4} />

			Neues Case
		</button>
	</div>

	<!-- MESSAGE -->

	{#if form?.message}
		<div
			class={`mt-5 border px-4 py-3 text-[12px] font-semibold ${
				form?.success
					? 'border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300'
					: 'border-red-400/15 bg-red-400/[0.04] text-red-300'
			}`}
		>
			{form.message}
		</div>
	{/if}

	<!-- STATS -->

	<div class="mt-7 grid overflow-hidden border border-white/[0.06] bg-[#0e1116] sm:grid-cols-3">
		<div class="px-5 py-4">
			<div class="stat-label">Cases</div>

			<div class="stat-value">
				{data.cases.length}
			</div>
		</div>

		<div class="border-t border-white/[0.06] px-5 py-4 sm:border-l sm:border-t-0">
			<div class="stat-label">Aktiv</div>

			<div class="stat-value">
				{data.cases.filter((caseItem: Case) => caseItem.is_active).length}
			</div>
		</div>

		<div class="border-t border-white/[0.06] px-5 py-4 sm:border-l sm:border-t-0">
			<div class="stat-label">Drops</div>

			<div class="stat-value">
				{data.cases.reduce((sum: number, caseItem: Case) => sum + caseItem.case_items.length, 0)}
			</div>
		</div>
	</div>

	<!-- CASES -->

	<section class="mt-7">
		<div class="mb-3 text-[10px] font-bold tracking-[0.13em] text-white/25 uppercase">
			Alle Cases
		</div>

		{#if data.cases.length}
			<div class="space-y-3">
				{#each data.cases as caseItem}
					<div class="overflow-hidden border border-white/[0.065] bg-[#0e1116]">
						<div class="grid gap-4 p-4 lg:grid-cols-[70px_minmax(0,1fr)_auto] lg:items-center">
							<div
								class="flex h-[66px] w-[66px] items-center justify-center overflow-hidden border border-white/[0.06] bg-[#090c10]"
							>
								{#if caseItem.image_url}
									<img
										src={caseItem.image_url}
										alt={caseItem.name}
										class="max-h-[56px] max-w-[56px] object-contain"
									/>
								{:else}
									<Box size={26} class="text-white/15" />
								{/if}
							</div>

							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<h2 class="text-[15px] font-bold text-white">
										{caseItem.name}
									</h2>

									{#if caseItem.is_active}
										<span
											class="border border-emerald-400/15 bg-emerald-400/[0.05] px-2 py-0.5 text-[8px] font-bold tracking-[0.08em] text-emerald-300 uppercase"
										>
											Aktiv
										</span>
									{:else}
										<span
											class="border border-white/[0.07] bg-white/[0.025] px-2 py-0.5 text-[8px] font-bold tracking-[0.08em] text-white/30 uppercase"
										>
											Inaktiv
										</span>
									{/if}
								</div>

								{#if caseItem.description}
									<div class="mt-1 line-clamp-1 text-[11px] text-white/30">
										{caseItem.description}
									</div>
								{/if}

								<div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
									<div class="flex items-center gap-1.5 text-[10px] text-white/35">
										<Coins size={11} class="text-[#8dc7ff]" />

										<strong class="text-white/60">
											{formatPoints(caseItem.price_points)}
										</strong>

										PTS
									</div>

									<div class="text-[10px] text-white/30">
										{caseItem.case_items.length}
										Drops
									</div>

									<div
										class={`text-[10px] font-bold ${
											chanceComplete(caseItem) ? 'text-emerald-300' : 'text-amber-300'
										}`}
									>
										{formatChance(totalChance(caseItem))}%
									</div>

									<div class="text-[10px] text-white/25">
										Position
										{caseItem.position}
									</div>
								</div>
							</div>

							<div class="flex flex-wrap gap-2 lg:justify-end">
								<button
									type="button"
									disabled={caseItem.is_active}
									onclick={() => openAddItem(caseItem)}
									class="flex h-9 cursor-pointer items-center gap-1.5 border border-[#8dc7ff]/15 bg-[#8dc7ff]/[0.045] px-3 text-[10px] font-bold text-[#9dcef6] transition hover:bg-[#8dc7ff]/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
								>
									<Plus size={12} />

									Drop
								</button>

								<button
									type="button"
									onclick={() => openEditCase(caseItem)}
									class="flex h-9 cursor-pointer items-center gap-1.5 border border-white/[0.07] bg-white/[0.025] px-3 text-[10px] font-bold text-white/45 transition hover:bg-white/[0.05] hover:text-white"
								>
									<Pencil size={12} />

									Bearbeiten
								</button>

								<button
									type="button"
									onclick={() => (deleteCaseTarget = caseItem)}
									class="flex h-9 cursor-pointer items-center justify-center border border-red-400/10 bg-red-400/[0.025] px-3 text-red-300/55 transition hover:bg-red-400/[0.06] hover:text-red-300"
								>
									<Trash2 size={13} />
								</button>

								<button
									type="button"
									onclick={() => toggleCase(caseItem.id)}
									class="flex h-9 w-9 cursor-pointer items-center justify-center border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:bg-white/[0.05] hover:text-white"
								>
									<ChevronDown
										size={14}
										class={`transition ${isExpanded(caseItem.id) ? 'rotate-180' : ''}`}
									/>
								</button>
							</div>
						</div>

						<div class="h-[3px] bg-white/[0.035]">
							<div
								class={`h-full ${
									chanceComplete(caseItem) ? 'bg-emerald-400/60' : 'bg-amber-300/60'
								}`}
								style={`width:${Math.min(totalChance(caseItem), 100)}%`}
							></div>
						</div>

						{#if isExpanded(caseItem.id)}
							<div class="border-t border-white/[0.055] bg-[#0a0d12]">
								<div
									class="flex items-center justify-between border-b border-white/[0.05] px-4 py-3"
								>
									<div class="text-[9px] font-bold tracking-[0.1em] text-white/22 uppercase">
										Drop Table
									</div>

									<div
										class={`flex items-center gap-1.5 text-[9px] font-bold ${
											chanceComplete(caseItem) ? 'text-emerald-300' : 'text-amber-300'
										}`}
									>
										{#if chanceComplete(caseItem)}
											<Check size={11} />
										{/if}

										{formatChance(totalChance(caseItem))}
										/ 100%
									</div>
								</div>

								{#if caseItem.case_items.length}
									{#each caseItem.case_items as item, index}
										<div
											class={`grid gap-3 px-4 py-3 md:grid-cols-[44px_minmax(0,1fr)_120px_120px_90px_auto] md:items-center ${
												index !== caseItem.case_items.length - 1
													? 'border-b border-white/[0.045]'
													: ''
											}`}
										>
											<div
												class="relative flex h-10 w-10 items-center justify-center overflow-hidden border border-white/[0.055] bg-[#07090d]"
											>
												<div
													class={`absolute bottom-0 h-[2px] w-full ${rarityLine(item.rarity)}`}
												></div>

												{#if item.image_url}
													<img
														src={item.image_url}
														alt={item.name}
														class="max-h-8 max-w-8 object-contain"
													/>
												{:else if item.reward_type === 'points'}
													<Coins size={16} class="text-[#8dc7ff]/60" />
												{:else if item.reward_type === 'balance'}
													<Banknote size={16} class="text-emerald-300/60" />
												{:else}
													<Gift size={16} class="text-white/20" />
												{/if}
											</div>

											<div class="min-w-0">
												<div class="truncate text-[11px] font-bold text-white/70">
													{item.name}
												</div>

												<div
													class={`mt-1 text-[8px] font-bold tracking-[0.08em] uppercase ${rarityText(
														item.rarity
													)}`}
												>
													{item.rarity}
												</div>
											</div>

											<div>
												<div class="table-label">Gewinnart</div>

												<div class="table-value">
													{rewardTypeLabel(item.reward_type)}
												</div>
											</div>

											<div>
												<div class="table-label">Gewinn</div>

												<div class="table-value">
													{rewardValueLabel(item)}
												</div>
											</div>

											<div>
												<div class="table-label">Chance</div>

												<div class="table-value">
													{formatChance(Number(item.chance))}%
												</div>
											</div>

											<div class="flex gap-1.5 md:justify-end">
												<button
													type="button"
													disabled={caseItem.is_active}
													onclick={() => openEditItem(item)}
													class="icon-button"
												>
													<Pencil size={12} />
												</button>

												<button
													type="button"
													disabled={caseItem.is_active}
													onclick={() => (deleteItemTarget = item)}
													class="delete-button"
												>
													<Trash2 size={12} />
												</button>
											</div>
										</div>
									{/each}
								{:else}
									<div class="px-4 py-10 text-center text-[11px] text-white/25">
										Noch keine Drops vorhanden.
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="border border-dashed border-white/[0.07] bg-[#0d1015] py-16 text-center">
				<PackageOpen size={32} class="mx-auto text-white/12" />

				<div class="mt-4 text-[13px] font-bold text-white/40">Noch keine Cases erstellt</div>
			</div>
		{/if}
	</section>
</div>

<!-- CREATE CASE -->

{#if createCaseOpen}
	<div class="modal-backdrop">
		<button type="button" class="absolute inset-0" aria-label="Schließen" onclick={closeModals}
		></button>

		<div class="modal">
			<div class="modal-header">
				<div>
					<div class="modal-kicker">Case erstellen</div>

					<div class="modal-title">Neues Case</div>
				</div>

				<button type="button" onclick={closeModals} class="icon-button">
					<X size={14} />
				</button>
			</div>

			<form
				method="POST"
				action="?/createCase"
				enctype="multipart/form-data"
				use:enhance
				class="p-5"
			>
				<div class="grid gap-4 sm:grid-cols-[130px_1fr]">
					<label class="upload-box h-[130px]">
						{#if caseImagePreview}
							<img
								src={caseImagePreview}
								alt=""
								class="max-h-[105px] max-w-[105px] object-contain"
							/>
						{:else}
							<div class="text-center">
								<Upload size={20} class="mx-auto text-white/20" />

								<div class="mt-2 text-[9px] font-bold text-white/25">Case Bild</div>
							</div>
						{/if}

						<input
							type="file"
							name="image"
							accept="image/png,image/jpeg,image/webp,image/gif"
							onchange={(event) => previewFile(event, 'case')}
							class="hidden"
						/>
					</label>

					<div class="space-y-4">
						<div>
							<label for="create-case-name" class="field-label"> Name </label>

							<input
								id="create-case-name"
								name="name"
								required
								class="field-input"
								placeholder="z. B. BZET Premium Case"
							/>
						</div>

						<div>
							<label for="create-case-description" class="field-label"> Beschreibung </label>

							<textarea
								id="create-case-description"
								name="description"
								rows="3"
								class="field-input resize-none"
								placeholder="Kurze Beschreibung..."></textarea>
						</div>
					</div>
				</div>

				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<div>
						<label for="create-price" class="field-label"> Preis in Points </label>

						<input
							id="create-price"
							name="price_points"
							type="number"
							min="1"
							step="1"
							value="1000"
							required
							class="field-input"
						/>
					</div>

					<div>
						<label for="create-position" class="field-label"> Position </label>

						<input
							id="create-position"
							name="position"
							type="number"
							step="1"
							value="0"
							class="field-input"
						/>
					</div>
				</div>

				<div class="mt-4 border border-white/[0.06] bg-[#090c10] px-4 py-3">
					<div class="text-[11px] font-bold text-white/55">
						Case wird zunächst inaktiv erstellt.
					</div>

					<div class="mt-1 text-[9px] leading-4 text-white/25">
						Sobald die Drop-Tabelle genau 100 % erreicht, kannst du das Case über Bearbeiten
						aktivieren.
					</div>
				</div>

				<div class="modal-actions">
					<button type="button" onclick={closeModals} class="secondary-button"> Abbrechen </button>

					<button type="submit" class="primary-button">
						<Plus size={13} />

						Case erstellen
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- EDIT CASE -->

{#if editingCase}
	<div class="modal-backdrop">
		<button type="button" class="absolute inset-0" aria-label="Schließen" onclick={closeModals}
		></button>

		<div class="modal">
			<div class="modal-header">
				<div>
					<div class="modal-kicker">Case bearbeiten</div>

					<div class="modal-title">
						{editingCase.name}
					</div>
				</div>

				<button type="button" onclick={closeModals} class="icon-button">
					<X size={14} />
				</button>
			</div>

			<form
				method="POST"
				action="?/updateCase"
				enctype="multipart/form-data"
				use:enhance
				class="p-5"
			>
				<input type="hidden" name="case_id" value={editingCase.id} />

				<div class="grid gap-4 sm:grid-cols-[130px_1fr]">
					<label class="upload-box h-[130px]">
						{#if caseImagePreview ?? editingCase.image_url}
							<img
								src={caseImagePreview ?? editingCase.image_url ?? ''}
								alt=""
								class="max-h-[105px] max-w-[105px] object-contain"
							/>
						{:else}
							<Upload size={20} class="text-white/20" />
						{/if}

						<input
							type="file"
							name="image"
							accept="image/png,image/jpeg,image/webp,image/gif"
							onchange={(event) => previewFile(event, 'case')}
							class="hidden"
						/>
					</label>

					<div class="space-y-4">
						<div>
							<label for="edit-case-name" class="field-label"> Name </label>

							<input
								id="edit-case-name"
								name="name"
								required
								value={editingCase.name}
								class="field-input"
							/>
						</div>

						<div>
							<label for="edit-case-description" class="field-label"> Beschreibung </label>

							<textarea
								id="edit-case-description"
								name="description"
								rows="3"
								class="field-input resize-none">{editingCase.description ?? ''}</textarea
							>
						</div>
					</div>
				</div>

				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<div>
						<label for="edit-price" class="field-label"> Preis in Points </label>

						<input
							id="edit-price"
							name="price_points"
							type="number"
							min="1"
							required
							value={editingCase.price_points}
							class="field-input"
						/>
					</div>

					<div>
						<label for="edit-position" class="field-label"> Position </label>

						<input
							id="edit-position"
							name="position"
							type="number"
							value={editingCase.position}
							class="field-input"
						/>
					</div>
				</div>

				<label
					class="mt-4 flex cursor-pointer items-center justify-between border border-white/[0.06] bg-[#090c10] px-4 py-3"
				>
					<div>
						<div class="text-[11px] font-bold text-white/60">Case aktiv</div>

						<div class="mt-1 text-[9px] text-white/25">
							Aktivierung nur möglich, wenn die Drop-Tabelle 100 % ergibt.
						</div>
					</div>

					<input
						type="checkbox"
						name="is_active"
						value="true"
						checked={editingCase.is_active}
						class="h-4 w-4 accent-white"
					/>
				</label>

				<div class="modal-actions">
					<button type="button" onclick={closeModals} class="secondary-button"> Abbrechen </button>

					<button type="submit" class="primary-button">
						<Save size={13} />

						Speichern
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ADD DROP -->

{#if addingItemCase}
	<div class="modal-backdrop">
		<button type="button" class="absolute inset-0" aria-label="Schließen" onclick={closeModals}
		></button>

		<div class="modal max-h-[94vh] overflow-y-auto">
			<div class="modal-header">
				<div>
					<div class="modal-kicker">
						{addingItemCase.name}
					</div>

					<div class="modal-title">Drop hinzufügen</div>
				</div>

				<button type="button" onclick={closeModals} class="icon-button">
					<X size={14} />
				</button>
			</div>

			<form
				method="POST"
				action="?/createItem"
				enctype="multipart/form-data"
				use:enhance
				class="p-5"
			>
				<input type="hidden" name="case_id" value={addingItemCase.id} />

				<input type="hidden" name="reward_type" value={newRewardType} />

				<div>
					<div class="field-label">Gewinnart</div>

					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							onclick={() => (newRewardType = 'item')}
							class:reward-selected={newRewardType === 'item'}
							class="reward-button"
						>
							<Gift size={16} />

							<span> Sachpreis </span>
						</button>

						<button
							type="button"
							onclick={() => (newRewardType = 'points')}
							class:reward-selected={newRewardType === 'points'}
							class="reward-button"
						>
							<Coins size={16} />

							<span> Points </span>
						</button>

						<button
							type="button"
							onclick={() => (newRewardType = 'balance')}
							class:reward-selected={newRewardType === 'balance'}
							class="reward-button"
						>
							<Banknote size={16} />

							<span> Balance </span>
						</button>
					</div>
				</div>

				<div class="mt-5 grid gap-4 sm:grid-cols-[120px_1fr]">
					<label class="upload-box h-[120px]">
						{#if itemImagePreview}
							<img src={itemImagePreview} alt="" class="max-h-[96px] max-w-[96px] object-contain" />
						{:else}
							<div class="text-center">
								{#if newRewardType === 'points'}
									<Coins size={22} class="mx-auto text-[#8dc7ff]/50" />
								{:else if newRewardType === 'balance'}
									<Banknote size={22} class="mx-auto text-emerald-300/50" />
								{:else}
									<Upload size={20} class="mx-auto text-white/20" />
								{/if}

								<div class="mt-2 text-[9px] font-bold text-white/25">Bild optional</div>
							</div>
						{/if}

						<input
							type="file"
							name="image"
							accept="image/png,image/jpeg,image/webp,image/gif"
							onchange={(event) => previewFile(event, 'item')}
							class="hidden"
						/>
					</label>

					<div class="space-y-4">
						<div>
							<label for="new-item-name" class="field-label"> Name </label>

							<input
								id="new-item-name"
								name="name"
								required
								class="field-input"
								placeholder={newRewardType === 'points'
									? 'z. B. 50.000 Points'
									: newRewardType === 'balance'
										? 'z. B. 50 € Balance'
										: 'z. B. AirPods Pro'}
							/>
						</div>

						<div>
							<label for="new-description" class="field-label"> Beschreibung </label>

							<input
								id="new-description"
								name="description"
								class="field-input"
								placeholder="Optional"
							/>
						</div>
					</div>
				</div>

				{#if newRewardType === 'points'}
					<div class="mt-4">
						<label for="new-points-amount" class="field-label"> Points Gewinn </label>

						<input
							id="new-points-amount"
							name="reward_amount"
							type="number"
							min="1"
							step="1"
							required
							class="field-input"
							placeholder="50000"
						/>
					</div>
				{:else if newRewardType === 'balance'}
					<div class="mt-4">
						<label for="new-balance-amount" class="field-label"> Balance Gewinn € </label>

						<input
							id="new-balance-amount"
							name="reward_amount"
							type="number"
							min="0.01"
							step="0.01"
							required
							class="field-input"
							placeholder="50.00"
						/>
					</div>
				{:else}
					<div class="mt-4">
						<label for="new-item-value" class="field-label"> Ungefährer Sachwert € </label>

						<input
							id="new-item-value"
							name="value"
							type="number"
							min="0"
							step="0.01"
							class="field-input"
							placeholder="279.00"
						/>
					</div>
				{/if}

				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<div>
						<label for="new-chance" class="field-label"> Chance % </label>

						<input
							id="new-chance"
							name="chance"
							type="number"
							min="0.00001"
							max="100"
							step="0.00001"
							required
							class="field-input"
							placeholder="5"
						/>

						<div class="mt-1.5 text-[9px] text-white/20">
							Aktuell:
							{formatChance(totalChance(addingItemCase))}%
						</div>
					</div>

					<div>
						<label for="new-rarity" class="field-label"> Seltenheit </label>

						<select id="new-rarity" name="rarity" class="field-input" value="common">
							{#each rarities as rarity}
								<option value={rarity.value}>
									{rarity.label}
								</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="modal-actions">
					<button type="button" onclick={closeModals} class="secondary-button"> Abbrechen </button>

					<button type="submit" class="primary-button">
						<Plus size={13} />

						Drop hinzufügen
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- EDIT DROP -->

{#if editingItem}
	<div class="modal-backdrop">
		<button type="button" class="absolute inset-0" aria-label="Schließen" onclick={closeModals}
		></button>

		<div class="modal max-h-[94vh] overflow-y-auto">
			<div class="modal-header">
				<div>
					<div class="modal-kicker">Drop bearbeiten</div>

					<div class="modal-title">
						{editingItem.name}
					</div>
				</div>

				<button type="button" onclick={closeModals} class="icon-button">
					<X size={14} />
				</button>
			</div>

			<form
				method="POST"
				action="?/updateItem"
				enctype="multipart/form-data"
				use:enhance
				class="p-5"
			>
				<input type="hidden" name="item_id" value={editingItem.id} />

				<input type="hidden" name="reward_type" value={editRewardType} />

				<div>
					<div class="field-label">Gewinnart</div>

					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							onclick={() => (editRewardType = 'item')}
							class:reward-selected={editRewardType === 'item'}
							class="reward-button"
						>
							<Gift size={16} />

							Sachpreis
						</button>

						<button
							type="button"
							onclick={() => (editRewardType = 'points')}
							class:reward-selected={editRewardType === 'points'}
							class="reward-button"
						>
							<Coins size={16} />

							Points
						</button>

						<button
							type="button"
							onclick={() => (editRewardType = 'balance')}
							class:reward-selected={editRewardType === 'balance'}
							class="reward-button"
						>
							<Banknote size={16} />

							Balance
						</button>
					</div>
				</div>

				<div class="mt-5 grid gap-4 sm:grid-cols-[120px_1fr]">
					<label class="upload-box h-[120px]">
						{#if itemImagePreview ?? editingItem.image_url}
							<img
								src={itemImagePreview ?? editingItem.image_url ?? ''}
								alt=""
								class="max-h-[96px] max-w-[96px] object-contain"
							/>
						{:else}
							<Upload size={20} class="text-white/20" />
						{/if}

						<input
							type="file"
							name="image"
							accept="image/png,image/jpeg,image/webp,image/gif"
							onchange={(event) => previewFile(event, 'item')}
							class="hidden"
						/>
					</label>

					<div class="space-y-4">
						<div>
							<label for="edit-item-name" class="field-label"> Name </label>

							<input
								id="edit-item-name"
								name="name"
								required
								value={editingItem.name}
								class="field-input"
							/>
						</div>

						<div>
							<label for="edit-item-description" class="field-label"> Beschreibung </label>

							<input
								id="edit-item-description"
								name="description"
								value={editingItem.description ?? ''}
								class="field-input"
							/>
						</div>
					</div>
				</div>

				{#if editRewardType === 'points'}
					<div class="mt-4">
						<label for="edit-reward-points" class="field-label"> Points Gewinn </label>

						<input
							id="edit-reward-points"
							name="reward_amount"
							type="number"
							min="1"
							step="1"
							required
							value={editingItem.reward_type === 'points' ? (editingItem.reward_amount ?? '') : ''}
							class="field-input"
						/>
					</div>
				{:else if editRewardType === 'balance'}
					<div class="mt-4">
						<label for="edit-reward-balance" class="field-label"> Balance Gewinn € </label>

						<input
							id="edit-reward-balance"
							name="reward_amount"
							type="number"
							min="0.01"
							step="0.01"
							required
							value={editingItem.reward_type === 'balance' ? (editingItem.reward_amount ?? '') : ''}
							class="field-input"
						/>
					</div>
				{:else}
					<div class="mt-4">
						<label for="edit-item-value" class="field-label"> Ungefährer Sachwert € </label>

						<input
							id="edit-item-value"
							name="value"
							type="number"
							min="0"
							step="0.01"
							value={editingItem.value ?? ''}
							class="field-input"
						/>
					</div>
				{/if}

				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<div>
						<label for="edit-chance" class="field-label"> Chance % </label>

						<input
							id="edit-chance"
							name="chance"
							type="number"
							min="0.00001"
							max="100"
							step="0.00001"
							required
							value={editingItem.chance}
							class="field-input"
						/>
					</div>

					<div>
						<label for="edit-rarity" class="field-label"> Seltenheit </label>

						<select id="edit-rarity" name="rarity" class="field-input" value={editingItem.rarity}>
							{#each rarities as rarity}
								<option value={rarity.value}>
									{rarity.label}
								</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="modal-actions">
					<button type="button" onclick={closeModals} class="secondary-button"> Abbrechen </button>

					<button type="submit" class="primary-button">
						<Save size={13} />

						Speichern
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- DELETE CASE -->

{#if deleteCaseTarget}
	<div class="modal-backdrop">
		<div class="modal max-w-[430px] p-5">
			<div
				class="flex h-10 w-10 items-center justify-center border border-red-400/15 bg-red-400/[0.04] text-red-300"
			>
				<Trash2 size={17} />
			</div>

			<h3 class="mt-4 text-[17px] font-bold text-white">Case wirklich löschen?</h3>

			<p class="mt-2 text-[12px] leading-5 text-white/35">
				Das Case
				<strong class="text-white/65">
					{deleteCaseTarget.name}
				</strong>
				und alle Drops werden dauerhaft entfernt.
			</p>

			<form method="POST" action="?/deleteCase" use:enhance class="modal-actions">
				<input type="hidden" name="case_id" value={deleteCaseTarget.id} />

				<button type="button" onclick={() => (deleteCaseTarget = null)} class="secondary-button">
					Abbrechen
				</button>

				<button type="submit" class="danger-button"> Endgültig löschen </button>
			</form>
		</div>
	</div>
{/if}

<!-- DELETE DROP -->

{#if deleteItemTarget}
	<div class="modal-backdrop">
		<div class="modal max-w-[430px] p-5">
			<div
				class="flex h-10 w-10 items-center justify-center border border-red-400/15 bg-red-400/[0.04] text-red-300"
			>
				<Trash2 size={17} />
			</div>

			<h3 class="mt-4 text-[17px] font-bold text-white">Drop löschen?</h3>

			<p class="mt-2 text-[12px] leading-5 text-white/35">
				<strong class="text-white/65">
					{deleteItemTarget.name}
				</strong>
				wird aus dem Case entfernt.
			</p>

			<form method="POST" action="?/deleteItem" use:enhance class="modal-actions">
				<input type="hidden" name="item_id" value={deleteItemTarget.id} />

				<button type="button" onclick={() => (deleteItemTarget = null)} class="secondary-button">
					Abbrechen
				</button>

				<button type="submit" class="danger-button"> Drop löschen </button>
			</form>
		</div>
	</div>
{/if}

<style>
	:global(.field-label) {
		display: block;
		margin-bottom: 6px;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.25);
	}

	:global(.field-input) {
		width: 100%;
		min-height: 42px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: #090c10;
		padding: 0 12px;
		font-size: 12px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.82);
		outline: none;
		transition:
			border-color 160ms ease,
			background 160ms ease;
	}

	:global(textarea.field-input) {
		padding-top: 10px;
		padding-bottom: 10px;
	}

	:global(.field-input:focus) {
		border-color: rgba(141, 199, 255, 0.3);
		background: #0b0f14;
	}

	:global(.field-input::placeholder) {
		color: rgba(255, 255, 255, 0.18);
	}

	:global(select.field-input) {
		cursor: pointer;
	}

	:global(select.field-input option) {
		background: #0d1015;
		color: white;
	}

	:global(.stat-label) {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.22);
	}

	:global(.stat-value) {
		margin-top: 6px;
		font-size: 20px;
		font-weight: 800;
		color: white;
	}

	:global(.table-label) {
		font-size: 8px;
		font-weight: 700;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.2);
	}

	:global(.table-value) {
		margin-top: 2px;
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.55);
	}

	:global(.modal-backdrop) {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: rgba(0, 0, 0, 0.82);
		backdrop-filter: blur(6px);
	}

	:global(.modal) {
		position: relative;
		z-index: 10;
		width: 100%;
		max-width: 620px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: #0d1015;
		box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
	}

	:global(.modal-header) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	:global(.modal-kicker) {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #8dc7ff;
	}

	:global(.modal-title) {
		margin-top: 4px;
		font-size: 16px;
		font-weight: 700;
		color: white;
	}

	:global(.modal-actions) {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	:global(.primary-button) {
		display: flex;
		height: 40px;
		cursor: pointer;
		align-items: center;
		gap: 8px;
		border: 0;
		background: white;
		padding: 0 16px;
		font-size: 11px;
		font-weight: 800;
		color: black;
	}

	:global(.secondary-button) {
		height: 40px;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: transparent;
		padding: 0 16px;
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.4);
	}

	:global(.danger-button) {
		height: 40px;
		cursor: pointer;
		border: 1px solid rgba(248, 113, 113, 0.2);
		background: rgba(248, 113, 113, 0.07);
		padding: 0 16px;
		font-size: 11px;
		font-weight: 700;
		color: rgb(252, 165, 165);
	}

	:global(.icon-button) {
		display: flex;
		height: 32px;
		width: 32px;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: rgba(255, 255, 255, 0.02);
		color: rgba(255, 255, 255, 0.3);
	}

	:global(.icon-button:disabled) {
		cursor: not-allowed;
		opacity: 0.25;
	}

	:global(.delete-button) {
		display: flex;
		height: 32px;
		width: 32px;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(248, 113, 113, 0.1);
		background: rgba(248, 113, 113, 0.02);
		color: rgba(252, 165, 165, 0.4);
	}

	:global(.delete-button:disabled) {
		cursor: not-allowed;
		opacity: 0.25;
	}

	:global(.upload-box) {
		display: flex;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border: 1px dashed rgba(255, 255, 255, 0.09);
		background: #090c10;
		transition: border-color 160ms ease;
	}

	:global(.upload-box:hover) {
		border-color: rgba(141, 199, 255, 0.3);
	}

	:global(.reward-button) {
		display: flex;
		min-height: 58px;
		cursor: pointer;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 5px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: #090c10;
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.35);
		transition:
			background 150ms ease,
			border-color 150ms ease,
			color 150ms ease;
	}

	:global(.reward-button:hover) {
		border-color: rgba(141, 199, 255, 0.18);
		color: rgba(255, 255, 255, 0.7);
	}

	:global(.reward-button.reward-selected) {
		border-color: rgba(141, 199, 255, 0.35);
		background: rgba(141, 199, 255, 0.07);
		color: #a9d4ff;
	}
</style>
