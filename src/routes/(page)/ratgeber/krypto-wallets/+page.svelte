<script lang="ts">
	import {
		ArrowLeft,
		Bitcoin,
		BookOpen,
		Check,
		ChevronDown,
		CircleAlert,
		Clock3,
		KeyRound,
		ShieldCheck,
		WalletCards
	} from 'lucide-svelte';

	let openFaq = $state<number | null>(0);

	const sections = [
		{
			title: 'Was ist eine Krypto Wallet?',
			text: 'Eine Krypto Wallet ist vereinfacht gesagt dein Zugang zu deinen Kryptowährungen. Die Coins selbst befinden sich auf der jeweiligen Blockchain. Die Wallet verwaltet die Schlüssel, mit denen du über deine Coins verfügen kannst.',
			points: [
				'Kryptowährungen liegen auf der Blockchain',
				'Die Wallet verwaltet deinen Zugang',
				'Transaktionen werden über Wallet-Adressen durchgeführt',
				'Private Keys oder Seed Phrase sichern deine Wallet'
			]
		},
		{
			title: 'Custodial und Non-Custodial Wallets',
			text: 'Bei einer Custodial Wallet verwaltet ein Anbieter die privaten Schlüssel für dich. Bei einer Non-Custodial Wallet besitzt du die Kontrolle über die Schlüssel selbst.',
			points: [
				'Custodial: Anbieter verwaltet die Schlüssel',
				'Non-Custodial: du kontrollierst deine Schlüssel selbst',
				'Non-Custodial bedeutet mehr Eigenverantwortung',
				'Seed Phrase niemals an andere Personen weitergeben'
			]
		},
		{
			title: 'Hot Wallet oder Hardware Wallet?',
			text: 'Hot Wallets sind mit dem Internet verbunden und dadurch besonders praktisch für regelmäßige Transaktionen. Hardware Wallets speichern deine Schlüssel auf einem separaten Gerät und werden häufig für größere Beträge oder langfristige Aufbewahrung verwendet.'
		},
		{
			title: 'Krypto im Online Casino',
			text: 'Viele Krypto Casinos ermöglichen Ein- und Auszahlungen mit Bitcoin, Ethereum, USDT und weiteren Coins. Wichtig ist, dass du immer das richtige Netzwerk und die richtige Wallet-Adresse verwendest.',
			points: [
				'Coin und Netzwerk vor dem Senden prüfen',
				'Wallet-Adresse vollständig kontrollieren',
				'Bei größeren Beträgen zunächst eine Testtransaktion erwägen',
				'Netzwerkgebühren beachten',
				'Blockchain-Transaktionen sind normalerweise nicht rückgängig zu machen'
			]
		}
	];

	const faqs = [
		{
			question: 'Sind meine Coins wirklich in der Wallet?',
			answer:
				'Technisch befinden sich Kryptowährungen auf der Blockchain. Deine Wallet verwaltet die Schlüssel, mit denen du auf diese Coins zugreifen kannst.'
		},
		{
			question: 'Was ist eine Seed Phrase?',
			answer:
				'Eine Seed Phrase ist eine Reihe von Wörtern, mit der sich viele Wallets wiederherstellen lassen. Sie sollte niemals online geteilt oder an andere Personen weitergegeben werden.'
		},
		{
			question: 'Was passiert bei einem falschen Netzwerk?',
			answer:
				'Das hängt vom konkreten Fall ab. Bei einer falsch durchgeführten Blockchain-Transaktion können Coins unter Umständen nur schwer oder gar nicht zurückgeholt werden.'
		},
		{
			question: 'Welche Wallet eignet sich für Anfänger?',
			answer:
				'Das hängt davon ab, wie häufig du Transaktionen durchführst und welche Kryptowährungen du verwendest. Entscheidend sind Sicherheit, unterstützte Netzwerke und eine verständliche Bedienung.'
		}
	];
</script>

<svelte:head>
	<title>Krypto Wallets erklärt | BZETBONUS</title>
	<meta
		name="description"
		content="Krypto Wallets einfach erklärt: Hot Wallet, Hardware Wallet, Seed Phrase, Private Keys und Krypto Einzahlungen im Online Casino."
	/>
</svelte:head>

<div class="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 sm:px-7 lg:px-10 lg:pt-14">
	<a
		href="/"
		class="group mb-7 inline-flex items-center gap-2 text-[12px] font-semibold text-white/35 transition hover:text-white/70"
	>
		<ArrowLeft size={15} class="transition group-hover:-translate-x-0.5" />
		Zurück zur Übersicht
	</a>

	<section
		class="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025]"
	>
		<div
			class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(141,199,255,0.08),transparent_38%)]"
		></div>

		<div class="grid min-h-[470px] lg:grid-cols-[1.02fr_0.98fr]">
			<div class="relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-12">
				<div class="mb-5 flex flex-wrap gap-2">
					<div
						class="inline-flex h-8 items-center gap-2 rounded-lg border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.07] px-3 text-[11px] font-bold text-[#acd7ff]"
					>
						<BookOpen size={14} />
						Ratgeber
					</div>

					<div
						class="inline-flex h-8 items-center gap-2 rounded-lg border border-white/[0.07] bg-black/10 px-3 text-[11px] font-semibold text-white/38"
					>
						<Clock3 size={13} />
						ca. 6 Min. Lesezeit
					</div>
				</div>

				<h1
					class="max-w-[660px] text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-[58px]"
				>
					Krypto Wallets
					<span class="text-[#9fd0ff]">einfach erklärt.</span>
				</h1>

				<p class="mt-6 max-w-[620px] text-[14px] font-medium leading-7 text-white/48">
					Wallet-Adressen, Seed Phrase, Hot Wallet, Hardware Wallet und Netzwerke: Hier bekommst du
					die wichtigsten Grundlagen kompakt erklärt.
				</p>

				<div
					class="mt-8 flex max-w-[560px] items-start gap-3 rounded-xl border border-white/[0.065] bg-black/10 p-4"
				>
					<ShieldCheck size={18} class="mt-0.5 shrink-0 text-[#9fd0ff]" />
					<p class="text-[12px] font-medium leading-5 text-white/40">
						Seed Phrase und Private Keys gehören ausschließlich dir. Seriöse Anbieter werden dich
						niemals auffordern, diese Daten weiterzugeben.
					</p>
				</div>
			</div>

			<div class="relative min-h-[300px] overflow-hidden lg:min-h-full">
				<img
					src="/images/ratgeber/krypto-wallets.webp"
					alt="Krypto Wallet Ratgeber"
					class="absolute inset-0 h-full w-full object-cover"
				/>

				<div
					class="absolute inset-0 bg-linear-to-r from-[#111318] via-[#111318]/25 to-transparent lg:from-[#111318]/80"
				></div>

				<div
					class="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-white backdrop-blur-xl"
				>
					<WalletCards size={25} strokeWidth={1.8} />
				</div>
			</div>
		</div>
	</section>

	<div class="mt-12 grid gap-10 lg:grid-cols-[1fr_300px]">
		<main>
			<p class="text-[15px] font-medium leading-8 text-white/55">
				Wer Kryptowährungen nutzt, kommt früher oder später mit einer
				<strong class="font-bold text-white/85">Krypto Wallet</strong> in Kontakt. Gerade bei Krypto Casinos
				ist es wichtig zu verstehen, wie Wallet-Adressen, Netzwerke und die Sicherung deiner Coins funktionieren.
			</p>

			<div class="mt-10 space-y-6">
				{#each sections as section, index}
					<section class="rounded-2xl border border-white/[0.065] bg-white/[0.018] p-6 sm:p-8">
						<div class="mb-5 flex items-start gap-4">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.07] text-[12px] font-black text-[#9fd0ff]"
							>
								{String(index + 1).padStart(2, '0')}
							</div>

							<h2 class="pt-1 text-xl font-black tracking-[-0.025em] text-white sm:text-2xl">
								{section.title}
							</h2>
						</div>

						<p class="text-[14px] font-medium leading-7 text-white/48">{section.text}</p>

						{#if section.points}
							<div class="mt-6 grid gap-2.5">
								{#each section.points as point}
									<div
										class="flex items-start gap-3 rounded-lg border border-white/[0.045] bg-black/10 px-4 py-3"
									>
										<div
											class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#8dc7ff]/10 text-[#9fd0ff]"
										>
											<Check size={12} strokeWidth={2.5} />
										</div>

										<span class="text-[12px] font-semibold leading-5 text-white/50">
											{point}
										</span>
									</div>
								{/each}
							</div>
						{/if}
					</section>
				{/each}
			</div>

			<div
				class="mt-6 flex items-start gap-4 rounded-2xl border border-red-300/[0.08] bg-red-400/[0.025] p-6"
			>
				<CircleAlert size={20} class="mt-0.5 shrink-0 text-red-300/70" />

				<div>
					<h3 class="text-[13px] font-bold text-white/80">Transaktionen sorgfältig prüfen</h3>
					<p class="mt-2 text-[12px] font-medium leading-6 text-white/40">
						Blockchain-Transaktionen können normalerweise nicht einfach storniert werden. Überprüfe
						deshalb Adresse, Coin und Netzwerk besonders sorgfältig.
					</p>
				</div>
			</div>

			<section class="mt-14">
				<p class="text-[10px] font-bold tracking-[0.16em] text-[#9fd0ff]/55 uppercase">
					Häufige Fragen
				</p>

				<h2 class="mb-6 mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
					FAQ zu Krypto Wallets
				</h2>

				<div class="space-y-2">
					{#each faqs as faq, index}
						<div class="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018]">
							<button
								type="button"
								onclick={() => (openFaq = openFaq === index ? null : index)}
								class="flex w-full cursor-pointer items-center justify-between gap-5 px-5 py-5 text-left"
							>
								<span class="text-[13px] font-bold text-white/75">{faq.question}</span>

								<ChevronDown
									size={16}
									class={`transition-transform ${
										openFaq === index ? 'rotate-180 text-[#9fd0ff]' : 'text-white/30'
									}`}
								/>
							</button>

							<div
								class={[
									'grid transition-[grid-template-rows,opacity] duration-300',
									openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
								]}
							>
								<div class="overflow-hidden">
									<p
										class="border-t border-white/[0.05] px-5 pb-5 pt-4 text-[12px] font-medium leading-6 text-white/42"
									>
										{faq.answer}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		</main>

		<aside>
			<div class="sticky top-8 space-y-4">
				<div class="rounded-2xl border border-white/[0.065] bg-white/[0.02] p-5">
					<div
						class="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#8dc7ff]/[0.07] text-[#9fd0ff]"
					>
						<KeyRound size={19} />
					</div>

					<p class="text-[13px] font-bold text-white/80">Wallet Grundregel</p>

					<p class="mt-2 text-[11px] font-medium leading-5 text-white/38">
						Wer die privaten Schlüssel kontrolliert, kontrolliert den Zugriff auf die entsprechenden
						Kryptowährungen.
					</p>
				</div>

				<div class="rounded-2xl border border-white/[0.065] bg-white/[0.02] p-5">
					<p class="text-[10px] font-bold tracking-[0.14em] text-white/25 uppercase">Beispiele</p>

					<div class="mt-4 space-y-3">
						<div class="flex items-center gap-3">
							<Bitcoin size={16} class="text-white/35" />
							<span class="text-[12px] font-semibold text-white/55">Bitcoin</span>
						</div>

						<div class="flex items-center gap-3">
							<WalletCards size={16} class="text-white/35" />
							<span class="text-[12px] font-semibold text-white/55">Ethereum</span>
						</div>

						<div class="flex items-center gap-3">
							<WalletCards size={16} class="text-white/35" />
							<span class="text-[12px] font-semibold text-white/55">USDT</span>
						</div>
					</div>
				</div>
			</div>
		</aside>
	</div>
</div>
