import {
	Alert,
	Avatar,
	Box,
	Button,
	CssBaseline,
	Paper,
	Stack,
	TextField,
	Typography,
	Zoom,
} from '@mui/material';
import { UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { validarDatosLogin, validarDatosRegister } from '../utils/validadorDatos';

function AuthPage() {
	const navigate = useNavigate();
	// Recuperamos la función login del store
	const login = useAuthStore(state => state.login);

	// Estado para alternar entre login y registro
	const [isLoginView, setIsLoginView] = useState(true);

	// Tus estados lógicos (los mantengo)
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState('');
	const [usuarioLogin, setUsuarioLogin] = useState({ email: '', password_hash: '' });
	const [usuarioRegister, setUsuarioRegister] = useState({
		nombre: '',
		email: '',
		password_hash: '',
	});

	const [isCamposValidosLogin, setIsCamposValidosLogin] = useState({
		email: true,
		password_hash: true,
		mensajeEmailError: '',
		mensajePasswordError: '',
	});

	const [isCamposValidosRegister, setIsCamposValidosRegister] = useState({
		nombre: true,
		email: true,
		password_hash: true,
		mensajeNombreError: '',
		mensajeEmailError: '',
		mensajePasswordError: '',
	});

	// useEffect para manejar el login y registro
	useEffect(() => {
		async function fetchLogin() {
			try {
				// Recuperamos los datos del usuario y el token, dependiendo de si estamos en login o registro.
				const { datos, token } = isLoginView
					? await api.post('/usuarios/login', usuarioLogin)
					: await api.post('/usuarios/register', usuarioRegister);

				// Guardamos los datos del usuario y el token en local storage (Zustand).
				login(token, datos);

				setError('');

				// Mandamos al usuario a la pantalla principal (Zona Privada).
				navigate('/');
			} catch (error) {
				console.log(error);
				setError(error.mensaje || 'Error al iniciar sesión');
			}
			// Pase lo que pase hemos terminado el proceso de actualización
			setIsUpdating(false);
		}

		if (isUpdating) fetchLogin();
	}, [isUpdating]);

	// useEffect para que el Alert desaparezca
	useEffect(() => {
		// 5s para que el Alert desaparezca
		const timer = setTimeout(() => {
			setError('');
		}, 5000);
		return () => clearTimeout(timer);
	}, [error]);

	// Función para manejar los parámetros del login
	function handleLogin(e) {
		setUsuarioLogin({ ...usuarioLogin, [e.target.name]: e.target.value });
	}

	// Función para manejar los parámetros del registro
	function handleRegister(e) {
		setUsuarioRegister({ ...usuarioRegister, [e.target.name]: e.target.value });
	}

	// Función para manejar el click en el botón de login o registro
	function handleClick() {
		// evitar envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
		if (isUpdating) return;

		if (isLoginView) {
			const [valido, objetoValidacion] = validarDatosLogin(usuarioLogin);
			setIsCamposValidosLogin(objetoValidacion);
			if (valido) {
				setIsUpdating(true);
			}
		} else {
			const [valido, objetoValidacion] = validarDatosRegister(usuarioRegister);
			setIsCamposValidosRegister(objetoValidacion);
			if (valido) {
				setIsUpdating(true);
			}
		}
	}

	// Estilo reutilizable para los inputs (fondo gris, sin borde, redondeados)
	const inputStyles = {
		'& .MuiOutlinedInput-root': {
			bgcolor: '#f5f6f8',
			borderRadius: '12px',
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

			<Stack spacing={4} sx={{ maxWidth: 400, mx: 'auto', width: '100%', mt: 10 }}>
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
									<TextField
										label="Correo Electronico"
										id="email"
										name="email"
										fullWidth
										placeholder="tu@email.com"
										type="email"
										variant="outlined"
										sx={inputStyles}
										value={usuarioLogin.email}
										onChange={handleLogin}
										error={!isCamposValidosLogin.email}
										helperText={!isCamposValidosLogin.email && isCamposValidosLogin.mensajeEmailError}
									/>
								</Box>

								<Box>
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
										error={!isCamposValidosLogin.password_hash}
										helperText={!isCamposValidosLogin.password_hash && isCamposValidosLogin.mensajePasswordError}
									/>
								</Box>
							</Stack>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								loading={isUpdating}
								disabled={isUpdating}
								onClick={handleClick}
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
						<Stack spacing={3}>
							<Box>
								<Typography variant="h6" fontWeight="bold">
									Crear Cuenta
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Únete para planificar tus comidas
								</Typography>
							</Box>

							<Stack spacing={2}>
								<Box>
									<TextField
										label="Nombre"
										id="nombre"
										name="nombre"
										fullWidth
										placeholder="Tu nombre"
										variant="outlined"
										sx={inputStyles}
										value={usuarioRegister.nombre}
										onChange={handleRegister}
										error={!isCamposValidosRegister.nombre}
										helperText={!isCamposValidosRegister.nombre && isCamposValidosRegister.mensajeNombreError}
									/>
								</Box>

								<Box>
									<TextField
										label="Correo Electronico"
										id="email"
										name="email"
										fullWidth
										placeholder="tu@email.com"
										type="email"
										variant="outlined"
										sx={inputStyles}
										value={usuarioRegister.email}
										onChange={handleRegister}
										error={!isCamposValidosRegister.email}
										helperText={!isCamposValidosRegister.email && isCamposValidosRegister.mensajeEmailError}
									/>
								</Box>

								<Box>
									<TextField
										label="Contraseña"
										id="password_hash"
										name="password_hash"
										fullWidth
										placeholder="••••••••"
										type="password"
										variant="outlined"
										sx={inputStyles}
										value={usuarioRegister.password_hash}
										onChange={handleRegister}
										error={!isCamposValidosRegister.password_hash}
										helperText={!isCamposValidosRegister.password_hash && isCamposValidosRegister.mensajePasswordError}
									/>
								</Box>
							</Stack>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								loading={isUpdating}
								disabled={isUpdating}
								onClick={handleClick}
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
					)}
				</Paper>

				{/* Mensaje de Error */}
				<Box sx={{ mt: 2, width: '100%' }}>
					<Zoom in={error}>
						<Alert severity="error">{error}</Alert>
					</Zoom>
				</Box>
			</Stack>
		</Box>
	);
}

export default AuthPage;
