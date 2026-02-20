// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import useAuthStore from '../store/authStore';
// import api from '../utils/api';
// import { Box, Paper, Stack, Typography } from '@mui/material';

// function AuthPage() {
// 	const navigate = useNavigate();
// 	const login = useAuthStore(state => state.login);

// 	const [usuarioLogin, setUsuarioLogin] = useState({
// 		email: '',
// 		password_hash: '',
// 	});

// 	const [usuarioRegister, setUsuarioRegister] = useState({
// 		nombre: '',
// 		email: '',
// 		password_hash: '',
// 	});

// 	const handleLogin = async e => {
// 		e.preventDefault();
// 		try {
// 			// 1. Petición al backend
// 			const { datos, token } = await api.post('/usuarios/login', usuarioLogin);

// 			// 2. Si llega aquí, es que todo fue bien. Guardamos en Zustand.
// 			// Asegúrate que tu backend devuelve { token: "...", usuario: {...} }
// 			login(token, datos);

// 			// 3. Nos vamos a la zona privada
// 			navigate('/');
// 		} catch (error) {
// 			alert('Error: ' + (error.response?.data?.msg || 'Fallo al logearse'));
// 		}
// 	};

// 	const handleRegister = async e => {
// 		e.preventDefault();
// 		try {
// 			const { datos, token } = await api.post('/usuarios/register', usuarioRegister);

// 			login(token, datos);

// 			navigate('/');
// 		} catch (error) {
// 			alert('Error: ' + (error.response?.data?.msg || 'Fallo al registrar'));
// 		}
// 	};

// 	return (
// 		<>
// 			<div style={{ padding: 20 }}>
// 				<h1>Login de Prueba</h1>
// 				<form onSubmit={handleLogin}>
// 					<input
// 						type="email"
// 						placeholder="Email"
// 						value={usuarioLogin.email}
// 						onChange={e => setUsuarioLogin({ ...usuarioLogin, email: e.target.value })}
// 					/>
// 					<br />
// 					<br />
// 					<input
// 						type="password"
// 						placeholder="Contraseña"
// 						value={usuarioLogin.password_hash}
// 						onChange={e => setUsuarioLogin({ ...usuarioLogin, password_hash: e.target.value })}
// 					/>
// 					<br />
// 					<br />
// 					<button type="submit">Login</button>
// 				</form>
// 			</div>
// 			<div style={{ padding: 20 }}>
// 				<h1>Registro de Prueba</h1>
// 				<form onSubmit={handleRegister}>
// 					<input
// 						type="text"
// 						placeholder="Nombre"
// 						value={usuarioRegister.nombre}
// 						onChange={e => setUsuarioRegister({ ...usuarioRegister, nombre: e.target.value })}
// 					/>
// 					<br />
// 					<br />
// 					<input
// 						type="email"
// 						placeholder="Email"
// 						value={usuarioRegister.email}
// 						onChange={e => setUsuarioRegister({ ...usuarioRegister, email: e.target.value })}
// 					/>
// 					<br />
// 					<br />
// 					<input
// 						type="password"
// 						placeholder="Contraseña"
// 						value={usuarioRegister.password_hash}
// 						onChange={e => setUsuarioRegister({ ...usuarioRegister, password_hash: e.target.value })}
// 					/>
// 					<br />
// 					<br />
// 					<button type="submit">Register</button>
// 				</form>
// 			</div>
// 			{/* Usamos Box con p={2} (padding) para que el texto no pegue con los bordes del móvil */}
// 			{/* <Box sx={{ p: 2 }}>
// 				<Stack spacing={2}>
// 					<Paper sx={{ p: 2 }}>
// 						<Typography>Bienvenido a la App</Typography>
// 					</Paper>

// 					<Box sx={{ height: '1000px', bgcolor: '#eee' }}>
// 						<Typography>Contenido largo...</Typography>
// 					</Box>
// 				</Stack>
// 			</Box> */}
// 		</>
// 	);
// }

// export default AuthPage;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { UtensilsCrossed } from 'lucide-react';
import api from '../utils/api';
import {
	Box,
	Paper,
	Stack,
	Typography,
	Button,
	TextField,
	Avatar,
	CssBaseline,
} from '@mui/material';

function AuthPage() {
	const navigate = useNavigate();
	const login = useAuthStore(state => state.login);

	// Estado VISUAL para el diseño (cambiar entre login y registro)
	const [isLoginView, setIsLoginView] = useState(true);

	// Tus estados lógicos (los mantengo)
	const [isUpdating, setIsUpdating] = useState(false);
	const [usuarioLogin, setUsuarioLogin] = useState({ email: '', password_hash: '' });
	const [usuarioRegister, setUsuarioRegister] = useState({
		nombre: '',
		email: '',
		password_hash: '',
	});

	useEffect(() => {
		async function fetchLogin() {
			try {
				const { datos, token } = await api.post('/usuarios/login', usuarioLogin);

				// 2. Si llega aquí, es que todo fue bien. Guardamos en Zustand.
				// Asegúrate que tu backend devuelve { token: "...", usuario: {...} }
				login(token, datos);

				// 3. Nos vamos a la zona privada
				navigate('/');

				/* setDialogMessage(respuesta.mensaje); // Mensaje
				setDialogSeverity('success'); // Color verde
				setOpenDialog(true); // Abrir el diálogo */
			} catch (error) {
				console.log(error);
				/* setDialogMessage(error.mensaje || 'Error al crear la donación');
				setDialogSeverity('error'); // Color rojo
				setOpenDialog(true); // Abrir el diálogo */
			}
			// Pase lo que pase hemos terminado el proceso de actualización
			setIsUpdating(false);
		}

		if (isUpdating) fetchLogin();
	}, [isUpdating]);

	function handleLogin(e) {
		setUsuarioLogin({ ...usuarioLogin, [e.target.name]: e.target.value });
	}

	/*function handleChange(e) {
        if (e.target.name == "es_primera_vez") {
            setDonacion({ ...donacion, [e.target.name]: e.target.checked });
        } else if (e.target.name == "id_campana") {
            setDonacion({ ...donacion, [e.target.name]: e.target.value });
            setCampaña(campañas.find(campaña => campaña.id_campana == e.target.value));
        } else {
            setDonacion({ ...donacion, [e.target.name]: e.target.value });
        }
    } */

	function handleClickLogin() {
		// evitar envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
		if (isUpdating) return;

		// if (validarDatos()) {
			setIsUpdating(true);
		// }
	}

	const handleRegister = async e => {
		e.preventDefault();
		// ... tu lógica de registro
	};

	// Estilo reutilizable para los inputs (fondo gris, sin borde, redondeados)
	const inputStyles = {
		'& .MuiOutlinedInput-root': {
			bgcolor: '#f5f6f8',
			borderRadius: '12px',
			'& fieldset': { border: 'none' },
		},
	};

	return (
		// Contenedor principal para Capacitor (pantalla completa, sin scroll en el body)
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
				width: '100vw',
				bgcolor: '#fff7ed', // El color crema de fondo
				overflow: 'auto', // Permite scroll si la pantalla es muy pequeña
				p: 2,
			}}
		>
			<CssBaseline />

			<Stack spacing={4} sx={{ maxWidth: 400, mx: 'auto', width: '100%', mt: 4 }}>
				{/* --- SECCIÓN LOGO Y TÍTULO --- */}
				<Stack alignItems="center" spacing={1}>
					<Avatar sx={{ bgcolor: '#ff6900', width: 72, height: 72, mb: 1 }}>
						<UtensilsCrossed color="#fff" size={35} />
					</Avatar>
					<Typography variant="h6" sx={{ color: '#ff6900', fontWeight: 'bold' }}>
						Propón & Come
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Planifica tus comidas en familia
					</Typography>
				</Stack>

				{/* --- SECCIÓN SELECTOR (TABS) --- */}
				<Box
					sx={{
						display: 'flex',
						bgcolor: '#eef0f3', // Gris clarito para el fondo del "pill"
						borderRadius: '50px',
						p: 0.5,
					}}
				>
					<Button
						fullWidth
						onClick={() => setIsLoginView(true)}
						sx={{
							borderRadius: '50px',
							textTransform: 'none',
							fontWeight: isLoginView ? 'bold' : 'normal',
							color: isLoginView ? 'text.primary' : 'text.secondary',
							bgcolor: isLoginView ? 'white' : 'transparent',
							boxShadow: isLoginView ? 1 : 0,
							'&:hover': { bgcolor: isLoginView ? 'white' : 'transparent' },
						}}
					>
						Iniciar Sesión
					</Button>
					<Button
						fullWidth
						onClick={() => setIsLoginView(false)}
						sx={{
							borderRadius: '50px',
							textTransform: 'none',
							fontWeight: !isLoginView ? 'bold' : 'normal',
							color: !isLoginView ? 'text.primary' : 'text.secondary',
							bgcolor: !isLoginView ? 'white' : 'transparent',
							boxShadow: !isLoginView ? 1 : 0,
							'&:hover': { bgcolor: !isLoginView ? 'white' : 'transparent' },
						}}
					>
						Registrarse
					</Button>
				</Box>

				{/* --- SECCIÓN FORMULARIO (TARJETA BLANCA) --- */}
				<Paper
					elevation={0}
					sx={{ p: 3, borderRadius: 4, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}
				>
					{isLoginView ? (
						/* FORMULARIO DE LOGIN */
						<Stack spacing={3}>
							<Box>
								<Typography variant="h6" fontWeight="bold">
									Iniciar Sesión
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Ingresa a tu cuenta
								</Typography>
							</Box>

							<Stack spacing={2}>
								<Box>
									<Typography
										variant="caption"
										fontWeight="bold"
										sx={{ ml: 1, mb: 0.5, display: 'block' }}
									>
										Email
									</Typography>
									<TextField
										label="Email"
										id="email"
										name="email"
										fullWidth
										placeholder="tu@email.com"
										type="email"
										variant="outlined"
										sx={inputStyles}
										value={usuarioLogin.email}
										onChange={handleLogin}
									/>
								</Box>

								<Box>
									<Typography
										variant="caption"
										fontWeight="bold"
										sx={{ ml: 1, mb: 0.5, display: 'block' }}
									>
										Contraseña
									</Typography>
									<TextField
										label="Contraseña"
										id="password_hash"
										name="password_hash"
										fullWidth
										placeholder="••••••••"
										type="password"
										variant="outlined"
										sx={inputStyles}
										value={usuarioLogin.password_hash}
										onChange={handleLogin}
									/>
								</Box>
							</Stack>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								onClick={handleClickLogin}
								sx={{
									bgcolor: '#050505',
									color: 'white',
									borderRadius: '50px',
									py: 1.5,
									textTransform: 'none',
									fontWeight: 'bold',
									fontSize: '1rem',
									'&:hover': { bgcolor: '#222' },
								}}
							>
								Ingresar
							</Button>
						</Stack>
					) : (
						/* FORMULARIO DE REGISTRO */
						<form onSubmit={handleRegister}>
							<Stack spacing={3}>
								<Box>
									<Typography variant="h6" fontWeight="bold">
										Crear Cuenta
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Únete para planificar
									</Typography>
								</Box>

								<Stack spacing={2}>
									<Box>
										<Typography
											variant="caption"
											fontWeight="bold"
											sx={{ ml: 1, mb: 0.5, display: 'block' }}
										>
											Nombre
										</Typography>
										<TextField
											fullWidth
											placeholder="Tu nombre"
											variant="outlined"
											sx={inputStyles}
										/>
									</Box>

									<Box>
										<Typography
											variant="caption"
											fontWeight="bold"
											sx={{ ml: 1, mb: 0.5, display: 'block' }}
										>
											Email
										</Typography>
										<TextField
											fullWidth
											placeholder="tu@email.com"
											type="email"
											variant="outlined"
											sx={inputStyles}
										/>
									</Box>

									<Box>
										<Typography
											variant="caption"
											fontWeight="bold"
											sx={{ ml: 1, mb: 0.5, display: 'block' }}
										>
											Contraseña
										</Typography>
										<TextField
											fullWidth
											placeholder="••••••••"
											type="password"
											variant="outlined"
											sx={inputStyles}
										/>
									</Box>
								</Stack>

								<Button
									type="submit"
									fullWidth
									variant="contained"
									sx={{
										bgcolor: '#050505',
										color: 'white',
										borderRadius: '50px',
										py: 1.5,
										textTransform: 'none',
										fontWeight: 'bold',
										fontSize: '1rem',
										'&:hover': { bgcolor: '#222' },
									}}
								>
									Registrarse
								</Button>
							</Stack>
						</form>
					)}
				</Paper>
			</Stack>
		</Box>
	);
}

export default AuthPage;
