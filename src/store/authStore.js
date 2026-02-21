/**
 * @file authStore.js
 * @description Store de Zustand para gestionar el estado de autenticación del usuario.
 * Utiliza el middleware 'persist' para mantener los datos en el localStorage del navegador.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Hook de Zustand que proporciona acceso al estado de autenticación.
 *
 * @typedef {Object} AuthState
 * @property {string|null} token - Token JWT de autenticación.
 * @property {Object|null} user - Información del perfil del usuario autenticado.
 * @property {boolean} isAuth - Indica si el usuario está actualmente autenticado.
 * @property {Function} login - Función para establecer la sesión del usuario.
 * @property {Function} logout - Función para limpiar la sesión y cerrar sesión.
 */

/**
 * Store global para la autenticación.
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<AuthState>>}
 */
const useAuthStore = create(
	persist(
		set => ({
			// --- Estado Inicial ---
			token: null, // Almacena el token de acceso recibido del backend
			user: null, // Almacena los datos del usuario (nombre, id, roles, etc.)
			isAuth: false, // Flag booleano para comprobaciones rápidas de autenticación

			/**
			 * Inicia la sesión del usuario guardando su token y datos de perfil.
			 *
			 * @param {string} token - El token JWT proporcionado por el servidor.
			 * @param {Object} user - Objeto con la información del usuario.
			 */
			login: (token, user) =>
				set({
					token,
					user,
					isAuth: true,
				}),

			/**
			 * Cierra la sesión del usuario restableciendo el estado a los valores iniciales.
			 * Esto también limpiará automáticamente el localStorage gracias al middleware 'persist'.
			 */
			logout: () =>
				set({
					token: null,
					user: null,
					isAuth: false,
				}),
		}),
		{
			/**
			 * Configuración de persistencia.
			 * 'name' define la clave bajo la cual se guardará el JSON en el localStorage.
			 */
			name: 'auth-storage',
		}
	)
);

export default useAuthStore;
