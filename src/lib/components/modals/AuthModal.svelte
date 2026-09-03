<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fade, fly, slide } from 'svelte/transition';

	let { open = $bindable(false) } = $props<{
		open?: boolean;
	}>();

	function close() {
		open = false;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<div
			in:fly={{ duration: 200 }}
			class="relative w-full max-w-[430px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0e13]/95 shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
			role="dialog"
			aria-modal="true"
			aria-labelledby="auth-modal-title"
		>
			<!-- subtle top glow -->
			<div
				class="pointer-events-none absolute left-1/2 top-0 h-[180px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9fd0ff]/[0.08] blur-[80px]"
			></div>

			<!-- close -->
			<button
				type="button"
				onclick={close}
				class="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-white/45 transition hover:bg-white/[0.07] hover:text-white"
				aria-label="Login schließen"
			>
				<X size={17} strokeWidth={2} />
			</button>

			<div class="relative z-[1] px-6 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-9">
				<!-- brand -->
				<div class="flex justify-center">
					<img
						src="/logo.png"
						alt="BZETBONUS"
						draggable="false"
						class="h-auto w-[185px] select-none object-contain"
					/>
				</div>

				<div class="mt-7 text-center">
					<h2
						id="auth-modal-title"
						class="text-[26px] font-black tracking-[-0.035em] text-white sm:text-[30px]"
					>
						Willkommen zurück.
					</h2>

					<p class="mx-auto mt-2 max-w-[320px] text-[13px] leading-5 text-white/40">
						Melde dich mit Discord oder Twitch an und verbinde dein BZETBONUS Konto.
					</p>
				</div>

				<!-- auth buttons -->
				<div class="mt-7 space-y-3">
					<form method="POST" action="/login?/discord">
						<button
							type="submit"
							class="group flex h-[54px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#5865F2]/25 bg-[#5865F2]/12 px-5 text-[14px] font-bold text-white transition duration-200 hover:border-[#5865F2]/40 hover:bg-[#5865F2]/18"
						>
							<svg
								viewBox="0 0 24 24"
								aria-hidden="true"
								class="h-[20px] w-[20px] fill-current text-[#7883ff]"
							>
								<path
									d="M19.54 5.34A16.5 16.5 0 0 0 15.44 4l-.5 1.02a15.18 15.18 0 0 0-5.88 0L8.56 4a16.59 16.59 0 0 0-4.11 1.34C1.85 9.2 1.15 12.96 1.5 16.67A16.82 16.82 0 0 0 6.52 19.2l1.22-1.66a10.8 10.8 0 0 1-1.92-.91l.47-.37c3.69 1.72 7.69 1.72 11.33 0l.48.37c-.62.36-1.26.66-1.93.91l1.22 1.66a16.75 16.75 0 0 0 5.02-2.53c.42-4.3-.72-8.03-2.87-11.33ZM8.52 14.42c-1.11 0-2.02-1.02-2.02-2.27 0-1.25.89-2.27 2.02-2.27 1.14 0 2.04 1.03 2.02 2.27 0 1.25-.89 2.27-2.02 2.27Zm6.96 0c-1.11 0-2.02-1.02-2.02-2.27 0-1.25.89-2.27 2.02-2.27 1.14 0 2.04 1.03 2.02 2.27 0 1.25-.88 2.27-2.02 2.27Z"
								/>
							</svg>

							Mit Discord anmelden
						</button>
					</form>

					<form method="POST" action="/login?/twitch">
						<button
							type="submit"
							class="group flex h-[54px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#9146FF]/25 bg-[#9146FF]/10 px-5 text-[14px] font-bold text-white transition duration-200 hover:border-[#9146FF]/40 hover:bg-[#9146FF]/16"
						>
							<svg
								viewBox="0 0 24 24"
								aria-hidden="true"
								class="h-[20px] w-[20px] fill-current text-[#a970ff]"
							>
								<path
									d="M4.265 2 3 5.236v13.007h4.498V22h3.767l3.738-3.757h3.002L23 13.257V2H4.265Zm16.87 10.319-2.84 2.84h-4.12l-3.738 3.757v-3.757H7.378V3.879h13.757v8.44Z"
								/>
								<path d="M15.999 6.32h1.88v5.64h-1.88V6.32Zm-5.16 0h1.88v5.64h-1.88V6.32Z" />
							</svg>

							Mit Twitch anmelden
						</button>
					</form>
				</div>

				<!-- divider -->
				<div class="my-6 flex items-center gap-3">
					<div class="h-px flex-1 bg-white/[0.06]"></div>
					<span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/20">
						BZETBONUS
					</span>
					<div class="h-px flex-1 bg-white/[0.06]"></div>
				</div>

				<!-- trust -->
				<div class="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
					<p class="text-center text-[11px] leading-5 text-white/30">
						Mit einem Nutzerkonto hast du Zugriff auf alle Funktion von Bzetbonus wie Verlosungen,
						Bonushunts, Case Openings.
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}
