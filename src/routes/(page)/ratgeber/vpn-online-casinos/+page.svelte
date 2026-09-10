<script lang="ts">
	import {
		ArrowLeft,
		BookOpen,
		Check,
		ChevronDown,
		CircleAlert,
		Clock3,
		Globe2,
		LockKeyhole,
		ShieldCheck,
		Wifi
	} from 'lucide-svelte';

	let openFaq = $state<number | null>(0);

	const sections = [
		{
			title: 'Was macht ein VPN?',
			text: 'Ein VPN baut eine verschlüsselte Verbindung zwischen deinem Gerät und einem VPN-Server auf. Webseiten sehen dadurch grundsätzlich die IP-Adresse des VPN-Servers statt deiner direkten öffentlichen IP-Adresse.',
			points: [
				'Datenverkehr wird über einen VPN-Server geleitet',
				'Öffentliche IP-Adresse kann sich dadurch ändern',
				'Verbindung zwischen Gerät und VPN-Server wird verschlüsselt',
				'Besonders in öffentlichen Netzwerken kann das zusätzlichen Schutz bieten'
			]
		},
		{
			title: 'Warum nutzen Spieler ein VPN?',
			text: 'VPNs werden häufig aus Datenschutz- oder Sicherheitsgründen genutzt. Im Zusammenhang mit Online Casinos muss jedoch besonders darauf geachtet werden, ob der jeweilige Anbieter die Nutzung eines VPN überhaupt erlaubt.',
			points: [
				'Zusätzlicher Datenschutz im Netzwerk',
				'Schutz in öffentlichen WLAN-Netzen',
				'Änderung der sichtbaren IP-Adresse',
				'Casino-Regeln zur VPN-Nutzung unbedingt beachten'
			]
		},
		{
			title: 'Kann ein Casino ein VPN verbieten?',
			text: 'Ja. Ein Casino kann in seinen Nutzungsbedingungen festlegen, ob VPN-Verbindungen erlaubt sind. Wird ein VPN verwendet, um Standortbeschränkungen oder andere Vorgaben zu umgehen, kann dies je nach Anbieter gegen die Bedingungen verstoßen.'
		},
		{
			title: 'Was macht einen guten VPN aus?',
			text: 'Bei der Auswahl eines VPNs spielen nicht nur Geschwindigkeit und Serveranzahl eine Rolle. Besonders wichtig sind Sicherheitsfunktionen und eine nachvollziehbare Datenschutzpolitik.',
			points: [
				'Moderne Verschlüsselung',
				'Kill Switch',
				'Transparente Datenschutzbedingungen',
				'Gute Verbindungsgeschwindigkeit',
				'Server in passenden Regionen',
				'Regelmäßige Sicherheitsupdates'
			]
		}
	];

	const faqs = [
		{
			question: 'Ist die Nutzung eines VPN im Online Casino erlaubt?',
			answer:
				'Das hängt vom jeweiligen Casino und dessen Bedingungen ab. Vor der Nutzung solltest du prüfen, ob VPN-Verbindungen ausdrücklich erlaubt oder eingeschränkt werden.'
		},
		{
			question: 'Bin ich mit einem VPN anonym?',
			answer:
				'Ein VPN erhöht den Datenschutz, macht dich aber nicht automatisch vollständig anonym. Casinos können weiterhin beispielsweise Kontodaten, Cookies und weitere technische Merkmale verwenden.'
		},
		{
			question: 'Macht ein VPN meine Verbindung langsamer?',
			answer:
				'Da deine Verbindung über einen zusätzlichen Server geleitet wird, kann die Geschwindigkeit etwas sinken. Bei guten Anbietern und nahegelegenen Servern fällt der Unterschied häufig geringer aus.'
		},
		{
			question: 'Kann ich mit einem VPN Länderbeschränkungen umgehen?',
			answer:
				'Technisch kann ein VPN die sichtbare IP-Adresse verändern. Die Umgehung geografischer oder regulatorischer Einschränkungen kann jedoch gegen die Bedingungen eines Casinos verstoßen und sollte nicht als Zweck der Nutzung angesehen werden.'
		}
	];
</script>

<svelte:head>
	<title>VPN für Online Casinos | BZETBONUS</title>
	<meta
		name="description"
		content="VPN für Online Casinos erklärt: Wie VPNs funktionieren, Datenschutz, Sicherheit und worauf Spieler bei Casino Bedingungen achten sollten."
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
					class="max-w-[680px] text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-[58px]"
				>
					VPN für
					<span class="text-[#9fd0ff]">Online Casinos.</span>
				</h1>

				<p class="mt-6 max-w-[620px] text-[14px] font-medium leading-7 text-white/48">
					Was ein VPN tatsächlich macht, welche Sicherheitsvorteile es bietet und warum du bei
					Online Casinos trotzdem immer die jeweiligen Nutzungsbedingungen beachten musst.
				</p>

				<div
					class="mt-8 flex max-w-[560px] items-start gap-3 rounded-xl border border-white/[0.065] bg-black/10 p-4"
				>
					<ShieldCheck size={18} class="mt-0.5 shrink-0 text-[#9fd0ff]" />

					<p class="text-[12px] font-medium leading-5 text-white/40">
						Ein VPN sollte nicht verwendet werden, um geografische oder regulatorische
						Beschränkungen eines Casinos zu umgehen.
					</p>
				</div>
			</div>

			<div class="relative min-h-[300px] overflow-hidden lg:min-h-full">
				<img
					src="/images/ratgeber/vpn.jpg"
					alt="VPN für Online Casinos"
					class="absolute inset-0 h-full w-full object-cover"
				/>

				<div
					class="absolute inset-0 bg-linear-to-r from-[#111318] via-[#111318]/25 to-transparent lg:from-[#111318]/80"
				></div>

				<div
					class="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-white backdrop-blur-xl"
				>
					<Wifi size={25} strokeWidth={1.8} />
				</div>
			</div>
		</div>
	</section>

	<div class="mt-12 grid gap-10 lg:grid-cols-[1fr_300px]">
		<main>
			<p class="text-[15px] font-medium leading-8 text-white/55">
				Ein <strong class="font-bold text-white/85">Virtual Private Network</strong>, kurz VPN, kann
				deine Verbindung absichern und deine öffentliche IP-Adresse gegenüber Webseiten verändern.
				Gerade beim Glücksspiel ist es jedoch wichtig, technische Möglichkeiten und die Bedingungen
				des jeweiligen Anbieters voneinander zu unterscheiden.
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
					<h3 class="text-[13px] font-bold text-white/80">Casino-Regeln haben Vorrang</h3>

					<p class="mt-2 text-[12px] font-medium leading-6 text-white/40">
						Auch wenn ein VPN technisch funktioniert, bedeutet das nicht automatisch, dass seine
						Nutzung beim jeweiligen Casino erlaubt ist. Die Nutzungsbedingungen des Anbieters sind
						entscheidend.
					</p>
				</div>
			</div>

			<section class="mt-14">
				<p class="text-[10px] font-bold tracking-[0.16em] text-[#9fd0ff]/55 uppercase">
					Häufige Fragen
				</p>

				<h2 class="mb-6 mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
					FAQ zu VPNs im Online Casino
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
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8dc7ff]/[0.07] text-[#9fd0ff]"
					>
						<LockKeyhole size={19} />
					</div>

					<p class="mt-4 text-[13px] font-bold text-white/80">Was ein VPN schützt</p>

					<p class="mt-2 text-[11px] font-medium leading-5 text-white/38">
						Ein VPN schützt insbesondere die Verbindung zwischen deinem Gerät und dem verwendeten
						VPN-Server.
					</p>
				</div>

				<div class="rounded-2xl border border-white/[0.065] bg-white/[0.02] p-5">
					<div class="flex items-center gap-3">
						<Globe2 size={17} class="text-[#9fd0ff]" />
						<p class="text-[12px] font-bold text-white/70">Standort & IP</p>
					</div>

					<p class="mt-3 text-[11px] font-medium leading-5 text-white/36">
						Der VPN-Server stellt gegenüber Webseiten eine andere öffentliche IP-Adresse bereit. Das
						ändert jedoch nicht deine tatsächlichen rechtlichen oder vertraglichen Voraussetzungen.
					</p>
				</div>
			</div>
		</aside>
	</div>
</div>
