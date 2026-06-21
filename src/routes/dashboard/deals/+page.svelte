<script lang="ts">
	import { goto } from '$app/navigation';
	import { Plus } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import Deal from '$lib/components/Deal.svelte';
	import type { Deal as DealType } from '$lib/components/Deal.svelte';
	import { dndzone } from 'svelte-dnd-action';

	const flipDurationMs = 150;

	let {
		data
	}: {
		data: { deals: (DealType & { id: string; position?: number | null })[] };
	} = $props();

	let deals = $state([...data.deals].sort((a, b) => (a.position ?? 1e9) - (b.position ?? 1e9)));

	function onConsider(
		e: CustomEvent<{ items: (DealType & { id: string; position?: number | null })[] }>
	) {
		deals = e.detail.items;
	}

	async function onFinalize(
		e: CustomEvent<{ items: (DealType & { id: string; position?: number | null })[] }>
	) {
		deals = e.detail.items;

		const order = deals.map((d, i) => ({ id: d.id, position: i + 1 }));

		const fd = new FormData();
		fd.set('order', JSON.stringify(order));

		const res = await fetch('?/reorder', {
			method: 'POST',
			body: fd,
			headers: { accept: 'application/json' }
		});

		if (!res.ok) {
			deals = [...data.deals].sort((a, b) => (a.position ?? 1e9) - (b.position ?? 1e9));
			console.error('Reorder failed', await res.text());
		}
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<section class="mx-auto mt-8 max-w-7xl p-7 font-[Inter]">
	<div class="flex w-full items-center justify-between">
		<h1 class="text-lg text-white">Manage your deals</h1>
		<button
			onclick={() => goto('/dashboard/deals/add')}
			class="group flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-400 px-4 py-1 text-white duration-150 hover:-translate-y-0.5 hover:bg-indigo-500"
		>
			<Plus size={26} class="text-white transition-transform" />
		</button>
	</div>
</section>

<section class="mx-auto w-full max-w-7xl px-4 py-8">
	{#if deals.length === 0}
		<div class="rounded-xl border border-white/10 bg-zinc-800/60 p-8 text-center text-zinc-300">
			No deals found.
		</div>
	{:else}
		<div
			use:dndzone={{
				items: deals,
				flipDurationMs,
				dragDisabled: false,
				dropFromOthersDisabled: true
			}}
			onconsider={onConsider}
			onfinalize={onFinalize}
			class="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-6 p-3"
			id="deals"
		>
			{#each deals as deal (deal.id)}
				<div animate:flip={{ duration: flipDurationMs }} class="cursor-grab active:cursor-grabbing">
					<Deal {deal} />
				</div>
			{/each}
		</div>
	{/if}
</section>
