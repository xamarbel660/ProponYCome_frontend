/**
 * @file notificationStore.js
 * @description Store global de notificaciones para mostrar Alert flotante en toda la app.
 */

import { create } from 'zustand';

/**
 * @typedef {'success'|'error'|'info'|'warning'} NotificationSeverity
 */

/**
 * @typedef {Object} NotificationState
 * @property {boolean} mostrar
 * @property {string} mensaje
 * @property {NotificationSeverity} severidad
 * @property {number} duracionMs
 * @property {(payload: { mensaje: string, severidad?: NotificationSeverity, duracionMs?: number }) => void} showNotification
 * @property {() => void} hideNotification
 */

/**
 * Store global de notificaciones.
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<NotificationState>>}
 */
const useNotificationStore = create(set => ({
	mostrar: false,
	mensaje: '',
	severidad: 'info',
	duracionMs: 5000,

	showNotification: ({ mensaje, severidad = 'info', duracionMs = 5000 }) =>
		set({
			mostrar: true,
			mensaje,
			severidad,
			duracionMs,
		}),

	hideNotification: () =>
		set({
			mostrar: false,
		}),
}));

export default useNotificationStore;
