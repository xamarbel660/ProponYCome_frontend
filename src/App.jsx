import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import Inicio from './components/Inicio';
import AuthPage from './pages/AuthPage';
import ErrorPage from './pages/ErrorPage';
import Home from './pages/Home';
import Recetas from './pages/Recetas';
import useAuthStore from './store/authStore';

// GUARDIA PRIVADO: Solo deja pasar si estás logueado
const RutaPrivada = ({ children }) => {
	const isAuth = useAuthStore(state => state.isAuth);
	// Si NO está logueado, patada al Login
	return isAuth ? children : <Navigate to="/login" replace />;
};

// GUARDIA PÚBLICO: Solo deja pasar si NO estás logueado
// (Para que si ya estás dentro, no veas el Login otra vez)
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
				Component: Inicio,
			},
			// Aquí irán las recetas, perfil, etc.
			{ path: 'recetas', element: <Recetas /> },
		],
	},
]);

function App() {
	return (
		<>
			<RouterProvider router={router} />
		</>
	);
}

export default App;
