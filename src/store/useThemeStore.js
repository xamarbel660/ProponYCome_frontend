/**
 * @fileoverview Store de Zustand para la gestión del tema visual (Light/Dark).
 * Incluye persistencia en localStorage para recordar la preferencia del usuario.
 */
// stores/useThemeStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Crea el store de tema con persistencia.
 *
 * @typedef {Object} ThemeState
 * @property {'light'|'dark'} mode - Modo de color activo.
 * @property {(modeRecuperado: 'light'|'dark') => void} setMode - Actualiza el modo de forma explicita.
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<ThemeState>>}
 */
const useThemeStore = create(
    //persist nos permite guardar el estado en localStorage
    persist(
        (set) => ({
            /**
             * Modo actual del tema.
             * @type {'light' | 'dark'}
             * @default 'light'
             */
            mode: 'light',

            /**
             * Establece el modo del tema a partir del valor recibido.
             * Se utiliza tanto para cambios manuales como para restaurar persistencia.
             *
             * @param {'light'|'dark'} modeRecuperado - Modo seleccionado.
             */
            setMode: (modeRecuperado) =>
                set({ mode: modeRecuperado }),
        }),
        {
            // Nombre para guardar en localStorage
            name: 'theme-storage',
        }
    )
);

export default useThemeStore;
