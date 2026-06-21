<script lang="ts">
	import { Sparkle } from 'lucide-svelte';

	type SparkleItem = {
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

	const sparkles: SparkleItem[] = Array.from({ length: 18 }, (_, index) => {
		const r1 = seededRandom(index + 1);
		const r2 = seededRandom(index + 12);
		const r3 = seededRandom(index + 24);
		const r4 = seededRandom(index + 48);

		return {
			id: index,
			left: 5 + r1 * 90,
			top: 5 + r2 * 90,
			size: 11 + r3 * 15,
			duration: 5.8 + r4 * 4.2,

			// Die ersten starten sofort, der Rest ist schon im Loop.
			delay: index < 5 ? index * 0.25 : -(seededRandom(index + 80) * 8),

			rotate: seededRandom(index + 120) * 360,
			opacity: 0.75 + seededRandom(index + 160) * 0.25
		};
	});
</script>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
	{#each sparkles as sparkle}
		<span
			class="casino-sparkle"
			style="
				left: {sparkle.left}%;
				top: {sparkle.top}%;
				animation-delay: {sparkle.delay}s;
				animation-duration: {sparkle.duration}s;
				--sparkle-size: {sparkle.size}px;
				--sparkle-rotate: {sparkle.rotate}deg;
				--sparkle-opacity: {sparkle.opacity};
			"
		>
			<Sparkle size={sparkle.size} strokeWidth={2.3} />
		</span>
	{/each}
</div>

<style>
	.casino-sparkle {
		position: absolute;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--sparkle-size);
		height: var(--sparkle-size);
		color: rgba(255, 255, 255, 0.96);
		opacity: 0;
		transform: translate(-50%, -50%) scale(0) rotate(var(--sparkle-rotate));
		filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.85))
			drop-shadow(0 0 18px rgba(255, 255, 255, 0.38));
		animation-name: sparkleBlink;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		will-change: opacity, transform, filter;
	}

	.casino-sparkle :global(svg) {
		display: block;
	}

	@keyframes sparkleBlink {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0) rotate(var(--sparkle-rotate));
			filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0)) drop-shadow(0 0 0 rgba(255, 255, 255, 0));
		}

		4% {
			opacity: calc(var(--sparkle-opacity) * 0.45);
			transform: translate(-50%, -50%) scale(0.55) rotate(var(--sparkle-rotate));
		}

		8% {
			opacity: var(--sparkle-opacity);
			transform: translate(-50%, -50%) scale(1.18) rotate(var(--sparkle-rotate));
			filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.95))
				drop-shadow(0 0 24px rgba(255, 255, 255, 0.48));
		}

		13% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.18) rotate(var(--sparkle-rotate));
			filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.45))
				drop-shadow(0 0 12px rgba(255, 255, 255, 0.18));
		}

		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0) rotate(var(--sparkle-rotate));
		}
	}

	@media (max-width: 640px) {
		.casino-sparkle {
			filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.7))
				drop-shadow(0 0 15px rgba(255, 255, 255, 0.28));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.casino-sparkle {
			display: none;
			animation: none;
		}
	}
</style>
