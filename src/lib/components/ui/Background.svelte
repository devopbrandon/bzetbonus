<script lang="ts">
	type StarItem = {
		id: number;
		left: number;
		top: number;
		size: number;
		delay: number;
		duration: number;
		rotate: number;
		opacity: number;
	};

	function seededRandom(seed: number) {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	}

	const stars: StarItem[] = Array.from({ length: 16 }, (_, index) => {
		const r1 = seededRandom(index + 1);
		const r2 = seededRandom(index + 12);
		const r3 = seededRandom(index + 24);
		const r4 = seededRandom(index + 48);

		return {
			id: index,
			left: 4 + r1 * 92,
			top: 5 + r2 * 88,
			size: 18 + r3 * 26,
			duration: 4.8 + r4 * 4.5,

			// startet direkt, nicht erst nach mehreren Sekunden
			delay: index < 6 ? index * 0.18 : -(seededRandom(index + 80) * 7),

			rotate: -18 + seededRandom(index + 120) * 36,
			opacity: 0.78 + seededRandom(index + 160) * 0.22
		};
	});
</script>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
	{#each stars as star}
		<span
			class="casino-star"
			style="
				left: {star.left}%;
				top: {star.top}%;
				width: {star.size}px;
				height: {star.size}px;
				animation-delay: {star.delay}s;
				animation-duration: {star.duration}s;
				--star-rotate: {star.rotate}deg;
				--star-opacity: {star.opacity};
			"
		>
			<span class="casino-star__ray casino-star__ray--horizontal"></span>
			<span class="casino-star__ray casino-star__ray--vertical"></span>
			<span class="casino-star__diamond"></span>
		</span>
	{/each}
</div>

<style>
	.casino-star {
		position: absolute;
		display: block;
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.15) rotate(var(--star-rotate));
		animation-name: casinoStarFlash;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		will-change: opacity, transform, filter;
		filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.95))
			drop-shadow(0 0 14px rgba(255, 255, 255, 0.55))
			drop-shadow(0 0 26px rgba(180, 220, 255, 0.35));
	}

	.casino-star__diamond {
		position: absolute;
		inset: 27%;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 1) 0%,
			rgba(255, 255, 255, 0.98) 38%,
			rgba(185, 205, 220, 0.96) 66%,
			rgba(255, 255, 255, 1) 100%
		);
		clip-path: polygon(50% 0%, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0% 50%, 36% 36%);
		border-radius: 1px;
		box-shadow:
			0 0 3px rgba(255, 255, 255, 1),
			0 0 9px rgba(255, 255, 255, 0.78),
			0 0 18px rgba(255, 255, 255, 0.38);
	}

	.casino-star__ray {
		position: absolute;
		left: 50%;
		top: 50%;
		display: block;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.casino-star__ray--horizontal {
		width: 118%;
		height: 8%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 18%,
			rgba(255, 255, 255, 0.95) 50%,
			rgba(255, 255, 255, 0.1) 82%,
			transparent 100%
		);
		border-radius: 999px;
	}

	.casino-star__ray--vertical {
		width: 8%;
		height: 118%;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 18%,
			rgba(255, 255, 255, 0.95) 50%,
			rgba(255, 255, 255, 0.1) 82%,
			transparent 100%
		);
		border-radius: 999px;
	}

	@keyframes casinoStarFlash {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.08) rotate(var(--star-rotate));
			filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0)) drop-shadow(0 0 0 rgba(255, 255, 255, 0));
		}

		5% {
			opacity: calc(var(--star-opacity) * 0.55);
			transform: translate(-50%, -50%) scale(0.62) rotate(var(--star-rotate));
		}

		9% {
			opacity: var(--star-opacity);
			transform: translate(-50%, -50%) scale(1.22) rotate(var(--star-rotate));
			filter: drop-shadow(0 0 6px rgba(255, 255, 255, 1))
				drop-shadow(0 0 16px rgba(255, 255, 255, 0.75))
				drop-shadow(0 0 34px rgba(180, 220, 255, 0.45));
		}

		13% {
			opacity: calc(var(--star-opacity) * 0.72);
			transform: translate(-50%, -50%) scale(0.88) rotate(var(--star-rotate));
		}

		18% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.16) rotate(var(--star-rotate));
			filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))
				drop-shadow(0 0 12px rgba(255, 255, 255, 0.16));
		}

		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.08) rotate(var(--star-rotate));
		}
	}

	@media (max-width: 640px) {
		.casino-star {
			filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.82))
				drop-shadow(0 0 14px rgba(255, 255, 255, 0.36));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.casino-star {
			display: none;
			animation: none;
		}
	}
</style>
