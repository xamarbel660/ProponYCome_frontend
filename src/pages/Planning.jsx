import {
	Box,
	Card,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { MoveLeft, MoveRight } from 'lucide-react';
import api from '../utils/api';
import { formatearFechaAmigable, obtenerLimitesSemana } from '../utils/diasSemana';
import CardDiaSemanalPlanning from '../components/CardDiaSemanalPlanning';
const LIMITE_SEMANAS = 5;

function Planning() {
	// Familias del usuario
	const [familiasRecuperadas, setFamiliasRecuperadas] = useState([]);
	// Familia seleccionada
	const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
	// Propuestas de la familia seleccionada
	const [planningFamilia, setPlanningFamilia] = useState([]);
	// Fecha actual para calcular la semana que se muestra
	const [fechaBase, setFechaBase] = useState(new Date());
	// Desplazamiento en semanas respecto a la fecha actual (puede ser negativo, positivo o 0)
	const [desplazamientoSemana, setDesplazamientoSemana] = useState(0);
	// Calculo de los límites de la semana (lunes y domingo) a partir de la fecha base
	const { lunes, domingo } = obtenerLimitesSemana(fechaBase);
	// Strings para enviar a la API y mostrar en el título de la semana
	const inicioStr = lunes.toISOString().split('T')[0];
	const finStr = domingo.toISOString().split('T')[0];

	// Texto para el título de la semana y control de habilitación de botones de navegación
	const textoLunes = formatearFechaAmigable(lunes);
	const textoDomingo = formatearFechaAmigable(domingo);
	// Control para no permitir navegar más de 5 semanas hacia adelante o hacia atrás
	const puedeIrSemanaAnterior = desplazamientoSemana > -LIMITE_SEMANAS;
	const puedeIrSemanaSiguiente = desplazamientoSemana < LIMITE_SEMANAS;
	// Array con los 7 días de la semana actual
	const diasDeLaSemana = [];
	for (let i = 0; i < 7; i++) {
		const dia = new Date(lunes);
		dia.setDate(lunes.getDate() + i);
		diasDeLaSemana.push(dia);
	}

	// Funcion para navegar una semana hacia atrás
	const irSemanaAnterior = () => {
		if (!puedeIrSemanaAnterior) {
			return;
		}

		setFechaBase((anterior) => {
			const nuevaFecha = new Date(anterior);
			nuevaFecha.setDate(nuevaFecha.getDate() - 7);
			return nuevaFecha;
		});
		setDesplazamientoSemana((anterior) => anterior - 1);
	};

	// Funcion para navegar una semana hacia adelante
	const irSemanaSiguiente = () => {
		if (!puedeIrSemanaSiguiente) {
			return;
		}

		setFechaBase((anterior) => {
			const nuevaFecha = new Date(anterior);
			nuevaFecha.setDate(nuevaFecha.getDate() + 7);
			return nuevaFecha;
		});
		setDesplazamientoSemana((anterior) => anterior + 1);
	};

	// Cargamos las familias del usuario
	useEffect(() => {
		async function familiasUsuario() {
			try {
				const familiasRecuperadas = await api.post('/familias/')

				setFamiliasRecuperadas(familiasRecuperadas.datos || []);
			} catch (error) {
				console.log(error);
				setFamiliasRecuperadas([]);
			}
		}

		familiasUsuario();
	}, []);

	// Cargamos el planning de la familia cada vez que cambie la familia seleccionada o las fechas
	useEffect(() => {
		if (!familiaSeleccionada) {
			return;
		}

		async function planningDeLaFamilia() {
			const payload = {
				id_familia: familiaSeleccionada,
				fecha_inicio: inicioStr,
				fecha_fin: finStr
			}

			try {
				const planningRecuperado = await api.post('/planning/', { datosPropuestas: payload });
				setPlanningFamilia(planningRecuperado.datos || []);
			} catch (error) {
				console.log(error);
				setPlanningFamilia([]);
			}
		}

		planningDeLaFamilia();
	}, [familiaSeleccionada, inicioStr, finStr]);

	const handleChange = (event) => {
		setFamiliaSeleccionada(event.target.value);
	};

	return (
		<>
			<Box
				sx={{
					p: 2,
					pb: { xs: 4, sm: 2 }, // Reducimos el padding inferior en móvil porque 12 era demasiado
				}}
			>
				<Stack spacing={2}>
					<Box sx={{ minHeight: '100vh' }}>
						{/* Titulo, subtitulo y select de las familias */}
						<Stack>
							<Typography variant="h5" sx={{ fontWeight: 'bold' }}> Planificador Semanal</Typography>
							<Typography variant="subtitle2" color="text.secondary">
								Organiza las comidas de la semana
							</Typography>

							{/* Familias del usuario */}
							<FormControl variant="outlined" sx={{ mt: 2, minWidth: 120 }}>
								<InputLabel id="FamiliaUsuario">Selecciona una familia</InputLabel>
								<Select
									labelId="FamiliaUsuario"
									id="FamiliaUsuario"
									value={familiaSeleccionada}
									onChange={handleChange}
									label="Selecciona una familia"
								>
									{familiasRecuperadas.map((familia) => (
										<MenuItem key={familia.id_familia} value={familia.id_familia}>
											{familia.nombre_familia}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Stack>

						{/* Botones de navegación por semanas */}
						{familiaSeleccionada && (
							<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
								<IconButton onClick={irSemanaAnterior} disabled={!puedeIrSemanaAnterior}>
									<MoveLeft size={30} />
								</IconButton>
								<Typography variant="h6" color="text.secondary" sx={{ mx: 2 }}>
									{textoLunes} - {textoDomingo}
								</Typography>
								<IconButton onClick={irSemanaSiguiente} disabled={!puedeIrSemanaSiguiente}>
									<MoveRight size={30} />
								</IconButton>
							</Box>
						)}

						{/* Días de la semana */}
						{familiaSeleccionada && (
							<Stack spacing={3} sx={{ mt: 3 }}>
								{diasDeLaSemana.map((diaObj, index) => {
									// Convertimos la fecha (Date object) a "YYYY-MM-DD" para poder compararla con el JSON de la BD
									const fechaString = diaObj.toISOString().split('T')[0];

									// Sacamos solo los que coincidan con la fecha de esta tarjeta (Lunes, martes, ...)
									const propuestasDelDia = planningFamilia.filter(
										(propuesta) => propuesta.fecha === fechaString
									);

									// Pintamos la tarjeta de este día.
									return (
										<CardDiaSemanalPlanning
											index={index}
											propuestasDelDia={propuestasDelDia}
											diaObj={diaObj}
										/>
									);
								})}
							</Stack>
						)}

					</Box>
				</Stack>
			</Box>
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

export default Planning;
