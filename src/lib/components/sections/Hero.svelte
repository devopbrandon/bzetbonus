<section
	class="relative isolate flex min-h-100 items-center justify-center overflow-hidden px-5 pt-2 sm:min-h-140"
>
	<div class="relative z-10 flex flex-col items-center text-center">
		<img
			src="/logo.png"
			alt="Money4Duo"
			draggable="false"
			class="hero-logo w-[min(78vw,420px)] select-none drop-shadow-[0_28px_48px_rgba(0,0,0,0.5)]"
		/>

		<p
			class="hero-slogan mt-8 text-2xl sm:text-4xl lg:text-5xl uppercase leading-tight tracking-wide text-white sm:mt-10"
		>
			{#each ['Bonis', 'die', 'du', 'lieben', 'wirst!'] as word, i (word)}
				<span class="word" style="--i: {i}">{word}&nbsp;</span>
			{/each}
		</p>
	</div>
</section>

<style>
	.marquee-frame {
		--bulb: 26px;
		--dot: 2.5px;
		--amber: 255, 178, 84;
	}

	.bulb-strip {
		position: absolute;
		opacity: 0.9;
	}

	.bulb-strip::after {
		content: '';
		position: absolute;
		inset: 0;
		mix-blend-mode: screen;
		opacity: 0;
	}

	.bulb-strip--top,
	.bulb-strip--bottom {
		left: 0;
		right: 0;
		height: var(--dot);
		background-image: radial-gradient(circle, rgba(var(--amber), 0.55) 0 1.4px, transparent 1.6px);
		background-size: var(--bulb) 100%;
		background-repeat: repeat-x;
	}

	.bulb-strip--left,
	.bulb-strip--right {
		top: 0;
		bottom: 0;
		width: var(--dot);
		background-image: radial-gradient(circle, rgba(var(--amber), 0.55) 0 1.4px, transparent 1.6px);
		background-size: 100% var(--bulb);
		background-repeat: repeat-y;
	}

	.bulb-strip--top {
		top: 0;
	}
	.bulb-strip--bottom {
		bottom: 0;
	}
	.bulb-strip--left {
		left: 0;
	}
	.bulb-strip--right {
		right: 0;
	}

	.bulb-strip::after {
		background-image: radial-gradient(circle, rgba(255, 235, 200, 1) 0 1.6px, transparent 2.2px);
		filter: blur(0.3px) drop-shadow(0 0 6px rgba(var(--amber), 0.9));
	}

	.bulb-strip--top::after,
	.bulb-strip--bottom::after {
		background-size: 130px 100%;
		background-repeat: no-repeat;
		background-position: -130px 0;
	}

	.bulb-strip--left::after,
	.bulb-strip--right::after {
		background-size: 100% 130px;
		background-repeat: no-repeat;
		background-position: 0 -130px;
	}

	.bulb-strip--top::after {
		animation: chase-x 8s linear infinite;
		animation-delay: 0s;
	}
	.bulb-strip--right::after {
		animation: chase-y 8s linear infinite;
		animation-delay: -2s;
	}
	.bulb-strip--bottom::after {
		animation: chase-x-rev 8s linear infinite;
		animation-delay: -4s;
	}
	.bulb-strip--left::after {
		animation: chase-y-rev 8s linear infinite;
		animation-delay: -6s;
	}

	@keyframes chase-x {
		0% {
			opacity: 0;
			background-position: -130px 0;
		}
		2% {
			opacity: 1;
		}
		23% {
			opacity: 1;
			background-position: 100% 0;
		}
		25% {
			opacity: 0;
		}
		100% {
			opacity: 0;
			background-position: 100% 0;
		}
	}
	@keyframes chase-x-rev {
		0% {
			opacity: 0;
			background-position: 100% 0;
		}
		2% {
			opacity: 1;
		}
		23% {
			opacity: 1;
			background-position: -130px 0;
		}
		25% {
			opacity: 0;
		}
		100% {
			opacity: 0;
			background-position: -130px 0;
		}
	}
	@keyframes chase-y {
		0% {
			opacity: 0;
			background-position: 0 -130px;
		}
		2% {
			opacity: 1;
		}
		23% {
			opacity: 1;
			background-position: 0 100%;
		}
		25% {
			opacity: 0;
		}
		100% {
			opacity: 0;
			background-position: 0 100%;
		}
	}
	@keyframes chase-y-rev {
		0% {
			opacity: 0;
			background-position: 0 100%;
		}
		2% {
			opacity: 1;
		}
		23% {
			opacity: 1;
			background-position: 0 -130px;
		}
		25% {
			opacity: 0;
		}
		100% {
			opacity: 0;
			background-position: 0 -130px;
		}
	}

	.marquee-frame {
		animation: frame-ignite 900ms steps(2, end) 150ms both;
	}
	@keyframes frame-ignite {
		0% {
			opacity: 0;
		}
		40% {
			opacity: 0.4;
		}
		55% {
			opacity: 0.15;
		}
		100% {
			opacity: 1;
		}
	}

	.hero-logo {
		animation:
			logo-in 850ms cubic-bezier(0.16, 1, 0.3, 1) both,
			logo-float 6s ease-in-out 1s infinite;
	}

	@keyframes logo-in {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.97);
			filter: blur(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}

	@keyframes logo-float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.hero-slogan {
		font-family: 'Bungee', 'Montserrat', sans-serif;
		letter-spacing: 0.01em;
	}

	.hero-slogan .word {
		display: inline-block;
		opacity: 0;
		transform-origin: center bottom;
		animation:
			word-ignite 480ms ease forwards,
			word-wobble 4.2s ease-in-out calc(1030ms + var(--i) * 110ms) infinite;
		animation-delay: calc(550ms + var(--i) * 110ms), calc(1030ms + var(--i) * 110ms);
		text-shadow:
			0 3px 0 rgba(0, 0, 0, 0.55),
			0 0 22px rgba(255, 200, 140, 0.35);
		-webkit-text-stroke: 1px rgba(0, 0, 0, 0.35);
	}

	@keyframes word-ignite {
		0% {
			opacity: 0;
			transform: translateY(10px) scale(0.85) rotate(-3deg);
			text-shadow: none;
		}
		55% {
			opacity: 1;
			transform: translateY(-3px) scale(1.06) rotate(1.5deg);
			text-shadow: 0 0 18px rgba(255, 200, 140, 0.6);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1) rotate(0deg);
		}
	}

	@keyframes word-wobble {
		0%,
		100% {
			transform: translateY(0) rotate(0deg) scale(1);
		}
		25% {
			transform: translateY(-4px) rotate(-1.5deg) scale(1.015);
		}
		50% {
			transform: translateY(0) rotate(0.5deg) scale(1);
		}
		75% {
			transform: translateY(-2px) rotate(1.5deg) scale(1.01);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-frame,
		.bulb-strip::after,
		.hero-logo,
		.hero-slogan .word {
			animation: none !important;
			opacity: 1 !important;
		}
	}
</style>
