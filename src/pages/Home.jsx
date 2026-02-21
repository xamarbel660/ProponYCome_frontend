import { SafeArea } from '@capacitor-community/safe-area';
import {
	AppBar,
	Avatar,
	BottomNavigation,
	BottomNavigationAction,
	Box,
	CssBaseline,
	IconButton,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import {
	BookOpen,
	CalendarDays,
	LogOut,
	ShoppingCart,
	Sparkles,
	Users,
	UtensilsCrossed
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import useAuthStore from '../store/authStore';

function Home() {
	const logout = useAuthStore(state => state.logout); // Leemos el logout

	const navigate = useNavigate();
	const location = useLocation(); // Para saber en qué pestaña estamos

	// Estados para los márgenes seguros (Arriba y Abajo)
	const [topPadding, setTopPadding] = useState(30);

	useEffect(() => {
		const leerBarrasDeEstado = async () => {
			try {
				const info = await SafeArea.getSafeAreaInsets();
				// Guardamos el margen de arriba
				setTopPadding(info.insets.top > 0 ? info.insets.top : 30);
			} catch (error) {
				console.log('Error leyendo safe area', error);
			}
		};
		leerBarrasDeEstado();
	}, []);

	// Función para cambiar de ruta con los botones de abajo
	const handleNavegacion = (event, newValue) => {
		navigate(newValue);
	};

	return (
		<>
			{/* 1. CssBaseline: IMPORTANTE. Resetea márgenes del navegador para que ocupe el 100% real. */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					height: '100vh',
					width: '100vw',
					overflow: 'hidden',
				}}
			>
				<CssBaseline />

				{/* 2. Header Fijo (No se mueve al hacer scroll) */}
				<AppBar position="static" elevation={0}>
					<Toolbar
						sx={{
							bgcolor: '#fff',
							pt: `${topPadding}px`,
						}}
					>
						<Avatar
							sx={{ bgcolor: '#ff6900', width: 45, height: 45, my: 2, mr: 2, borderRadius: 4 }}
						>
							<UtensilsCrossed color="#fff" size={28} />
						</Avatar>
						<Typography sx={{ color: '#ff6900' }} variant="h6">
							Propón & Come
						</Typography>
						<IconButton onClick={logout} aria-label="Cerrar Sesión">
							<LogOut />
						</IconButton>
					</Toolbar>
				</AppBar>

				{/* 3. Área de Contenido (Scrollable) */}
				{/* flexGrow: 1 hace que ocupe todo el espacio disponible entre el Header y el Footer */}
				{/* overflow: 'auto' permite que SOLO esta parte haga scroll */}
				<Box
					component="main"
					sx={{
						flexGrow: 1,
						overflow: 'auto',
						bgcolor: 'background.default',
						position: 'relative', // Necesario para posicionamiento absoluto interno si lo usas
						backgroundColor: '#fff7ed',
					}}
				>
					{/* Aquí se renderizarán tus páginas hijas */}
					<Outlet />
				</Box>

				{/* 4. Menú Inferior Fijo */}
				<Paper
					elevation={8}
					sx={{
						// MAGIA AQUÍ: Usamos la variable nativa de Capacitor 8 para esquivar los 3 botones
						pb: 'calc(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 5px)',
						bgcolor: '#fff',
						borderTop: '1px solid #eee',
					}}
				>
					<BottomNavigation
						showLabels
						value={location.pathname} // Marca como activo el botón de la URL actual
						onChange={handleNavegacion}
						sx={{
							bgcolor: '#fff',
							height: 65,
							'& .MuiBottomNavigationAction-root': {
								color: '#8e8e8e', // Gris para los no seleccionados
							},
							'& .Mui-selected': {
								color: '#ff6900 !important', // Naranja para el seleccionado
							},
							'& .MuiBottomNavigationAction-label': {
								fontSize: '0.75rem',
								'&.Mui-selected': {
									fontSize: '0.75rem', // Evita que el texto crezca al seleccionar
								},
							},
						}}
					>
						<BottomNavigationAction label="Planning" value="/planning" icon={<CalendarDays />} />
						<BottomNavigationAction label="Familias" value="/familias" icon={<Users />} />
						<BottomNavigationAction label="Recetas" value="/" icon={<BookOpen />} />
						<BottomNavigationAction label="Compra" value="/compras" icon={<ShoppingCart />} />
						<BottomNavigationAction label="IA" value="/ia" icon={<Sparkles />} />
					</BottomNavigation>
				</Paper>
			</Box>
		</>
	);
}

export default Home;
