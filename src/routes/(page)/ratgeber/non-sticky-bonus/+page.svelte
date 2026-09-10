<script lang="ts">
	import {
		ArrowLeft,
		BookOpen,
		Check,
		ChevronDown,
		CircleAlert,
		Clock3,
		ShieldCheck,
		Star
	} from 'lucide-svelte';

	let openFaq = $state<number | null>(0);

	const sections = [
		{
			title: 'Wie funktioniert ein Non-Sticky Bonus?',
			text: 'Bei einem Non-Sticky Bonus werden dein eingezahltes Echtgeld und das Bonusguthaben grundsätzlich getrennt behandelt. Häufig spielst du zunächst mit deinem eigenen Guthaben. Erst wenn dieses aufgebraucht ist, wird der eigentliche Bonus verwendet.',
			points: [
				'Echtgeld und Bonusguthaben bleiben getrennt',
				'Häufig wird zuerst dein Echtgeld verwendet',
				'Der Bonus kann je nach Casino vor Nutzung verworfen werden',
				'Umsatzbedingungen betreffen in erster Linie den Bonus'
			]
		},
		{
			title: 'Was ist der Vorteil?',
			text: 'Der größte Vorteil ist die zusätzliche Flexibilität. Solange das Bonusguthaben noch nicht angerührt wurde, kannst du bei vielen Angeboten Gewinne aus deinem Echtgeldspiel auszahlen lassen, ohne zunächst den kompletten Bonus umsetzen zu müssen.',
			points: [
				'Mehr Kontrolle über dein eigenes Guthaben',
				'Potentiell frühere Auszahlungen möglich',
				'Bonusbedingungen blockieren dein Echtgeld weniger',
				'Bonus kann je nach Regeln abgebrochen werden'
			]
		},
		{
			title: 'Beispiel',
			text: 'Du zahlst 100 € ein und bekommst zusätzlich 100 € Bonus. Dein Kontostand beträgt damit 200 €. Bei einem typischen Non-Sticky Modell spielst du zunächst mit deinen eingezahlten 100 €. Gewinnst du damit beispielsweise und möchtest auszahlen, kannst du den ungenutzten Bonus je nach Bedingungen verwerfen und dein Echtgeld auszahlen.'
		},
		{
			title: 'Darauf solltest du achten',
			text: 'Auch ein Non-Sticky Bonus ist nicht automatisch ein guter Bonus. Entscheidend sind immer die vollständigen Bedingungen.',
			points: [
				'Wager beziehungsweise Umsatzanforderungen',
				'Maximal erlaubter Einsatz pro Spin',
				'Ausgeschlossene Spiele',
				'Zeitlimit des Bonus',
				'Mögliche maximale Gewinne oder Auszahlungen'
			]
		}
	];

	const faqs = [
		{
			question: 'Was bedeutet Non-Sticky Bonus?',
			answer:
				'Ein Non-Sticky Bonus ist ein Casino Bonus, bei dem das eingezahlte Echtgeld und das Bonusguthaben grundsätzlich getrennt voneinander behandelt werden.'
		},
		{
			question: 'Kann ich mein Echtgeld auszahlen?',
			answer:
				'Bei vielen Non-Sticky Angeboten ja, solange das Bonusguthaben noch nicht genutzt wurde. Die genauen Regeln unterscheiden sich jedoch je nach Casino.'
		},
		{
			question: 'Muss ein Non-Sticky Bonus umgesetzt werden?',
			answer:
				'Das Bonusguthaben selbst besitzt normalerweise weiterhin einen Wager. Der Vorteil besteht hauptsächlich darin, dass dein Echtgeld weniger stark an diese Umsatzbedingungen gekoppelt ist.'
		},
		{
			question: 'Ist Non-Sticky immer besser als Sticky?',
			answer:
				'Nicht zwangsläufig. Non-Sticky Boni sind häufig flexibler, trotzdem sollte immer das Gesamtpaket aus Wager, Max-Bet, Laufzeit und weiteren Bedingungen betrachtet werden.'
		}
	];
</script>

<svelte:head>
	<title>Non-Sticky Bonus erklärt | BZETBONUS</title>
	<meta
		name="description"
		content="Was ist ein Non-Sticky Bonus? Erfahre, wie Non-Sticky Casino Boni funktionieren, welche Vorteile sie haben und worauf du achten solltest."
	/>
</svelte:head>

<div class="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 sm:px-7 lg:px-10 lg:pt-14">
	<a
		href="/"
		class="group mb-7 inline-flex items-center gap-2 text-[12px] font-semibold text-white/35 transition hover:text-white/70"
	>
		<ArrowLeft size={15} class="transition-transform duration-200 group-hover:-translate-x-0.5" />
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
				<div class="mb-5 flex flex-wrap items-center gap-2">
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
						ca. 5 Min. Lesezeit
					</div>
				</div>

				<h1
					class="max-w-[650px] text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-[58px]"
				>
					Was ist ein
					<span class="text-[#9fd0ff]">Non-Sticky Bonus?</span>
				</h1>

				<p
					class="mt-6 max-w-[620px] text-[14px] font-medium leading-7 text-white/48 sm:text-[15px]"
				>
					Non-Sticky Casino Boni bieten dir mehr Flexibilität beim Umgang mit Echtgeld und
					Bonusguthaben. Wir erklären dir, wie das Modell funktioniert und wo die Unterschiede zu
					klassischen Boni liegen.
				</p>

				<div
					class="mt-8 flex max-w-[560px] items-start gap-3 rounded-xl border border-white/[0.065] bg-black/10 p-4"
				>
					<ShieldCheck size={18} class="mt-0.5 shrink-0 text-[#9fd0ff]" />

					<p class="text-[12px] font-medium leading-5 text-white/40">
						Bonusbedingungen unterscheiden sich je nach Anbieter. Prüfe vor der Aktivierung immer
						die Bedingungen des jeweiligen Casinos.
					</p>
				</div>
			</div>

			<div class="relative min-h-[300px] overflow-hidden lg:min-h-full">
				<img
					src="/images/ratgeber/non-sticky-bonus.webp"
					alt="Non-Sticky Bonus Ratgeber"
					class="absolute inset-0 h-full w-full object-cover"
				/>

				<div
					class="absolute inset-0 bg-linear-to-r from-[#111318] via-[#111318]/25 to-transparent lg:from-[#111318]/80"
				></div>

				<div
					class="absolute inset-0 bg-linear-to-t from-[#111318] via-transparent to-transparent lg:hidden"
				></div>

				<div
					class="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-white backdrop-blur-xl"
				>
					<Star size={25} strokeWidth={1.8} />
				</div>
			</div>
		</div>
	</section>

	<div class="mt-12 grid gap-10 lg:grid-cols-[1fr_300px]">
		<main class="min-w-0">
			<section>
				<p class="text-[15px] font-medium leading-8 text-white/55">
					Ein <strong class="font-bold text-white/85">Non-Sticky Bonus</strong> gehört zu den flexibleren
					Bonusvarianten im Online Casino. Anders als bei vielen klassischen Bonusmodellen wird deine
					Einzahlung nicht sofort vollständig mit dem Bonus verknüpft. Dadurch kann es einfacher sein,
					Gewinne aus deinem Echtgeldspiel auszahlen zu lassen, ohne zuvor sämtliche Umsatzbedingungen
					erfüllen zu müssen.
				</p>
			</section>

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

						<p class="text-[14px] font-medium leading-7 text-white/48">
							{section.text}
						</p>

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
				class="mt-6 flex items-start gap-4 rounded-2xl border border-amber-300/[0.09] bg-amber-300/[0.025] p-6"
			>
				<CircleAlert size={20} class="mt-0.5 shrink-0 text-amber-200/70" />

				<div>
					<h3 class="text-[13px] font-bold text-white/80">Wichtig zu wissen</h3>
					<p class="mt-2 text-[12px] font-medium leading-6 text-white/40">
						Der Begriff „Non-Sticky“ wird nicht bei jedem Anbieter exakt gleich verwendet. Schau
						deshalb immer nach, wann der Bonus aktiviert wird und welche Bedingungen bei einer
						Auszahlung gelten.
					</p>
				</div>
			</div>

			<section class="mt-14">
				<div class="mb-6">
					<p class="text-[10px] font-bold tracking-[0.16em] text-[#9fd0ff]/55 uppercase">
						Häufige Fragen
					</p>
					<h2 class="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
						FAQ zum Non-Sticky Bonus
					</h2>
				</div>

				<div class="space-y-2">
					{#each faqs as faq, index}
						<div class="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018]">
							<button
								type="button"
								onclick={() => (openFaq = openFaq === index ? null : index)}
								class="flex w-full cursor-pointer items-center justify-between gap-5 px-5 py-5 text-left"
							>
								<span class="text-[13px] font-bold text-white/75">
									{faq.question}
								</span>

								<ChevronDown
									size={16}
									class={`shrink-0 text-white/30 transition-transform duration-200 ${
										openFaq === index ? 'rotate-180 text-[#9fd0ff]' : ''
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
					<p class="text-[10px] font-bold tracking-[0.14em] text-white/25 uppercase">
						Kurz erklärt
					</p>

					<div class="mt-5 space-y-4">
						<div>
							<p class="text-[11px] font-semibold text-white/30">Typ</p>
							<p class="mt-1 text-[13px] font-bold text-white/75">Casino Bonus</p>
						</div>

						<div class="h-px bg-white/[0.05]"></div>

						<div>
							<p class="text-[11px] font-semibold text-white/30">Flexibilität</p>
							<p class="mt-1 text-[13px] font-bold text-[#9fd0ff]">Hoch</p>
						</div>

						<div class="h-px bg-white/[0.05]"></div>

						<div>
							<p class="text-[11px] font-semibold text-white/30">Wager</p>
							<p class="mt-1 text-[13px] font-bold text-white/75">Abhängig vom Angebot</p>
						</div>
					</div>
				</div>

				<a
					href="/#deals"
					class="group flex items-center justify-between rounded-xl border border-[#8dc7ff]/10 bg-[#8dc7ff]/[0.06] p-4 transition hover:bg-[#8dc7ff]/[0.09]"
				>
					<div>
						<p class="text-[11px] font-bold text-[#acd7ff]">Casino Angebote</p>
						<p class="mt-1 text-[10px] font-medium text-white/30">Aktuelle Deals ansehen</p>
					</div>

					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8dc7ff]/10 text-[#9fd0ff]"
					>
						<ChevronDown size={15} class="-rotate-90" />
					</div>
				</a>
			</div>
		</aside>
	</div>
</div>
