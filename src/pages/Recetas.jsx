import { Box, Button, Card, CardContent, Grid, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { Toast } from '@capacitor/toast';

function Recetas() {
	const user = useAuthStore(state => state.user); // Leemos el usuario

	const [dataRecetas, setDataRecetas] = useState([]);

	// Al cargar, pedimos datos protegidos al backend
	useEffect(() => {
		async function fetchRecetas() {
			try {
				const datos = await api.post('/recetas', user);

				setDataRecetas(datos.datos.recetas);
			} catch (error) {
				console.log(error);
				setDataRecetas([]);
			}
		}

		fetchRecetas();
	}, []);

	const showHelloToast = async () => {
		await Toast.show({
			text: 'Hello!',
		});
	};

	return (
		<>
			<Box
				sx={{
					p: 2,
				}}
			>
				<Stack spacing={2}>
					<Paper sx={{ p: 2 }}>
						<Typography>Zona Privada,{user.nombre}</Typography>
						<Button onClick={showHelloToast}>Show Toast</Button>
					</Paper>

					<Box sx={{ height: '1000px', bgcolor: '#eee' }}>
						{/* Ejemplo de contenido largo para probar el scroll */}
						<Typography>Tus Recetas (Traídas del Backend):</Typography>
						<Grid container spacing={1}>
							{dataRecetas.map(row => (
								<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={row.id_receta}>
									<Card>
										<CardContent>
											{/* Nombre del donante */}
											<Typography gutterBottom variant="h5" component="div">
												{row.titulo}
											</Typography>
											<Typography variant="body2" sx={{ color: 'text.secondary' }}>
												{row.descripcion}
											</Typography>
											<Typography variant="caption" gutterBottom>
												<strong>Dificultad:</strong> {row.dificultad}
											</Typography>
										</CardContent>
									</Card>
								</Grid>
							))}
						</Grid>
					</Box>
				</Stack>
			</Box>
		</>
	);
}

export default Recetas;
