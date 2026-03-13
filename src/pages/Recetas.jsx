import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Grid,
	IconButton,
	Stack,
	Typography,
	Zoom,
} from '@mui/material';
import { ChartNoAxesColumnIncreasing, Plus, SquarePen, Trash2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import DialogoConfirmacion from '../components/DialogoConfirmacion';
import DialogoReceta from '../components/DialogoReceta';
import api from '../utils/api';
import DialogoVerReceta from '../components/DialogoVerReceta';

function Recetas() {
	// Recupera las recetas del usuario
	const [recetasRecuperadas, setRecetasRecuperadas] = useState([]);
	// Recuperamos todos los ingredientes disponibles para el autocomplete
	const [ingredientesRecuperados, setIngredientesRecuperados] = useState([]);
	// Estado para abrir y cerrar el dialog de Nueva/Editar Receta
	const [openDialogReceta, setOpenDialogReceta] = useState(false);
	// Estado para abrir y cerrar el dialog de confirmar eliminación de receta
	const [openDialogConfirmarEliminarReceta, setOpenDialogConfirmarEliminarReceta] = useState(false);
	// Estado para abrir y cerrar el dialog de ver receta
	const [openDialogVerReceta, setOpenDialogVerReceta] = useState(false);
	// Indica si se está procesando el envío
	const [isUpdating, setIsUpdating] = useState(false);
	// Estado para mostrar alertas
	const [alerta, setAlerta] = useState({
		mostrar: false,
		mensaje: '',
		severidad: 'success',
	});
	// Indica si es necesario actualizar los datos o no
	const [recargarDatos, setRecargarDatos] = useState(false);
	// Estado dinámico para el modo del diálogo
	const [modoDialogo, setModoDialogo] = useState('Nueva');
	// ID de la receta que se va a borrar o editar
	const [idRecetaActiva, setIdRecetaActiva] = useState(null);

	const onSuccess = tipo => {
		setRecargarDatos(prev => !prev);
		setOpenDialogReceta(false);
		setIsUpdating(false);
		setAlerta({
			mostrar: true,
			mensaje:
				tipo === 'Nueva' ? 'Receta creada correctamente' : 'Receta actualizada correctamente',
			severidad: 'success',
		});
	};

	// Abre el dialog de Nueva/Editar/Eliminar receta
	const handleClickOpenDialog = (tipo, id = null) => {
		setIdRecetaActiva(id);
		if (tipo === 'Nueva' || tipo === 'Editar') {
			setModoDialogo(tipo);
			setOpenDialogReceta(true);
		} else if (tipo === 'Eliminar') {
			setOpenDialogConfirmarEliminarReceta(true);
		} else if (tipo === 'Ver') {
			setOpenDialogVerReceta(true);
		}
	};

	// Cierra el dialog
	const handleCloseDialog = tipo => {
		if (tipo === 'Nueva' || tipo === 'Editar') {
			setOpenDialogReceta(false);
		} else if (tipo === 'Eliminar') {
			setOpenDialogConfirmarEliminarReceta(false);
		} else if (tipo === 'Ver') {
			setOpenDialogVerReceta(false);
		}
	};

	// Cargamos las recetas y los ingredientes
	useEffect(() => {
		async function cargarDatosPreliminares() {
			try {
				// Ejecutamos ambas peticiones a la vez (en paralelo)
				const [resRecetas, resIngredientes] = await Promise.all([
					api.post('/recetas'),
					api.post('/ingredientes'),
				]);

				setRecetasRecuperadas(resRecetas.datos.recetas || []);
				setIngredientesRecuperados(resIngredientes.datos.ingredientes || []);
			} catch (error) {
				console.log(error);
				setRecetasRecuperadas([]);
				setIngredientesRecuperados([]);
			}
		}

		cargarDatosPreliminares();
	}, [recargarDatos]);

	async function handleDelete() {
		setIsUpdating(true); // Bloqueamos los botones al iniciar
		try {
			await api.delete('recetas/' + idRecetaActiva);

			//Buscamos la receta borrada y la quitamos de los datos
			const datos_nuevos = recetasRecuperadas.filter(receta => receta.id_receta !== idRecetaActiva);
			// Actualizamos los datos de recetas sin la que hemos borrado
			setRecetasRecuperadas(datos_nuevos);
			setRecargarDatos(prev => !prev);
			// Cerramos el diálogo
			setOpenDialogConfirmarEliminarReceta(false);
			setAlerta({
				mostrar: true,
				mensaje: 'Receta borrada correctamente',
				severidad: 'success',
			});
			setIdRecetaActiva(null);
		} catch (error) {
			console.log(error);
			setRecetasRecuperadas([]);
		} finally {
			setIsUpdating(false); // Desbloqueamos los botones, independientemente de si hubo éxito o error
		}
	}

	// useEffect para que el Alert desaparezca
	useEffect(() => {
		if (alerta.mostrar) {
			const timer = setTimeout(() => {
				setAlerta(prev => ({ ...prev, mostrar: false }));
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [alerta.mostrar]);

	return (
		<>
			<Box
				sx={{
					p: 2,
				}}
			>
				<Stack spacing={2}>
					<Box sx={{ height: '1000px' }}>
						{/* Titulo, subtitulo y boton de crear nueva receta*/}
						<Stack sx={{ mb: 4 }}>
							<Typography variant="h5"> Mi Cuaderno de Recetas</Typography>
							<Typography variant="subtitle2" color="#7c7c7cff">
								Guarda y organiza tus recetas favoritas
							</Typography>
							<Button
								onClick={() => handleClickOpenDialog('Nueva')}
								variant="contained"
								startIcon={<Plus />}
								sx={{ color: '#fff', backgroundColor: '#ff6900', mt: 2, borderRadius: 2 }}
							>
								Nueva Receta
							</Button>
						</Stack>

						{/* Recetas */}
						<Grid container spacing={1}>
							{recetasRecuperadas.map(row => (
								<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={row.id_receta}>
									<Card sx={{ borderRadius: 2, mb: 2 }}>
										<CardContent>
											{/* Titulo y dificultad */}
											<Box
												sx={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													mb: 1,
												}}
											>
												<Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
													{row.titulo}
												</Typography>
												<Chip
													label={row.dificultad}
													color={
														row.dificultad === 'Fácil'
															? 'success'
															: row.dificultad === 'Media'
															? 'warning'
															: 'error'
													}
													sx={{ borderRadius: 3 }}
												/>
											</Box>
											{/* Descripcion y cantidad de ingredientes */}
											<Box
												sx={{
													display: 'block',
													mb: 1,
												}}
											>
												<Typography
													variant="subtitle1"
													sx={{
														color: 'text.secondary',
														mb: 3,
														display: '-webkit-box',
														WebkitLineClamp: 2,
														WebkitBoxOrient: 'vertical',
														overflow: 'hidden',
													}}
												>
													{row.descripcion}
												</Typography>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														color: 'text.secondary',
														gap: 1,
														mb: 2,
													}}
												>
													<ChartNoAxesColumnIncreasing size={20} />
													<Typography variant="subtitle1">
														{row.cantidadIngredientes} Ingredientes
													</Typography>
												</Box>
											</Box>
											{/* Botones de editar y borrar */}
											<Box sx={{ display: 'flex', gap: 1 }}>
												<IconButton
													aria-label="Ver Receta"
													onClick={() => handleClickOpenDialog('Ver', row.id_receta)}
													sx={{
														border: '1px solid',
														borderRadius: 2,
														width: 34,
														height: 34,
													}}
												>
													<Eye color="#ff6900" size={18} />
												</IconButton>
												<Button
													startIcon={<SquarePen />}
													variant="outlined"
													size="small"
													onClick={() => handleClickOpenDialog('Editar', row.id_receta)}
													sx={{
														color: 'black',
														borderRadius: 2,
														borderColor: '#7c7c7cff',
														flexGrow: 1,
													}}
												>
													Editar
												</Button>
												<IconButton
													aria-label="Borrar Receta"
													onClick={() => handleClickOpenDialog('Eliminar', row.id_receta)}
													sx={{
														border: '1px solid #7c7c7cff',
														borderRadius: 2,
														width: 34,
														height: 34,
													}}
												>
													<Trash2 color="red" size={18} />
												</IconButton>
											</Box>
										</CardContent>
									</Card>
								</Grid>
							))}
						</Grid>

						{/* Dialogo Reutilizable para Crear/Editar Recetas */}
						<DialogoReceta
							modo={modoDialogo}
							idReceta={idRecetaActiva}
							open={openDialogReceta}
							onClose={() => handleCloseDialog(modoDialogo)}
							onSuccess={onSuccess}
							ingredientesRecuperados={ingredientesRecuperados}
						/>

						{/* Dialogo para confirmar la eliminación de una receta */}
						<DialogoConfirmacion
							open={openDialogConfirmarEliminarReceta}
							onClose={() => handleCloseDialog('Eliminar')}
							onConfirm={handleDelete}
							titulo="Eliminar Receta"
							mensaje="¿Estás seguro de que quieres eliminar esta receta de tu cuaderno?"
							isProcessing={isUpdating}
						/>

						<DialogoVerReceta
							idReceta={idRecetaActiva}
							open={openDialogVerReceta}
							onClose={() => handleCloseDialog('Ver')}
						/>
					</Box>
				</Stack>
			</Box>
			{/* Renderizado del mensaje de alerta unificado */}
			{alerta.mostrar && (
				<Box
					sx={{
						position: 'fixed',
						top: '85%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						zIndex: 2000,
						width: { xs: '90%', sm: 'auto' },
						minWidth: { sm: 300 },
					}}
				>
					<Zoom in={alerta.mostrar}>
						<Alert
							severity={alerta.severidad}
							variant="filled"
							sx={{
								borderRadius: 2,
								boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
								width: '100%',
							}}
						>
							{alerta.mensaje}
						</Alert>
					</Zoom>
				</Box>
			)}
		</>
	);
}

export default Recetas;
