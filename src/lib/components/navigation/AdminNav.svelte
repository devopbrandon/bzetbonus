<script lang="ts">
	const navItems = [{ label: 'Deals', href: '/dashboard/deals' }];
</script>

<div class="border-b border-white/10 bg-black/60 py-4 backdrop-blur">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4">
		<ul class="flex items-center gap-3">
			{#each navItems as item (item.label)}
				<li>
					<a
						href={item.href}
						class="cursor-pointer rounded-xl border border-white/10 bg-white/4 px-4 py-2 text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/8"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<form method="POST" action="/logout">
			<button
				type="submit"
				class="cursor-pointer rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 transition hover:border-red-400/40 hover:bg-red-500/20"
			>
				Logout
			</button>
		</form>
	</div>
</div>
