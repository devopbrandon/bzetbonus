<script lang="ts">
	type ParticleItem = {
		id: number;
		left: number;
		size: number;
		delay: number;
		duration: number;
		opacity: number;
		drift: number;
	};

	type FloatingSlotItem = {
		id: number;
		src: string;

		left: number;
		top: number;

		size: number;

		delay: number;
		duration: number;

		opacity: number;

		rotate: number;

		driftX: number;
		driftY: number;
	};

	function seededRandom(seed: number) {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	}

	/* ============================================================
	   PARTICLES
	============================================================ */

	const particles: ParticleItem[] = Array.from({ length: 12 }, (_, index) => {
		const r1 = seededRandom(index + 1);
		const r2 = seededRandom(index + 20);
		const r3 = seededRandom(index + 40);
		const r4 = seededRandom(index + 80);

		return {
			id: index,

			left: r1 * 100,

			size: 1 + r2 * 2,

			duration: 10 + r3 * 8,

			delay: -(r4 * 14),

			opacity: 0.05 + seededRandom(index + 120) * 0.1,

			drift: -18 + seededRandom(index + 160) * 36
		};
	});

	/* ============================================================
	   SLOT ICONS
	============================================================ */

	const slotImages = [
		'/images/slots/slot-1.png',
		'/images/slots/slot-2.png',
		'/images/slots/slot-3.png',
		'/images/slots/slot-4.webp',
		'/images/slots/slot-5.webp'
	];

	/*
	 * Bewusst feste Zonen.
	 *
	 * 4 Icons oben
	 * 4 Icons mittig
	 * 4 Icons unten
	 *
	 * Die Reihen sind leicht gegeneinander versetzt,
	 * damit es nicht nach einem sichtbaren Raster aussieht.
	 */
	const slotPositions = [
		// TOP
		{ left: 7, top: 12 },
		{ left: 34, top: 16 },
		{ left: 66, top: 12 },
		{ left: 92, top: 17 },

		// MIDDLE
		{ left: 13, top: 47 },
		{ left: 39, top: 52 },
		{ left: 64, top: 48 },
		{ left: 88, top: 54 },

		// BOTTOM
		{ left: 7, top: 82 },
		{ left: 34, top: 88 },
		{ left: 67, top: 83 },
		{ left: 93, top: 89 }
	];

	const floatingSlots: FloatingSlotItem[] = slotPositions.map((position, index) => {
		const imageIndex = Math.floor(seededRandom(index + 300) * slotImages.length);

		return {
			id: index,

			src: slotImages[imageIndex],

			left: position.left,
			top: position.top,

			/*
			 * ca. 52 - 88px
			 */
			size: 52 + seededRandom(index + 420) * 36,

			/*
			 * Langsame Bewegung.
			 */
			duration: 14 + seededRandom(index + 460) * 8,

			/*
			 * Unterschiedliche Startpunkte,
			 * damit sie nicht synchron schweben.
			 */
			delay: -(seededRandom(index + 500) * 16),

			/*
			 * Sichtbar, aber nicht Hero-Level.
			 */
			opacity: 0.085 + seededRandom(index + 540) * 0.065,

			/*
			 * Nur leichte Rotation.
			 */
			rotate: -10 + seededRandom(index + 580) * 20,

			/*
			 * Sehr kleine Bewegung,
			 * damit die saubere Verteilung erhalten bleibt.
			 */
			driftX: -12 + seededRandom(index + 620) * 24,

			driftY: -10 + seededRandom(index + 660) * 20
		};
	});
</script>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05070a]">
	<!-- =====================================================
	     BASE
	===================================================== -->

	<div
		class="absolute inset-0 bg-[linear-gradient(180deg,#090b0f_0%,#07090c_38%,#05070a_72%,#05070a_100%)]"
	></div>

	<!-- =====================================================
	     AMBIENT GLOWS
	===================================================== -->

	<div class="ambient ambient--top"></div>

	<div class="ambient ambient--left"></div>

	<div class="ambient ambient--bottom"></div>

	<!-- Fine top light -->

	<div
		class="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(159,208,255,0.035),transparent_68%)]"
	></div>

	<!-- BZET cool glow -->

	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(92,200,255,0.045),transparent_30%)]"
	></div>

	<!-- Secondary depth -->

	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_20%_58%,rgba(93,119,160,0.025),transparent_32%)]"
	></div>

	<!-- Very soft center light -->

	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(98,153,196,0.015),transparent_36%)]"
	></div>

	<!-- =====================================================
	     SLOT ICONS
	===================================================== -->

	<div class="slot-layer">
		{#each floatingSlots as slot}
			<img
				src={slot.src}
				alt=""
				aria-hidden="true"
				draggable="false"
				class="floating-slot"
				style="
					left: {slot.left}%;
					top: {slot.top}%;

					width: {slot.size}px;

					animation-delay: {slot.delay}s;
					animation-duration: {slot.duration}s;

					--slot-opacity: {slot.opacity};

					--slot-rotate: {slot.rotate}deg;

					--slot-drift-x: {slot.driftX}px;
					--slot-drift-y: {slot.driftY}px;
				"
			/>
		{/each}
	</div>

	<!-- =====================================================
	     PARTICLES
	===================================================== -->

	<div class="particle-layer">
		{#each particles as particle}
			<span
				class="particle"
				style="
					left: {particle.left}%;

					width: {particle.size}px;
					height: {particle.size}px;

					animation-delay: {particle.delay}s;
					animation-duration: {particle.duration}s;

					--particle-opacity: {particle.opacity};
					--particle-drift: {particle.drift}px;
				"
			></span>
		{/each}
	</div>

	<!-- =====================================================
	     VIGNETTE
	===================================================== -->

	<div
		class="absolute inset-0 z-[4] bg-[radial-gradient(circle_at_center,transparent_42%,rgba(0,0,0,0.20)_100%)]"
	></div>

	<!-- =====================================================
	     BOTTOM DEPTH
	===================================================== -->

	<div
		class="absolute inset-x-0 bottom-0 z-[2] h-[420px] bg-[linear-gradient(to_top,rgba(0,0,0,0.20),transparent)]"
	></div>

	<!-- =====================================================
	     NOISE
	===================================================== -->

	<div class="noise"></div>
</div>

<style>
	/* ============================================================
	   AMBIENT
	============================================================ */

	.ambient {
		position: absolute;

		border-radius: 9999px;

		filter: blur(110px);

		pointer-events: none;
	}

	.ambient--top {
		top: -240px;
		left: 50%;

		width: 780px;
		height: 430px;

		transform: translateX(-50%);

		background: rgba(92, 130, 170, 0.055);

		opacity: 0.7;

		animation: topGlow 10s ease-in-out infinite;
	}

	.ambient--left {
		top: 30%;
		left: -280px;

		width: 540px;
		height: 540px;

		background: rgba(70, 96, 130, 0.035);

		opacity: 0.65;

		animation: sideGlow 12s ease-in-out infinite;
	}

	.ambient--bottom {
		left: 54%;
		bottom: -340px;

		width: 920px;
		height: 520px;

		transform: translateX(-50%);

		background: rgba(63, 89, 122, 0.04);

		opacity: 0.55;

		animation: bottomGlow 11s ease-in-out infinite;
	}

	/* ============================================================
	   SLOT ICONS
	============================================================ */

	.slot-layer {
		position: absolute;

		inset: 0;

		z-index: 3;

		overflow: hidden;
	}

	.floating-slot {
		position: absolute;

		display: block;

		height: auto;

		object-fit: contain;

		user-select: none;

		opacity: var(--slot-opacity);

		filter: saturate(0.88) brightness(0.98) contrast(1.02)
			drop-shadow(0 9px 20px rgba(0, 0, 0, 0.24));

		transform: translate(-50%, -50%) translate3d(0, 0, 0) rotate(var(--slot-rotate));

		animation-name: floatingSlot;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;

		will-change: transform, opacity;
	}

	@keyframes floatingSlot {
		0%,
		100% {
			opacity: calc(var(--slot-opacity) * 0.78);

			transform: translate(-50%, -50%) translate3d(0, 0, 0) rotate(var(--slot-rotate)) scale(0.99);
		}

		30% {
			opacity: var(--slot-opacity);

			transform: translate(-50%, -50%)
				translate3d(calc(var(--slot-drift-x) * 0.65), calc(var(--slot-drift-y) * -0.55), 0)
				rotate(calc(var(--slot-rotate) + 2.5deg)) scale(1.01);
		}

		65% {
			opacity: calc(var(--slot-opacity) * 0.92);

			transform: translate(-50%, -50%) translate3d(var(--slot-drift-x), var(--slot-drift-y), 0)
				rotate(calc(var(--slot-rotate) - 2deg)) scale(1);
		}

		82% {
			opacity: var(--slot-opacity);

			transform: translate(-50%, -50%)
				translate3d(calc(var(--slot-drift-x) * -0.25), calc(var(--slot-drift-y) * 0.35), 0)
				rotate(calc(var(--slot-rotate) + 1deg)) scale(1.005);
		}
	}

	/* ============================================================
	   PARTICLES
	============================================================ */

	.particle-layer {
		position: absolute;

		inset: 0;

		z-index: 5;

		overflow: hidden;
	}

	.particle {
		position: absolute;

		bottom: -16px;

		display: block;

		border-radius: 9999px;

		background: rgba(205, 228, 255, 0.8);

		box-shadow: 0 0 8px rgba(120, 180, 220, 0.12);

		opacity: 0;

		animation-name: particleRise;
		animation-timing-function: linear;
		animation-iteration-count: infinite;

		will-change: transform, opacity;
	}

	@keyframes particleRise {
		0% {
			opacity: 0;

			transform: translate3d(0, 0, 0);
		}

		15% {
			opacity: var(--particle-opacity);
		}

		75% {
			opacity: calc(var(--particle-opacity) * 0.45);
		}

		100% {
			opacity: 0;

			transform: translate3d(var(--particle-drift), -110vh, 0);
		}
	}

	/* ============================================================
	   NOISE
	============================================================ */

	.noise {
		position: absolute;

		inset: 0;

		z-index: 6;

		opacity: 0.015;

		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='.55'/%3E%3C/svg%3E");

		background-repeat: repeat;

		mix-blend-mode: soft-light;
	}

	/* ============================================================
	   AMBIENT ANIMATIONS
	============================================================ */

	@keyframes topGlow {
		0%,
		100% {
			opacity: 0.46;

			transform: translateX(-50%) scale(0.98);
		}

		50% {
			opacity: 0.68;

			transform: translateX(-50%) scale(1.05);
		}
	}

	@keyframes sideGlow {
		0%,
		100% {
			opacity: 0.38;

			transform: translateY(0) scale(0.98);
		}

		50% {
			opacity: 0.58;

			transform: translateY(-18px) scale(1.05);
		}
	}

	@keyframes bottomGlow {
		0%,
		100% {
			opacity: 0.32;

			transform: translateX(-50%) scaleX(0.98);
		}

		50% {
			opacity: 0.52;

			transform: translateX(-50%) scaleX(1.06);
		}
	}

	/* ============================================================
	   TABLET
	============================================================ */

	@media (max-width: 1024px) {
		.slot-layer {
			opacity: 0.82;
		}

		.floating-slot {
			filter: saturate(0.82) brightness(0.92) contrast(1.02);
		}
	}

	/* ============================================================
	   MOBILE
	============================================================ */

	@media (max-width: 640px) {
		.particle-layer {
			opacity: 0.45;
		}

		.slot-layer {
			opacity: 0.72;
		}

		/*
		 * Desktop = 12.
		 * Mobile entfernen wir regelmäßig 4 Stück,
		 * sodass ungefähr 8 übrig bleiben.
		 *
		 * Nicht random, damit es weiterhin sauber verteilt ist.
		 */
		.floating-slot:nth-child(3n) {
			display: none;
		}

		.ambient {
			filter: blur(85px);
		}

		.ambient--top {
			width: 560px;
			height: 340px;
		}

		.ambient--bottom {
			width: 620px;
		}
	}

	/* ============================================================
	   SMALL MOBILE
	============================================================ */

	@media (max-width: 420px) {
		.slot-layer {
			opacity: 0.65;
		}

		.floating-slot {
			width: 50px !important;
		}
	}

	/* ============================================================
	   REDUCED MOTION
	============================================================ */

	@media (prefers-reduced-motion: reduce) {
		.particle,
		.ambient,
		.floating-slot {
			animation: none;
		}

		.particle {
			display: none;
		}

		.floating-slot {
			opacity: calc(var(--slot-opacity) * 0.8);

			transform: translate(-50%, -50%) rotate(var(--slot-rotate));
		}
	}
</style>
