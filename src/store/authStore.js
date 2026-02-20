import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuth: false,

            // Acción para guardar sesión
            login: (token, user) => set({
                token,
                user,
                isAuth: true
            }),

            // Acción para cerrar sesión (limpia todo)
            logout: () => set({
                token: null,
                user: null,
                isAuth: false
            }),
        }),
        {
            name: 'auth-storage', // Nombre con el que se guarda en localStorage
        }
    )
);

export default useAuthStore;