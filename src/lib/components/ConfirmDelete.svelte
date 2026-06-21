<script lang="ts">
	import { Bomb, Trash, XCircle } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';

	let { dealId }: { dealId: number } = $props();

	let showConfirm = $state(false);

	function toggleConfirm() {
		showConfirm = !showConfirm;
	}

	function closeConfirm() {
		showConfirm = false;
	}

	function confirmDelete() {
		const form = document.getElementById(`delete-form-${dealId}`) as HTMLFormElement | null;
		form?.requestSubmit();
		showConfirm = false;
	}
</script>

<div class="confirm-delete">
	<button
		type="button"
		onclick={toggleConfirm}
		class="delete-trigger"
		title="Delete deal"
		aria-label="Delete deal"
		aria-expanded={showConfirm}
	>
		<Trash size={18} />
	</button>

	<form method="POST" action="?/delete" id={`delete-form-${dealId}`} class="hidden">
		<input type="hidden" name="dealId" value={dealId} />
	</form>

	{#if showConfirm}
		<div class="confirm-panel" in:fade={{ duration: 120 }} out:fade={{ duration: 100 }}>
			<div class="confirm-top-line"></div>

			<button
				type="button"
				onclick={closeConfirm}
				class="confirm-close"
				title="Cancel"
				aria-label="Cancel"
			>
				<XCircle size={18} />
			</button>

			<div class="mb-4 pr-7">
				<p class="text-[10px] font-black tracking-[0.2em] text-red-300/80 uppercase">Delete Deal</p>

				<h2 class="mt-1 text-lg font-black tracking-tight text-white">Delete this deal?</h2>

				<p class="mt-2 text-sm leading-6 text-white/55">
					This action cannot be undone. The deal will be permanently removed from the database.
				</p>
			</div>

			<div class="flex justify-end gap-2">
				<button type="button" onclick={closeConfirm} class="cancel-button"> Cancel </button>

				<button type="button" onclick={confirmDelete} class="confirm-button">
					<Bomb size={16} />
					Yes, delete
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.confirm-delete {
		position: relative;
		display: grid;
		height: 100%;
		width: 100%;
		place-items: center;
	}

	.delete-trigger {
		display: grid;
		height: 100%;
		width: 100%;
		cursor: pointer;
		place-items: center;
		color: rgba(255, 255, 255, 0.68);
		transition:
			color 180ms ease,
			transform 180ms ease;
	}

	.delete-trigger:hover {
		color: rgb(248, 113, 113);
		transform: translateY(-1px);
	}

	.confirm-panel {
		position: absolute;
		right: 0;
		bottom: calc(100% + 12px);
		z-index: 999;
		width: min(340px, calc(100vw - 32px));
		overflow: hidden;
		border-radius: 20px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background:
			radial-gradient(circle at 20% 0%, rgba(248, 113, 113, 0.16), transparent 36%),
			linear-gradient(180deg, rgba(18, 28, 62, 0.98), rgba(7, 13, 31, 0.98));
		padding: 18px;
		box-shadow:
			0 24px 70px -28px rgba(0, 0, 0, 0.9),
			0 0 42px -26px rgba(248, 113, 113, 0.7),
			inset 0 1px 0 rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(18px);
		transform-origin: bottom right;
	}

	.confirm-panel::before {
		content: '';
		position: absolute;
		right: 18px;
		bottom: -7px;
		height: 14px;
		width: 14px;
		border-right: 1px solid rgba(255, 255, 255, 0.12);
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
		background: #071026;
		transform: rotate(45deg);
	}

	.confirm-top-line {
		position: absolute;
		top: 0;
		left: 18px;
		right: 18px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
		opacity: 0.7;
	}

	.confirm-close {
		position: absolute;
		top: 12px;
		right: 12px;
		display: grid;
		height: 32px;
		width: 32px;
		cursor: pointer;
		place-items: center;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.055);
		color: rgba(255, 255, 255, 0.55);
		transition:
			background 180ms ease,
			color 180ms ease,
			border-color 180ms ease;
	}

	.confirm-close:hover {
		border-color: rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.09);
		color: white;
	}

	.cancel-button,
	.confirm-button {
		display: inline-flex;
		min-height: 42px;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		gap: 7px;
		border-radius: 14px;
		padding: 10px 14px;
		font-size: 13px;
		font-weight: 900;
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			background 180ms ease,
			border-color 180ms ease;
	}

	.cancel-button {
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.72);
	}

	.cancel-button:hover {
		transform: translateY(-1px);
		border-color: rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.09);
		color: white;
	}

	.confirm-button {
		border: 1px solid rgba(248, 113, 113, 0.45);
		background: linear-gradient(180deg, #ff4343, #c91428);
		color: white;
		box-shadow:
			0 0 22px rgba(239, 68, 68, 0.26),
			inset 0 1px 0 rgba(255, 255, 255, 0.22);
	}

	.confirm-button:hover {
		transform: translateY(-1px);
		box-shadow:
			0 0 34px rgba(239, 68, 68, 0.42),
			inset 0 1px 0 rgba(255, 255, 255, 0.28);
	}

	@media (max-width: 640px) {
		.confirm-panel {
			right: 50%;
			width: min(320px, calc(100vw - 28px));
			transform-origin: bottom center;
			translate: 50% 0;
		}

		.confirm-panel::before {
			right: 50%;
			translate: 50% 0;
		}
	}
</style>
