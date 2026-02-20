import { AppBar, Box, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router';

function Home() {
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
					<Toolbar>
						<Typography sx={{color: "#ff6900"}} variant="h6">Propón & Come</Typography>
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

				{/* 4. (Opcional) Menú Inferior Fijo */}
				{/* Si usas BottomNavigation, iría aquí, fuera del Box scrollable */}
				{/* <BottomNavigation ... /> */}
			</Box>
		</>
	);
}

export default Home;
