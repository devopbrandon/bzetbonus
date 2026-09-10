<script lang="ts">
	import {
		ArrowLeft,
		BookOpen,
		Check,
		ChevronDown,
		CircleAlert,
		Clock3,
		LockKeyhole,
		ShieldCheck
	} from 'lucide-svelte';

	let openFaq = $state<number | null>(0);

	const sections = [
		{
			title: 'Wie funktioniert ein Sticky Bonus?',
			text: 'Bei einem Sticky Bonus wird das Bonusguthaben stärker mit deiner Einzahlung verbunden. Sobald du den Bonus annimmst, gelten dessen Bedingungen häufig für dein gesamtes Bonuskonto.',
			points: [
				'Einzahlung und Bonus werden stärker miteinander verbunden',
				'Auszahlungen sind häufig erst nach dem Wager möglich',
				'Bonusbedingungen gelten während der gesamten Bonusphase',
				'Ein Abbruch kann zum Verlust des Bonusguthabens führen'
			]
		},
		{
			title: 'Was bedeutet der Wager?',
			text: 'Der Wager legt fest, wie oft ein bestimmter Betrag umgesetzt werden muss. Entscheidend ist dabei, ob nur der Bonus oder Bonus plus Einzahlung als Grundlage verwendet werden.',
			points: [
				'30x Bonus ist etwas anderes als 30x Einzahlung + Bonus',
				'Nicht jedes Spiel zählt zu 100 % zum Umsatz',
				'Ein Max-Bet begrenzt häufig den erlaubten Einsatz',
				'Der Wager muss innerhalb der Bonuslaufzeit erfüllt werden'
			]
		},
		{
			title: 'Ein einfaches Beispiel',
			text: 'Du zahlst 100 € ein und erhältst 100 € Bonus. Bei einem 30x Wager nur auf den Bonus müsstest du 3.000 € umsetzen. Gilt der 30x Wager dagegen auf Einzahlung und Bonus zusammen, wären 6.000 € Umsatz notwendig.'
		},
		{
			title: 'Wann lohnt sich ein Sticky Bonus?',
			text: 'Sticky Boni können trotz ihrer stärkeren Bindung attraktiv sein. Entscheidend ist, ob die Konditionen fair sind und zu deinem Spielverhalten passen.',
			points: [
				'Niedriger oder realistischer Wager',
				'Faire Max-Bet-Regel',
				'Ausreichend lange Bonuslaufzeit',
				'Gute Spielgewichtung',
				'Keine problematischen Gewinnlimits'
			]
		}
	];

	const faqs = [
		{
			question: 'Was bedeutet Sticky Bonus?',
			answer:
				'Bei einem Sticky Bonus ist dein Bonusguthaben stärker an die Einzahlung und die dazugehörigen Umsatzbedingungen gekoppelt.'
		},
		{
			question: 'Kann ich während eines Sticky Bonus auszahlen?',
			answer:
				'In vielen Fällen erst nachdem die Umsatzbedingungen vollständig erfüllt wurden. Die konkrete Regel hängt vom jeweiligen Casino ab.'
		},
		{
			question: 'Was passiert, wenn ich den Bonus abbreche?',
			answer:
				'Je nach Anbieter kann das Bonusguthaben und unter Umständen ein Teil der daraus entstandenen Gewinne entfernt werden.'
		},
		{
			question: 'Ist Sticky schlechter als Non-Sticky?',
			answer:
				'Nicht grundsätzlich. Non-Sticky ist häufig flexibler, ein Sticky Bonus kann bei guten Konditionen trotzdem attraktiv sein.'
		}
	];
</script>

<svelte:head>
	<title>Sticky Bonus erklärt | BZETBONUS</title>
	<meta
		name="description"
		content="Was ist ein Sticky Bonus? Erfahre alles über Wager, Umsatzbedingungen, Auszahlungen und den Unterschied zu Non-Sticky Boni."
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
						ca. 5 Min. Lesezeit
					</div>
				</div>

				<h1
					class="max-w-[650px] text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-[58px]"
				>
					Was ist ein
					<span class="text-[#9fd0ff]">Sticky Bonus?</span>
				</h1>

				<p class="mt-6 max-w-[620px] text-[14px] font-medium leading-7 text-white/48">
					Sticky Boni gehören zu den klassischen Bonusmodellen im Online Casino. Wir zeigen dir, was
					beim Wager passiert und warum die Bedingungen besonders wichtig sind.
				</p>

				<div
					class="mt-8 flex max-w-[560px] items-start gap-3 rounded-xl border border-white/[0.065] bg-black/10 p-4"
				>
					<ShieldCheck size={18} class="mt-0.5 shrink-0 text-[#9fd0ff]" />
					<p class="text-[12px] font-medium leading-5 text-white/40">
						Achte besonders darauf, ob der Wager nur für den Bonus oder für Einzahlung und Bonus
						zusammen gilt.
					</p>
				</div>
			</div>

			<div class="relative min-h-[300px] overflow-hidden lg:min-h-full">
				<img
					src="/images/ratgeber/sticky-bonus.jpg"
					alt="Sticky Bonus Ratgeber"
					class="absolute inset-0 h-full w-full object-cover"
				/>

				<div
					class="absolute inset-0 bg-linear-to-r from-[#111318] via-[#111318]/25 to-transparent lg:from-[#111318]/80"
				></div>

				<div
					class="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-white backdrop-blur-xl"
				>
					<LockKeyhole size={25} strokeWidth={1.8} />
				</div>
			</div>
		</div>
	</section>

	<div class="mt-12 grid gap-10 lg:grid-cols-[1fr_300px]">
		<main>
			<p class="text-[15px] font-medium leading-8 text-white/55">
				Ein <strong class="font-bold text-white/85">Sticky Bonus</strong> bindet das erhaltene Bonusguthaben
				stärker an dein Spielkonto. Bevor eine Auszahlung möglich wird, müssen normalerweise zunächst
				die dazugehörigen Umsatzbedingungen erfüllt werden.
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
				class="mt-6 flex items-start gap-4 rounded-2xl border border-amber-300/[0.09] bg-amber-300/[0.025] p-6"
			>
				<CircleAlert size={20} class="mt-0.5 shrink-0 text-amber-200/70" />

				<div>
					<h3 class="text-[13px] font-bold text-white/80">Bonusbedingungen beachten</h3>
					<p class="mt-2 text-[12px] font-medium leading-6 text-white/40">
						Ein niedriger Bonusbetrag mit guten Bedingungen kann attraktiver sein als ein riesiger
						Bonus mit sehr hohem Wager und strengen Einschränkungen.
					</p>
				</div>
			</div>

			<section class="mt-14">
				<p class="text-[10px] font-bold tracking-[0.16em] text-[#9fd0ff]/55 uppercase">
					Häufige Fragen
				</p>

				<h2 class="mb-6 mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
					FAQ zum Sticky Bonus
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
									class={`shrink-0 text-white/30 transition-transform ${
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
			<div class="sticky top-8 rounded-2xl border border-white/[0.065] bg-white/[0.02] p-5">
				<p class="text-[10px] font-bold tracking-[0.14em] text-white/25 uppercase">Kurz erklärt</p>

				<div class="mt-5 space-y-4">
					<div>
						<p class="text-[11px] font-semibold text-white/30">Typ</p>
						<p class="mt-1 text-[13px] font-bold text-white/75">Casino Bonus</p>
					</div>

					<div class="h-px bg-white/[0.05]"></div>

					<div>
						<p class="text-[11px] font-semibold text-white/30">Flexibilität</p>
						<p class="mt-1 text-[13px] font-bold text-white/75">Mittel</p>
					</div>

					<div class="h-px bg-white/[0.05]"></div>

					<div>
						<p class="text-[11px] font-semibold text-white/30">Wichtig</p>
						<p class="mt-1 text-[13px] font-bold text-[#9fd0ff]">Wager prüfen</p>
					</div>
				</div>
			</div>
		</aside>
	</div>
</div>
