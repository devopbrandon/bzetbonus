<script lang="ts">
	import { ArrowDown, Play, ShieldCheck } from 'lucide-svelte';

	function scrollToDeals() {
		document.getElementById('deals')?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}
</script>

<section
	class="relative flex min-h-[72vh] items-center justify-center overflow-hidden px-5 pb-20 pt-24 sm:px-8 md:min-h-[78vh] md:pb-28 md:pt-28"
>
	<!-- =====================================================
	     BACKGROUND
	===================================================== -->
	<div class="pointer-events-none absolute inset-0 z-0">
		<img
			src="/images/hero.png"
			alt=""
			draggable="false"
			class="hero-background absolute inset-0 h-full w-full object-cover"
		/>

		<!-- dark cinematic grading -->
		<div class="absolute inset-0 bg-black/5"></div>

		<!-- center readability -->
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,8,13,0.30)_0%,rgba(5,8,13,0.48)_38%,rgba(3,5,8,0.78)_100%)]"
		></div>

		<!-- stronger darkness behind main content -->
		<div
			class="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,8,0.18)_0%,rgba(3,5,8,0.30)_32%,rgba(3,5,8,0.62)_50%,rgba(3,5,8,0.34)_70%,rgba(3,5,8,0.24)_100%)]"
		></div>

		<!-- seamless fade into next section -->
		<div
			class="absolute inset-x-0 bottom-0 h-[60%]
				bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,7,10,0.16)_22%,rgba(5,7,10,0.48)_52%,rgba(5,7,10,0.82)_76%,#05070a_100%)]"
		></div>
	</div>

	<!-- soft hero light -->
	<div
		class="pointer-events-none absolute left-1/2 top-[22%] z-[1] h-[320px] w-[700px] -translate-x-1/2 rounded-full bg-[#8dc7ff]/[0.035] blur-[110px]"
	></div>

	<div
		class="pointer-events-none absolute left-1/2 top-[32%] z-[1] h-px w-[65%] max-w-[900px] -translate-x-1/2 bg-linear-to-r from-transparent via-white/[0.055] to-transparent"
	></div>

	<!-- =====================================================
	     FLOATING SLOT ICONS
	===================================================== -->
	<div class="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
		<img src="/images/slots/slot-1.png" alt="" draggable="false" class="slot-icon slot-icon--1" />

		<img src="/images/slots/slot-2.png" alt="" draggable="false" class="slot-icon slot-icon--2" />

		<img src="/images/slots/slot-3.png" alt="" draggable="false" class="slot-icon slot-icon--3" />

		<img src="/images/slots/slot-4.webp" alt="" draggable="false" class="slot-icon slot-icon--4" />

		<img src="/images/slots/slot-5.webp" alt="" draggable="false" class="slot-icon slot-icon--5" />
	</div>

	<!-- =====================================================
	     CONTENT
	===================================================== -->
	<div class="relative z-10 mx-auto w-full max-w-[980px] text-center">
		<!-- Brand -->
		<div class="hero-enter hero-enter--logo mb-7 flex justify-center">
			<img
				src="/logo.png"
				alt="BZETBONUS"
				draggable="false"
				class="h-auto w-[220px] select-none object-contain drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:w-[270px] md:w-[330px]"
			/>
		</div>

		<!-- Headline -->
		<h1
			class="hero-enter hero-enter--headline mx-auto max-w-[800px] text-[34px] font-black leading-[0.98] tracking-[-0.045em] text-white sm:text-[48px] md:text-[64px] lg:text-[72px]"
		>
			Die besten Casino Boni für die
			<span class="text-[#9fd0ff]"> Community. </span>
		</h1>

		<!-- Copy -->
		<p
			class="hero-enter hero-enter--copy mx-auto mt-6 max-w-[620px] text-[14px] font-medium leading-6 text-white/48 sm:text-[15px]"
		>
			Verifizierte Casino Deals, die Bzet selbst nutzt und denen er vertraut. Schnelle Ein- und
			Auszahlungen sowie Freispiele ohne Einzahlung
		</p>

		<!-- Actions -->
		<div
			class="hero-enter hero-enter--actions mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
		>
			<button
				type="button"
				onclick={scrollToDeals}
				class="group flex h-12 min-w-[180px] cursor-pointer items-center justify-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.06] px-6 text-[13px] font-bold text-white transition duration-200 hover:border-[#5cc8ff]/35 hover:bg-[#5cc8ff]/[0.08]"
			>
				Bonus Angebote

				<ArrowDown
					size={16}
					strokeWidth={2.2}
					class="text-[#9fd0ff] transition-transform duration-200 group-hover:translate-y-0.5"
				/>
			</button>

			<a
				href="https://www.twitch.tv/bzetbros"
				target="_blank"
				rel="noreferrer"
				class="flex h-12 min-w-[180px] cursor-pointer items-center justify-center gap-2.5 rounded-md border border-white/[0.12] bg-white/[0.04] px-6 text-[13px] font-semibold text-white/75 transition duration-200 hover:border-[#9146ff]/35 hover:bg-[#9146ff]/[0.08] hover:text-white"
			>
				<img src="/images/socials/twitch.svg" alt="" class="h-[17px] w-[17px] object-contain" />

				Bzet auf Twitch
			</a>
		</div>

		<!-- Trust -->
		<div
			class="hero-enter hero-enter--trust mt-8 flex items-center justify-center gap-2 text-[11px] font-medium text-white/35"
		>
			<ShieldCheck size={14} strokeWidth={2} class="text-[#9fd0ff]/70" />

			<span> Von Bzet ausgewählte & getestete Casinos </span>
		</div>
	</div>
</section>

<style>
	/* ============================================================
	   BACKGROUND
	============================================================ */

	.hero-background {
		object-position: center center;
		filter: saturate(0.88) contrast(1.04) brightness(0.78);
		transform: scale(1.015);

		animation: heroBackgroundReveal 1100ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	/* ============================================================
	   CONTENT ENTRANCE
	============================================================ */

	.hero-enter {
		opacity: 0;
		transform: translateY(18px);
		filter: blur(5px);

		animation: heroReveal 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards;

		will-change: transform, opacity, filter;
	}

	.hero-enter--logo {
		animation-delay: 80ms;
	}

	.hero-enter--headline {
		animation-delay: 150ms;
	}

	.hero-enter--copy {
		animation-delay: 220ms;
	}

	.hero-enter--actions {
		animation-delay: 290ms;
	}

	.hero-enter--trust {
		animation-delay: 350ms;
	}

	@keyframes heroReveal {
		0% {
			opacity: 0;

			transform: translateY(18px) scale(0.992);

			filter: blur(5px);
		}

		55% {
			opacity: 1;
			filter: blur(0);
		}

		100% {
			opacity: 1;

			transform: translateY(0) scale(1);

			filter: blur(0);
		}
	}

	@keyframes heroBackgroundReveal {
		from {
			opacity: 0;
			transform: scale(1.04);
			filter: saturate(0.8) contrast(1.02) brightness(0.56);
		}

		to {
			opacity: 1;
			transform: scale(1.015);
			filter: saturate(0.88) contrast(1.04) brightness(0.78);
		}
	}

	/* ============================================================
	   FLOATING SLOT ICONS
	============================================================ */

	.slot-icon {
		position: absolute;

		display: block;

		object-fit: contain;

		user-select: none;

		opacity: 0;

		filter: saturate(0.85) brightness(0.95);

		will-change: transform, opacity;
	}

	.slot-icon--1 {
		left: 7%;
		top: 18%;

		width: 76px;

		animation:
			slotReveal 700ms 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards,
			floatOne 7.8s 950ms ease-in-out infinite;
	}

	.slot-icon--2 {
		right: 8%;
		top: 22%;

		width: 92px;

		animation:
			slotRevealSoft 700ms 340ms cubic-bezier(0.16, 1, 0.3, 1) forwards,
			floatTwo 9.4s 1.05s ease-in-out infinite;
	}

	.slot-icon--3 {
		left: 35%;
		bottom: 10%;

		width: 62px;

		animation:
			slotRevealSoft 700ms 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards,
			floatThree 8.7s 1.1s ease-in-out infinite;
	}

	.slot-icon--4 {
		right: 17%;
		bottom: 15%;

		width: 70px;

		animation:
			slotReveal 700ms 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards,
			floatFour 10.2s 1.2s ease-in-out infinite;
	}

	.slot-icon--5 {
		right: 30%;
		top: 9%;

		width: 50px;

		animation:
			slotRevealFaint 700ms 580ms cubic-bezier(0.16, 1, 0.3, 1) forwards,
			floatFive 11s 1.3s ease-in-out infinite;
	}

	@keyframes slotReveal {
		from {
			opacity: 0;
			scale: 0.82;
		}

		to {
			opacity: 0.18;
			scale: 1;
		}
	}

	@keyframes slotRevealSoft {
		from {
			opacity: 0;
			scale: 0.82;
		}

		to {
			opacity: 0.14;
			scale: 1;
		}
	}

	@keyframes slotRevealFaint {
		from {
			opacity: 0;
			scale: 0.82;
		}

		to {
			opacity: 0.1;
			scale: 1;
		}
	}

	@keyframes floatOne {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(-6deg);
		}

		35% {
			transform: translate3d(14px, -18px, 0) rotate(2deg);
		}

		70% {
			transform: translate3d(-8px, 10px, 0) rotate(-2deg);
		}
	}

	@keyframes floatTwo {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(7deg);
		}

		40% {
			transform: translate3d(-18px, 15px, 0) rotate(-1deg);
		}

		75% {
			transform: translate3d(10px, -12px, 0) rotate(4deg);
		}
	}

	@keyframes floatThree {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(3deg);
		}

		30% {
			transform: translate3d(10px, -14px, 0) rotate(-5deg);
		}

		65% {
			transform: translate3d(-12px, 8px, 0) rotate(1deg);
		}
	}

	@keyframes floatFour {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(-3deg);
		}

		38% {
			transform: translate3d(-12px, -20px, 0) rotate(5deg);
		}

		72% {
			transform: translate3d(16px, 7px, 0) rotate(0deg);
		}
	}

	@keyframes floatFive {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(8deg);
		}

		32% {
			transform: translate3d(-8px, 12px, 0) rotate(0deg);
		}

		68% {
			transform: translate3d(12px, -16px, 0) rotate(5deg);
		}
	}

	/* ============================================================
	   RESPONSIVE
	============================================================ */

	@media (max-width: 1024px) {
		.hero-background {
			object-position: 38% center;
		}
	}

	@media (max-width: 768px) {
		.hero-background {
			object-position: 28% center;

			filter: saturate(0.82) contrast(1.02) brightness(0.6);
		}

		.slot-icon--1 {
			left: 2%;
			top: 15%;
		}

		.slot-icon--2 {
			right: 1%;
			top: 28%;
		}

		.slot-icon--3 {
			left: 5%;
			bottom: 13%;
		}

		.slot-icon--4 {
			right: 5%;
			bottom: 12%;
		}

		.slot-icon--5 {
			right: 24%;
			top: 7%;
		}

		@keyframes slotReveal {
			to {
				opacity: 0.1;
				scale: 1;
			}
		}

		@keyframes slotRevealSoft {
			to {
				opacity: 0.08;
				scale: 1;
			}
		}

		@keyframes slotRevealFaint {
			to {
				opacity: 0.06;
				scale: 1;
			}
		}
	}

	@media (max-width: 520px) {
		.hero-background {
			object-position: 20% center;

			filter: saturate(0.75) contrast(1.02) brightness(0.48);
		}

		.hero-enter {
			transform: translateY(12px);
			filter: blur(3px);

			animation-duration: 520ms;
		}
	}

	/* ============================================================
	   REDUCED MOTION
	============================================================ */

	@media (prefers-reduced-motion: reduce) {
		.hero-background,
		.hero-enter,
		.slot-icon {
			animation: none;
		}

		.hero-enter {
			opacity: 1;
			transform: none;
			filter: none;
		}

		.slot-icon {
			opacity: 0.12;
		}
	}
</style>
