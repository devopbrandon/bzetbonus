<script lang="ts">
	import {
		AlertTriangle,
		CalendarDays,
		Check,
		ChevronDown,
		ChevronUp,
		Clock3,
		Crown,
		Edit3,
		Gift,
		Plus,
		Save,
		Sparkles,
		Trash2,
		Trophy,
		UserRound,
		Users,
		X
	} from 'lucide-svelte';

	let { data, form } = $props();

	let startDateTime = $state('');
	let endDateTime = $state('');

	let startIsoInput: HTMLInputElement;
	let endIsoInput: HTMLInputElement;

	let expandedId = $state<string | null>(null);
	let editId = $state<string | null>(null);

	let deleteTarget = $state<any | null>(null);
	let removeParticipantTarget = $state<any | null>(null);
	let drawWinnerTarget = $state<any | null>(null);

	function prepareCreateForm() {
		if (startDateTime && startIsoInput) {
			startIsoInput.value = new Date(startDateTime).toISOString();
		}

		if (endDateTime && endIsoInput) {
			endIsoInput.value = new Date(endDateTime).toISOString();
		}
	}

	function prepareEditForm(event: SubmitEvent) {
		const formElement = event.currentTarget as HTMLFormElement;

		const startInput = formElement.querySelector(
			'input[data-edit-start]'
		) as HTMLInputElement | null;

		const endInput = formElement.querySelector('input[data-edit-end]') as HTMLInputElement | null;

		const startHidden = formElement.querySelector(
			'input[name="start_at_iso"]'
		) as HTMLInputElement | null;

		const endHidden = formElement.querySelector(
			'input[name="end_at_iso"]'
		) as HTMLInputElement | null;

		if (startInput?.value && startHidden) {
			startHidden.value = new Date(startInput.value).toISOString();
		}

		if (endInput?.value && endHidden) {
			endHidden.value = new Date(endInput.value).toISOString();
		}
	}

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

	function toDateTimeLocal(value: string | null | undefined) {
		if (!value) return '';

		const parts = new Intl.DateTimeFormat('en-CA', {
			timeZone: 'Europe/Berlin',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23'
		}).formatToParts(new Date(value));

		const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

		return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
	}

	function profileName(profile: any) {
		return profile?.username ?? profile?.email ?? 'Unbekannt';
	}

	function getStatus(verlosung: any) {
		const now = Date.now();

		const start = new Date(verlosung.start_at).getTime();

		const end = new Date(verlosung.end_at).getTime();

		if (now < start) {
			return {
				label: 'Geplant',
				classes: 'border-sky-400/15 bg-sky-400/[0.08] text-sky-300'
			};
		}

		if (now <= end) {
			return {
				label: 'Aktiv',
				classes: 'border-[#8dc7ff]/20 bg-[#8dc7ff]/[0.08] text-[#b8dcff]'
			};
		}

		if ((verlosung.winners?.length ?? 0) < verlosung.max_winners) {
			return {
				label: 'Ziehung offen',
				classes: 'border-amber-400/15 bg-amber-400/[0.08] text-amber-300'
			};
		}

		return {
			label: 'Beendet',
			classes: 'border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300'
		};
	}

	function canDraw(verlosung: any) {
		return (
			Date.now() >= new Date(verlosung.end_at).getTime() &&
			(verlosung.participants?.length ?? 0) > 0 &&
			(verlosung.winners?.length ?? 0) < verlosung.max_winners
		);
	}

	function isWinner(verlosung: any, userId: string) {
		return verlosung.winners?.some((winner: any) => winner.user_id === userId);
	}

	function toggleParticipants(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	function toggleEdit(id: string) {
		editId = editId === id ? null : id;
	}

	function closeModals() {
		deleteTarget = null;
		removeParticipantTarget = null;
		drawWinnerTarget = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModals();
		}
	}
</script>

<svelte:head>
	<title>Verlosungen | BZETBONUS</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10">
	<!-- HEADER -->
	<div
		class="mb-8 flex flex-col gap-5 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-end lg:justify-between"
	>
		<div>
			<div
				class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35"
			>
				<Gift size={14} />
				Community
			</div>

			<h1 class="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">Verlosungen</h1>

			<p class="mt-2 max-w-2xl text-sm leading-6 text-white/45">
				Verwalte Community-Verlosungen, Teilnehmer und Gewinner.
			</p>
		</div>

		<div
			class="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-xs text-white/45"
		>
			<Clock3 size={15} class="text-[#8dc7ff]" />

			Zeitzone:

			<span class="font-semibold text-white/75"> Europe/Berlin </span>
		</div>
	</div>

	<!-- MESSAGE -->
	{#if form?.message}
		<div
			class={[
				'mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm',
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

	<div class="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
		<!-- CREATE -->
		<section
			class="h-fit overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] xl:sticky xl:top-6"
		>
			<div class="border-b border-white/[0.06] px-5 py-5">
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 items-center justify-center rounded-xl border border-[#8dc7ff]/15 bg-[#8dc7ff]/[0.07] text-[#b8dcff]"
					>
						<Plus size={19} />
					</div>

					<div>
						<h2 class="font-bold text-white">Neue Verlosung</h2>

						<p class="mt-0.5 text-xs text-white/35">Community-Verlosung anlegen</p>
					</div>
				</div>
			</div>

			<form method="POST" action="?/create" onsubmit={prepareCreateForm} class="space-y-5 p-5">
				<div>
					<label for="title" class="mb-2 block text-xs font-semibold text-white/55"> Titel </label>

					<input
						id="title"
						name="title"
						type="text"
						required
						placeholder="500 € Monatsverlosung"
						class="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 px-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#8dc7ff]/35"
					/>
				</div>

				<div>
					<label for="prize" class="mb-2 block text-xs font-semibold text-white/55"> Preis </label>

					<input
						id="prize"
						name="prize"
						type="text"
						required
						placeholder="500 €"
						class="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 px-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#8dc7ff]/35"
					/>
				</div>

				<div>
					<label for="description" class="mb-2 block text-xs font-semibold text-white/55">
						Beschreibung
					</label>

					<textarea
						id="description"
						name="description"
						rows="4"
						placeholder="Beschreibe die Verlosung..."
						class="w-full resize-none rounded-xl border border-white/[0.08] bg-black/15 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-[#8dc7ff]/35"
					></textarea>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
					<div>
						<label for="start" class="mb-2 block text-xs font-semibold text-white/55">
							Start
						</label>

						<input
							id="start"
							type="datetime-local"
							required
							bind:value={startDateTime}
							class="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 px-3.5 text-sm text-white outline-none transition focus:border-[#8dc7ff]/35"
						/>

						<input bind:this={startIsoInput} type="hidden" name="start_at_iso" />
					</div>

					<div>
						<label for="end" class="mb-2 block text-xs font-semibold text-white/55"> Ende </label>

						<input
							id="end"
							type="datetime-local"
							required
							bind:value={endDateTime}
							class="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 px-3.5 text-sm text-white outline-none transition focus:border-[#8dc7ff]/35"
						/>

						<input bind:this={endIsoInput} type="hidden" name="end_at_iso" />
					</div>
				</div>

				<div>
					<label for="max_winners" class="mb-2 block text-xs font-semibold text-white/55">
						Anzahl Gewinner
					</label>

					<input
						id="max_winners"
						name="max_winners"
						type="number"
						min="1"
						step="1"
						value="1"
						required
						class="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 px-3.5 text-sm text-white outline-none transition focus:border-[#8dc7ff]/35"
					/>

					<p class="mt-2 text-[11px] leading-5 text-white/30">
						Teilnehmer sind unbegrenzt. Hier wird nur festgelegt, wie viele Gewinner gezogen werden.
					</p>
				</div>

				<div class="rounded-xl border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.035] p-3.5">
					<div class="flex gap-2.5 text-xs leading-5 text-white/40">
						<Clock3 size={15} class="mt-0.5 shrink-0 text-[#8dc7ff]/70" />

						<span>
							Zeiten werden korrekt als Europe/Berlin interpretiert und als UTC-Zeitpunkt
							gespeichert.
						</span>
					</div>
				</div>

				<button
					type="submit"
					class="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#101827] transition duration-200 hover:-translate-y-0.5 hover:bg-white/90"
				>
					<Plus size={17} />

					Verlosung erstellen
				</button>
			</form>
		</section>

		<!-- LIST -->
		<section>
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="font-bold text-white">Alle Verlosungen</h2>

					<p class="mt-1 text-xs text-white/35">
						{data.verlosungen.length}
						Verlosungen insgesamt
					</p>
				</div>
			</div>

			{#if data.verlosungen.length === 0}
				<div
					class="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 text-center"
				>
					<div
						class="mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-white/40"
					>
						<Gift size={22} />
					</div>

					<h3 class="font-semibold text-white/80">Noch keine Verlosungen</h3>

					<p class="mt-2 max-w-sm text-sm leading-6 text-white/35">
						Erstelle links deine erste Community-Verlosung.
					</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.verlosungen as verlosung}
						{@const status = getStatus(verlosung)}

						<article
							class="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition duration-200 hover:border-white/[0.1]"
						>
							<div class="p-5 sm:p-6">
								<div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
									<div class="min-w-0 flex-1">
										<div class="mb-3 flex flex-wrap items-center gap-2">
											<span
												class={[
													'rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
													status.classes
												]}
											>
												{status.label}
											</span>

											<div class="flex items-center gap-1.5 text-xs text-white/35">
												<Users size={13} />

												{verlosung.participants.length}
												Teilnehmer
											</div>

											<div class="flex items-center gap-1.5 text-xs text-white/35">
												<Crown size={13} />

												{verlosung.winners.length}
												/
												{verlosung.max_winners}
												Gewinner
											</div>
										</div>

										<h3 class="text-xl font-bold tracking-[-0.02em] text-white">
											{verlosung.title}
										</h3>

										<div class="mt-2 flex items-center gap-2">
											<Trophy size={15} class="text-[#8dc7ff]" />

											<span class="text-sm font-bold text-[#c7e4ff]">
												{verlosung.prize}
											</span>
										</div>

										{#if verlosung.description}
											<p class="mt-4 max-w-3xl text-sm leading-6 text-white/45">
												{verlosung.description}
											</p>
										{/if}
									</div>

									<div class="flex shrink-0 flex-wrap gap-2">
										<button
											type="button"
											onclick={() => toggleEdit(verlosung.id)}
											class={[
												'flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition duration-200',
												editId === verlosung.id
													? 'border-[#8dc7ff]/25 bg-[#8dc7ff]/[0.09] text-[#b8dcff]'
													: 'border-white/[0.08] bg-white/[0.035] text-white/55 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white'
											]}
										>
											{#if editId === verlosung.id}
												<X size={14} />
												Schließen
											{:else}
												<Edit3 size={14} />
												Bearbeiten
											{/if}
										</button>

										<button
											type="button"
											onclick={() => (deleteTarget = verlosung)}
											class="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-red-400/10 bg-red-400/[0.04] px-3 text-xs font-semibold text-red-300/70 transition duration-200 hover:border-red-400/20 hover:bg-red-400/[0.08] hover:text-red-200"
										>
											<Trash2 size={14} />
											Löschen
										</button>
									</div>
								</div>

								<div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
									<div class="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
										<div
											class="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/25"
										>
											<CalendarDays size={12} />

											Start
										</div>

										<div class="text-xs font-semibold text-white/65">
											{formatDate(verlosung.start_at)}
										</div>
									</div>

									<div class="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
										<div
											class="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/25"
										>
											<Clock3 size={12} />

											Ende
										</div>

										<div class="text-xs font-semibold text-white/65">
											{formatDate(verlosung.end_at)}
										</div>
									</div>

									<div class="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
										<div
											class="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/25"
										>
											Erstellt von
										</div>

										<div class="truncate text-xs font-semibold text-white/65">
											{profileName(verlosung.createdByProfile)}
										</div>

										<div class="mt-1 text-[10px] text-white/25">
											{formatDate(verlosung.created_at)}
										</div>
									</div>

									<div class="rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
										<div
											class="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/25"
										>
											Zuletzt bearbeitet
										</div>

										<div class="truncate text-xs font-semibold text-white/65">
											{profileName(verlosung.updatedByProfile)}
										</div>

										<div class="mt-1 text-[10px] text-white/25">
											{formatDate(verlosung.updated_at)}
										</div>
									</div>
								</div>

								<!-- WINNERS -->
								{#if verlosung.winners.length > 0}
									<div
										class="mt-4 overflow-hidden rounded-xl border border-emerald-400/10 bg-emerald-400/[0.025]"
									>
										<div
											class="flex items-center justify-between border-b border-emerald-400/[0.08] px-4 py-3"
										>
											<div class="flex items-center gap-2">
												<Crown size={15} class="text-emerald-300" />

												<span class="text-xs font-bold text-emerald-100/80">
													Gezogene Gewinner
												</span>
											</div>

											<span class="text-[10px] font-bold text-emerald-200/40">
												{verlosung.winners.length}
												/
												{verlosung.max_winners}
											</span>
										</div>

										<div class="divide-y divide-emerald-400/[0.06]">
											{#each verlosung.winners as winner}
												<div
													class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
												>
													<div class="flex items-center gap-3">
														<div
															class="flex size-8 items-center justify-center rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] text-xs font-black text-emerald-200"
														>
															#{winner.position}
														</div>

														<div>
															<div class="text-sm font-bold text-emerald-100">
																{profileName(winner.profile)}
															</div>

															<div class="mt-0.5 text-[10px] text-white/25">
																Gezogen:
																{formatDate(winner.drawn_at)}
															</div>
														</div>
													</div>

													<div class="text-[10px] text-white/25 sm:text-right">
														Gezogen von

														<div class="mt-0.5 font-semibold text-white/45">
															{profileName(winner.drawnByProfile)}
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<div class="mt-4 flex flex-wrap items-center gap-2">
									<button
										type="button"
										onclick={() => toggleParticipants(verlosung.id)}
										class={[
											'flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition duration-200',
											expandedId === verlosung.id
												? 'border-[#8dc7ff]/20 bg-[#8dc7ff]/[0.07] text-[#b8dcff]'
												: 'border-white/[0.07] bg-white/[0.025] text-white/50 hover:bg-white/[0.045] hover:text-white'
										]}
									>
										<Users size={14} />

										Teilnehmer

										<span class="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px]">
											{verlosung.participants.length}
										</span>

										{#if expandedId === verlosung.id}
											<ChevronUp size={13} />
										{:else}
											<ChevronDown size={13} />
										{/if}
									</button>

									{#if canDraw(verlosung)}
										<button
											type="button"
											onclick={() => (drawWinnerTarget = verlosung)}
											class="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-amber-300/15 bg-amber-300/[0.07] px-3 text-xs font-bold text-amber-200 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-300/[0.11]"
										>
											<Sparkles size={14} />

											Gewinner
											{verlosung.winners.length + 1}
											/{verlosung.max_winners}
											ziehen
										</button>
									{/if}
								</div>
							</div>

							<!-- EDIT -->
							{#if editId === verlosung.id}
								<div class="border-t border-white/[0.06] bg-black/15 p-5 sm:p-6">
									<div class="mb-5 flex items-center gap-3">
										<div
											class="flex size-8 items-center justify-center rounded-lg border border-[#8dc7ff]/15 bg-[#8dc7ff]/[0.07] text-[#8dc7ff]"
										>
											<Edit3 size={14} />
										</div>

										<div>
											<h4 class="text-sm font-bold text-white/80">Verlosung bearbeiten</h4>

											<p class="mt-0.5 text-[11px] text-white/30">
												Änderungen werden dem bearbeitenden Teammitglied zugeordnet.
											</p>
										</div>
									</div>

									<form
										method="POST"
										action="?/update"
										onsubmit={prepareEditForm}
										class="grid gap-4 lg:grid-cols-2"
									>
										<input type="hidden" name="id" value={verlosung.id} />

										<div>
											<label class="mb-2 block text-xs font-semibold text-white/45"> Titel </label>

											<input
												name="title"
												type="text"
												value={verlosung.title}
												required
												class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/15 px-3 text-sm text-white outline-none transition focus:border-[#8dc7ff]/30"
											/>
										</div>

										<div>
											<label class="mb-2 block text-xs font-semibold text-white/45"> Preis </label>

											<input
												name="prize"
												type="text"
												value={verlosung.prize}
												required
												class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/15 px-3 text-sm text-white outline-none transition focus:border-[#8dc7ff]/30"
											/>
										</div>

										<div class="lg:col-span-2">
											<label class="mb-2 block text-xs font-semibold text-white/45">
												Beschreibung
											</label>

											<textarea
												name="description"
												rows="3"
												class="w-full resize-none rounded-lg border border-white/[0.07] bg-black/15 px-3 py-2.5 text-sm leading-6 text-white outline-none transition focus:border-[#8dc7ff]/30"
												>{verlosung.description ?? ''}</textarea
											>
										</div>

										<div>
											<label class="mb-2 block text-xs font-semibold text-white/45"> Start </label>

											<input
												data-edit-start
												type="datetime-local"
												value={toDateTimeLocal(verlosung.start_at)}
												required
												class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/15 px-3 text-sm text-white outline-none transition focus:border-[#8dc7ff]/30"
											/>

											<input type="hidden" name="start_at_iso" value={verlosung.start_at} />
										</div>

										<div>
											<label class="mb-2 block text-xs font-semibold text-white/45"> Ende </label>

											<input
												data-edit-end
												type="datetime-local"
												value={toDateTimeLocal(verlosung.end_at)}
												required
												class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/15 px-3 text-sm text-white outline-none transition focus:border-[#8dc7ff]/30"
											/>

											<input type="hidden" name="end_at_iso" value={verlosung.end_at} />
										</div>

										<div>
											<label class="mb-2 block text-xs font-semibold text-white/45">
												Anzahl Gewinner
											</label>

											<input
												name="max_winners"
												type="number"
												min="1"
												step="1"
												value={verlosung.max_winners}
												required
												class="h-10 w-full rounded-lg border border-white/[0.07] bg-black/15 px-3 text-sm text-white outline-none transition focus:border-[#8dc7ff]/30"
											/>

											{#if verlosung.winners.length > 0}
												<p class="mt-2 text-[10px] text-white/25">
													Bereits
													{verlosung.winners.length}
													Gewinner gezogen.
												</p>
											{/if}
										</div>

										<div class="flex items-end gap-2">
											<button
												type="submit"
												class="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-4 text-xs font-bold text-black transition duration-200 hover:bg-white/90"
											>
												<Save size={14} />

												Änderungen speichern
											</button>

											<button
												type="button"
												onclick={() => (editId = null)}
												class="flex h-10 cursor-pointer items-center rounded-lg border border-white/[0.07] px-4 text-xs font-semibold text-white/45 transition hover:bg-white/[0.04] hover:text-white"
											>
												Abbrechen
											</button>
										</div>
									</form>
								</div>
							{/if}

							<!-- PARTICIPANTS -->
							{#if expandedId === verlosung.id}
								<div class="border-t border-white/[0.06] bg-black/10">
									<div
										class="flex items-center justify-between border-b border-white/[0.05] px-5 py-4 sm:px-6"
									>
										<div>
											<h4 class="text-sm font-bold text-white/75">Teilnehmer</h4>

											<p class="mt-0.5 text-[11px] text-white/30">
												{verlosung.participants.length}
												Teilnehmer insgesamt · kein Limit
											</p>
										</div>
									</div>

									{#if verlosung.participants.length === 0}
										<div class="flex flex-col items-center justify-center px-5 py-10 text-center">
											<div
												class="mb-3 flex size-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/25"
											>
												<Users size={16} />
											</div>

											<div class="text-sm font-semibold text-white/45">Noch keine Teilnehmer</div>

											<p class="mt-1 text-xs text-white/25">
												Sobald Nutzer teilnehmen, erscheinen sie hier.
											</p>
										</div>
									{:else}
										<div class="divide-y divide-white/[0.05]">
											{#each verlosung.participants as participant, index}
												{@const participantIsWinner = isWinner(verlosung, participant.user_id)}

												<div
													class="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-white/[0.015] sm:px-6"
												>
													<div class="flex min-w-0 items-center gap-3">
														{#if participant.profile?.avatar_url}
															<img
																src={participant.profile.avatar_url}
																alt=""
																class="size-9 shrink-0 rounded-full border border-white/[0.07] object-cover"
															/>
														{:else}
															<div
																class="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/30"
															>
																<UserRound size={15} />
															</div>
														{/if}

														<div class="min-w-0">
															<div class="flex flex-wrap items-center gap-2">
																<span class="text-[10px] font-bold text-white/20">
																	#{index + 1}
																</span>

																<span class="truncate text-sm font-semibold text-white/70">
																	{profileName(participant.profile)}
																</span>

																{#if participantIsWinner}
																	<span
																		class="flex items-center gap-1 rounded-md border border-emerald-400/10 bg-emerald-400/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-300"
																	>
																		<Crown size={9} />
																		Gewinner
																	</span>
																{/if}
															</div>

															<div class="mt-1 text-[10px] text-white/25">
																Teilnahme:
																{formatDate(participant.created_at)}
															</div>
														</div>
													</div>

													{#if !participantIsWinner}
														<button
															type="button"
															title="Teilnehmer entfernen"
															onclick={() =>
																(removeParticipantTarget = {
																	...participant,
																	verlosungTitle: verlosung.title
																})}
															class="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-red-400/10 bg-red-400/[0.04] text-red-300/55 transition hover:border-red-400/20 hover:bg-red-400/[0.08] hover:text-red-200"
														>
															<X size={14} />
														</button>
													{/if}
												</div>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</div>

<!-- DELETE MODAL -->
{#if deleteTarget}
	<div
		role="presentation"
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[6px]"
		onclick={(event) => {
			if (event.target === event.currentTarget) {
				deleteTarget = null;
			}
		}}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="delete-title"
			class="w-full max-w-md overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#0d1015] shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
		>
			<div class="p-6">
				<div
					class="mb-5 flex size-11 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.07] text-red-300"
				>
					<Trash2 size={19} />
				</div>

				<h3 id="delete-title" class="text-xl font-bold tracking-[-0.025em] text-white">
					Verlosung löschen?
				</h3>

				<p class="mt-2 text-sm leading-6 text-white/40">
					Die Verlosung

					<span class="font-semibold text-white/70">
						„{deleteTarget.title}“
					</span>

					wird dauerhaft gelöscht.
				</p>

				<div class="mt-5 flex gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.035] p-3.5">
					<AlertTriangle size={17} class="mt-0.5 shrink-0 text-red-300/70" />

					<p class="text-xs leading-5 text-red-100/50">
						Alle Teilnehmer und bereits gezogenen Gewinner dieser Verlosung werden ebenfalls
						gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
					</p>
				</div>
			</div>

			<div
				class="flex items-center justify-end gap-2 border-t border-white/[0.06] bg-black/15 px-6 py-4"
			>
				<button
					type="button"
					onclick={() => (deleteTarget = null)}
					class="h-10 cursor-pointer rounded-lg border border-white/[0.07] px-4 text-xs font-semibold text-white/50 transition hover:bg-white/[0.04] hover:text-white"
				>
					Abbrechen
				</button>

				<form method="POST" action="?/delete">
					<input type="hidden" name="id" value={deleteTarget.id} />

					<button
						type="submit"
						class="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-4 text-xs font-bold text-white transition hover:bg-red-400"
					>
						<Trash2 size={14} />

						Endgültig löschen
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- REMOVE PARTICIPANT -->
{#if removeParticipantTarget}
	<div
		role="presentation"
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[6px]"
		onclick={(event) => {
			if (event.target === event.currentTarget) {
				removeParticipantTarget = null;
			}
		}}
	>
		<div
			role="dialog"
			aria-modal="true"
			class="w-full max-w-md overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#0d1015] shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
		>
			<div class="p-6">
				<div
					class="mb-5 flex size-11 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.07] text-red-300"
				>
					<UserRound size={19} />
				</div>

				<h3 class="text-xl font-bold tracking-[-0.025em] text-white">Teilnehmer entfernen?</h3>

				<p class="mt-2 text-sm leading-6 text-white/40">
					<span class="font-semibold text-white/75">
						{profileName(removeParticipantTarget.profile)}
					</span>

					wird aus

					<span class="font-semibold text-white/75">
						„{removeParticipantTarget.verlosungTitle}“
					</span>

					entfernt und kann anschließend nicht mehr gezogen werden.
				</p>
			</div>

			<div
				class="flex items-center justify-end gap-2 border-t border-white/[0.06] bg-black/15 px-6 py-4"
			>
				<button
					type="button"
					onclick={() => (removeParticipantTarget = null)}
					class="h-10 cursor-pointer rounded-lg border border-white/[0.07] px-4 text-xs font-semibold text-white/50 transition hover:bg-white/[0.04] hover:text-white"
				>
					Abbrechen
				</button>

				<form method="POST" action="?/removeParticipant">
					<input type="hidden" name="participant_id" value={removeParticipantTarget.id} />

					<button
						type="submit"
						class="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-red-500 px-4 text-xs font-bold text-white transition hover:bg-red-400"
					>
						<X size={14} />

						Entfernen
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- DRAW WINNER -->
{#if drawWinnerTarget}
	<div
		role="presentation"
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-[6px]"
		onclick={(event) => {
			if (event.target === event.currentTarget) {
				drawWinnerTarget = null;
			}
		}}
	>
		<div
			role="dialog"
			aria-modal="true"
			class="w-full max-w-md overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#0d1015] shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
		>
			<div class="p-6">
				<div
					class="mb-5 flex size-11 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/[0.07] text-amber-200"
				>
					<Sparkles size={19} />
				</div>

				<div class="mb-3 flex items-center gap-2">
					<span
						class="rounded-lg border border-amber-300/10 bg-amber-300/[0.05] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-200/70"
					>
						Gewinner
						{drawWinnerTarget.winners.length + 1}
						/
						{drawWinnerTarget.max_winners}
					</span>
				</div>

				<h3 class="text-xl font-bold tracking-[-0.025em] text-white">Gewinner ziehen</h3>

				<p class="mt-2 text-sm leading-6 text-white/40">
					Aus

					<span class="font-semibold text-white/75">
						{drawWinnerTarget.participants.length}
						Teilnehmern
					</span>

					wird zufällig der nächste Gewinner für

					<span class="font-semibold text-white/75">
						„{drawWinnerTarget.title}“
					</span>

					gezogen.
				</p>

				{#if drawWinnerTarget.winners.length > 0}
					<div class="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
						<div class="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/25">
							Bereits gezogen
						</div>

						<div class="flex flex-wrap gap-2">
							{#each drawWinnerTarget.winners as winner}
								<span
									class="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1 text-[10px] font-semibold text-emerald-200/70"
								>
									#{winner.position}
									{profileName(winner.profile)}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<div
					class="mt-5 rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-3.5 text-xs leading-5 text-amber-100/45"
				>
					Bereits gezogene Gewinner werden automatisch von weiteren Ziehungen ausgeschlossen.
				</div>
			</div>

			<div
				class="flex items-center justify-end gap-2 border-t border-white/[0.06] bg-black/15 px-6 py-4"
			>
				<button
					type="button"
					onclick={() => (drawWinnerTarget = null)}
					class="h-10 cursor-pointer rounded-lg border border-white/[0.07] px-4 text-xs font-semibold text-white/50 transition hover:bg-white/[0.04] hover:text-white"
				>
					Abbrechen
				</button>

				<form method="POST" action="?/drawWinner">
					<input type="hidden" name="verlosung_id" value={drawWinnerTarget.id} />

					<button
						type="submit"
						class="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-4 text-xs font-bold text-black transition hover:bg-white/90"
					>
						<Sparkles size={14} />

						Gewinner
						{drawWinnerTarget.winners.length + 1}
						ziehen
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
