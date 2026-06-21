<script lang="ts">
	import {
		Building2,
		Percent,
		Sparkles,
		Link2,
		Image as ImageIcon,
		Euro,
		Coins,
		Plus,
		X,
		BadgePercent,
		BookCheck,
		UploadCloud,
		PartyPopper,
		CreditCard,
		NotebookText
	} from 'lucide-svelte';

	import { createClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);

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
		'PayPal'
	];

	let brand = $state('');
	let bonus = $state('');
	let bonustype = $state<'non-sticky' | 'sticky' | 'cashable' | 'wagerfree'>('non-sticky');
	let maxbet = $state('');
	let maxbonus = $state('');
	let freeSpins = $state<string | number>('');
	let features = $state<string[]>([]);
	let featureDraft = $state('');
	let logoURL = $state('');
	let logoPreview = $state('');
	let dealURL = $state('');
	let wager = $state('');
	let wagertype = $state<'Wagerfree' | 'Sticky' | 'Non-Sticky' | 'B' | 'B+D'>('Wagerfree');
	let promocode = $state('');
	let information = $state('');
	let payments = $state<string[]>([]);

	let merkur = $state(false);
	let novoline = $state(false);

	let uploading = $state(false);
	let uploadError = $state('');

	let fileEl = $state<HTMLInputElement | null>(null);

	function addFeature() {
		const v = featureDraft.trim();
		if (!v) return;
		if (!features.includes(v)) features = [...features, v];
		featureDraft = '';
	}

	function removeFeature(v: string) {
		features = features.filter((f) => f !== v);
	}

	function togglePayment(payment: string) {
		if (payments.includes(payment)) {
			payments = payments.filter((p) => p !== payment);
			return;
		}

		payments = [...payments, payment];
	}

	function getExtFromFile(f: File) {
		const name = f.name || '';
		const dot = name.lastIndexOf('.');
		return dot >= 0 ? name.slice(dot + 1).toLowerCase() : f.type.split('/')[1] || 'png';
	}

	async function onPickLogo(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input?.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			uploadError = 'Please select an image file.';
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			uploadError = 'File is larger than 2 MB.';
			return;
		}

		uploadError = '';
		uploading = true;

		if (logoPreview) URL.revokeObjectURL(logoPreview);
		logoPreview = URL.createObjectURL(file);

		try {
			const ext = getExtFromFile(file);
			const safeBrand = (brand || 'brand').toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
			const path = `logos/${safeBrand}-${Date.now()}.${ext}`;

			const { error: upErr } = await supabase.storage.from('deals-logos').upload(path, file, {
				cacheControl: '3600',
				upsert: true,
				contentType: file.type
			});

			if (upErr) throw upErr;

			const { data } = supabase.storage.from('deals-logos').getPublicUrl(path);
			logoURL = data.publicUrl;
		} catch (err: any) {
			console.error(err);
			uploadError = err?.message ?? 'Upload failed.';
		} finally {
			uploading = false;
			if (fileEl) fileEl.value = '';
		}
	}

	function resetForm() {
		brand = '';
		bonus = '';
		maxbet = '';
		maxbonus = '';
		freeSpins = '';
		features = [];
		featureDraft = '';

		if (logoPreview) URL.revokeObjectURL(logoPreview);

		logoURL = '';
		logoPreview = '';
		dealURL = '';
		wager = '';
		bonustype = 'non-sticky';
		wagertype = 'Wagerfree';
		uploadError = '';
		promocode = '';
		information = '';
		payments = [];
		merkur = false;
		novoline = false;

		if (fileEl) fileEl.value = '';
	}
</script>

<svelte:head>
	<title>Add Deal - Samet777</title>
</svelte:head>

<section class="min-h-[80vh] w-full px-4 py-10 text-white">
	<div class="mx-auto w-full max-w-3xl">
		<form
			method="POST"
			class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl ring-1 ring-white/5 backdrop-blur-md"
		>
			<div class="mb-6 flex items-center justify-between gap-4">
				<h1 class="flex items-center gap-2 text-2xl font-bold">
					<Sparkles class="text-indigo-400" />
					<span>Add Deal</span>
				</h1>

				<span
					class="rounded-full bg-indigo-400/15 px-3 py-1 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-400/30"
				>
					Samet777
				</span>
			</div>

			<div class="mb-6 space-y-4">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-indigo-400">
					<Building2 class="h-5 w-5" /> Basic Information
				</h2>

				<label class="block">
					<span class="mb-1 block text-sm text-white/80">Brand*</span>
					<div
						class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
					>
						<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
							<Building2 class="h-5 w-5" />
						</span>
						<input
							name="brand"
							placeholder="e.g. Stake"
							class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
							bind:value={brand}
							required
						/>
					</div>
				</label>

				<label class="block">
					<span class="mb-1 block text-sm text-white/80">Promo Code</span>
					<div
						class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
					>
						<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
							<PartyPopper class="h-5 w-5" />
						</span>
						<input
							name="promocode"
							placeholder="e.g. SAMET777"
							class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
							bind:value={promocode}
						/>
					</div>
				</label>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1 block text-sm text-white/80">Bonus*</span>
						<div
							class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
						>
							<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
								<Percent class="h-5 w-5" />
							</span>
							<input
								name="bonus"
								placeholder="e.g. 200%"
								class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
								bind:value={bonus}
								required
							/>
						</div>
					</label>

					<label class="block">
						<span class="mb-1 block text-sm text-white/80">Bonus Type*</span>
						<div
							class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
						>
							<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
								<BadgePercent class="h-5 w-5" />
							</span>
							<select
								name="bonustype"
								class="w-full rounded-r-xl bg-transparent px-3 py-3 text-white focus:outline-none"
								bind:value={bonustype}
							>
								<option class="bg-zinc-900" value="non-sticky">non-sticky</option>
								<option class="bg-zinc-900" value="sticky">sticky</option>
								<option class="bg-zinc-900" value="wagerfree">wagerfree</option>
							</select>
						</div>
					</label>
				</div>
			</div>

			<div class="mb-6 space-y-4">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-indigo-400">
					<Coins class="h-5 w-5" /> Limits & Values
				</h2>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1 block text-sm text-white/80">Max Bonus*</span>
						<div
							class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
						>
							<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
								<Euro class="h-5 w-5" />
							</span>
							<input
								name="maxbonus"
								placeholder="e.g. €1,000"
								class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
								bind:value={maxbonus}
								required
							/>
						</div>
					</label>

					<label class="block">
						<span class="mb-1 block text-sm text-white/80">Max Bet</span>
						<div
							class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
						>
							<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
								<Euro class="h-5 w-5" />
							</span>
							<input
								name="maxbet"
								placeholder="e.g. €5"
								class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
								bind:value={maxbet}
							/>
						</div>
					</label>

					<label class="block">
						<span class="mb-1 block text-sm text-white/80">Free Spins</span>
						<div
							class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
						>
							<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
								<Percent class="h-5 w-5" />
							</span>
							<input
								name="freespins"
								placeholder="e.g. 150"
								class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
								bind:value={freeSpins}
							/>
						</div>
					</label>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1 block text-sm text-white/80">Wager</span>
						<div
							class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
						>
							<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
								<BookCheck class="h-5 w-5" />
							</span>
							<input
								name="wager"
								placeholder="e.g. 0x / 30x"
								class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
								bind:value={wager}
							/>
						</div>
					</label>

					<label class="block">
						<span class="mb-1 block text-sm text-white/80">Wager Type</span>
						<div
							class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
						>
							<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
								<BadgePercent class="h-5 w-5" />
							</span>
							<select
								name="wagertype"
								class="w-full rounded-r-xl bg-transparent px-3 py-3 text-white focus:outline-none"
								bind:value={wagertype}
							>
								<option class="bg-zinc-900" value="Wagerfree">Wagerfree</option>
								<option class="bg-zinc-900" value="B">Bonus</option>
								<option class="bg-zinc-900" value="B+D">Bonus + Deposit</option>
							</select>
						</div>
					</label>
				</div>
			</div>

			<div class="mb-6 space-y-4">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-indigo-400">
					<ImageIcon class="h-5 w-5" /> Media & Links
				</h2>

				<div class="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
					<label class="block">
						<span class="mb-1 block text-sm text-white/80">Logo File</span>
						<input
							bind:this={fileEl}
							type="file"
							accept="image/*"
							class="w-full cursor-pointer rounded-xl border border-white/10 bg-black/30 px-3 py-3 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-110"
							onchange={onPickLogo}
						/>
						{#if uploadError}
							<p class="mt-2 text-sm text-red-400">{uploadError}</p>
						{/if}
					</label>

					<button
						type="button"
						disabled={uploading}
						class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-400 px-4 py-2 font-semibold text-white ring-1 ring-black/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
						onclick={() => fileEl?.click()}
					>
						<UploadCloud class="h-5 w-5" />
						{uploading ? 'Uploading…' : 'Upload'}
					</button>
				</div>

				<label class="block">
					<span class="mb-1 block text-sm text-white/80">Logo URL (public)</span>
					<div
						class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
					>
						<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
							<ImageIcon class="h-5 w-5" />
						</span>
						<input
							name="logoURL"
							placeholder="https://…"
							class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
							bind:value={logoURL}
							readonly
						/>
					</div>
				</label>

				{#if logoPreview || logoURL}
					<div class="rounded-xl border border-white/10 bg-black/30 p-3">
						<img
							src={logoPreview || logoURL}
							alt="Logo Preview"
							class="h-12 max-w-full object-contain"
						/>
					</div>
				{/if}

				<label class="block">
					<span class="mb-1 block text-sm text-white/80">Deal URL</span>
					<div
						class="group flex items-center rounded-xl border border-white/10 bg-black/30 transition focus-within:border-indigo-400/60 focus-within:ring-1 focus-within:ring-indigo-400/60"
					>
						<span class="pr-2 pl-3 text-white/60 group-focus-within:text-indigo-400">
							<Link2 class="h-5 w-5" />
						</span>
						<input
							name="dealURL"
							placeholder="Your referral link"
							class="w-full rounded-r-xl bg-transparent px-3 py-3 placeholder:text-white/40 focus:outline-none"
							bind:value={dealURL}
						/>
					</div>
				</label>
			</div>

			<div class="mb-8 space-y-4">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-indigo-400">
					<CreditCard class="h-5 w-5" /> Payments
				</h2>

				<input type="hidden" name="payments" value={JSON.stringify(payments)} />

				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{#each paymentOptions as payment}
						<button
							type="button"
							onclick={() => togglePayment(payment)}
							class={[
								'cursor-pointer rounded-xl border px-3 py-3 text-left text-sm font-semibold transition',
								payments.includes(payment)
									? 'border-indigo-400/60 bg-indigo-400/15 text-indigo-200 shadow-[0_0_18px_rgba(129,140,248,0.20)]'
									: 'border-white/10 bg-black/30 text-white/75 hover:border-white/20 hover:bg-white/[0.06]'
							]}
						>
							{payment}
						</button>
					{/each}
				</div>

				{#if payments.length}
					<p class="text-xs text-white/50">
						Selected: {payments.join(', ')}
					</p>
				{/if}
			</div>

			<div class="mb-8 space-y-4">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-indigo-400">
					<Sparkles class="h-5 w-5" /> Features
				</h2>

				<div class="flex items-center gap-2">
					<input type="hidden" name="features" value={JSON.stringify(features)} />
					<input
						class="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 placeholder:text-white/40 focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/60 focus:outline-none"
						placeholder="e.g. No Wagering"
						bind:value={featureDraft}
						onkeydown={(e: KeyboardEvent) =>
							e.key === 'Enter' && (e.preventDefault(), addFeature())}
					/>
					<button
						type="button"
						onclick={addFeature}
						class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-400 px-4 py-2 font-semibold text-white ring-1 ring-black/10 transition hover:brightness-110"
					>
						<Plus class="h-4 w-4" /> Add
					</button>
				</div>

				{#if features.length}
					<ul class="mt-2 flex flex-wrap gap-2">
						{#each features as f}
							<li
								class="inline-flex items-center gap-2 rounded-lg bg-black/30 px-2.5 py-1 text-xs text-white/90 ring-1 ring-white/10"
							>
								{f}
								<button
									type="button"
									class="cursor-pointer rounded p-1 text-white/60 transition hover:text-indigo-400"
									onclick={() => removeFeature(f)}
									aria-label={`Remove feature ${f}`}
								>
									<X class="h-3.5 w-3.5" />
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="mb-8 space-y-4">
				<h2 class="flex items-center gap-2 text-lg font-semibold text-indigo-400">
					<NotebookText class="h-5 w-5" /> Notes
				</h2>

				<label class="block">
					<span class="mb-1 block text-sm text-white/80">Information</span>
					<textarea
						name="information"
						rows="5"
						placeholder="Add notes, important terms, payout info, bonus details..."
						class="min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white placeholder:text-white/40 focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/60 focus:outline-none"
						bind:value={information}></textarea>
				</label>
			</div>

			<div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p class="text-xs text-white/60">Resetting will clear everything.</p>
				<div class="flex items-center gap-2">
					<button
						type="reset"
						class="cursor-pointer rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/90 transition hover:bg-black/40"
						onclick={resetForm}
					>
						Reset
					</button>

					<button
						type="submit"
						class="rounded-xl bg-linear-to-r from-indigo-400 via-indigo-400 to-indigo-300 px-6 py-2.5 text-sm font-extrabold tracking-wide text-white shadow-[0_0_22px_rgba(129,140,248,0.35)] ring-1 ring-indigo-400/30 transition hover:shadow-[0_0_36px_rgba(129,140,248,0.55)] hover:brightness-110"
					>
						Save
					</button>
				</div>
			</div>
		</form>
	</div>
</section>
