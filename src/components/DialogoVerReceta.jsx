/**
 * @fileoverview Dialogo de detalle de receta con descripcion e ingredientes.
 */
import {
	Box,
	Chip,
	CircularProgress,
	Dialog,
	DialogContent,
	Divider,
	IconButton,
	Typography,
} from '@mui/material';
import { ChefHat, Utensils, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../utils/api';

/**
 * Muestra una receta desde props o recuperandola por id en backend.
 *
 * @param {{
 *  idReceta?: number|null,
 *  open: boolean,
 *  onClose: () => void,
 *  recetaProp?: any,
 *  ingredientesProp?: Array<any>|null
 * }} props - Parametros de apertura y origen de datos.
 * @returns {JSX.Element}
 */
function DialogoVerReceta({ idReceta, open, onClose, recetaProp = null, ingredientesProp = null }) {
	const [receta, setReceta] = useState(null);
	const [ingredientes, setIngredientes] = useState([]);
	const [cargando, setCargando] = useState(false);

	/**
	 * Normaliza una lista heterogenea de ingredientes para pintarla en UI.
	 *
	 * @param {Array<any>} lista - Lista original de ingredientes.
	 * @returns {Array<{ nombre_ingrediente: string, cantidad: number|null, unidad: string }>}
	 */
	const normalizarIngredientes = lista => {
		if (!Array.isArray(lista)) return [];

		return lista
			.map(ingrediente => {
				const nombreIngrediente =
					typeof ingrediente === 'string'
						? ingrediente
						: typeof ingrediente?.nombre_ingrediente === 'string'
							? ingrediente.nombre_ingrediente
							: typeof ingrediente?.nombre_ingrediente?.nombre_ingrediente === 'string'
								? ingrediente.nombre_ingrediente.nombre_ingrediente
								: typeof ingrediente?.nombre_ingrediente?.nombre === 'string'
									? ingrediente.nombre_ingrediente.nombre
									: typeof ingrediente?.nombre === 'string'
										? ingrediente.nombre
										: '';

				if (typeof ingrediente === 'string') {
					return {
						nombre_ingrediente: nombreIngrediente,
						cantidad: null,
						unidad: '',
					};
				}

				return {
					nombre_ingrediente: nombreIngrediente,
					cantidad: ingrediente?.cantidad ?? null,
					unidad: ingrediente?.unidad || '',
				};
			})
			.filter(ingrediente => ingrediente.nombre_ingrediente);
	};

	useEffect(() => {
		async function fetchDetalles() {
			if (!open) {
				// Limpiamos los datos cuando se cierra para que no parpadee la receta anterior al abrir otra
				setReceta(null);
				setIngredientes([]);
				return;
			}

			if (recetaProp) {
				const ingredientesDesdeProps = Array.isArray(ingredientesProp)
					? ingredientesProp
					: Array.isArray(recetaProp?.ingredientes)
						? recetaProp.ingredientes
						: [];
				const ingredientesNormalizados = normalizarIngredientes(ingredientesDesdeProps);

				setReceta(recetaProp);

				// Si llegan ingredientes por props, los usamos directamente.
				// Si no llegan y tenemos id, consultamos backend para completar datos.
				if (ingredientesNormalizados.length > 0 || !idReceta) {
					setIngredientes(ingredientesNormalizados);
					setCargando(false);
					return;
				}
			}

			if (idReceta) {
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
			} else {
				setReceta(null);
				setIngredientes([]);
				setCargando(false);
			}
		}

		fetchDetalles();
	}, [open, idReceta, recetaProp, ingredientesProp]);

	/**
	 * Devuelve el color semantico del chip segun dificultad.
	 *
	 * @param {string} dificultad - Nivel de dificultad de receta.
	 * @returns {'success'|'warning'|'error'}
	 */
	const getColorDificultad = dificultad => {
		if (dificultad === 'Fácil') return 'success';
		if (dificultad === 'Media') return 'warning';
		return 'error';
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={{ pt: 5, maxHeight: '91vh' }}>
			{/* Botón de cerrar superior flotante */}
			<IconButton
				onClick={onClose}
				sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary', zIndex: 1 }}
			>
				<X size={25} />
			</IconButton>

			{cargando || !receta ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
					<CircularProgress sx={{ color: 'primary.main' }} />
				</Box>
			) : (
				<>
					{/* Cabecera de la receta */}
					<Box sx={{ p: 4, pb: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
						<Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
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
							<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
								Descripción
							</Typography>
							<Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
								{receta.descripcion}
							</Typography>
						</Box>

						{/* Sección de Ingredientes */}
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
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
											bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent',
											borderRadius: 1,
										}}
									>
										<Typography variant="body1" sx={{ fontWeight: 'medium' }}>
											{ingrediente.nombre_ingrediente}
										</Typography>
										{ingrediente.cantidad !== null || ingrediente.unidad ? (
											<Typography
												variant="body2"
												sx={{ color: 'text.secondary', fontWeight: 'bold' }}
											>
												{ingrediente.cantidad ?? ''}{ingrediente.unidad ? ` ${ingrediente.unidad}` : ''}
											</Typography>
										) : null}
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
