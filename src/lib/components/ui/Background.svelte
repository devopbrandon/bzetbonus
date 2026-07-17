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

	const particles: ParticleItem[] = Array.from({ length: 22 }, (_, index) => {
		const r1 = seededRandom(index + 1);
		const r2 = seededRandom(index + 20);
		const r3 = seededRandom(index + 40);
		const r4 = seededRandom(index + 80);

		return {
			id: index,
			left: r1 * 100,
			size: 2 + r2 * 4,
			duration: 5 + r3 * 5,
			delay: -(r4 * 10),
			opacity: 0.15 + seededRandom(index + 120) * 0.3,
			drift: -24 + seededRandom(index + 160) * 48
		};
	});
</script>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0F0B1F]">
	<div class="absolute inset-0 bg-linear-to-b from-[#17122E] via-[#241646] to-[#0F0B1F]"></div>

	<div class="background-glow background-glow--left"></div>
	<div class="background-glow background-glow--right"></div>
	<div class="background-glow background-glow--bottom"></div>

	<div class="wave-wrap">
		<div class="glow-wave glow-wave--one"></div>
		<div class="glow-wave glow-wave--two"></div>
	</div>

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

	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(147,51,234,0.16),transparent_38%)]"
	></div>
	<div
		class="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.4),transparent_40%,rgba(255,255,255,0.02))]"
	></div>
</div>

<style>
	.background-glow {
		position: absolute;
		border-radius: 9999px;
		filter: blur(50px);
		opacity: 0.55;
		mix-blend-mode: screen;
	}

	.background-glow--left {
		left: -160px;
		top: 18%;
		width: 360px;
		height: 360px;
		background: rgba(124, 58, 237, 0.32);
		animation: glowPulse 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	.background-glow--right {
		right: -160px;
		top: 8%;
		width: 400px;
		height: 400px;
		background: rgba(168, 85, 247, 0.24);
		animation: glowPulse 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse;
	}

	.background-glow--bottom {
		left: 50%;
		bottom: -220px;
		width: 560px;
		height: 260px;
		background: rgba(147, 51, 234, 0.24);
		transform: translateX(-50%);
		animation: bottomGlow 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	.wave-wrap {
		position: absolute;
		left: -10%;
		right: -10%;
		bottom: -12%;
		height: 38%;
		overflow: hidden;
		opacity: 0.85;
	}

	.glow-wave {
		position: absolute;
		left: 50%;
		bottom: 0;
		width: 130%;
		height: 180px;
		border-radius: 50%;
		transform: translateX(-50%);
		background:
			radial-gradient(ellipse at center, rgba(147, 51, 234, 0.28) 0%, transparent 55%),
			linear-gradient(
				90deg,
				transparent,
				rgba(124, 58, 237, 0.32),
				rgba(88, 40, 200, 0.2),
				transparent
			);
		filter: blur(18px);
		mix-blend-mode: screen;
		animation: waveMove 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	.glow-wave--one {
		bottom: 18px;
		height: 140px;
		opacity: 0.55;
		animation-duration: 3.8s;
	}

	.glow-wave--two {
		bottom: 60px;
		height: 100px;
		opacity: 0.28;
		animation-duration: 4.8s;
		animation-delay: -1.5s;
	}

	.particle-layer {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.particle {
		position: absolute;
		bottom: -24px;
		display: block;
		border-radius: 9999px;
		background: rgba(220, 205, 255, 0.85);
		box-shadow:
			0 0 4px rgba(255, 255, 255, 0.7),
			0 0 10px rgba(147, 51, 234, 0.6);
		opacity: 0;
		animation-name: particleRise;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		will-change: transform, opacity;
	}

	@keyframes particleRise {
		0% {
			opacity: 0;
			transform: translate3d(0, 0, 0) scale(0.4);
		}

		12% {
			opacity: var(--particle-opacity);
		}

		70% {
			opacity: calc(var(--particle-opacity) * 0.6);
		}

		100% {
			opacity: 0;
			transform: translate3d(var(--particle-drift), -115vh, 0) scale(1);
		}
	}

	@keyframes waveMove {
		0%,
		100% {
			transform: translateX(-50%) translateY(10px) scaleX(1);
			filter: blur(16px);
		}

		50% {
			transform: translateX(-48%) translateY(-14px) scaleX(1.05);
			filter: blur(11px);
		}
	}

	@keyframes glowPulse {
		0%,
		100% {
			opacity: 0.32;
			transform: scale(0.96);
		}

		50% {
			opacity: 0.65;
			transform: scale(1.1);
		}
	}

	@keyframes bottomGlow {
		0%,
		100% {
			opacity: 0.22;
			transform: translateX(-50%) scaleX(0.98);
		}

		50% {
			opacity: 0.45;
			transform: translateX(-50%) scaleX(1.1);
		}
	}

	@media (max-width: 640px) {
		.particle-layer {
			opacity: 0.6;
		}

		.wave-wrap {
			height: 32%;
		}

		.background-glow {
			filter: blur(42px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.particle,
		.glow-wave,
		.background-glow {
			animation: none;
		}

		.particle {
			display: none;
		}
	}
</style>
