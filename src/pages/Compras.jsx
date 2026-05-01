import {
	Box,
	Card,
	CardContent,
	Checkbox,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Typography
} from '@mui/material';
import { MoveLeft, MoveRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { ShoppingCart, FileDown } from 'lucide-react';
import { formatearFechaAmigable, formatearFechaApi, obtenerLimitesSemana } from '../utils/formatosFechas';
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Toast } from "@capacitor/toast";
import { pdf } from "@react-pdf/renderer";
import ArchivoPdfIngredientes from '../components/ArchivoPdfIngredientes';
const LIMITE_SEMANAS = 5;

function Compras() {
	// Familias del usuario
	const [familiasRecuperadas, setFamiliasRecuperadas] = useState([]);
	// Familia seleccionada
	const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
	// INgredientes de la familia seleccionada
	const [ingredientesComprar, setIngredientesComprar] = useState([]);
	// Fecha actual para calcular la semana que se muestra
	const [fechaBase, setFechaBase] = useState(new Date());
	// Desplazamiento en semanas respecto a la fecha actual (puede ser negativo, positivo o 0)
	const [desplazamientoSemana, setDesplazamientoSemana] = useState(0);
	// Calculo de los límites de la semana (lunes y domingo) a partir de la fecha base
	const { lunes, domingo } = obtenerLimitesSemana(fechaBase);
	// Strings para enviar a la API y mostrar en el título de la semana
	const inicioStr = formatearFechaApi(lunes);
	const finStr = formatearFechaApi(domingo);

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

	/**
	 * Mueve la vista una semana hacia atras respetando limite configurado.
	 */
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

	/**
	 * Mueve la vista una semana hacia delante respetando limite configurado.
	 */
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

	// Cargamos los ingredientes de la lista de compra cada vez que se cambia de familia o semana
	useEffect(() => {
		if (!familiaSeleccionada) {
			return;
		}

		async function comprasDeLaFamilia() {

			try {
				const comprasRecuperadas = await api.post(`/compra/${familiaSeleccionada}/${inicioStr}`);
				setIngredientesComprar(comprasRecuperadas.datos.LISTA_COMPRA_ITEMs || []);
			} catch (error) {
				console.log(error);
				setIngredientesComprar([]);
			}
		}

		comprasDeLaFamilia();
	}, [familiaSeleccionada, inicioStr, finStr]);

	/**
	 * Cambia la familia activa y recalcula permisos del usuario.
	 *
	 * @param {import('react').ChangeEvent<{ value: unknown }>} event - Cambio del selector.
	 */
	const handleChange = (event) => {
		setIngredientesComprar([]);
		setFechaBase(new Date());
		setDesplazamientoSemana(0);
		setFamiliaSeleccionada(event.target.value);
	};

	const handleToggleComprado = async (itemId, nuevoEstado) => {
		setIngredientesComprar((prev) =>
			prev.map((item) =>
				item.id_item === itemId ? { ...item, comprado: nuevoEstado } : item
			)
		);

		try {
			await api.put(`/compra/items/${itemId}`, { comprado: nuevoEstado });
		} catch (error) {
			console.log(error);
			setIngredientesComprar((prev) =>
				prev.map((item) =>
					item.id_item === itemId ? { ...item, comprado: !nuevoEstado } : item
				)
			);
		}
	};

	const descargarPDF = async () => {
		try {
			if (!ingredientesComprar || ingredientesComprar.length === 0) {
				await Toast.show({ text: "No hay ingredientes para exportar" });
				return;
			}

			const nombreArchivo = `ingredientes_compra_${new Date().toISOString().slice(0, 10)}.pdf`;
			const documento = (
				<ArchivoPdfIngredientes ingredientes={ingredientesComprar} />
			);
			const blob = await pdf(documento).toBlob();

			// En Android/iOS (Capacitor), el atributo download y los Blobs suelen fallar.
			// Preferimos guardar un archivo temporal y abrir el share sheet nativo.
			if (Capacitor.isNativePlatform()) {
				if (!Capacitor.isPluginAvailable("Filesystem") || !Capacitor.isPluginAvailable("Share")) {
					await Toast.show({ text: "Plugins nativos no disponibles. Ejecuta: npx cap sync" });
					return;
				}

				const base64 = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onerror = () => reject(reader.error);
					reader.onload = () => {
						const result = typeof reader.result === "string" ? reader.result : "";
						resolve(result.split(",")[1] || "");
					};
					reader.readAsDataURL(blob);
				});

				const { uri } = await Filesystem.writeFile({
					path: nombreArchivo,
					data: base64,
					directory: Directory.Cache,
				});

				await Share.share({
					title: "Lista de compra",
					text: "Ingredientes de la semana",
					url: uri,
					dialogTitle: "Compartir PDF",
				});
				return;
			}

			// Web (desktop / navegador normal)
			const archivo = new File([blob], nombreArchivo, { type: "application/pdf" });
			if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
				await navigator.share({
					files: [archivo],
					title: "Lista de compra",
					text: "Ingredientes de la semana",
				});
				return;
			}

			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = nombreArchivo;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error al generar/compartir PDF", error);
			await Toast.show({
				text: `Error al exportar PDF: ${error?.message || String(error)}`,
			});
		}
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
					<Box>
						{/* Titulo, subtitulo y select de las familias */}
						<Stack>
							<Typography variant="h5" sx={{ fontWeight: 'bold' }}> Lista de Compra</Typography>
							<Typography variant="subtitle2" color="text.secondary">
								Ingredientes consolidados de la semana
							</Typography>
							{familiasRecuperadas.length === 0 && (
								<Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
									No estás en ninguna familia. Únete o crea una para empezar a planificar tus comidas.
								</Typography>
							)}

							{/* Familias del usuario */}
							<FormControl variant="outlined" sx={{ mt: 2, minWidth: 120 }} disabled={familiasRecuperadas.length === 0}>
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
							<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
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

						{familiaSeleccionada && (
							<>
								<Card sx={{ maxHeight: 440, overflow: 'auto' }}>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'flex-start',
											justifyContent: 'space-between',
											gap: 2,
										}}
									>
										<Box>
											<Typography variant="h6" sx={{ px: 2, pt: 2 }}>
												Ingredientes
											</Typography>
											<Typography variant="body2" sx={{ px: 2 }}>
												Cantidad de ingredientes: {ingredientesComprar.length}
											</Typography>
										</Box>
										<IconButton sx={{ mt: 3, mr: 2 }} onClick={descargarPDF}>
											<FileDown color='black' />
										</IconButton>
									</Box>
									<CardContent>
										{ingredientesComprar.length === 0 ? (
											<Typography variant="body1" color="text.secondary">
												<ShoppingCart />
												No hay comidas aprobadas para esta semana. Aprueba propuestas en el planificador semanal
											</Typography>
										) : (
											<>
												{ingredientesComprar.map((item) => (
													<Box
														key={item.id_item}
														sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
													>
														<Checkbox
															checked={item.comprado}
															onChange={(event) =>
																handleToggleComprado(item.id_item, event.target.checked)
															}
														/>
														<Typography variant="body1" sx={{ ml: 2, textDecoration: item.comprado ? 'line-through' : 'none' }}>
															{item.nombre_producto} - {item.cantidad} {item.unidad}
														</Typography>
													</Box>
												))}
											</>
										)}
									</CardContent>
								</Card>
							</>
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

export default Compras;