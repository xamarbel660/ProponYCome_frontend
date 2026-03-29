import { Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import { BookPlus, Check, Eye, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import api from '../utils/api';
import DialogoVerReceta from '../components/DialogoVerReceta';

function IA() {
	const [ingredientesIA, setIngredientesIA] = useState('');
	const [openDialogVerReceta, setOpenDialogVerReceta] = useState(false);
	const [recetaActiva, setRecetaActiva] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [añadiendoReceta, setAñadiendoReceta] = useState(false);
	const [recetasIARecuperadas, setRecetasIARecuperadas] = useState([]);
	/* {
			"titulo": "Nombre de la receta",
			"descripcion": "Breve descripción de los pasos a seguir",
			"ingredientes": ["zanahoria", "patata", "cebolla"],
			"cantidad_ingredientes": 2,
			"dificultad": "Fácil"
		} */
	const [recetasAñadidas, setRecetasAñadidas] = useState([]);

	// Cuando se pulsa el botón de enviar, se ejecuta esta función
	const handleSubmit = async () => {
		// Evitamos envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
		if (isUpdating) return;
		// Bloqueamos botones y enviamos
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
		} catch (error) {
			console.log('Error al enviar:', error);
		} finally {
			setIsUpdating(false);
		}
	};

	/* {
	  "receta": {
		"titulo": "Receta de prueba2",
		"descripcion": "Descripcion de prueba2",
		"dificultad": "Media"
	  },
	  "ingredientes": [
		{
		  "nombre_ingrediente": "Espaguetis",
		  "cantidad": 69,
		  "unidad": "gramos"
		}
	  ]
	} */

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
		} catch (error) {
			console.log('Error guardando:', error);
			// Podrías poner aquí un setErrores({ global: "Error en el servidor" }) si quisieras
		} finally {
			setAñadiendoReceta(false);
		}

	};

	// Cuando cambia un campo del formulario se actualiza el estado
	const handleChange = e => {
		setIngredientesIA(e.target.value);
	};

	// Abre el dialog de Nueva/Editar/Eliminar receta
	const handleClickOpenDialog = receta => {
		setRecetaActiva(receta);
		setOpenDialogVerReceta(true);
	};

	const obtenerNombreIngrediente = ingrediente => {
		if (typeof ingrediente === 'string') return ingrediente;
		if (ingrediente && typeof ingrediente === 'object') {
			return ingrediente.nombre_ingrediente || ingrediente.nombre || '';
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
					<Box sx={{ minHeight: '100vh' }}>
						{/* Titulo, subtitulo y boton de crear nueva receta*/}
						<Stack sx={{ mb: 4 }}>
							<Typography variant="h5" sx={{ fontWeight: 'bold' }}> Asistente de Cocina IA </Typography>
							<Typography variant="subtitle2" color="text.secondary">
								Obtén sugerencias de recetas basadas en los ingredientes que añadas.
							</Typography>
						</Stack>

						{/* Card para ingresar ingredientes */}
						<Grid container spacing={1}>
							<Card className="ia-highlight-card" sx={{ mb: 2 }}>
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
									minHeight: '45vh',
									gap: 2,
									textAlign: 'center',
								}}
							>
								<CircularProgress />
								<Typography variant="body1" color="text.secondary">
									Encendiendo los fogones
								</Typography>
							</Box>

						) : null}

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

					</Box>
				</Stack>
			</Box>

			<DialogoVerReceta
				recetaProp={recetaActiva}
				open={openDialogVerReceta}
				onClose={() => setOpenDialogVerReceta(false)}
			/>
			{/* Renderizado del mensaje de alerta unificado */}
			{/* {alerta.mostrar && (
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
			)} */}
		</>
	);
}

export default IA;