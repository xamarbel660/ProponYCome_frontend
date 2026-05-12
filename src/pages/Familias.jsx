/**
 * @fileoverview Gestion de familias del usuario:
 * creacion, union, consulta de miembros, invitaciones y salida/eliminacion.
 */
import { Box, Button, Card, CardContent, Chip, Grid, Pagination, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Crown, Eye, LogOut, Plus, QrCode, Trash2, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import DialogoCodigoInvitacion from '../components/DialogoCodigoInvitacionFamilia';
import DialogoConfirmacion from '../components/DialogoConfirmacion';
import DialogoFamilia from '../components/DialogoFamilia';
import DialogoVerMiembros from '../components/DialogoVerMiembros';
import useNotificationStore from '../store/notificationStore';
import api from '../utils/api';

/** 
 * Pagina principal de familias del usuario autenticado.
 *
 * @returns {JSX.Element}
 */
function Familias() {
	// Recupera las familias del usuario
	const [familiasRecuperadas, setFamiliasRecuperadas] = useState([]);
	// Paginación
	const [paginaActual, setPaginaActual] = useState(1);
	const [totalPaginas, setTotalPaginas] = useState(1);
	// Estado para abrir y cerrar el dialog de Nueva/Unir Familia
	const [openDialogFamilia, setOpenDialogFamilia] = useState(false);
	// Estado para abrir y cerrar el dialog de confirmar eliminación de receta
	const [openDialogConfirmarEliminarFamilia, setOpenDialogConfirmarEliminarFamilia] = useState(false);
	// Estado para abrir y cerrar el dialog de ver miembros de la familia
	const [openDialogVerMiembros, setOpenDialogVerMiembros] = useState(false);
	// Estado para abrir y cerrar el dialog de ver el código de invitación
	const [openDialogCodigoInvitacion, setOpenDialogCodigoInvitacion] = useState(false);
	// Indica si se está procesando el envío
	const [isUpdating, setIsUpdating] = useState(false);
	const showNotification = useNotificationStore(state => state.showNotification);
	// Indica si es necesario actualizar los datos o no
	const [recargarDatos, setRecargarDatos] = useState(false);
	// Estado dinámico para el modo del diálogo
	const [modoDialogo, setModoDialogo] = useState('Nueva');
	// Familia activa con toda su información
	const [familiaActiva, setFamiliaActiva] = useState({
		id_familia: null,
		nombre_familia: '',
		codigo_invitacion: '',
		cantidadMiembros: 0,
		es_admin: false,
		nombreCreador: '',
	});

	/**
	 * Callback de exito tras crear o unirse a una familia.
	 *
	 * @param {'Nueva'|'Unirme'} tipo - Accion completada en el dialogo.
	 */
	const onSuccess = tipo => {
		setRecargarDatos(prev => !prev);
		setOpenDialogFamilia(false);
		setIsUpdating(false);
		showNotification({
			mensaje: tipo === 'Nueva' ? 'Familia creada correctamente' : 'Unido a la familia correctamente',
			severidad: 'success',
			duracionMs: 5000,
		});
	};

	/**
	 * Abre el dialogo correspondiente segun accion de usuario.
	 *
	 * @param {'Nueva'|'Unirme'|'Eliminar'|'Ver'|'Invitación'} tipo - Tipo de dialogo.
	 * @param {Object|null} [familia=null] - Familia objetivo de la accion.
	 */
	const handleClickOpenDialog = (tipo, familia = null) => {
		if (tipo === 'Nueva' || tipo === 'Unirme') {
			setModoDialogo(tipo);
			setOpenDialogFamilia(true);
		} else if (tipo === 'Eliminar') {
			setFamiliaActiva(familia);
			setOpenDialogConfirmarEliminarFamilia(true);
		} else if (tipo === 'Ver') {
			setFamiliaActiva(familia);
			setOpenDialogVerMiembros(true);
		} else if (tipo === 'Invitación') {
			setModoDialogo(tipo);
			setFamiliaActiva(familia);
			setOpenDialogCodigoInvitacion(true);
		}
	};

	/**
	 * Sincroniza el nuevo codigo de invitacion en el estado local y la lista paginada.
	 *
	 * @param {string} nuevoCodigoInvitacion - Codigo generado recientemente.
	 */
	const handleCodigoActualizado = (nuevoCodigoInvitacion) => {
		// Actualizar familiaActiva
		setFamiliaActiva(prev => ({
			...prev,
			codigo_invitacion: nuevoCodigoInvitacion,
		}));
		
		// Actualizar la familia en la lista de familiasRecuperadas
		setFamiliasRecuperadas(prev => 
			prev.map(familia => 
				familia.id_familia === familiaActiva.id_familia
					? { ...familia, codigo_invitacion: nuevoCodigoInvitacion }
					: familia
			)
		);
	};

	/**
	 * Cierra el dialogo indicado por tipo.
	 *
	 * @param {'Nueva'|'Unirme'|'Eliminar'|'Ver'|'Invitación'} tipo - Dialogo a cerrar.
	 */
	const handleCloseDialog = tipo => {
		if (tipo === 'Nueva' || tipo === 'Unirme') {
			setOpenDialogFamilia(false);
		} else if (tipo === 'Eliminar') {
			setOpenDialogConfirmarEliminarFamilia(false);
		} else if (tipo === 'Ver') {
			setOpenDialogVerMiembros(false);
		} else if (tipo === 'Invitación') {
			setOpenDialogCodigoInvitacion(false);
		}
	};

	// Cargamos las familias
	useEffect(() => {
		async function cargarDatosPreliminares() {
			try {
				const familiasRecuperadas = await api.post('/familias/paginadas', { page: paginaActual })

				setFamiliasRecuperadas(familiasRecuperadas.datos.familias || []);
				setTotalPaginas(Math.ceil((familiasRecuperadas.datos.total || 0) / 5) || 1);
			} catch (error) {
				console.log(error);
				setFamiliasRecuperadas([]);
				showNotification({
					mensaje: error?.mensaje || 'No se pudieron cargar las familias.',
					severidad: 'error',
					duracionMs: 6000,
				});
			}
		}

		cargarDatosPreliminares();
	}, [recargarDatos, paginaActual]);

	/**
	 * Elimina la familia (si es admin) o abandona la familia (si es miembro).
	 * Actualiza estado local y feedback visual.
	 *
	 * @returns {Promise<void>}
	 */
	async function handleDelete() {
		setIsUpdating(true); // Bloqueamos los botones al iniciar
		try {
			if (familiaActiva.es_admin) {
				await api.delete('familias/' + familiaActiva.id_familia);
			} else {
				await api.post('familias/salir/' + familiaActiva.id_familia);
			}

			// Buscamos la familia borrada y la quitamos de los datos
			const datos_nuevos = familiasRecuperadas.filter(familia => familia.id_familia !== familiaActiva.id_familia);
			// Actualizamos los datos de familias sin la que hemos borrado
			setFamiliasRecuperadas(datos_nuevos);
			setRecargarDatos(prev => !prev);
			// Cerramos el diálogo
			setOpenDialogConfirmarEliminarFamilia(false);
			showNotification({
				mensaje: familiaActiva.es_admin
					? 'Familia borrada correctamente'
					: 'Has salido de la familia correctamente',
				severidad: 'success',
				duracionMs: 5000,
			});
			// Limpiamos la familia activa
			setFamiliaActiva({
				id_familia: null,
				nombre_familia: '',
				codigo_invitacion: '',
				cantidadMiembros: 0,
				es_admin: false,
				nombreCreador: '',
			});
		} catch (error) {
			console.log(error);
			setFamiliasRecuperadas([]);
			showNotification({
				mensaje: error?.mensaje || 'No se pudo completar la operación.',
				severidad: 'error',
				duracionMs: 6000,
			});
		} finally {
			setIsUpdating(false); // Desbloqueamos los botones, independientemente de si hubo éxito o error
		}
	}

	return (
		<>
			{/* Un Box principal solo para dar margen a los lados (p: 2 equivale a 16px) */}
			{/* IMPORTANTE: Aquí NO ponemos anchos, ni altos, ni colores de fondo generales. */}
			<Box sx={{ p: 2 }}>
				{/* Un Stack para apilar tus elementos verticalmente con una separación uniforme */}
				<Stack spacing={2}>
					<Box>
						{/* Titulo, subtitulo y boton de crear nueva familia y unirse a una nueva familia */}
						<Stack sx={{ mb: 4 }}>
							<Typography variant="h5" sx={{ fontWeight: 'bold' }}> Mis Familias</Typography>
							<Typography variant="subtitle2" color="text.secondary">
								Gestiona tus grupos de planificación
							</Typography>
							<Button
								onClick={() => { handleClickOpenDialog('Nueva') }}
								variant="contained"
								startIcon={<Plus />}
								sx={{ color: 'primary.contrastText', backgroundColor: 'primary.main', mt: 2, borderRadius: 2 }}
							>
								Crear Familia
							</Button>
							<Button
								onClick={() => { handleClickOpenDialog('Unirme') }}
								variant="contained"
								startIcon={<UserPlus />}
								sx={{ color: 'text.primary', backgroundColor: 'background.paper', mt: 2, borderRadius: 2 }}
							>
								Unirme a una Familia
							</Button>
						</Stack>

						{/* Familias */}
						<Grid container spacing={1}>
							{familiasRecuperadas.map(row => (
								<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={row.id_familia}>
									<Card sx={{ borderRadius: 2, mb: 2 }}>
										<CardContent>
											{/* Titulo y si es admin */}
											<Box
												sx={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
												}}
											>
												<Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
													{row.nombre_familia}
												</Typography>
												{row.es_admin && (
													<Chip
														icon={<Crown size={20} />}
														label={'Admin'}
														color={grey[300]}
														sx={{ borderRadius: 3, fontWeight: 'bold' }}
													/>
												)}

											</Box>
											{/* Creador y cantidad de miembros de la Familia */}
											<Box
												sx={{
													display: 'block',
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
													Creado por {row.nombreCreador}
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
													<Users size={20} />
													<Typography variant="subtitle1">
														{row.cantidadMiembros} Miembros
													</Typography>
												</Box>
											</Box>
											{/* Botones de ver miembros, codigo de invitación y eliminar/salir familia */}
											<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
												<Box sx={{ display: 'flex', gap: 1 }}>
													<Button
														startIcon={<Eye />}
														variant="outlined"
														size="medium"
														fullWidth
														onClick={() => handleClickOpenDialog('Ver', row)}
														sx={{
															color: 'text.primary',
															borderRadius: 2,
															borderColor: 'divider',
															flexGrow: 1,
														}}
													>
														Miembros
													</Button>
													<Button
														startIcon={<QrCode />}
														variant="outlined"
														size="medium"
														fullWidth
														onClick={() => handleClickOpenDialog('Invitación', row)}
														sx={{
															color: 'text.primary',
															borderRadius: 2,
															borderColor: 'divider',
															flexGrow: 1,
														}}
													>
														Invitación
													</Button>
												</Box>
												<Button
													startIcon={row.es_admin ? <Trash2 /> : <LogOut />}
													variant="outlined"
													size="medium"
													fullWidth
													onClick={() => handleClickOpenDialog('Eliminar', row)}
													sx={{
														color: 'error.main',
														borderRadius: 2,
														borderColor: 'divider',
													}}
												>
													{row.es_admin ? 'Eliminar Familia' : 'Salir de la Familia'}
												</Button>
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
											}
										}
									}}
								/>
							</Box>
						)}

						{/* Dialogo para crear o unirse a una familia */}
						<DialogoFamilia
							modo={modoDialogo}
							open={openDialogFamilia}
							onClose={() => handleCloseDialog(modoDialogo)}
							onSuccess={onSuccess}
						/>

						{/* Dialogo para confirmar la eliminación de una familia */}
						<DialogoConfirmacion
							open={openDialogConfirmarEliminarFamilia}
							onClose={() => handleCloseDialog('Eliminar')}
							onConfirm={() => handleDelete()}
							titulo={familiaActiva.es_admin ? 'Eliminar Familia' : 'Salir de la Familia'}
							mensaje={familiaActiva.es_admin
								? '¿Estás seguro de que quieres eliminar esta familia?'
								: '¿Estás seguro de que quieres salir de esta familia?'
							}
							confirmText={familiaActiva.es_admin ? 'Borrar' : 'Salir'}
							isProcessing={isUpdating}
						/>

						{/* Dialogo para ver el código de invitación */}
						<DialogoCodigoInvitacion
							open={openDialogCodigoInvitacion}
							onClose={() => handleCloseDialog('Invitación')}
							esAdmin={familiaActiva.es_admin}
							nombreFamilia={familiaActiva.nombre_familia}
							codigoInvitacion={familiaActiva.codigo_invitacion}
							idFamilia={familiaActiva.id_familia}
							onCodigoActualizado={handleCodigoActualizado}
						/>

						{/* Dialogo para ver los miembros de la familia */}
						<DialogoVerMiembros
							open={openDialogVerMiembros}
							onClose={() => handleCloseDialog('Ver')}
							idFamilia={familiaActiva.id_familia}
						/>

					</Box>
				</Stack>
			</Box>
		</>
	);
}

export default Familias;
