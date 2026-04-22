/**
 * @fileoverview Asistente de recetas con IA.
 * Permite sugerir recetas por ingredientes y guardarlas en el cuaderno.
 */
import { Alert, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Grid, IconButton, Stack, TextField, Typography, Zoom } from '@mui/material';
import { BookPlus, Check, Eye, Send, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import DialogoVerReceta from '../components/DialogoVerReceta';
import api from '../utils/api';

const mensajesCargando = [
	'Encendiendo los fogones...',
	'El Chef IA está leyendo tus ingredientes...',
	'Creando recetas únicas...'
];

/**
 * Pantalla de sugerencias de recetas generadas por IA.
 *
 * @returns {JSX.Element}
 */
function IA() {
	const [ingredientesIA, setIngredientesIA] = useState('');
	const [openDialogVerReceta, setOpenDialogVerReceta] = useState(false);
	const [recetaActiva, setRecetaActiva] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [mensajeCargaIndex, setMensajeCargaIndex] = useState(0);
	const [añadiendoReceta, setAñadiendoReceta] = useState(false);
	const [recetasIARecuperadas, setRecetasIARecuperadas] = useState([]);
	const [recetasAñadidas, setRecetasAñadidas] = useState([]);
	// Estado para mostrar alertas
	const [alerta, setAlerta] = useState({
		mostrar: false,
		mensaje: '',
		severidad: 'success',
	});

	// Efecto para cambiar el mensaje de carga cada 5 segundos mientras isUpdating es true
	useEffect(() => {
		if (!isUpdating) {
			setMensajeCargaIndex(0);
			return;
		}

		const intervalId = setInterval(() => {
			setMensajeCargaIndex(prev => (prev + 1) % mensajesCargando.length);
		}, 5000);

		return () => clearInterval(intervalId);
	}, [isUpdating]);

	/**
	 * Envia ingredientes al backend de IA y carga las recetas sugeridas.
	 *
	 * @returns {Promise<void>}
	 */
	const handleSubmit = async () => {
		// Evitamos envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
		if (isUpdating) return;
		// Bloqueamos botones y enviamos
		setMensajeCargaIndex(0);
		setIsUpdating(true);

		const ingredientesFormateados = ingredientesIA.split(',').map(ing => ing.trim()).filter(ing => ing !== '');

		// Construimos el objeto final tal y como lo pide el backend
		const payload = {
			ingredientes: ingredientesFormateados,
		};

		try {
			const respuesta = await api.post('/ia', payload, {
				timeout: 120000,
			});
			const datos = respuesta.datos;
			const recetas = Array.isArray(datos)
				? datos
				: Array.isArray(datos?.recetas)
					? datos.recetas
					: [];

			setRecetasIARecuperadas(recetas);
			setAlerta({
				mostrar: true,
				mensaje: 'Recetas sugeridas correctamente',
				severidad: 'success'
			});

			// Ocultamos la alerta después de 3 segundos
			setTimeout(() => {
				setAlerta(prev => ({ ...prev, mostrar: false }));
			}, 3000);
		} catch (error) {
			console.log('Error al enviar:', error);
			const mensajeError = error?.mensaje || 'Error al obtener recetas sugeridas';
			setAlerta({
				mostrar: true,
				mensaje: mensajeError,
				severidad: 'error'
			});
			// Ocultamos la alerta después de 3 segundos
			setTimeout(() => {
				setAlerta(prev => ({ ...prev, mostrar: false }));
			}, 3000);
		} finally {
			setIsUpdating(false);
		}
	};

	/**
	 * Guarda una receta sugerida en el cuaderno del usuario.
	 *
	 * @param {{
	 *  titulo: string,
	 *  descripcion: string,
	 *  dificultad: string,
	 *  ingredientes: Array<any>
	 * }} receta - Receta sugerida por IA.
	 * @returns {Promise<void>}
	 */
	const handleAñadirReceta = async (receta) => {
		if (recetasAñadidas.includes(receta.titulo)) return;
		if (añadiendoReceta) return;
		setAñadiendoReceta(true);

		const payload = {
			receta: {
				titulo: receta.titulo,
				descripcion: receta.descripcion,
				dificultad: receta.dificultad,
			},
			// Filtramos para evitar enviar ingredientes completamente vacíos si le dieron a "Añadir otro" sin querer
			ingredientes: receta.ingredientes,
		};

		try {
			await api.post('/recetas/new', payload);
			setRecetasAñadidas([...recetasAñadidas, receta.titulo]);
			setAlerta({
				mostrar: true,
				mensaje: 'Receta añadida al cuaderno',
				severidad: 'success'
			});
			// Ocultamos la alerta después de 3 segundos
			setTimeout(() => {
				setAlerta(prev => ({ ...prev, mostrar: false }));
			}, 3000);
		} catch (error) {
			console.log('Error guardando:', error);
			// Podrías poner aquí un setErrores({ global: "Error en el servidor" }) si quisieras
			setAlerta({
				mostrar: true,
				mensaje: 'Error al guardar la receta',
				severidad: 'error'
			});
			// Ocultamos la alerta después de 3 segundos
			setTimeout(() => {
				setAlerta(prev => ({ ...prev, mostrar: false }));
			}, 3000);
		} finally {
			setAñadiendoReceta(false);
		}

	};

	/**
	 * Actualiza el input de ingredientes en bruto.
	 *
	 * @param {import('react').ChangeEvent<HTMLInputElement>} e - Evento de input.
	 */
	const handleChange = e => {
		setIngredientesIA(e.target.value);
	};

	/**
	 * Abre el dialogo de detalle para una receta sugerida.
	 *
	 * @param {Object} receta - Receta activa para vista detallada.
	 */
	const handleClickOpenDialog = receta => {
		setRecetaActiva(receta);
		setOpenDialogVerReceta(true);
	};

	/**
	 * Extrae un nombre de ingrediente desde distintos formatos de respuesta.
	 *
	 * @param {string|Object} ingrediente - Elemento de ingrediente heterogeneo.
	 * @returns {string} Nombre normalizado o cadena vacia.
	 */
	const obtenerNombreIngrediente = ingrediente => {
		if (typeof ingrediente === 'string') return ingrediente;
		if (ingrediente && typeof ingrediente === 'object') {
			if (typeof ingrediente.nombre_ingrediente === 'string') {
				return ingrediente.nombre_ingrediente;
			}

			if (ingrediente.nombre_ingrediente && typeof ingrediente.nombre_ingrediente === 'object') {
				if (typeof ingrediente.nombre_ingrediente.nombre_ingrediente === 'string') {
					return ingrediente.nombre_ingrediente.nombre_ingrediente;
				}
				if (typeof ingrediente.nombre_ingrediente.nombre === 'string') {
					return ingrediente.nombre_ingrediente.nombre;
				}
			}

			if (typeof ingrediente.nombre === 'string') {
				return ingrediente.nombre;
			}
		}
		return '';
	};

	// Estilos de los TextField
	const inputStyles = theme => ({
		'& .MuiOutlinedInput-root': {
			bgcolor: 'action.hover',
			borderRadius: '12px',
			'& fieldset': {
				borderColor: theme.palette.mode === 'dark' ? '#5d3f6b' : '#c8ccd5',
			},
			'&:hover fieldset': {
				borderColor: theme.palette.mode === 'dark' ? '#7a5390' : '#aeb4c0',
			},
			'&.Mui-focused fieldset': {
				borderColor: theme.palette.mode === 'dark' ? '#d8b4ff' : '#7e22ce',
			},
		},
		'& .MuiInputLabel-root.Mui-focused': {
			color: theme.palette.mode === 'dark' ? '#d8b4ff' : '#7e22ce',
		},
	});

	return (
		<>
			{/* 1. Un Box principal solo para dar margen a los lados (p: 2 equivale a 16px) */}
			{/* IMPORTANTE: Aquí NO ponemos anchos, ni altos, ni colores de fondo generales. */}
			<Box sx={{ p: 2 }}>
				{/* 2. Un Stack para apilar tus elementos verticalmente con una separación uniforme */}
				<Stack spacing={2}>
					<Box>
						{/* Titulo, subtitulo y boton de crear nueva receta*/}
						<Stack sx={{ mb: 4 }}>
							<Typography variant="h5" sx={{ fontWeight: 'bold' }}> Asistente de Cocina IA </Typography>
							<Typography variant="subtitle2" color="text.secondary">
								Obtén sugerencias de recetas basadas en los ingredientes que añadas.
							</Typography>
						</Stack>

						{/* Card para ingresar ingredientes */}
						<Grid container spacing={1}>
							<Card className="ia-highlight-card" sx={{ mb: 2, width: '100%' }}>
								<CardContent>
									{/* Titulo, subtitulo*/}
									<Box
										sx={{
											alignItems: 'center',
										}}
									>
										<Typography variant="body1" component="div" className="ia-highlight-title">
											<Sparkles
												size={20}
												className="ia-highlight-icon"
											/>
											¿Qué ingredientes tienes?
										</Typography>
										<Typography variant="body2" component="div">
											Ingresa los ingredientes que tienes disponibles (separados por comas)
										</Typography>
									</Box>
								</CardContent>
								<CardActions>
									{/* TextField y Botón */}
									<Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
										<TextField
											label="Ingredientes"
											id="ingredientes"
											name="ingredientes"
											fullWidth
											placeholder="Tomate, queso, albahaca..."
											type="text"
											variant="outlined"
											sx={inputStyles}
											value={ingredientesIA}
											onChange={handleChange}
										/>
										<IconButton
											aria-label="buscar recetas"
											className="invert-surface"
											sx={{ ml: 1, mt: '1px', borderRadius: '10px', width: 56, height: 56, p: 0, flexShrink: 0 }}
											disabled={isUpdating}
											onClick={handleSubmit}
										>
											{isUpdating ? <CircularProgress size={22} color="inherit" /> : <Send />}
										</IconButton>
									</Box>
								</CardActions>
							</Card>
						</Grid>

						{/* RecetasIA */}
						{isUpdating ? (
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									minHeight: '30vh',
									gap: 2,
									textAlign: 'center',
								}}
							>
								<Card sx={{ p: 4, bgcolor: 'background.paper', borderColor: 'primary.main' }}>
									<CircularProgress />
									<Typography variant="h5" color="text.secondary">
										{mensajesCargando[mensajeCargaIndex]}
									</Typography>
								</Card>

							</Box>
						) : (
							<Grid container spacing={1}>
								{recetasIARecuperadas.map(row => (
									<Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={row.titulo}>
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
												{/* Descripcion e ingredientes */}
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
															display: 'block',
															alignItems: 'center',
															color: 'text.secondary',
															gap: 1,
															mb: 2,
														}}
													>
														<Typography
															variant="body1"
														>
															Ingredientes:
														</Typography>
														{(row.ingredientes || []).map((ing, index) => {
															const nombreIngrediente = obtenerNombreIngrediente(ing);
															if (!nombreIngrediente) return null;

															return (
																<Chip
																	key={index}
																	label={nombreIngrediente}
																	size="small"
																	sx={{ borderRadius: 3, mx: 0.5 }}
																/>
															);
														})}
													</Box>
												</Box>
												{/* Boton añadir receta a cuaderno */}
												{recetasAñadidas.includes(row.titulo) ? (
													<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', alignContent: 'center' }}>
														<Check size={18} color="green" />
														<Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
															Receta añadida al cuaderno
														</Typography>
													</Box>
												) : (
													<Box sx={{ display: 'flex', gap: 1 }}>
														<IconButton
															aria-label="Ver Receta"
															onClick={() => handleClickOpenDialog(row)}
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
															startIcon={<BookPlus />}
															variant="outlined"
															size="small"
															onClick={() => handleAñadirReceta(row)}
															sx={{
																color: 'text.primary',
																borderRadius: 2,
																borderColor: 'divider',
																flexGrow: 1,
															}}
														>
															Añadir al Cuaderno
														</Button>
													</Box>
												)}

											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

					</Box>
				</Stack>
			</Box>

			<DialogoVerReceta
				recetaProp={recetaActiva}
				open={openDialogVerReceta}
				onClose={() => setOpenDialogVerReceta(false)}
			/>
			{/* Renderizado del mensaje de alerta unificado */}
			{alerta.mostrar && (
				<Box
					sx={{
						position: 'fixed',
						top: '83%',
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

export default IA;