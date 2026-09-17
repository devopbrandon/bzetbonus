<script lang="ts">
	import { onMount } from 'svelte';
	import { ExternalLink, MessageSquare, Radio, Tv, Maximize2 } from 'lucide-svelte';

	const twitchChannel = 'bzetbros'; // <- HIER Twitch Username eintragen

	let parent = $state('');
	let mounted = $state(false);

	onMount(() => {
		parent = window.location.hostname;
		mounted = true;
	});

	const twitchUrl = `https://www.twitch.tv/${twitchChannel}`;
</script>

<svelte:head>
	<title>Stream | BZETBONUS.COM</title>
	<meta
		name="description"
		content="Schau den Bzet Stream direkt auf BZETBONUS.COM und chatte live mit der Community."
	/>
</svelte:head>

<div class="stream-page">
	<div class="background-glow glow-one"></div>
	<div class="background-glow glow-two"></div>

	<div class="page-container">
		<!-- Header -->
		<section class="stream-header">
			<div class="header-left">
				<div class="eyebrow">
					<span class="live-dot"></span>
					<span>LIVE STREAM</span>
				</div>

				<h1>
					Bzet <span>Live.</span>
				</h1>

				<p>Stream anschauen, mit der Community chatten und nichts mehr verpassen.</p>
			</div>

			<a class="twitch-button" href={twitchUrl} target="_blank" rel="noopener noreferrer">
				<Tv size={18} strokeWidth={2.1} />
				<span>Direkt zu Twitch</span>
				<ExternalLink size={15} strokeWidth={2} />
			</a>
		</section>

		<!-- Stream Grid -->
		<section class="stream-grid">
			<!-- Player -->
			<div class="stream-card player-card">
				<div class="card-topbar">
					<div class="topbar-left">
						<div class="icon-box">
							<Radio size={16} strokeWidth={2} />
						</div>

						<div>
							<span class="topbar-label">STREAM</span>
							<span class="topbar-title">@{twitchChannel}</span>
						</div>
					</div>

					<a
						href={twitchUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="icon-button"
						aria-label="Stream auf Twitch öffnen"
					>
						<Maximize2 size={16} />
					</a>
				</div>

				<div class="player-wrapper">
					{#if mounted && parent}
						<iframe
							src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${parent}&muted=false`}
							title="Bzet Twitch Stream"
							allow="autoplay; fullscreen"
							allowfullscreen
						></iframe>
					{:else}
						<div class="loading-state">
							<div class="loader"></div>
							<span>Stream wird geladen...</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Chat -->
			<div class="stream-card chat-card">
				<div class="card-topbar">
					<div class="topbar-left">
						<div class="icon-box">
							<MessageSquare size={16} strokeWidth={2} />
						</div>

						<div>
							<span class="topbar-label">COMMUNITY</span>
							<span class="topbar-title">Live Chat</span>
						</div>
					</div>

					<div class="live-status">
						<span></span>
						LIVE
					</div>
				</div>

				<div class="chat-wrapper">
					{#if mounted && parent}
						<iframe
							src={`https://www.twitch.tv/embed/${twitchChannel}/chat?parent=${parent}&darkpopout`}
							title="Bzet Twitch Chat"
						></iframe>
					{:else}
						<div class="loading-state">
							<div class="loader"></div>
							<span>Chat wird geladen...</span>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Bottom Info -->
		<section class="stream-info">
			<div class="info-icon">
				<Tv size={20} strokeWidth={2} />
			</div>

			<div class="info-content">
				<strong>Direkt aus der Community.</strong>
				<span>
					Du kannst den Stream hier schauen und gleichzeitig ganz normal im Twitch-Chat schreiben.
				</span>
			</div>

			<a href={twitchUrl} target="_blank" rel="noopener noreferrer" class="info-link">
				Auf Twitch öffnen
				<ExternalLink size={14} />
			</a>
		</section>
	</div>
</div>

<style>
	.stream-page {
		position: relative;
		min-height: 100vh;
		overflow: hidden;

		color: #f4f7fb;
	}

	.page-container {
		position: relative;
		z-index: 2;
		width: min(1580px, calc(100% - 56px));
		margin: 0 auto;
		padding: 66px 0 80px;
	}

	/* HEADER */

	.stream-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 40px;
		margin-bottom: 26px;
	}

	.header-left {
		max-width: 720px;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;

		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.13em;
		color: #65bfff;
	}

	.live-dot {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: #4cb8ff;
		box-shadow: 0 0 0 4px rgba(76, 184, 255, 0.08);
	}

	h1 {
		margin: 0;
		font-size: clamp(38px, 4vw, 58px);
		line-height: 0.98;
		letter-spacing: -0.045em;
		font-weight: 850;
	}

	h1 span {
		color: #7dc7fa;
	}

	.header-left p {
		margin: 15px 0 0;
		max-width: 600px;
		color: #7d8794;
		font-size: 14px;
		line-height: 1.65;
	}

	.twitch-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 9px;

		height: 46px;
		padding: 0 18px;

		border: 1px solid rgba(145, 149, 160, 0.19);
		border-radius: 8px;

		background: #11161e;
		color: #ffffff;

		font-size: 12px;
		font-weight: 750;
		text-decoration: none;

		box-shadow:
			inset 0 1px rgba(255, 255, 255, 0.025),
			0 8px 30px rgba(0, 0, 0, 0.18);

		transition:
			background 160ms ease,
			border-color 160ms ease,
			transform 160ms ease;
	}

	.twitch-button :global(svg:first-child) {
		color: #a970ff;
	}

	.twitch-button:hover {
		background: #151b24;
		border-color: rgba(169, 112, 255, 0.42);
		transform: translateY(-1px);
	}

	/* GRID */

	.stream-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 370px;
		gap: 14px;
	}

	.stream-card {
		overflow: hidden;
		border: 1px solid rgba(154, 167, 183, 0.14);
		border-radius: 12px;
		background: #0d1219;

		box-shadow:
			0 25px 80px rgba(0, 0, 0, 0.32),
			inset 0 1px rgba(255, 255, 255, 0.02);
	}

	.card-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 62px;
		padding: 0 15px;

		border-bottom: 1px solid rgba(255, 255, 255, 0.055);
		background: #10161e;
	}

	.topbar-left {
		display: flex;
		align-items: center;
		gap: 11px;
	}

	.icon-box {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 33px;
		height: 33px;
		border-radius: 8px;

		border: 1px solid rgba(82, 172, 229, 0.13);
		background: rgba(67, 158, 218, 0.075);
		color: #69bdf3;
	}

	.topbar-left > div:last-child {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.topbar-label {
		color: #55b4ee;
		font-size: 9px;
		font-weight: 850;
		letter-spacing: 0.11em;
	}

	.topbar-title {
		color: #e6ebf1;
		font-size: 12px;
		font-weight: 700;
	}

	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 32px;
		height: 32px;
		border-radius: 7px;

		border: 1px solid rgba(255, 255, 255, 0.07);
		background: #141a22;
		color: #76808d;

		transition:
			color 150ms ease,
			border-color 150ms ease,
			background 150ms ease;
	}

	.icon-button:hover {
		color: #d9e1e9;
		background: #181f29;
		border-color: rgba(255, 255, 255, 0.12);
	}

	/* PLAYER */

	.player-wrapper {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #05070a;
	}

	.player-wrapper iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}

	/* CHAT */

	.chat-card {
		display: flex;
		flex-direction: column;
	}

	.chat-wrapper {
		position: relative;
		flex: 1;
		min-height: 0;
		background: #0b0e13;
	}

	.chat-wrapper iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}

	.live-status {
		display: inline-flex;
		align-items: center;
		gap: 6px;

		padding: 5px 8px;
		border-radius: 5px;

		background: rgba(88, 181, 239, 0.08);
		color: #67bff5;

		font-size: 9px;
		font-weight: 850;
		letter-spacing: 0.08em;
	}

	.live-status span {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #65bfff;
		box-shadow: 0 0 8px rgba(101, 191, 255, 0.8);
	}

	/* LOADING */

	.loading-state {
		position: absolute;
		inset: 0;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;

		color: #58616d;
		font-size: 12px;
	}

	.loader {
		width: 22px;
		height: 22px;
		border: 2px solid rgba(255, 255, 255, 0.08);
		border-top-color: #6abcf1;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* BOTTOM INFO */

	.stream-info {
		display: flex;
		align-items: center;
		gap: 13px;

		margin-top: 14px;
		padding: 15px 17px;

		border: 1px solid rgba(154, 167, 183, 0.11);
		border-radius: 10px;
		background: rgba(15, 20, 28, 0.76);
		backdrop-filter: blur(8px);
	}

	.info-icon {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 38px;
		height: 38px;
		flex: 0 0 38px;

		border-radius: 8px;
		background: rgba(169, 112, 255, 0.08);
		color: #a970ff;
	}

	.info-content {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}

	.info-content strong {
		font-size: 12px;
		font-weight: 750;
		color: #e6eaf0;
	}

	.info-content span {
		font-size: 11px;
		color: #6f7884;
	}

	.info-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;

		margin-left: auto;
		white-space: nowrap;

		color: #8b96a3;
		font-size: 11px;
		font-weight: 650;
		text-decoration: none;

		transition: color 150ms ease;
	}

	.info-link:hover {
		color: #ffffff;
	}

	/* BACKGROUND */

	.background-glow {
		position: absolute;
		pointer-events: none;
		border-radius: 999px;
		filter: blur(100px);
	}

	.glow-one {
		top: -300px;
		left: 12%;
		width: 620px;
		height: 620px;
		background: rgba(33, 116, 180, 0.065);
	}

	.glow-two {
		right: -300px;
		top: 220px;
		width: 600px;
		height: 600px;
		background: rgba(34, 97, 151, 0.035);
	}

	/* RESPONSIVE */

	@media (max-width: 1180px) {
		.stream-grid {
			grid-template-columns: 1fr;
		}

		.chat-wrapper {
			height: 650px;
			flex: none;
		}
	}

	@media (max-width: 720px) {
		.page-container {
			width: min(100% - 28px, 1580px);
			padding: 36px 0 50px;
		}

		.stream-header {
			align-items: flex-start;
			flex-direction: column;
			gap: 20px;
		}

		.twitch-button {
			width: 100%;
		}

		h1 {
			font-size: 42px;
		}

		.header-left p {
			font-size: 13px;
		}

		.stream-card {
			border-radius: 10px;
		}

		.chat-wrapper {
			height: 580px;
		}

		.stream-info {
			align-items: flex-start;
		}

		.info-link {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.page-container {
			width: calc(100% - 20px);
		}

		h1 {
			font-size: 36px;
		}

		.card-topbar {
			height: 56px;
			padding: 0 12px;
		}

		.chat-wrapper {
			height: 520px;
		}
	}
</style>
