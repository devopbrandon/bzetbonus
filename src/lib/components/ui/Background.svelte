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

	function seededRandom(seed: number) {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	}

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
</script>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05070a]">
	<!-- Main depth -->
	<div
		class="absolute inset-0 bg-[linear-gradient(180deg,#090b0f_0%,#07090c_38%,#05070a_72%,#05070a_100%)]"
	></div>

	<!-- Soft ambient glows -->
	<div class="ambient ambient--top"></div>
	<div class="ambient ambient--left"></div>
	<div class="ambient ambient--bottom"></div>

	<!-- Fine top light -->
	<div
		class="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(159,208,255,0.035),transparent_68%)]"
	></div>

	<!-- Subtle BZET cool glow -->
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(92,200,255,0.045),transparent_30%)]"
	></div>

	<!-- Secondary depth glow -->
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_20%_58%,rgba(93,119,160,0.025),transparent_32%)]"
	></div>

	<!-- Particles -->
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

	<!-- Vignette -->
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(0,0,0,0.38)_100%)]"
	></div>

	<!-- Bottom depth -->
	<div
		class="absolute inset-x-0 bottom-0 h-[420px] bg-[linear-gradient(to_top,rgba(0,0,0,0.24),transparent)]"
	></div>

	<!-- Extremely subtle texture -->
	<div class="noise"></div>
</div>

<style>
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

	.particle-layer {
		position: absolute;
		inset: 0;

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

	.noise {
		position: absolute;
		inset: 0;

		opacity: 0.015;

		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='.55'/%3E%3C/svg%3E");

		background-repeat: repeat;

		mix-blend-mode: soft-light;
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

	@media (max-width: 640px) {
		.particle-layer {
			opacity: 0.45;
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

	@media (prefers-reduced-motion: reduce) {
		.particle,
		.ambient {
			animation: none;
		}

		.particle {
			display: none;
		}
	}
</style>
