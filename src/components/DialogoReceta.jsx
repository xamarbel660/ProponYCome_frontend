import { Autocomplete, Box, Button, ButtonGroup, IconButton, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../utils/api';

function DialogoReceta({ modo, idReceta, open, onClose, onSuccess, ingredientesRecuperados }) {
	// Hay dos modos, "Nueva" y "Editar"
	// Receta que se está editando o creando
	const [recetaActual, setRecetaActual] = useState({
		titulo: '',
		descripcion: '',
		dificultad: '',
	});
	// Ingredientes de la receta que se está editando o creando
	const [ingredientes, setIngredientes] = useState([
		{
			nombre_ingrediente: '',
			cantidad: '',
			unidad: '',
		},
	]);
	// Indica si se está procesando el envío
	const [isUpdating, setIsUpdating] = useState(false);

	// Indica si hay errores en el formulario
	const [errores, setErrores] = useState({});

	// Carga los datos de la receta si estamos en modo edición
	useEffect(() => {
		async function fetchDetalles() {
			if (open && modo === 'Editar' && idReceta) {
				setIsUpdating(true); // Bloqueamos el botón mientras carga
				try {
					const respuesta = await api.post(`/recetas/${idReceta}`);
					const datos = respuesta.datos;

					setRecetaActual({
						id_receta: idReceta,
						titulo: datos.receta.titulo,
						descripcion: datos.receta.descripcion,
						dificultad: datos.receta.dificultad,
					});

					const ingredientesMapeados = (datos.ingredientes || []).map(ing => ({
						nombre_ingrediente: ing.nombre_ingrediente || '',
						cantidad: ing.cantidad ? ing.cantidad : '',
						unidad: ing.unidad ? ing.unidad : '',
					}));

					if (ingredientesMapeados.length === 0) {
						ingredientesMapeados.push({ nombre_ingrediente: '', cantidad: '', unidad: '' });
					}
					setIngredientes(ingredientesMapeados);
				} catch (error) {
					console.error('Error cargando receta', error);
				} finally {
					setIsUpdating(false);
				}
			} else if (open && modo === 'Nueva') {
				// Vaciamos si es nueva
				setRecetaActual({ titulo: '', descripcion: '', dificultad: '' });
				setIngredientes([{ nombre_ingrediente: '', cantidad: '', unidad: '' }]);
			}
		}
		fetchDetalles();
	}, [open, modo, idReceta]);

	// Cuando cambia un campo del formulario se actualiza el estado
	const handleChange = e => {
		setRecetaActual({ ...recetaActual, [e.target.name]: e.target.value });
		// Limpiamos el error de este campo concreto cuando el usuario escribe
		if (errores[e.target.name]) {
			setErrores({ ...errores, [e.target.name]: null });
		}
	};

	// Añadir o modificar un ingrediente específico
	const handleChangeIngrediente = (index, campo, valor) => {
		setIngredientes(prevIngredientes => {
			// Creamos una copia del array para no mutar el estado directamente
			const nuevosIngredientes = [...prevIngredientes];
			// Actualizamos solo el campo (ej: 'cantidad') del ingrediente en esa posición (index)
			nuevosIngredientes[index][campo] = valor;
			return nuevosIngredientes;
		});
	};

	// Añadir una nueva fila de ingrediente en blanco
	const handleAñadirIngrediente = () => {
		setIngredientes([...ingredientes, { nombre_ingrediente: '', cantidad: '', unidad: '' }]);
	};

	// Eliminar un ingrediente (por si el usuario se equivoca al añadir de más)
	const handleEliminarIngrediente = indexAEliminar => {
		setIngredientes(ingredientes.filter((_, index) => index !== indexAEliminar));
	};

	// Cuando se pulsa el botón de enviar, se ejecuta esta función
	const handleSubmit = async () => {
		// Evitamos envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
		if (isUpdating) return;
		// Validación. Si falla, nos detenemos aquí
		if (!validarDatos()) return;
		// Bloqueamos botones y enviamos
		setIsUpdating(true);

		// Construimos el objeto final tal y como lo pide el backend
		const payload = {
			receta: recetaActual,
			// Filtramos para evitar enviar ingredientes completamente vacíos si le dieron a "Añadir otro" sin querer
			ingredientes: ingredientes.filter(ing => ing.nombre_ingrediente.trim() !== ''),
		};

		try {
			if (modo === 'Nueva') {
				await api.post('/recetas/new', payload);
			} else {
				await api.put('/recetas/update', payload);
			}
			// Si todo va bien, avisamos al padre (Recetas.jsx)
			onSuccess(modo);
		} catch (error) {
			console.log('Error guardando:', error);
			// Podrías poner aquí un setErrores({ global: "Error en el servidor" }) si quisieras
		} finally {
			setIsUpdating(false);
		}
	};

	// Estilos de los TextField
	const inputStyles = {
		'& .MuiOutlinedInput-root': {
			bgcolor: '#f5f6f8',
			borderRadius: '12px',
		},
		mb: 2,
	};

	// Estilos de los botones de dificultad
	const getButtonStyle = (value, color) => {
		const isSelected = recetaActual.dificultad === value;
		return {
			color: isSelected ? 'white' : 'black',
			flexGrow: 1,
			textTransform: 'none',
			borderRadius: '8px',
			transition: 'all 0.2s',
			borderColor: isSelected ? color : '#e0e0e0',
			bgcolor: isSelected ? `${color}` : 'transparent',
			zIndex: isSelected ? 1 : 0,
			'&:hover': {
				color: 'white',
				borderColor: color,
				bgcolor: `${color}`,
				zIndex: 2,
			},
			'&.MuiButtonGroup-grouped': {
				borderColor: isSelected ? color : '#e0e0e0',
				'&:hover': {
					borderColor: `${color} !important`,
					zIndex: 2,
				},
			},
		};
	};

	const validarDatos = () => {
		const nuevosErrores = {};
		// Validación del Título
		if (!recetaActual.titulo || !recetaActual.titulo.trim()) {
			nuevosErrores.titulo = 'El título de la receta es obligatorio.';
		} else if (recetaActual.titulo.length < 3) {
			nuevosErrores.titulo = 'El título es demasiado corto (mín. 3 letras).';
		} else if (recetaActual.titulo.length > 150) {
			nuevosErrores.titulo = 'El título es demasiado largo (máx. 150 letras).';
		}

		// Validación de la Descripción
		if (!recetaActual.descripcion || !recetaActual.descripcion.trim()) {
			nuevosErrores.descripcion = 'Por favor, describe los pasos de la receta.';
		} else if (recetaActual.descripcion.length < 10) {
			nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres.';
		} else if (recetaActual.descripcion.length > 500) {
			nuevosErrores.descripcion = 'La descripción es demasiado larga (máx. 500 caracteres).';
		}

		// Validación de la Dificultad
		if (!recetaActual.dificultad) {
			nuevosErrores.dificultad = 'Debes seleccionar una dificultad.';
		}

		// Validación de los Ingredientes (Al menos 1 válido)
		const ingredientesValidos = ingredientes.filter(
			ing => ing.nombre_ingrediente && ing.nombre_ingrediente.trim() !== ''
		);
		if (ingredientesValidos.length === 0) {
			nuevosErrores.ingredientes = 'Debes añadir al menos un ingrediente con nombre.';
		} else {
			// Creamos un array solo con los nombres en minúsculas (para evitar errores por mayúsculas/minúsculas)
			const nombresIngredientes = ingredientesValidos.map(ing =>
				ing.nombre_ingrediente.trim().toLowerCase()
			);
			// Set es un objeto de JavaScript que elimina automáticamente los duplicados
			const nombresUnicos = new Set(nombresIngredientes);
			// Si el tamaño del Set es menor que el del array original, ¡hay duplicados!
			if (nombresUnicos.size < nombresIngredientes.length) {
				nuevosErrores.ingredientes = 'No puedes añadir el mismo ingrediente varias veces.';
			}
		}
		// Validación de la Cantidad de los ingredientes
		ingredientes.forEach((ing, index) => {
			if (ing.nombre_ingrediente && (!ing.cantidad || ing.cantidad <= 0)) {
				nuevosErrores[`cantidad_${index}`] = 'Requerido'; // Ejemplo para campo específico
			}
		});
		setErrores(nuevosErrores);
		return Object.keys(nuevosErrores).length === 0;
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			{/* Titulo, subtitulo y boton de cerrar */}
			<Box sx={{ pt: 2, textAlign: 'center', position: 'relative' }}>
				<IconButton
					onClick={onClose}
					sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
				>
					<X size={25} />
				</IconButton>
				<Typography variant="h6" sx={{ fontWeight: 'bold' }}>
					{modo === 'Nueva' ? 'Nueva Receta' : 'Editar Receta'}
				</Typography>
				<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
					{modo === 'Nueva'
						? 'Añade una nueva receta a tu cuaderno'
						: 'Edita la receta seleccionada'}
				</Typography>
			</Box>
			{/* Formulario para crear una nueva receta */}
			<DialogContent>
				<TextField
					label="Titulo"
					id="titulo"
					name="titulo"
					fullWidth
					placeholder="Carrillada de ternera"
					type="text"
					variant="outlined"
					sx={inputStyles}
					value={recetaActual.titulo}
					onChange={handleChange}
					error={!!errores.titulo}
					helperText={errores.titulo}
				/>
				<TextField
					label="Descripción"
					id="descripcion"
					name="descripcion"
					fullWidth
					placeholder="Describe la receta, pasos de preparación..."
					multiline
					rows={3}
					variant="outlined"
					sx={inputStyles}
					value={recetaActual.descripcion}
					onChange={handleChange}
					error={!!errores.descripcion}
					helperText={errores.descripcion}
				/>

				<Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
					Dificultad
				</Typography>
				{/* Pintamos el error de dificultad debajo de los botones */}
				{errores.dificultad && (
					<Typography variant="body2" color="error" sx={{ display: 'block', mb: 2 }}>
						{errores.dificultad}
					</Typography>
				)}

				{/* Botones de dificultad */}
				<Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center' }}>
					<ButtonGroup variant="outlined" aria-label="botones de dificultad de la receta" fullWidth>
						<Button
							name="dificultad"
							value="Fácil"
							sx={getButtonStyle('Fácil', '#2e7d32')}
							onClick={handleChange}
						>
							Fácil
						</Button>
						<Button
							name="dificultad"
							value="Media"
							sx={getButtonStyle('Media', '#ed6c02')}
							onClick={handleChange}
						>
							Media
						</Button>
						<Button
							name="dificultad"
							value="Difícil"
							sx={getButtonStyle('Difícil', '#d32f2f')}
							onClick={handleChange}
						>
							Difícil
						</Button>
					</ButtonGroup>
				</Box>

				{/* Renderizamos los ingredientes dinámicamente */}
				<Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
					Ingredientes
				</Typography>
				{errores.ingredientes && (
					<Typography variant="body2" color="error" sx={{ mb: 1 }}>
						{errores.ingredientes}
					</Typography>
				)}

				{ingredientes.map((ingrediente, index) => (
					// Envolvemos todo en una Box con un borde sutil y un poco de padding
					<Box
						key={index}
						sx={{
							mb: 2,
							p: 1.5,
							border: '1px solid #e0e0e0',
							borderRadius: '8px',
							bgcolor: '#fafafa', // Un fondo gris súper clarito
						}}
					>
						{/* Nombre del Ingrediente */}
						<Box>
							<Autocomplete
								freeSolo
								disableClearable
								options={ingredientesRecuperados.map(ing => ing.nombre_ingrediente)}
								value={ingrediente.nombre_ingrediente}
								onInputChange={(event, newValue) => {
									handleChangeIngrediente(index, 'nombre_ingrediente', newValue);
								}}
								renderInput={params => (
									<TextField
										{...params}
										label="Nombre del Ingrediente"
										size="small"
										fullWidth
										sx={inputStyles}
										InputProps={{
											...params.InputProps,
											type: 'search',
										}}
									/>
								)}
							/>
						</Box>

						{/* FILA 2: Cantidad, Unidad y Papelera */}
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
							<TextField
								label="Cantidad"
								type="number" // Mejor poner tipo number para que en el móvil salga el teclado numérico
								size="small"
								sx={{ flex: 1, ...inputStyles }} // flex: 1 hace que se repartan el espacio disponible
								placeholder="Ej: 200"
								value={ingrediente.cantidad}
								onChange={e => handleChangeIngrediente(index, 'cantidad', e.target.value)}
							/>

							<TextField
								label="Unidad"
								size="small"
								sx={{ flex: 1, ...inputStyles }} // flex: 1
								placeholder="Gramos"
								value={ingrediente.unidad}
								onChange={e => handleChangeIngrediente(index, 'unidad', e.target.value)}
							/>

							{/* Botón para eliminar esta fila */}
							{ingredientes.length > 1 && (
								<IconButton
									color="error"
									onClick={() => handleEliminarIngrediente(index)}
									sx={{
										p: 1,
										mb: 2, // <-- ESTO empuja el botón un poco hacia arriba
									}}
								>
									<Trash2 size={20} />
								</IconButton>
							)}
						</Box>
					</Box>
				))}

				{/* Botón para añadir una nueva fila */}
				<Button
					fullWidth
					startIcon={<Plus />}
					onClick={handleAñadirIngrediente}
					variant="contained"
					sx={{
						bgcolor: '#ff6900',
						color: 'white',
						py: 1.5, // Le da un poco más de altura para que sea más fácil de tocar en móvil
						borderRadius: '8px', // Bordes un poco redondeados
						fontSize: '1rem',
						fontWeight: 'bold',
						textTransform: 'none', // Para que no ponga todo el texto en mayúsculas
						'&:hover': {
							bgcolor: '#e65c00', // Un naranja un pelín más oscuro al pasar el ratón o pulsar
						},
					}}
				>
					Añadir otro ingrediente
				</Button>
			</DialogContent>
			{/* Modificamos el DialogActions para darle un poco de padding lateral y abajo */}
			<DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
				<Button
					startIcon={<Check />}
					onClick={handleSubmit}
					fullWidth
					variant="contained"
					disabled={isUpdating}
					sx={{
						bgcolor: '#ff6900',
						color: 'white',
						py: 1.5, // Le da un poco más de altura para que sea más fácil de tocar en móvil
						borderRadius: '8px', // Bordes un poco redondeados
						fontSize: '1rem',
						fontWeight: 'bold',
						textTransform: 'none', // Para que no ponga todo el texto en mayúsculas
						'&:hover': {
							bgcolor: '#e65c00', // Un naranja un pelín más oscuro al pasar el ratón o pulsar
						},
					}}
				>
					Guardar Receta
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default DialogoReceta;
