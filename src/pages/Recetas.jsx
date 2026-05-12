/**
 * @fileoverview Gestion del cuaderno de recetas del usuario.
 * Incluye listado paginado, creacion, edicion, borrado y vista de detalle.
 */
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Grid,
	IconButton,
	Pagination,
	Stack,
	Typography,
} from '@mui/material';
import { ChartNoAxesColumnIncreasing, Eye, Plus, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import DialogoConfirmacion from '../components/DialogoConfirmacion';
import DialogoReceta from '../components/DialogoCrearReceta';
import DialogoVerReceta from '../components/DialogoVerReceta';
import useNotificationStore from '../store/notificationStore';
import api from '../utils/api';

/**
 * Pagina principal de recetas del usuario.
 *
 * @returns {JSX.Element}
 */
function Recetas() {
	// Recupera las recetas del usuario
	const [recetasRecuperadas, setRecetasRecuperadas] = useState([]);
	// Paginación
	const [paginaActual, setPaginaActual] = useState(1);
	const [totalPaginas, setTotalPaginas] = useState(1);
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
	const showNotification = useNotificationStore(state => state.showNotification);
	// Indica si es necesario actualizar los datos o no
	const [recargarDatos, setRecargarDatos] = useState(false);
	// Estado dinámico para el modo del diálogo
	const [modoDialogo, setModoDialogo] = useState('Nueva');
	// ID de la receta que se va a borrar o editar
	const [idRecetaActiva, setIdRecetaActiva] = useState(null);
	const recetaActiva = recetasRecuperadas.find(receta => receta.id_receta === idRecetaActiva) || null;

	/**
	 * Callback de exito cuando una receta se crea o actualiza desde el dialogo.
	 *
	 * @param {'Nueva'|'Editar'} tipo - Operacion completada.
	 */
	const onSuccess = tipo => {
		setRecargarDatos(prev => !prev);
		setOpenDialogReceta(false);
		setIsUpdating(false);
		showNotification({
			mensaje:
				tipo === 'Nueva' ? 'Receta creada correctamente' : 'Receta actualizada correctamente',
			severidad: 'success',
			duracionMs: 5000,
		});
	};

	/**
	 * Abre el dialogo adecuado segun accion sobre una receta.
	 *
	 * @param {'Nueva'|'Editar'|'Eliminar'|'Ver'} tipo - Dialogo a abrir.
	 * @param {number|null} [id=null] - Identificador de receta objetivo.
	 */
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

	/**
	 * Cierra el dialogo indicado por tipo.
	 *
	 * @param {'Nueva'|'Editar'|'Eliminar'|'Ver'} tipo - Dialogo a cerrar.
	 */
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
					api.post('/recetas/paginadas', { page: paginaActual }),
					api.post('/ingredientes'),
				]);

				setRecetasRecuperadas(resRecetas.datos.recetas || []);
				setTotalPaginas(Math.ceil((resRecetas.datos.total || 0) / 5) || 1);
				setIngredientesRecuperados(resIngredientes.datos.ingredientes || []);
			} catch (error) {
				console.log(error);
				setRecetasRecuperadas([]);
				setIngredientesRecuperados([]);
			}
		}

		cargarDatosPreliminares();
	}, [recargarDatos, paginaActual]);

	/**
	 * Elimina la receta activa y refresca el listado local.
	 *
	 * @returns {Promise<void>}
	 */
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
			showNotification({
				mensaje: 'Receta borrada correctamente',
				severidad: 'success',
				duracionMs: 5000,
			});
			setIdRecetaActiva(null);
		} catch (error) {
			console.log(error);
			showNotification({
				mensaje: 'No se pudo borrar la receta. Inténtalo de nuevo.',
				severidad: 'error',
				duracionMs: 5000,
			});
			setRecetasRecuperadas([]);
		} finally {
			setIsUpdating(false); // Desbloqueamos los botones, independientemente de si hubo éxito o error
		}
	}

	return (
		<>
			<Box
				sx={{
					p: 2,
					pb: { xs: 4, sm: 2 }, // Reducimos el padding inferior en móvil porque 12 era demasiado
				}}
			>
				<Stack spacing={2}>
					<Box>
						{/* Titulo, subtitulo y boton de crear nueva receta*/}
						<Stack sx={{ mb: 4 }}>
							<Typography variant="h5" sx={{ fontWeight: 'bold' }}> Mi Cuaderno de Recetas</Typography>
							<Typography variant="subtitle2" color="text.secondary">
								Guarda y organiza tus recetas favoritas
							</Typography>
							<Button
								onClick={() => handleClickOpenDialog('Nueva')}
								variant="contained"
								startIcon={<Plus />}
								sx={{
									color: 'primary.contrastText',
									backgroundColor: 'primary.main',
									mt: 2,
									borderRadius: 2,
								}}
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
											{/* Botones de ver, editar y borrar */}
											<Box sx={{ display: 'flex', gap: 1 }}>
												<IconButton
													aria-label="Ver Receta"
													onClick={() => handleClickOpenDialog('Ver', row.id_receta)}
													sx={{
														border: '1px solid',
														borderRadius: 2,
														borderColor: 'divider',
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
														color: 'text.primary',
														borderRadius: 2,
														borderColor: 'divider',
														flexGrow: 1,
													}}
												>
													Editar
												</Button>
												<IconButton
													aria-label="Borrar Receta"
													onClick={() => handleClickOpenDialog('Eliminar', row.id_receta)}
													sx={{
														border: theme => `1px solid ${theme.palette.divider}`,
														color: 'error.main',
														borderRadius: 2,
														width: 34,
														height: 34,
													}}
												>
													<Trash2 color="currentColor" size={18} />
												</IconButton>
											</Box>
										</CardContent>
									</Card>
								</Grid>
							))}
						</Grid>

						{/* Paginación */}
						{totalPaginas > 1 && (
							<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
								<Pagination
									count={totalPaginas}
									page={paginaActual}
									onChange={(event, value) => setPaginaActual(value)}
									size="large"
									sx={{
										'& .MuiPaginationItem-root.Mui-selected': {
											backgroundColor: '#ff6900',
											color: 'primary.contrastText',
										},
										'& .MuiPaginationItem-root.Mui-selected:hover': {
											backgroundColor: '#e65e00',
										},
										// Solo aplicamos el hover en dispositivos con ratón (evita que se quede pegado en móviles)
										'@media (hover: hover)': {
											'& .MuiPaginationItem-root:hover': {
												backgroundColor: '#ff6900',
												color: 'primary.contrastText',
											},
										},
									}}
								/>
							</Box>
						)}

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
							recetaProp={recetaActiva}
							open={openDialogVerReceta}
							onClose={() => handleCloseDialog('Ver')}
						/>
					</Box>
				</Stack>
			</Box>
		</>
	);
}

export default Recetas;
