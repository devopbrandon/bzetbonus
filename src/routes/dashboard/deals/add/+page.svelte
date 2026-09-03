<script lang="ts">
	import {
		BadgePercent,
		Banknote,
		Building2,
		Check,
		ChevronDown,
		Code2,
		CreditCard,
		Euro,
		FileText,
		Gift,
		Image as ImageIcon,
		Info,
		Landmark,
		Link2,
		Plus,
		RotateCcw,
		Sparkles,
		UploadCloud,
		X
	} from 'lucide-svelte';

	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);

	const paymentOptions = [
		'Paysafecard',
		'Crypto',
		'Klarna',
		'Mastercard',
		'Visa',
		'Apple Pay',
		'Google Pay',
		'Mifinity',
		'Jeton',
		'PayPal',
		'BankTransfers'
	];

	const licenceOptions = [
		'Anjouan',
		'Curaçao',
		'Malta Gaming Authority',
		'UK Gambling Commission',
		'Gibraltar',
		'Isle of Man',
		'Kahnawake',
		'Estonia',
		'Sweden',
		'Tobique Gaming Commission',
		'Denmark',
		'Germany',
		'Costa Rica',
		'Offshore',
		'Keine Lizenz'
	];

	type BonusType = 'non-sticky' | 'sticky' | 'wagerfree';
	type WagerType = 'Wagerfree' | 'B' | 'B+D';

	type FormValues = {
		brand?: string;
		tagline?: string;
		licence?: string;
		bonus?: string;
		bonustype?: string;
		maxbet?: string;
		maxbonus?: string;
		freespins?: string;
		freespins_code?: string;
		logourl?: string;
		reflink?: string;
		wager?: string;
		wagertype?: string;
		features?: string[];
		payments?: string[];
		promocode?: string;
		information?: string;
	};

	let {
		form
	}: {
		form?: {
			error?: string;
			success?: boolean;
			values?: FormValues;
		};
	} = $props();

	let brand = $state(form?.values?.brand ?? '');
	let tagline = $state(form?.values?.tagline ?? '');
	let licence = $state(form?.values?.licence ?? '');

	let bonus = $state(form?.values?.bonus ?? '');

	let bonustype = $state<BonusType>((form?.values?.bonustype as BonusType) ?? 'non-sticky');

	let maxbet = $state(form?.values?.maxbet ?? '');
	let maxbonus = $state(form?.values?.maxbonus ?? '');

	let freespins = $state(form?.values?.freespins ?? '');
	let freespinsCode = $state(form?.values?.freespins_code ?? '');

	let wager = $state(form?.values?.wager ?? '');

	let wagertype = $state<WagerType>((form?.values?.wagertype as WagerType) ?? 'Wagerfree');

	let promocode = $state(form?.values?.promocode ?? '');
	let information = $state(form?.values?.information ?? '');
	let reflink = $state(form?.values?.reflink ?? '');

	let features = $state<string[]>(
		Array.isArray(form?.values?.features) ? [...form.values.features] : []
	);

	let payments = $state<string[]>(
		Array.isArray(form?.values?.payments) ? [...form.values.payments] : []
	);

	let featureDraft = $state('');

	let logourl = $state(form?.values?.logourl ?? '');
	let logoPreview = $state('');

	let uploading = $state(false);
	let uploadError = $state('');

	let fileEl = $state<HTMLInputElement | null>(null);

	function addFeature() {
		const value = featureDraft.trim();

		if (!value) return;

		if (!features.includes(value)) {
			features = [...features, value];
		}

		featureDraft = '';
	}

	function removeFeature(value: string) {
		features = features.filter((feature) => feature !== value);
	}

	function togglePayment(payment: string) {
		if (payments.includes(payment)) {
			payments = payments.filter((item) => item !== payment);
			return;
		}

		payments = [...payments, payment];
	}

	function getExtFromFile(file: File) {
		const name = file.name || '';
		const dot = name.lastIndexOf('.');

		if (dot >= 0) {
			return name.slice(dot + 1).toLowerCase();
		}

		return file.type.split('/')[1] || 'png';
	}

	async function onPickLogo(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		if (!file.type.startsWith('image/')) {
			uploadError = 'Bitte wähle eine Bilddatei aus.';
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			uploadError = 'Die Datei darf maximal 2 MB groß sein.';
			return;
		}

		uploadError = '';
		uploading = true;

		if (logoPreview) {
			URL.revokeObjectURL(logoPreview);
		}

		logoPreview = URL.createObjectURL(file);

		try {
			const ext = getExtFromFile(file);

			const safeBrand = (brand || 'brand')
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9_-]+/g, '-')
				.replace(/^-+|-+$/g, '');

			const path = `logos/${safeBrand || 'brand'}-${Date.now()}.${ext}`;

			const { error } = await supabase.storage.from('deals-logos').upload(path, file, {
				cacheControl: '3600',
				upsert: true,
				contentType: file.type
			});

			if (error) throw error;

			const { data } = supabase.storage.from('deals-logos').getPublicUrl(path);

			logourl = data.publicUrl;
		} catch (error: any) {
			console.error('LOGO UPLOAD ERROR:', error);

			uploadError = error?.message ?? 'Logo konnte nicht hochgeladen werden.';
		} finally {
			uploading = false;

			if (fileEl) {
				fileEl.value = '';
			}
		}
	}

	function resetForm() {
		brand = '';
		tagline = '';
		licence = '';

		bonus = '';
		bonustype = 'non-sticky';

		maxbet = '';
		maxbonus = '';

		freespins = '';
		freespinsCode = '';

		wager = '';
		wagertype = 'Wagerfree';

		promocode = '';
		reflink = '';
		information = '';

		features = [];
		payments = [];

		featureDraft = '';

		if (logoPreview) {
			URL.revokeObjectURL(logoPreview);
		}

		logourl = '';
		logoPreview = '';

		uploadError = '';

		if (fileEl) {
			fileEl.value = '';
		}
	}
</script>

<svelte:head>
	<title>Deal hinzufügen | BZETBONUS</title>
</svelte:head>

<section class="min-h-[calc(100vh-68px)] px-4 py-8 text-white sm:px-6 lg:py-10">
	<div class="mx-auto w-full max-w-[1180px]">
		<div class="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
			<div>
				<div class="mb-3 flex items-center gap-2">
					<div
						class="flex h-7 w-7 items-center justify-center rounded-lg border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.07]"
					>
						<Sparkles size={14} strokeWidth={2} class="text-[#9fd0ff]" />
					</div>

					<span class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9fd0ff]/55">
						BZETBONUS Admin
					</span>
				</div>

				<h1 class="text-[30px] font-black tracking-[-0.04em] text-white sm:text-[38px]">
					Neuen Deal anlegen
				</h1>

				<p class="mt-2 max-w-[620px] text-[13px] leading-6 text-white/35">
					Alle relevanten Angaben für Deal, Bonusbedingungen und Darstellung.
				</p>
			</div>

			<div
				class="inline-flex items-center gap-2 self-start rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 sm:self-auto"
			>
				<div class="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
				<span class="text-[11px] font-semibold text-white/40">Deal Editor</span>
			</div>
		</div>

		{#if form?.error}
			<div
				class="mb-6 flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-500/[0.055] px-4 py-3 text-[13px] text-red-200"
			>
				<Info size={17} strokeWidth={2} class="mt-0.5 shrink-0 text-red-300" />
				<span>{form.error}</span>
			</div>
		{/if}

		{#if form?.success}
			<div
				class="mb-6 flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.055] px-4 py-3 text-[13px] text-emerald-200"
			>
				<Check size={17} strokeWidth={2.2} class="shrink-0" />
				Deal wurde erfolgreich gespeichert.
			</div>
		{/if}

		<form method="POST">
			<div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
				<div class="space-y-5">
					<section class="admin-card">
						<div class="section-head">
							<div class="section-icon">
								<Building2 size={17} strokeWidth={2} />
							</div>

							<div>
								<h2>Casino & Darstellung</h2>
								<p>Grundlegende Informationen, die der User zuerst sieht.</p>
							</div>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<label class="field">
								<span class="field-label">Casino *</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Building2 size={16} strokeWidth={1.8} />
									</div>

									<input name="brand" placeholder="z. B. Stake" bind:value={brand} required />
								</div>
							</label>

							<label class="field">
								<span class="field-label">Tagline</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Sparkles size={16} strokeWidth={1.8} />
									</div>

									<input
										name="tagline"
										placeholder="z. B. Bzets persönlicher Favorit"
										bind:value={tagline}
									/>
								</div>

								<span class="field-hint">Kurzer Satz direkt beim Deal.</span>
							</label>

							<label class="field sm:col-span-2">
								<span class="field-label">Lizenz</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Landmark size={16} strokeWidth={1.8} />
									</div>

									<select name="licence" bind:value={licence}>
										<option value="">Keine Auswahl</option>

										{#each licenceOptions as option}
											<option value={option}>{option}</option>
										{/each}
									</select>

									<div class="select-arrow-wrap">
										<ChevronDown size={14} strokeWidth={1.8} />
									</div>
								</div>
							</label>
						</div>
					</section>

					<section class="admin-card">
						<div class="section-head">
							<div class="section-icon">
								<Gift size={17} strokeWidth={2} />
							</div>

							<div>
								<h2>Bonus</h2>
								<p>Bonuswert, Typ und Freispiel-Angebot.</p>
							</div>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<label class="field">
								<span class="field-label">Bonus *</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<BadgePercent size={16} strokeWidth={1.8} />
									</div>

									<input name="bonus" placeholder="z. B. 200%" bind:value={bonus} required />
								</div>
							</label>

							<label class="field">
								<span class="field-label">Bonus Typ</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<BadgePercent size={16} strokeWidth={1.8} />
									</div>

									<select name="bonustype" bind:value={bonustype}>
										<option value="non-sticky">Non-Sticky</option>
										<option value="sticky">Sticky</option>
										<option value="wagerfree">Wagerfree</option>
									</select>

									<div class="select-arrow-wrap">
										<ChevronDown size={14} strokeWidth={1.8} />
									</div>
								</div>
							</label>

							<label class="field">
								<span class="field-label">Max. Bonus</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Euro size={16} strokeWidth={1.8} />
									</div>

									<input name="maxbonus" placeholder="z. B. 1.000 €" bind:value={maxbonus} />
								</div>
							</label>

							<label class="field">
								<span class="field-label">Max. Einsatz</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Banknote size={16} strokeWidth={1.8} />
									</div>

									<input name="maxbet" placeholder="z. B. 5 €" bind:value={maxbet} />
								</div>
							</label>

							<label class="field">
								<span class="field-label">Free Spins</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Gift size={16} strokeWidth={1.8} />
									</div>

									<input name="freespins" placeholder="z. B. 150" bind:value={freespins} />
								</div>
							</label>

							<label class="field">
								<span class="field-label">Free Spins Code</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Code2 size={16} strokeWidth={1.8} />
									</div>

									<input
										name="freespins_code"
										placeholder="z. B. BZETFS"
										bind:value={freespinsCode}
									/>
								</div>
							</label>
						</div>
					</section>

					<section class="admin-card">
						<div class="section-head">
							<div class="section-icon">
								<FileText size={17} strokeWidth={2} />
							</div>

							<div>
								<h2>Umsatzbedingungen</h2>
								<p>Wie der Bonus umgesetzt werden muss.</p>
							</div>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<label class="field">
								<span class="field-label">Wager</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<BadgePercent size={16} strokeWidth={1.8} />
									</div>

									<input name="wager" placeholder="z. B. 0x / 30x" bind:value={wager} />
								</div>
							</label>

							<label class="field">
								<span class="field-label">Wager Typ</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<FileText size={16} strokeWidth={1.8} />
									</div>

									<select name="wagertype" bind:value={wagertype}>
										<option value="Wagerfree">Wagerfree</option>
										<option value="B">Bonus</option>
										<option value="B+D">Bonus + Einzahlung</option>
									</select>

									<div class="select-arrow-wrap">
										<ChevronDown size={14} strokeWidth={1.8} />
									</div>
								</div>
							</label>
						</div>
					</section>

					<section class="admin-card">
						<div class="section-head">
							<div class="section-icon">
								<Code2 size={17} strokeWidth={2} />
							</div>

							<div>
								<h2>Promo & Tracking</h2>
								<p>Promocode und Affiliate-Link des Deals.</p>
							</div>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<label class="field">
								<span class="field-label">Promocode</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Code2 size={16} strokeWidth={1.8} />
									</div>

									<input name="promocode" placeholder="z. B. BZET" bind:value={promocode} />
								</div>
							</label>

							<label class="field">
								<span class="field-label">Referral Link</span>

								<div class="input-shell">
									<div class="input-icon-wrap">
										<Link2 size={16} strokeWidth={1.8} />
									</div>

									<input name="reflink" type="url" placeholder="https://..." bind:value={reflink} />
								</div>
							</label>
						</div>
					</section>

					<section class="admin-card">
						<div class="section-head">
							<div class="section-icon">
								<CreditCard size={17} strokeWidth={2} />
							</div>

							<div>
								<h2>Zahlungsmethoden</h2>
								<p>Verfügbare Zahlungsarten des Anbieters.</p>
							</div>
						</div>

						<input type="hidden" name="payments" value={JSON.stringify(payments)} />

						<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
							{#each paymentOptions as payment}
								<button
									type="button"
									onclick={() => togglePayment(payment)}
									class={[
										'flex min-h-[44px] cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 text-left text-[12px] font-semibold transition-all duration-200',
										payments.includes(payment)
											? 'border-[#8dc7ff]/25 bg-[#8dc7ff]/[0.09] text-[#cde7ff]'
											: 'border-white/[0.07] bg-black/20 text-white/42 hover:border-white/[0.12] hover:bg-white/[0.035] hover:text-white/75'
									]}
								>
									<span>{payment}</span>

									{#if payments.includes(payment)}
										<div
											class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#9fd0ff] text-[#07101a]"
										>
											<Check size={11} strokeWidth={3} />
										</div>
									{/if}
								</button>
							{/each}
						</div>
					</section>

					<section class="admin-card">
						<div class="section-head">
							<div class="section-icon">
								<Sparkles size={17} strokeWidth={2} />
							</div>

							<div>
								<h2>Deal Highlights</h2>
								<p>Kurze Vorteile, die direkt am Angebot angezeigt werden.</p>
							</div>
						</div>

						<input type="hidden" name="features" value={JSON.stringify(features)} />

						<div class="flex gap-2">
							<div class="input-shell flex-1">
								<div class="input-icon-wrap">
									<Sparkles size={16} strokeWidth={1.8} />
								</div>

								<input
									placeholder="z. B. Schnelle Auszahlungen"
									bind:value={featureDraft}
									onkeydown={(event: KeyboardEvent) => {
										if (event.key === 'Enter') {
											event.preventDefault();
											addFeature();
										}
									}}
								/>
							</div>

							<button
								type="button"
								onclick={addFeature}
								class="flex h-[46px] shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-[12px] font-bold text-black transition hover:bg-[#edf5ff]"
							>
								<Plus size={15} strokeWidth={2.4} />
								<span class="hidden sm:inline">Hinzufügen</span>
							</button>
						</div>

						{#if features.length}
							<div class="mt-3 flex flex-wrap gap-2">
								{#each features as feature}
									<div
										class="flex items-center gap-2 rounded-lg border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.055] py-1.5 pl-2.5 pr-1.5 text-[11px] font-semibold text-white/65"
									>
										<span>{feature}</span>

										<button
											type="button"
											onclick={() => removeFeature(feature)}
											aria-label={`${feature} entfernen`}
											class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-white/25 transition hover:bg-white/[0.06] hover:text-white"
										>
											<X size={12} strokeWidth={2} />
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</section>

					<section class="admin-card">
						<div class="section-head">
							<div class="section-icon">
								<Info size={17} strokeWidth={2} />
							</div>

							<div>
								<h2>Weitere Informationen</h2>
								<p>Zusätzliche Hinweise und Besonderheiten zum Deal.</p>
							</div>
						</div>

						<label class="field">
							<span class="field-label">Information</span>

							<textarea
								name="information"
								rows="6"
								placeholder="Bedingungen, Besonderheiten oder wichtige Hinweise..."
								bind:value={information}
								class="textarea-field"></textarea>
						</label>
					</section>
				</div>

				<div class="space-y-5 xl:sticky xl:top-[88px]">
					<section class="admin-card">
						<div class="section-head compact">
							<div class="section-icon">
								<ImageIcon size={17} strokeWidth={2} />
							</div>

							<div>
								<h2>Casino Logo</h2>
								<p>Transparentes PNG oder WebP empfohlen.</p>
							</div>
						</div>

						<div
							class="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-white/[0.09] bg-black/20 p-5"
						>
							{#if logoPreview || logourl}
								<img
									src={logoPreview || logourl}
									alt="Logo Vorschau"
									class="max-h-[90px] max-w-[220px] object-contain"
								/>
							{:else}
								<div class="text-center">
									<ImageIcon size={26} strokeWidth={1.5} class="mx-auto text-white/15" />

									<p class="mt-3 text-[11px] font-medium text-white/25">Noch kein Logo</p>
								</div>
							{/if}
						</div>

						<input
							bind:this={fileEl}
							type="file"
							accept="image/*"
							class="hidden"
							onchange={onPickLogo}
						/>

						<button
							type="button"
							disabled={uploading}
							onclick={() => fileEl?.click()}
							class="mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] text-[12px] font-semibold text-white/60 transition hover:border-white/[0.13] hover:bg-white/[0.055] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							<UploadCloud size={16} strokeWidth={2} />

							{uploading ? 'Wird hochgeladen...' : 'Logo auswählen'}
						</button>

						{#if uploadError}
							<p class="mt-2 text-[11px] leading-5 text-red-300/80">
								{uploadError}
							</p>
						{/if}

						<input type="hidden" name="logourl" value={logourl} />
					</section>

					<section class="rounded-2xl border border-[#8dc7ff]/[0.10] bg-[#8dc7ff]/[0.035] p-4">
						<p class="text-[11px] leading-5 text-white/30">
							Prüfe Bonus, Wager und Tracking-Link vor dem Speichern noch einmal.
						</p>

						<div class="mt-4 grid grid-cols-[auto_1fr] gap-2">
							<button
								type="reset"
								onclick={resetForm}
								class="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-black/20 px-4 text-white/40 transition hover:bg-white/[0.04] hover:text-white/75"
								aria-label="Formular zurücksetzen"
							>
								<RotateCcw size={16} strokeWidth={1.9} />
							</button>

							<button
								type="submit"
								class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-[12px] font-black text-[#090b0e] shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition hover:bg-[#edf5ff]"
							>
								<Check size={16} strokeWidth={2.4} />
								Deal speichern
							</button>
						</div>
					</section>
				</div>
			</div>
		</form>
	</div>
</section>

<style>
	.admin-card {
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 16px;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.012) 100%),
			rgba(10, 12, 16, 0.72);
		padding: 20px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.015),
			0 12px 40px rgba(0, 0, 0, 0.12);
	}

	.section-head {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 20px;
		padding-bottom: 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.055);
	}

	.section-head.compact {
		margin-bottom: 16px;
	}

	.section-head h2 {
		font-size: 14px;
		line-height: 1.3;
		font-weight: 750;
		color: rgba(255, 255, 255, 0.9);
	}

	.section-head p {
		margin-top: 3px;
		font-size: 10px;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.27);
	}

	.section-icon {
		display: flex;
		width: 32px;
		height: 32px;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(141, 199, 255, 0.1);
		border-radius: 9px;
		background: rgba(141, 199, 255, 0.055);
		color: rgba(159, 208, 255, 0.8);
	}

	.field {
		display: block;
		min-width: 0;
	}

	.field-label {
		display: block;
		margin-bottom: 7px;
		font-size: 11px;
		font-weight: 650;
		color: rgba(255, 255, 255, 0.52);
	}

	.field-hint {
		display: block;
		margin-top: 6px;
		font-size: 9px;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.2);
	}

	.input-shell {
		position: relative;
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		min-height: 46px;
		align-items: stretch;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.075);
		border-radius: 12px;
		background: rgba(0, 0, 0, 0.2);
		transition:
			border-color 160ms ease,
			background 160ms ease,
			box-shadow 160ms ease;
	}

	.input-shell:focus-within {
		border-color: rgba(141, 199, 255, 0.24);
		background: rgba(141, 199, 255, 0.025);
		box-shadow: 0 0 0 3px rgba(141, 199, 255, 0.035);
	}

	.input-icon-wrap {
		display: flex;
		width: 44px;
		height: 100%;
		min-height: 44px;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.34);
		transition:
			color 160ms ease,
			background 160ms ease;
	}

	.input-shell:focus-within .input-icon-wrap {
		color: rgba(159, 208, 255, 0.9);
		background: rgba(141, 199, 255, 0.025);
	}

	.input-shell input,
	.input-shell select {
		width: 100%;
		height: 100%;
		min-height: 44px;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		padding: 0 14px 0 10px;
		font-size: 12px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.84);
	}

	.input-shell input::placeholder {
		color: rgba(255, 255, 255, 0.18);
	}

	.input-shell select {
		cursor: pointer;
		appearance: none;
		padding-right: 42px;
	}

	.input-shell select option {
		background: #111419;
		color: white;
	}

	.select-arrow-wrap {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		width: 40px;
		height: 100%;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.25);
		pointer-events: none;
	}

	.textarea-field {
		width: 100%;
		min-height: 140px;
		resize: vertical;
		border: 1px solid rgba(255, 255, 255, 0.075);
		border-radius: 12px;
		outline: none;
		background: rgba(0, 0, 0, 0.2);
		padding: 13px 14px;
		font-size: 12px;
		line-height: 1.7;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.82);
		transition:
			border-color 160ms ease,
			background 160ms ease,
			box-shadow 160ms ease;
	}

	.textarea-field::placeholder {
		color: rgba(255, 255, 255, 0.18);
	}

	.textarea-field:focus {
		border-color: rgba(141, 199, 255, 0.24);
		background: rgba(141, 199, 255, 0.025);
		box-shadow: 0 0 0 3px rgba(141, 199, 255, 0.035);
	}

	@media (max-width: 640px) {
		.admin-card {
			padding: 16px;
			border-radius: 14px;
		}
	}
</style>
