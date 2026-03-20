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
 * @type {Object}
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
             * Alterna el modo del tema entre 'light' y 'dark'.
             * Utiliza el estado previo para determinar el nuevo valor.
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
