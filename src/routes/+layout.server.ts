import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, locals: { supabase } }) => {
	const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError || !claimsData?.claims?.sub) {
		return {
			cookies: cookies.getAll(),
			claims: null,
			profile: null
		};
	}

	const { claims } = claimsData;

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select(
			`
			id,
			created_at,
			username,
			email,
			avatar_url,
			role
		`
		)
		.eq('id', claims.sub)
		.maybeSingle();

	if (profileError) {
		console.error('PROFILE LOAD ERROR:', profileError);
	}

	return {
		cookies: cookies.getAll(),
		claims,
		profile: profile ?? null
	};
};
