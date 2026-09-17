<script lang="ts">
	import { enhance } from '$app/forms';

	import {
		Banknote,
		Building2,
		Check,
		CheckCircle2,
		Clock3,
		FileImage,
		Info,
		LoaderCircle,
		Mail,
		ShieldCheck,
		Upload,
		WalletCards,
		X,
		XCircle
	} from 'lucide-svelte';

	let { data, form } = $props();

	let amount = $state<number | undefined>();
	let fileName = $state('');
	let submitting = $state(false);

	const minimumPayout = 30;

	const money = new Intl.NumberFormat('de-DE', {
		style: 'currency',
		currency: 'EUR'
	});

	function setMaxAmount() {
		if (data.balance < minimumPayout) return;

		amount = Math.floor(data.balance * 100) / 100;
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

	function statusText(status: string) {
		switch (status) {
			case 'paid':
				return 'Ausgezahlt';

			case 'cancelled':
				return 'Storniert';

			default:
				return 'In Prüfung';
		}
	}
</script>

<svelte:head>
	<title>Auszahlen | BZETBONUS.COM</title>

	<meta name="description" content="Beantrage die Auszahlung deiner BZETBONUS Balance." />
</svelte:head>

<div class="relative min-h-screen overflow-hidden bg-[#070b10] text-white">
	<!-- Background -->
	<div
		class="pointer-events-none absolute left-[18%] top-[-300px] h-[650px] w-[650px] rounded-full bg-sky-500/[0.04] blur-[130px]"
	></div>

	<div
		class="pointer-events-none absolute right-[-300px] top-[250px] h-[600px] w-[600px] rounded-full bg-blue-500/[0.03] blur-[120px]"
	></div>

	<div class="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
		<!-- HEADER -->
		<div class="mb-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div class="max-w-2xl">
				<div
					class="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-400"
				>
					<WalletCards size={14} strokeWidth={2.2} />
					Auszahlung
				</div>

				<h1
					class="text-[38px] font-black leading-[0.98] tracking-[-0.045em] text-white sm:text-[48px] lg:text-[56px]"
				>
					Deine Gewinne
					<span class="text-sky-300">auszahlen.</span>
				</h1>

				<p class="mt-4 max-w-xl text-sm leading-6 text-zinc-500">
					Wähle das Casino aus, gib die dort registrierte E-Mail-Adresse an und lade einen
					Screenshot als Nachweis hoch.
				</p>
			</div>

			<!-- BALANCE -->
			<div
				class="flex min-w-[230px] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0f151d] p-4 shadow-2xl shadow-black/20"
			>
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-400/10 bg-sky-400/[0.06] text-sky-300"
				>
					<Banknote size={21} />
				</div>

				<div class="flex flex-col">
					<span class="text-[10px] font-medium text-zinc-500"> Deine Balance </span>

					<strong class="text-xl font-extrabold tracking-tight text-white">
						{money.format(data.balance)}
					</strong>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
			<!-- ====================================================== -->
			<!-- AUSZAHLUNGSFORMULAR -->
			<!-- ====================================================== -->

			<section
				class="rounded-2xl border border-white/[0.07] bg-[#0d1219] shadow-2xl shadow-black/20"
			>
				<div class="flex items-center gap-3 border-b border-white/[0.05] px-5 py-4 sm:px-6">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/10 bg-sky-400/[0.06] text-sky-300"
					>
						<Banknote size={17} />
					</div>

					<div>
						<span class="block text-[9px] font-extrabold uppercase tracking-[0.15em] text-sky-400">
							Auszahlung anfragen
						</span>

						<h2 class="mt-0.5 text-sm font-bold text-zinc-100">Auszahlungsdetails</h2>
					</div>
				</div>

				<div class="p-5 sm:p-6">
					{#if data.balance < minimumPayout}
						<div
							class="mb-6 flex gap-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.04] p-4"
						>
							<Info size={18} class="mt-0.5 shrink-0 text-amber-400" />

							<div>
								<p class="text-xs font-bold text-amber-300">
									Mindestens
									{money.format(minimumPayout)}
								</p>

								<p class="mt-1 text-[11px] leading-5 text-amber-200/40">
									Dir fehlen noch
									{money.format(Math.max(0, minimumPayout - data.balance))}, um eine Auszahlung
									anzufragen.
								</p>
							</div>
						</div>
					{/if}

					<!-- ACTION MESSAGE -->
					{#if form?.message}
						<div
							class={[
								'mb-6 flex items-start gap-3 rounded-xl border p-4 text-xs',
								form?.success
									? 'border-emerald-400/10 bg-emerald-400/[0.04] text-emerald-300'
									: 'border-red-400/10 bg-red-400/[0.04] text-red-300'
							]}
						>
							{#if form?.success}
								<CheckCircle2 size={17} class="mt-0.5 shrink-0" />
							{:else}
								<XCircle size={17} class="mt-0.5 shrink-0" />
							{/if}

							<span class="leading-5">
								{form.message}
							</span>
						</div>
					{/if}

					<form
						method="POST"
						enctype="multipart/form-data"
						use:enhance={() => {
							submitting = true;

							return async ({ update }) => {
								await update({
									reset: false
								});

								submitting = false;
							};
						}}
						class="space-y-5"
					>
						<!-- CASINO -->
						<div>
							<label
								for="deal_id"
								class="mb-2 flex items-center gap-2 text-[11px] font-semibold text-zinc-400"
							>
								<Building2 size={14} class="text-zinc-500" />
								Casino
							</label>

							<select
								id="deal_id"
								name="deal_id"
								required
								disabled={submitting}
								class="h-12 w-full cursor-pointer appearance-none rounded-lg border border-white/[0.07] bg-[#080d13] px-3 text-xs font-medium text-zinc-200 outline-none transition hover:border-white/10 focus:border-sky-400/30 focus:ring-2 focus:ring-sky-400/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value=""> Casino auswählen </option>

								{#each data.deals as deal}
									<option value={deal.id}>
										{deal.brand}
									</option>
								{/each}
							</select>

							<p class="mt-2 text-[10px] text-zinc-600">
								Wähle das Casino aus, bei dem du registriert bist.
							</p>
						</div>

						<!-- EMAIL -->
						<div>
							<label
								for="casino_email"
								class="mb-2 flex items-center gap-2 text-[11px] font-semibold text-zinc-400"
							>
								<Mail size={14} class="text-zinc-500" />
								Registrierte Casino-E-Mail
							</label>

							<input
								id="casino_email"
								name="casino_email"
								type="email"
								required
								autocomplete="email"
								placeholder="name@beispiel.de"
								disabled={submitting}
								class="h-12 w-full rounded-lg border border-white/[0.07] bg-[#080d13] px-3 text-xs font-medium text-zinc-200 outline-none transition placeholder:text-zinc-700 hover:border-white/10 focus:border-sky-400/30 focus:ring-2 focus:ring-sky-400/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
							/>

							<p class="mt-2 text-[10px] text-zinc-600">
								Die E-Mail muss mit deinem Casino-Account übereinstimmen.
							</p>
						</div>

						<!-- AMOUNT -->
						<div>
							<div class="mb-2 flex items-center justify-between gap-3">
								<label
									for="amount"
									class="flex items-center gap-2 text-[11px] font-semibold text-zinc-400"
								>
									<Banknote size={14} class="text-zinc-500" />
									Auszahlungsbetrag
								</label>

								<button
									type="button"
									onclick={setMaxAmount}
									disabled={submitting || data.balance < minimumPayout}
									class="text-[10px] font-bold text-sky-400 cursor-pointer transition hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-30"
								>
									Max
								</button>
							</div>

							<div class="relative">
								<input
									id="amount"
									name="amount"
									type="number"
									min={minimumPayout}
									max={data.balance}
									step="0.01"
									required
									bind:value={amount}
									placeholder="30.00"
									disabled={submitting}
									class="h-12 w-full rounded-lg border border-white/[0.07] bg-[#080d13] px-3 pr-12 text-sm font-bold text-zinc-100 outline-none transition placeholder:font-normal placeholder:text-zinc-700 hover:border-white/10 focus:border-sky-400/30 focus:ring-2 focus:ring-sky-400/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
								/>

								<span
									class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-400"
								>
									€
								</span>
							</div>

							<div class="mt-2 flex items-center justify-between gap-4 text-[10px] text-zinc-600">
								<span>
									Minimum:
									<strong class="font-semibold text-zinc-500">
										{money.format(minimumPayout)}
									</strong>
								</span>

								<span>
									Verfügbar:
									<strong class="font-semibold text-zinc-500">
										{money.format(data.balance)}
									</strong>
								</span>
							</div>
						</div>

						<!-- SCREENSHOT -->
						<div>
							<label class="mb-2 flex items-center gap-2 text-[11px] font-semibold text-zinc-400">
								<FileImage size={14} class="text-zinc-500" />
								Screenshot / Nachweis
							</label>

							<label
								class="group flex min-h-[155px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.09] bg-[#080d13] p-5 text-center transition hover:border-sky-400/25 hover:bg-sky-400/[0.015]"
							>
								<input
									name="screenshot"
									type="file"
									accept="image/jpeg,image/png,image/webp"
									required
									disabled={submitting}
									class="hidden"
									onchange={(event) => {
										const input = event.currentTarget as HTMLInputElement;

										fileName = input.files?.[0]?.name ?? '';
									}}
								/>

								<div
									class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-sky-400/10 bg-sky-400/[0.05] text-sky-400 transition group-hover:bg-sky-400/[0.08]"
								>
									{#if fileName}
										<Check size={19} />
									{:else}
										<Upload size={19} />
									{/if}
								</div>

								{#if fileName}
									<strong class="max-w-full truncate text-xs font-bold text-zinc-200">
										{fileName}
									</strong>

									<span class="mt-1 text-[10px] text-zinc-600">
										Klicken, um eine andere Datei auszuwählen
									</span>
								{:else}
									<strong class="text-xs font-bold text-zinc-300"> Screenshot hochladen </strong>

									<span class="mt-1 text-[10px] text-zinc-600"> Klicken und Datei auswählen </span>

									<span class="mt-3 text-[9px] text-zinc-700">
										JPG, PNG oder WebP · maximal 5 MB
									</span>
								{/if}
							</label>
						</div>

						<!-- SUBMIT -->
						<button
							type="submit"
							disabled={submitting || data.balance < minimumPayout}
							class="flex h-12 w-full items-center justify-center cursor-poniter gap-2 rounded-lg border border-sky-400/20 bg-[#163249] text-xs font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-px hover:bg-[#193b57] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
						>
							{#if submitting}
								<LoaderCircle size={17} class="animate-spin" />

								Auszahlung wird angefragt...
							{:else}
								<Banknote size={17} />

								{#if amount && amount >= minimumPayout}
									{money.format(amount)}
									auszahlen
								{:else}
									Auszahlung anfragen
								{/if}
							{/if}
						</button>
					</form>
				</div>
			</section>

			<!-- ====================================================== -->
			<!-- SIDEBAR -->
			<!-- ====================================================== -->

			<div class="space-y-4">
				<!-- HOW IT WORKS -->
				<section
					class="rounded-2xl border border-white/[0.07] bg-[#0d1219] p-5 shadow-2xl shadow-black/20"
				>
					<div class="mb-5 flex items-center gap-3">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/10 bg-sky-400/[0.06] text-sky-300"
						>
							<ShieldCheck size={17} />
						</div>

						<div>
							<span
								class="block text-[9px] font-extrabold uppercase tracking-[0.15em] text-sky-400"
							>
								Ablauf
							</span>

							<h2 class="mt-0.5 text-sm font-bold text-zinc-100">So funktioniert's</h2>
						</div>
					</div>

					<div>
						<div class="flex gap-3">
							<div
								class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-400/[0.06] text-[10px] font-extrabold text-sky-400"
							>
								1
							</div>

							<div>
								<p class="text-[11px] font-bold text-zinc-300">Anfrage erstellen</p>

								<p class="mt-1 text-[10px] leading-5 text-zinc-600">
									Casino auswählen, E-Mail und Screenshot einreichen.
								</p>
							</div>
						</div>

						<div class="ml-[13px] h-5 w-px bg-sky-400/10"></div>

						<div class="flex gap-3">
							<div
								class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-400/[0.06] text-[10px] font-extrabold text-sky-400"
							>
								2
							</div>

							<div>
								<p class="text-[11px] font-bold text-zinc-300">Prüfung durch das Team</p>

								<p class="mt-1 text-[10px] leading-5 text-zinc-600">
									Ein Moderator prüft deine Angaben und den Nachweis.
								</p>
							</div>
						</div>

						<div class="ml-[13px] h-5 w-px bg-sky-400/10"></div>

						<div class="flex gap-3">
							<div
								class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-400/[0.06] text-[10px] font-extrabold text-sky-400"
							>
								3
							</div>

							<div>
								<p class="text-[11px] font-bold text-zinc-300">Auszahlung</p>

								<p class="mt-1 text-[10px] leading-5 text-zinc-600">
									Nach erfolgreicher Prüfung wird die Auszahlung bearbeitet.
								</p>
							</div>
						</div>
					</div>

					<div
						class="mt-5 flex gap-2.5 rounded-lg border border-sky-400/[0.07] bg-sky-400/[0.025] p-3"
					>
						<ShieldCheck size={15} class="mt-0.5 shrink-0 text-sky-400" />

						<p class="text-[9px] leading-4 text-zinc-600">
							Wird eine Anfrage storniert, wird der Betrag automatisch wieder deiner Balance
							gutgeschrieben.
						</p>
					</div>
				</section>

				<!-- HISTORY -->
				<section
					class="rounded-2xl border border-white/[0.07] bg-[#0d1219] p-5 shadow-2xl shadow-black/20"
				>
					<div class="mb-4 flex items-center justify-between gap-4">
						<div>
							<span
								class="block text-[9px] font-extrabold uppercase tracking-[0.15em] text-sky-400"
							>
								Verlauf
							</span>

							<h2 class="mt-1 text-sm font-bold text-zinc-100">Letzte Auszahlungen</h2>
						</div>

						<Clock3 size={18} class="text-zinc-700" />
					</div>

					{#if data.payouts.length === 0}
						<div class="flex flex-col items-center py-8 text-center">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.025] text-zinc-700"
							>
								<Banknote size={20} />
							</div>

							<strong class="mt-3 text-[11px] font-bold text-zinc-500">
								Noch keine Auszahlungen
							</strong>

							<span class="mt-1 text-[9px] text-zinc-700"> Deine Anfragen erscheinen hier. </span>
						</div>
					{:else}
						<div class="space-y-2">
							{#each data.payouts as payout (payout.id)}
								<div class="rounded-xl border border-white/[0.05] bg-[#090e14] p-3">
									<div class="flex items-start justify-between gap-4">
										<div class="min-w-0">
											<p class="truncate text-[12px] font-bold text-zinc-300">
												{payout.casino_name}
											</p>

											<p class="mt-1 text-[12px] text-zinc-700">
												{formatDate(payout.created_at)}
											</p>
										</div>

										<strong class="shrink-0 text-xs font-extrabold text-zinc-100">
											{money.format(payout.amount)}
										</strong>
									</div>

									<div class="mt-3 flex items-center justify-between gap-3">
										<div
											class={[
												'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-bold',
												payout.status === 'paid'
													? 'bg-emerald-400/[0.07] text-emerald-400'
													: payout.status === 'cancelled'
														? 'bg-red-400/[0.07] text-red-400'
														: 'bg-amber-400/[0.07] text-amber-400'
											]}
										>
											{#if payout.status === 'paid'}
												<CheckCircle2 size={11} />
											{:else if payout.status === 'cancelled'}
												<X size={11} />
											{:else}
												<Clock3 size={11} />
											{/if}

											{statusText(payout.status)}
										</div>

										<span class="max-w-[180px] truncate text-[12px] text-zinc-700">
											{payout.casino_email}
										</span>
									</div>

									{#if payout.moderator_note}
										<div class="mt-3 border-t border-white/[0.04] pt-3">
											<p class="text-[9px] leading-4 text-zinc-600">
												{payout.moderator_note}
											</p>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</section>
			</div>
		</div>
	</div>
</div>
