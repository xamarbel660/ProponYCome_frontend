/**
 * @fileoverview Configuracion principal de la aplicacion:
 * rutas, guardias de acceso y proveedor de tema MUI.
 */
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect, useRef } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import AuthPage from './pages/AuthPage';
import Compras from './pages/Compras';
import ErrorPage from './pages/ErrorPage';
import Familias from './pages/Familias';
import Home from './pages/Home';
import IA from './pages/IA';
import Planning from './pages/Planning';
import Recetas from './pages/Recetas';
import useAuthStore from './store/authStore';
import useThemeStore from './store/useThemeStore';
import { getJwtExpMs, isJwtExpired } from './utils/jwt';

/**
 * Protege rutas privadas: redirige a login si no hay sesion activa.
 *
 * @param {{ children: import('react').ReactNode }} props - Contenido protegido.
 * @returns {JSX.Element}
 */
const RutaPrivada = ({ children }) => {
	const isAuth = useAuthStore(state => state.isAuth);
	// Si NO está logueado, patada al Login
	return isAuth ? children : <Navigate to="/login" replace />;
};

/**
 * Protege rutas publicas: si el usuario ya inicio sesion,
 * evita volver al login y lo redirige al inicio.
 *
 * @param {{ children: import('react').ReactNode }} props - Contenido publico.
 * @returns {JSX.Element}
 */
const RutaPublica = ({ children }) => {
	const isAuth = useAuthStore(state => state.isAuth);
	// Si YA está logueado, mándalo directo a casa
	return isAuth ? <Navigate to="/" replace /> : children;
};

/**
 * Router central de la aplicacion.
 * Define un grupo de rutas publicas y otro privado bajo Home.
 *
 * @type {import('react-router').Router}
 */
const router = createBrowserRouter([
	// -----------------------------------------------------------------
	// GRUPO 1: RUTAS PÚBLICAS (Sin Menú/Navbar)
	// -----------------------------------------------------------------
	{
		path: '/login',
		element: (
			<RutaPublica>
				<AuthPage />
			</RutaPublica>
		),
	},

	// -----------------------------------------------------------------
	// GRUPO 2: RUTAS PRIVADAS (Con Menú/Navbar en 'Home')
	// -----------------------------------------------------------------
	{
		path: '/',
		// Envolvemos TODO el Home en la protección
		element: (
			<RutaPrivada>
				<Home /> {/* Home.jsx tiene el <Outlet /> y el <Navbar /> */}
			</RutaPrivada>
		),
		errorElement: <ErrorPage />,
		children: [
			{
				index: true, // Esto es la ruta "/" exacta
				Component: Recetas,
			},
			// Aquí irán las recetas, perfil, etc.
			{ path: 'planning', element: <Planning /> },
			{ path: 'familias', element: <Familias /> },
			{ path: 'compras', element: <Compras /> },
			{ path: 'ia', element: <IA /> },
		],
	},
]);

/**
 * Componente principal de la aplicación.
 * Gestiona el tema global y provee el contexto de enrutamiento.
 * 
 * @returns {JSX.Element} La aplicación completa envuelta en proveedores de contexto.
 */
function App() {
	const logout = useAuthStore((state) => state.logout);
	const token = useAuthStore((state) => state.token);
	const logoutTimerRef = useRef(null);

	useEffect(() => {
		if (!Capacitor.isNativePlatform()) return;

		const hideLaunchSplash = async () => {
			try {
				await SplashScreen.hide();
			} catch {
				// Evita romper el arranque si el plugin no esta disponible en este entorno.
			}
		};

		void hideLaunchSplash();
	}, []);

	useEffect(() => {
		// Si el token cambia, reprogramamos el cierre de sesión automático.
		if (logoutTimerRef.current) {
			clearTimeout(logoutTimerRef.current);
			logoutTimerRef.current = null;
		}

		if (!token) return;
		// Si no podemos leer el exp o ya expiró, cerramos sesión.
		if (isJwtExpired(token)) {
			logout();
			return;
		}

		const expMs = getJwtExpMs(token);
		if (!expMs) {
			logout();
			return;
		}

		const msHastaExpirar = expMs - Date.now();
		logoutTimerRef.current = setTimeout(() => {
			logout();
		}, Math.max(0, msHastaExpirar));

		return () => {
			if (logoutTimerRef.current) {
				clearTimeout(logoutTimerRef.current);
				logoutTimerRef.current = null;
			}
		};
	}, [token, logout]);

	// Recuperamos el modo (dark / light) del store global de Zustand
	// Esto permite persistencia del tema entre recargas
	const mode = useThemeStore((state) => state.mode);
	// Creamos el tema de Material UI dinámicamente basado en el modo actual
	const theme = createTheme({
		palette: {
			mode,
			primary: {
				main: '#ff6900',
				dark: '#d95a00',
				light: '#ff8a3d',
				contrastText: '#ffffff',
			},
			inverse: {
				main: mode === 'dark' ? '#ffffff' : '#000000',
				contrastText: mode === 'dark' ? '#000000' : '#ffffff',
				hover: mode === 'dark' ? '#ededed' : '#222222',
			},
			background:
				mode === 'dark'
					? {
						default: '#11141a',
						paper: '#1a1f29',
					}
					: {
						default: '#fff7ed',
						paper: '#ffffff',
					},
			text:
				mode === 'dark'
					? {
						primary: '#f3f4f6',
						secondary: '#b0b7c3',
					}
					: {
						primary: '#171717',
						secondary: '#60656f',
					},
			divider: mode === 'dark' ? '#2b3240' : '#e5e7eb',
		},
		components: {
			MuiIconButton: {
				styleOverrides: {
					root: {
						'&.invert-surface': {
							backgroundColor: mode === 'dark' ? '#ffffff' : '#000000',
							color: mode === 'dark' ? '#000000' : '#ffffff',
							'&:hover': {
								backgroundColor: mode === 'dark' ? '#ededed' : '#222222',
							},
						},
					},
				},
			},
			MuiPaper: {
				styleOverrides: {
					root: {
						backgroundImage: 'none',
					},
				},
			},
			MuiAppBar: {
				styleOverrides: {
					root: {
						backgroundImage: 'none',
						backgroundColor: mode === 'dark' ? '#1a1f29' : '#ffffff',
						color: mode === 'dark' ? '#f3f4f6' : '#171717',
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						border: `1px solid ${mode === 'dark' ? '#2b3240' : '#e5e7eb'}`,
						'&.ia-highlight-card': {
							borderRadius: 8,
							backgroundColor: mode === 'dark' ? '#2a2031' : '#fcf3fb',
							border: mode === 'dark' ? '1px solid #5d3f6b' : '1px solid #e9d4ff',
						},
					},
				},
			},
			MuiTypography: {
				styleOverrides: {
					root: {
						'&.ia-highlight-title': {
							fontWeight: 700,
							color: mode === 'dark' ? '#f3f4f6' : '#000000',
							'& .ia-highlight-icon': {
								color: mode === 'dark' ? '#d8b4ff' : '#7e22ce',
							},
						},
					},
				},
			},
			MuiDialog: {
				styleOverrides: {
					paper: {
						border: `1px solid ${mode === 'dark' ? '#2b3240' : '#e5e7eb'}`,
						borderRadius: 14,
					},
				},
			},
			MuiBottomNavigation: {
				styleOverrides: {
					root: {
						backgroundColor: mode === 'dark' ? '#1a1f29' : '#ffffff',
					},
				},
			},
			MuiBottomNavigationAction: {
				styleOverrides: {
					root: {
						color: mode === 'dark' ? '#a5afbf' : '#8e8e8e',
						'&.Mui-selected': {
							color: '#ff6900',
						},
					},
				},
			},
			MuiOutlinedInput: {
				styleOverrides: {
					root: {
						backgroundColor: mode === 'dark' ? '#222836' : '#f5f6f8',
					},
				},
			},
		},
	});


	return (
		<>
			<ThemeProvider theme={theme}>
				{/* CssBaseline aplica estilos base de MUI */}
				<CssBaseline />
				<RouterProvider router={router} />
			</ThemeProvider>
		</>
	);
}

export default App;
