/**
 * @fileoverview Utilidades mínimas para leer información de un JWT en frontend.
 * Nota: esto NO verifica la firma; solo decodifica el payload para leer `exp`.
 */

/**
 * Decodifica el payload (segunda parte) de un JWT.
 *
 * @param {string|null|undefined} token
 * @returns {Record<string, any> | null}
 */
export function decodeJwtPayload(token) {
	if (!token || typeof token !== 'string') return null;

	try {
		const segmentoPayload = token.split('.')[1];
		if (!segmentoPayload) return null;

		// Base64URL -> Base64
		const base64 = segmentoPayload.replace(/-/g, '+').replace(/_/g, '/');
		const base64Padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

		const binario = atob(base64Padded);
		const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
		const payloadJson = new TextDecoder().decode(bytes);

		return JSON.parse(payloadJson);
	} catch {
		return null;
	}
}

/**
 * Devuelve el instante de expiración (`exp`) en milisegundos.
 *
 * @param {string|null|undefined} token
 * @returns {number|null}
 */
export function getJwtExpMs(token) {
	const payload = decodeJwtPayload(token);
	const expSeconds = payload?.exp;
	if (typeof expSeconds !== 'number' || !Number.isFinite(expSeconds)) return null;
	return expSeconds * 1000;
}

/**
 * Indica si el token está expirado (con un pequeño margen de seguridad).
 *
 * @param {string|null|undefined} token
 * @param {number} skewSeconds - segundos de margen (por defecto 10s)
 * @returns {boolean}
 */
export function isJwtExpired(token, skewSeconds = 10) {
	const expMs = getJwtExpMs(token);
	if (!expMs) return true;
	return Date.now() >= expMs - skewSeconds * 1000;
}
