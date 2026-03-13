import {
	Box,
	Chip,
	Dialog,
	DialogContent,
	IconButton,
	Typography,
	CircularProgress,
	Divider,
} from '@mui/material';
import { X, Clock, ChefHat, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../utils/api';

function DialogoVerReceta({ idReceta, open, onClose }) {
	const [receta, setReceta] = useState(null);
	const [ingredientes, setIngredientes] = useState([]);
	const [cargando, setCargando] = useState(false);

	useEffect(() => {
		async function fetchDetalles() {
			if (open && idReceta) {
				setCargando(true);
				try {
					const respuesta = await api.post(`/recetas/${idReceta}`);
					// El backend manda { datos: { receta: {...}, ingredientes: [...] } }
					setReceta(respuesta.datos.receta);
					setIngredientes(respuesta.datos.ingredientes || []);
				} catch (error) {
					console.error('Error cargando la receta', error);
				} finally {
					setCargando(false);
				}
			} else if (!open) {
				// Limpiamos los datos cuando se cierra para que no parpadee la receta anterior al abrir otra
				setReceta(null);
				setIngredientes([]);
			}
		}

		fetchDetalles();
	}, [open, idReceta]);

	// Función auxiliar para obtener el color del chip de dificultad
	const getColorDificultad = dificultad => {
		if (dificultad === 'Fácil') return 'success';
		if (dificultad === 'Media') return 'warning';
		return 'error';
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			{/* Botón de cerrar superior flotante */}
			<IconButton
				onClick={onClose}
				sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary', zIndex: 1 }}
			>
				<X size={25} />
			</IconButton>

			{cargando || !receta ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
					<CircularProgress sx={{ color: '#ff6900' }} />
				</Box>
			) : (
				<>
					{/* Cabecera de la receta */}
					<Box sx={{ p: 4, pb: 2, textAlign: 'center', bgcolor: '#fffbf5' }}>
						<Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
							{receta.titulo}
						</Typography>

						<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
							<Chip
								icon={<ChefHat size={16} />}
								label={receta.dificultad}
								color={getColorDificultad(receta.dificultad)}
								variant="outlined"
								sx={{ fontWeight: 'bold' }}
							/>
							<Chip
								icon={<Utensils size={16} />}
								label={`${ingredientes.length} Ingredientes`}
								variant="outlined"
							/>
						</Box>
					</Box>

					<Divider />

					{/* Contenido principal */}
					<DialogContent sx={{ p: 4 }}>
						{/* Sección de Descripción */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#ff6900' }}>
								Descripción
							</Typography>
							<Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
								{receta.descripcion}
							</Typography>
						</Box>

						{/* Sección de Ingredientes */}
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#ff6900' }}>
								Ingredientes
							</Typography>

							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								{ingredientes.map((ingrediente, index) => (
									<Box
										key={index}
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											p: 1.5,
											bgcolor: index % 2 === 0 ? '#f9f9f9' : 'transparent',
											borderRadius: 1,
										}}
									>
										<Typography variant="body1" sx={{ fontWeight: 'medium' }}>
											{ingrediente.nombre_ingrediente}
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: 'text.secondary', fontWeight: 'bold' }}
										>
											{ingrediente.cantidad} {ingrediente.unidad}
										</Typography>
									</Box>
								))}
							</Box>
						</Box>
					</DialogContent>
				</>
			)}
		</Dialog>
	);
}

export default DialogoVerReceta;
