<script lang="ts">
	import { Bomb, Trash, XCircle } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let { dealId }: { dealId: number } = $props();

	let showConfirm = $state(false);

	function toggleConfirm() {
		showConfirm = !showConfirm;
	}

	function confirmDelete() {
		const form = document.getElementById(`delete-form-${dealId}`) as HTMLFormElement | null;
		form?.requestSubmit();
		showConfirm = false;
	}
</script>

<button
	on:click={toggleConfirm}
	class="cursor-pointer text-zinc-400 transition hover:text-red-400"
	title="Delete deal"
	aria-label="Delete deal"
>
	<Trash size={20} />
</button>

<form method="POST" action="?/delete" id={`delete-form-${dealId}`} class="hidden">
	<input type="hidden" name="dealId" value={dealId} />
</form>

{#if showConfirm}
	<div
		in:fade={{ duration: 150 }}
		out:fade={{ duration: 150 }}
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
	>
		<div
			class="relative w-[90%] max-w-md rounded-2xl border border-white/10 bg-[#0b0820]/90 p-6 shadow-2xl ring-1 ring-indigo-400/10 backdrop-blur-xl"
		>
			<button
				on:click={toggleConfirm}
				class="absolute top-3 right-3 cursor-pointer text-zinc-500 transition hover:text-zinc-300"
				title="Cancel"
				aria-label="Cancel"
			>
				<XCircle size={20} />
			</button>

			<h2 class="mb-3 text-xl font-semibold text-white">Delete this deal?</h2>
			<p class="text-sm text-zinc-400">
				This action cannot be undone. The deal will be permanently removed from the database.
			</p>

			<div class="mt-6 flex justify-end gap-3">
				<button
					on:click={toggleConfirm}
					type="button"
					class="cursor-pointer rounded-xl border border-white/10 bg-zinc-800/60 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700/70"
				>
					Cancel
				</button>

				<button
					on:click={confirmDelete}
					type="button"
					class="flex cursor-pointer items-center gap-1 rounded-xl bg-linear-to-r from-red-500 via-red-600 to-red-700 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-red-400/40 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] active:translate-y-px"
				>
					<Bomb size={17} /> Yes, delete
				</button>
			</div>
		</div>
	</div>
{/if}
