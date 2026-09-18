<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';

	type SocialItem = {
		label: string;
		href: string;
		icon: string;
		action: string;
		subtitle: string;
		color: string;
	};

	const socialItems: SocialItem[] = [
		{
			label: 'Twitch',
			href: 'https://www.twitch.tv/bzetbros',
			icon: '/images/socials/twitch_white.svg',
			action: 'Folgen',
			subtitle: 'Live Streams & Casino Content',
			color: '#9146FF'
		},
		{
			label: 'Instagram',
			href: 'https://www.instagram.com/realbzet?igsi=eThpc3J6amZzeWlp',
			icon: '/images/socials/instagram.svg',
			action: 'Folgen',
			subtitle: 'Storys, Updates & Highlights',
			color: '#E1306C'
		},
		{
			label: 'YouTube',
			href: 'https://youtube.com/@realbzet?si=d2JgJw1OHcyUk81t',
			icon: '/images/socials/youtube.svg',
			action: 'Abonnieren',
			subtitle: 'Videos, Highlights & mehr',
			color: '#FF0000'
		},
		{
			label: 'Discord',
			href: 'https://discord.gg/RkUaKZnYY',
			icon: '/images/socials/discord.svg',
			action: 'Beitreten',
			subtitle: 'Direkt in die BZET Community',
			color: '#5865F2'
		},
		{
			label: 'TikTok',
			href: 'https://www.tiktok.com/@bzetreal?_r=1&_t=ZG-99qRMGOBMVV',
			icon: '/images/socials/tiktok.svg',
			action: 'Folgen',
			subtitle: 'Storys, Updates & Highlights',
			color: '#000000'
		}
	];
</script>

<section class="w-full py-12 sm:py-14">
	<div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
		<!-- Header -->
		<div class="mb-5">
			<div class="mb-3 flex items-center gap-3">
				<div
					class="rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40"
				>
					BZET SOCIALS
				</div>

				<div class="h-px flex-1 bg-white/[0.05]"></div>
			</div>

			<h2 class="text-[22px] font-bold tracking-[-0.035em] text-white sm:text-[26px]">
				Bleib mit BZET verbunden
			</h2>

			<p class="mt-1 max-w-[520px] text-[12px] leading-[19px] text-white/35 sm:text-[13px]">
				Streams, Videos, Community-Updates und alles rund um BZET auf einen Blick.
			</p>
		</div>

		<!-- Social Grid -->
		<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
			{#each socialItems as social (social.label)}
				<a
					href={social.href}
					target="_blank"
					rel="noreferrer"
					class="group relative overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#11131a] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#5fc4ff]/25 hover:bg-[#131720]"
				>
					<!-- Top Accent -->
					<div
						class="absolute left-0 top-0 h-px w-0 bg-[#66c7ff] transition-all duration-300 group-hover:w-full"
					></div>

					<div class="flex min-h-[116px] flex-col p-4">
						<!-- Icon Row -->
						<div class="flex items-start justify-between">
							<div
								style={`background-color: ${social.color}`}
								class="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/[0.07] transition-all duration-200 group-hover:border-[#67c8ff]/20 group-hover:bg-[#16202a]"
							>
								<img
									src={social.icon}
									alt={social.label}
									class="h-[17px] w-[17px] object-contain opacity-90 transition duration-200 group-hover:opacity-100"
								/>
							</div>

							<div
								class="flex h-7 w-7 items-center justify-center rounded-[7px] border border-white/[0.05] bg-white/[0.015] text-white/20 transition-all duration-200 group-hover:border-[#67c8ff]/15 group-hover:bg-[#67c8ff]/[0.04] group-hover:text-[#78ceff]"
							>
								<ArrowUpRight
									size={13}
									strokeWidth={2}
									class="transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
								/>
							</div>
						</div>

						<!-- Text -->
						<div class="mt-4">
							<div class="flex items-center gap-1.5">
								<span class="text-[13px] font-bold tracking-[-0.015em] text-white">
									{social.label}
								</span>

								<span class="text-[10px] text-white/18">•</span>

								<span
									class="text-[10px] font-semibold text-white/30 transition-colors duration-200 group-hover:text-[#76ccff]"
								>
									{social.action}
								</span>
							</div>

							<p class="mt-1 text-[10.5px] leading-[16px] text-white/27">
								{social.subtitle}
							</p>
						</div>
					</div>

					<!-- Bottom Hover Line -->
					<div
						class="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-[#66c7ff]/0 to-transparent transition-all duration-300 group-hover:via-[#66c7ff]/20"
					></div>
				</a>
			{/each}
		</div>
	</div>
</section>
