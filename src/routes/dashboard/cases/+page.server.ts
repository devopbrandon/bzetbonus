import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const BUCKET = 'case-images';

const ALLOWED_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const ALLOWED_REWARD_TYPES = ['item', 'points', 'balance'];

async function requireAdmin(locals: App.Locals) {
	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (!user) {
		throw redirect(303, '/');
	}

	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('id, username, role')
		.eq('id', user.id)
		.single();

	if (error || !profile || profile.role !== 'admin') {
		throw redirect(303, '/');
	}

	return {
		user,
		profile
	};
}

function cleanString(value: FormDataEntryValue | null) {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
}

function nullableString(value: FormDataEntryValue | null) {
	const result = cleanString(value);

	return result || null;
}

function numberValue(value: FormDataEntryValue | null, fallback = 0) {
	if (value === null || typeof value !== 'string' || value.trim() === '') {
		return fallback;
	}

	const parsed = Number(value);

	if (!Number.isFinite(parsed)) {
		return fallback;
	}

	return parsed;
}

function booleanValue(value: FormDataEntryValue | null) {
	return value === 'true' || value === 'on' || value === '1';
}

function safeFilename(filename: string) {
	let extension = filename.split('.').pop()?.toLowerCase() ?? 'webp';

	if (!['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) {
		extension = 'webp';
	}

	return `${crypto.randomUUID()}.${extension}`;
}

async function uploadImage(locals: App.Locals, file: File | null, folder: string) {
	if (!file || file.size === 0) {
		return null;
	}

	const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

	if (!allowedTypes.includes(file.type)) {
		throw new Error('INVALID_IMAGE_TYPE');
	}

	if (file.size > 5 * 1024 * 1024) {
		throw new Error('IMAGE_TOO_LARGE');
	}

	const path = `${folder}/${safeFilename(file.name)}`;

	const { error } = await locals.supabase.storage.from(BUCKET).upload(path, file, {
		cacheControl: '3600',
		upsert: false,
		contentType: file.type
	});

	if (error) {
		console.error('Image upload error:', error);

		throw new Error('UPLOAD_FAILED');
	}

	const {
		data: { publicUrl }
	} = locals.supabase.storage.from(BUCKET).getPublicUrl(path);

	return {
		path,
		url: publicUrl
	};
}

function getStoragePathFromUrl(url: string | null) {
	if (!url) {
		return null;
	}

	const marker = `/storage/v1/object/public/${BUCKET}/`;

	const index = url.indexOf(marker);

	if (index === -1) {
		return null;
	}

	return decodeURIComponent(url.slice(index + marker.length));
}

async function removeImageByUrl(locals: App.Locals, url: string | null) {
	const path = getStoragePathFromUrl(url);

	if (!path) {
		return;
	}

	const { error } = await locals.supabase.storage.from(BUCKET).remove([path]);

	if (error) {
		console.error('Image delete error:', error);
	}
}

async function getCaseChanceTotal(locals: App.Locals, caseId: string, ignoreItemId?: string) {
	let query = locals.supabase.from('case_items').select('id, chance').eq('case_id', caseId);

	if (ignoreItemId) {
		query = query.neq('id', ignoreItemId);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Chance total error:', error);

		throw new Error('CHANCE_TOTAL_FAILED');
	}

	return (data ?? []).reduce((sum, item) => sum + Number(item.chance), 0);
}

function isHundredPercent(value: number) {
	return Math.abs(value - 100) < 0.001;
}

function parseReward(formData: FormData) {
	const rewardType = cleanString(formData.get('reward_type'));

	if (!ALLOWED_REWARD_TYPES.includes(rewardType)) {
		throw new Error('INVALID_REWARD_TYPE');
	}

	const valueRaw = cleanString(formData.get('value'));

	const value = valueRaw === '' ? null : Number(valueRaw);

	if (value !== null && (!Number.isFinite(value) || value < 0)) {
		throw new Error('INVALID_DISPLAY_VALUE');
	}

	let rewardAmount: number | null = null;

	if (rewardType === 'points' || rewardType === 'balance') {
		const raw = cleanString(formData.get('reward_amount'));

		if (!raw) {
			throw new Error('REWARD_AMOUNT_REQUIRED');
		}

		rewardAmount = Number(raw);

		if (!Number.isFinite(rewardAmount) || rewardAmount <= 0) {
			throw new Error('INVALID_REWARD_AMOUNT');
		}

		if (rewardType === 'points' && !Number.isInteger(rewardAmount)) {
			throw new Error('POINTS_MUST_BE_INTEGER');
		}
	}

	return {
		rewardType,
		rewardAmount,
		value
	};
}

function rewardErrorMessage(error: unknown) {
	if (!(error instanceof Error)) {
		return null;
	}

	switch (error.message) {
		case 'INVALID_REWARD_TYPE':
			return 'Ungültige Gewinnart.';

		case 'REWARD_AMOUNT_REQUIRED':
			return 'Bitte gib die Höhe des Gewinns an.';

		case 'INVALID_REWARD_AMOUNT':
			return 'Der Gewinnbetrag muss größer als 0 sein.';

		case 'POINTS_MUST_BE_INTEGER':
			return 'Points müssen als ganze Zahl angegeben werden.';

		case 'INVALID_DISPLAY_VALUE':
			return 'Der angegebene Sachwert ist ungültig.';

		default:
			return null;
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	const { profile } = await requireAdmin(locals);

	const { data: cases, error } = await locals.supabase
		.from('cases')
		.select(
			`
				id,
				name,
				description,
				image_url,
				price_points,
				is_active,
				position,
				created_at,

				case_items (
					id,
					case_id,
					name,
					description,
					image_url,
					chance,
					rarity,
					value,
					reward_type,
					reward_amount,
					created_at
				)
			`
		)
		.order('position', {
			ascending: true
		});

	if (error) {
		console.error('Cases load error:', error);
	}

	const normalizedCases = (cases ?? []).map((caseItem) => ({
		...caseItem,

		case_items: [...(caseItem.case_items ?? [])].sort((a, b) => Number(a.chance) - Number(b.chance))
	}));

	return {
		profile,
		cases: normalizedCases
	};
};

export const actions: Actions = {
	createCase: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();

		const name = cleanString(formData.get('name'));

		const description = nullableString(formData.get('description'));

		const pricePoints = Math.round(numberValue(formData.get('price_points')));

		const position = Math.round(numberValue(formData.get('position')));

		const image = formData.get('image');

		if (!name) {
			return fail(400, {
				action: 'createCase',
				message: 'Bitte gib einen Namen für das Case an.'
			});
		}

		if (pricePoints <= 0) {
			return fail(400, {
				action: 'createCase',
				message: 'Der Case-Preis muss größer als 0 sein.'
			});
		}

		let uploadedImage: {
			path: string;
			url: string;
		} | null = null;

		try {
			uploadedImage = await uploadImage(locals, image instanceof File ? image : null, 'cases');
		} catch (error) {
			if (error instanceof Error && error.message === 'IMAGE_TOO_LARGE') {
				return fail(400, {
					action: 'createCase',
					message: 'Das Bild darf maximal 5 MB groß sein.'
				});
			}

			if (error instanceof Error && error.message === 'INVALID_IMAGE_TYPE') {
				return fail(400, {
					action: 'createCase',
					message: 'Bitte lade PNG, JPG, WEBP oder GIF hoch.'
				});
			}

			return fail(500, {
				action: 'createCase',
				message: 'Das Case-Bild konnte nicht hochgeladen werden.'
			});
		}

		const { error } = await locals.supabase.from('cases').insert({
			name,
			description,

			image_url: uploadedImage?.url ?? null,

			price_points: pricePoints,

			position,

			/*
						Ein neues Case besitzt noch
						keine 100%-Drop-Tabelle.
					*/
			is_active: false
		});

		if (error) {
			console.error('Create case error:', error);

			if (uploadedImage) {
				await locals.supabase.storage.from(BUCKET).remove([uploadedImage.path]);
			}

			return fail(500, {
				action: 'createCase',
				message: 'Das Case konnte nicht erstellt werden.'
			});
		}

		return {
			success: true,
			action: 'createCase',
			message: 'Case erstellt. Füge jetzt Drops hinzu und aktiviere es anschließend.'
		};
	},

	updateCase: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();

		const caseId = cleanString(formData.get('case_id'));

		const name = cleanString(formData.get('name'));

		const description = nullableString(formData.get('description'));

		const pricePoints = Math.round(numberValue(formData.get('price_points')));

		const position = Math.round(numberValue(formData.get('position')));

		const isActive = booleanValue(formData.get('is_active'));

		const image = formData.get('image');

		if (!caseId || !name) {
			return fail(400, {
				action: 'updateCase',
				message: 'Ungültige Case-Daten.'
			});
		}

		if (pricePoints <= 0) {
			return fail(400, {
				action: 'updateCase',
				message: 'Der Case-Preis muss größer als 0 sein.'
			});
		}

		if (isActive) {
			const chanceTotal = await getCaseChanceTotal(locals, caseId);

			if (!isHundredPercent(chanceTotal)) {
				return fail(400, {
					action: 'updateCase',
					message: `Das Case kann erst aktiviert werden, wenn die Drop-Chancen genau 100 % ergeben. Aktuell: ${chanceTotal.toFixed(5)} %.`
				});
			}
		}

		const { data: currentCase, error: caseError } = await locals.supabase
			.from('cases')
			.select('id, image_url')
			.eq('id', caseId)
			.single();

		if (caseError || !currentCase) {
			return fail(404, {
				action: 'updateCase',
				message: 'Das Case wurde nicht gefunden.'
			});
		}

		let imageUrl = currentCase.image_url;

		let uploadedImage: {
			path: string;
			url: string;
		} | null = null;

		if (image instanceof File && image.size > 0) {
			try {
				uploadedImage = await uploadImage(locals, image, 'cases');

				imageUrl = uploadedImage?.url ?? imageUrl;
			} catch (error) {
				if (error instanceof Error && error.message === 'IMAGE_TOO_LARGE') {
					return fail(400, {
						action: 'updateCase',
						message: 'Das Bild darf maximal 5 MB groß sein.'
					});
				}

				return fail(500, {
					action: 'updateCase',
					message: 'Das neue Case-Bild konnte nicht hochgeladen werden.'
				});
			}
		}

		const { error } = await locals.supabase
			.from('cases')
			.update({
				name,
				description,
				image_url: imageUrl,
				price_points: pricePoints,
				position,
				is_active: isActive
			})
			.eq('id', caseId);

		if (error) {
			console.error('Update case error:', error);

			if (uploadedImage) {
				await locals.supabase.storage.from(BUCKET).remove([uploadedImage.path]);
			}

			return fail(500, {
				action: 'updateCase',
				message: 'Das Case konnte nicht gespeichert werden.'
			});
		}

		if (uploadedImage && currentCase.image_url) {
			await removeImageByUrl(locals, currentCase.image_url);
		}

		return {
			success: true,
			action: 'updateCase',
			message: 'Case wurde gespeichert.'
		};
	},

	deleteCase: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();

		const caseId = cleanString(formData.get('case_id'));

		if (!caseId) {
			return fail(400, {
				action: 'deleteCase',
				message: 'Ungültiges Case.'
			});
		}

		const { data: caseData } = await locals.supabase
			.from('cases')
			.select(
				`
					id,
					image_url,

					case_items (
						image_url
					)
				`
			)
			.eq('id', caseId)
			.single();

		const { error } = await locals.supabase.from('cases').delete().eq('id', caseId);

		if (error) {
			console.error('Delete case error:', error);

			return fail(500, {
				action: 'deleteCase',
				message: 'Das Case konnte nicht gelöscht werden.'
			});
		}

		if (caseData?.image_url) {
			await removeImageByUrl(locals, caseData.image_url);
		}

		for (const item of caseData?.case_items ?? []) {
			if (item.image_url) {
				await removeImageByUrl(locals, item.image_url);
			}
		}

		return {
			success: true,
			action: 'deleteCase',
			message: 'Case wurde gelöscht.'
		};
	},

	createItem: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();

		const caseId = cleanString(formData.get('case_id'));

		const name = cleanString(formData.get('name'));

		const description = nullableString(formData.get('description'));

		const chance = numberValue(formData.get('chance'));

		const rarity = cleanString(formData.get('rarity'));

		const image = formData.get('image');

		if (!caseId || !name) {
			return fail(400, {
				action: 'createItem',
				message: 'Case und Gewinnname werden benötigt.'
			});
		}

		if (chance <= 0 || chance > 100) {
			return fail(400, {
				action: 'createItem',
				message: 'Die Gewinnchance muss größer als 0 und maximal 100 sein.'
			});
		}

		if (!ALLOWED_RARITIES.includes(rarity)) {
			return fail(400, {
				action: 'createItem',
				message: 'Ungültige Seltenheit.'
			});
		}

		let reward;

		try {
			reward = parseReward(formData);
		} catch (error) {
			return fail(400, {
				action: 'createItem',
				message: rewardErrorMessage(error) ?? 'Ungültige Gewinnangaben.'
			});
		}

		const { data: caseData } = await locals.supabase
			.from('cases')
			.select('id, is_active')
			.eq('id', caseId)
			.single();

		if (!caseData) {
			return fail(404, {
				action: 'createItem',
				message: 'Das Case wurde nicht gefunden.'
			});
		}

		if (caseData.is_active) {
			return fail(400, {
				action: 'createItem',
				message: 'Deaktiviere das Case zuerst, bevor du neue Drops hinzufügst.'
			});
		}

		const currentTotal = await getCaseChanceTotal(locals, caseId);

		const nextTotal = currentTotal + chance;

		if (nextTotal > 100.001) {
			return fail(400, {
				action: 'createItem',
				message: `Mit diesem Drop würde die Gesamtchance ${nextTotal.toFixed(5)} % betragen. Maximal sind 100 % erlaubt.`
			});
		}

		let uploadedImage: {
			path: string;
			url: string;
		} | null = null;

		try {
			uploadedImage = await uploadImage(
				locals,

				image instanceof File ? image : null,

				`items/${caseId}`
			);
		} catch (error) {
			if (error instanceof Error && error.message === 'IMAGE_TOO_LARGE') {
				return fail(400, {
					action: 'createItem',
					message: 'Das Item-Bild darf maximal 5 MB groß sein.'
				});
			}

			return fail(500, {
				action: 'createItem',
				message: 'Das Item-Bild konnte nicht hochgeladen werden.'
			});
		}

		const { error } = await locals.supabase.from('case_items').insert({
			case_id: caseId,

			name,
			description,

			image_url: uploadedImage?.url ?? null,

			chance,
			rarity,

			reward_type: reward.rewardType,

			reward_amount: reward.rewardAmount,

			value: reward.value
		});

		if (error) {
			console.error('Create item error:', error);

			if (uploadedImage) {
				await locals.supabase.storage.from(BUCKET).remove([uploadedImage.path]);
			}

			return fail(500, {
				action: 'createItem',
				message: 'Der Drop konnte nicht erstellt werden.'
			});
		}

		return {
			success: true,
			action: 'createItem',
			message: `Drop hinzugefügt. Gesamtchance: ${nextTotal.toFixed(5)} %.`
		};
	},

	updateItem: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();

		const itemId = cleanString(formData.get('item_id'));

		const name = cleanString(formData.get('name'));

		const description = nullableString(formData.get('description'));

		const chance = numberValue(formData.get('chance'));

		const rarity = cleanString(formData.get('rarity'));

		const image = formData.get('image');

		if (!itemId || !name) {
			return fail(400, {
				action: 'updateItem',
				message: 'Ungültige Drop-Daten.'
			});
		}

		if (chance <= 0 || chance > 100) {
			return fail(400, {
				action: 'updateItem',
				message: 'Die Gewinnchance muss größer als 0 und maximal 100 sein.'
			});
		}

		if (!ALLOWED_RARITIES.includes(rarity)) {
			return fail(400, {
				action: 'updateItem',
				message: 'Ungültige Seltenheit.'
			});
		}

		let reward;

		try {
			reward = parseReward(formData);
		} catch (error) {
			return fail(400, {
				action: 'updateItem',
				message: rewardErrorMessage(error) ?? 'Ungültige Gewinnangaben.'
			});
		}

		const { data: currentItem, error: itemError } = await locals.supabase
			.from('case_items')
			.select(
				`
				id,
				case_id,
				image_url,

				cases (
					is_active
				)
			`
			)
			.eq('id', itemId)
			.single();

		if (itemError || !currentItem) {
			return fail(404, {
				action: 'updateItem',
				message: 'Der Drop wurde nicht gefunden.'
			});
		}

		const caseRelation = Array.isArray(currentItem.cases)
			? currentItem.cases[0]
			: currentItem.cases;

		if (caseRelation?.is_active) {
			return fail(400, {
				action: 'updateItem',
				message: 'Deaktiviere das Case zuerst, bevor du seine Drops bearbeitest.'
			});
		}

		const totalWithoutCurrent = await getCaseChanceTotal(locals, currentItem.case_id, itemId);

		const nextTotal = totalWithoutCurrent + chance;

		if (nextTotal > 100.001) {
			return fail(400, {
				action: 'updateItem',
				message: `Mit dieser Chance würde das Case ${nextTotal.toFixed(5)} % erreichen. Maximal sind 100 % erlaubt.`
			});
		}

		let imageUrl = currentItem.image_url;

		let uploadedImage: {
			path: string;
			url: string;
		} | null = null;

		if (image instanceof File && image.size > 0) {
			try {
				uploadedImage = await uploadImage(locals, image, `items/${currentItem.case_id}`);

				imageUrl = uploadedImage?.url ?? imageUrl;
			} catch {
				return fail(500, {
					action: 'updateItem',
					message: 'Das neue Drop-Bild konnte nicht hochgeladen werden.'
				});
			}
		}

		const { error } = await locals.supabase
			.from('case_items')
			.update({
				name,
				description,
				image_url: imageUrl,
				chance,
				rarity,

				reward_type: reward.rewardType,

				reward_amount: reward.rewardAmount,

				value: reward.value
			})
			.eq('id', itemId);

		if (error) {
			console.error('Update item error:', error);

			if (uploadedImage) {
				await locals.supabase.storage.from(BUCKET).remove([uploadedImage.path]);
			}

			return fail(500, {
				action: 'updateItem',
				message: 'Der Drop konnte nicht gespeichert werden.'
			});
		}

		if (uploadedImage && currentItem.image_url) {
			await removeImageByUrl(locals, currentItem.image_url);
		}

		return {
			success: true,
			action: 'updateItem',
			message: `Drop gespeichert. Gesamtchance: ${nextTotal.toFixed(5)} %.`
		};
	},

	deleteItem: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();

		const itemId = cleanString(formData.get('item_id'));

		if (!itemId) {
			return fail(400, {
				action: 'deleteItem',
				message: 'Ungültiger Drop.'
			});
		}

		const { data: currentItem, error: itemError } = await locals.supabase
			.from('case_items')
			.select(
				`
				id,
				image_url,
				case_id,

				cases (
					is_active
				)
			`
			)
			.eq('id', itemId)
			.single();

		if (itemError || !currentItem) {
			return fail(404, {
				action: 'deleteItem',
				message: 'Der Drop wurde nicht gefunden.'
			});
		}

		const caseRelation = Array.isArray(currentItem.cases)
			? currentItem.cases[0]
			: currentItem.cases;

		if (caseRelation?.is_active) {
			return fail(400, {
				action: 'deleteItem',
				message: 'Deaktiviere das Case zuerst, bevor du Drops entfernst.'
			});
		}

		const { error } = await locals.supabase.from('case_items').delete().eq('id', itemId);

		if (error) {
			console.error('Delete item error:', error);

			return fail(500, {
				action: 'deleteItem',
				message: 'Der Drop konnte nicht gelöscht werden.'
			});
		}

		if (currentItem.image_url) {
			await removeImageByUrl(locals, currentItem.image_url);
		}

		return {
			success: true,
			action: 'deleteItem',
			message: 'Drop wurde gelöscht.'
		};
	}
};
