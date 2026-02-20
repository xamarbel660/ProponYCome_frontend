import { useEffect, useState } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

function Recetas() {
	const user = useAuthStore(state => state.user); // Leemos el usuario
	const logout = useAuthStore(state => state.logout); // Leemos el logout

	const [dataRecetas, setDataRecetas] = useState(null);

	// Al cargar, pedimos datos protegidos al backend
	useEffect(() => {
		api
			.post('/recetas', user)
			.then(res => setDataRecetas(res.datos.recetas))
			.catch(err => console.error('Error cargando recetas', err));
	}, []);

	return (
		<>
			<Box sx={{ p: 2 }}>
				<Stack spacing={2}>
					<Paper sx={{ p: 2 }}>
						<Typography>Zona Privada,{user.nombre}</Typography>
					</Paper>

					<Box sx={{ height: '1000px', bgcolor: '#eee' }}>
						{/* Ejemplo de contenido largo para probar el scroll */}
						<Typography>Tus Recetas (Traídas del Backend):</Typography>
						<pre>{JSON.stringify(dataRecetas, null, 2)}</pre>
						<Button onClick={logout} variant="contained" color="error">
							Cerrar Sesión
						</Button>
					</Box>
				</Stack>
			</Box>
		</>
	);
}

export default Recetas;
