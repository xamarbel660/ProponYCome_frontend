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
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

// GUARDIA PRIVADO: Solo deja pasar si estás logueado
const RutaPrivada = ({ children }) => {
	const isAuth = useAuthStore(state => state.isAuth);
	// Si NO está logueado, patada al Login
	return isAuth ? children : <Navigate to="/login" replace />;
};

// GUARDIA PÚBLICO: Solo deja pasar si NO estás logueado
// Para que si ya estás dentro, no veas el Login otra vez
const RutaPublica = ({ children }) => {
	const isAuth = useAuthStore(state => state.isAuth);
	// Si YA está logueado, mándalo directo a casa
	return isAuth ? <Navigate to="/" replace /> : children;
};

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
