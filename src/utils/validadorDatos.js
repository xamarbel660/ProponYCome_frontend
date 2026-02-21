// Validaciones de los datos de login y registro

// Regex para validar el email
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validarDatosLogin(usuarioLogin) {
	let valido = true;
	let objetoValidacion = {
		email: true,
		password_hash: true,
		mensajeEmailError: '',
		mensajePasswordError: '',
	};

	// Validación del email como requerido
	if (!usuarioLogin.email) {
		valido = false;
		objetoValidacion.email = false;
		objetoValidacion.mensajeEmailError = 'El email es requerido';
	}

	// Validación del email con regex
	if (!regex.test(usuarioLogin.email)) {
		valido = false;
		objetoValidacion.email = false;
		objetoValidacion.mensajeEmailError = 'El email es requerido';
	}

	// Validación de la contraseña como requerida
	if (!usuarioLogin.password_hash) {
		valido = false;
		objetoValidacion.password_hash = false;
		objetoValidacion.mensajePasswordError = 'La contraseña es requerida';
	}

	return [valido, objetoValidacion];
}

function validarDatosRegister(usuarioRegister) {
	let valido = true;
	let objetoValidacion = {
		nombre: true,
		email: true,
		password_hash: true,
		mensajeNombreError: '',
		mensajeEmailError: '',
		mensajePasswordError: '',
	};

	// Validación del nombre como requerido
	if (!usuarioRegister.nombre) {
		valido = false;
		objetoValidacion.nombre = false;
		objetoValidacion.mensajeNombreError = 'El nombre es requerido';
	}

	// Validación de la longitud del nombre
	if ((usuarioRegister.nombre.length < 4 || usuarioRegister.nombre.length > 100) && objetoValidacion.nombre) {
		valido = false;
		objetoValidacion.nombre = false;
		objetoValidacion.mensajeNombreError = 'El nombre debe tener al menos 4 caracteres';
	}

	// Validación del email como requerido
	if (!usuarioRegister.email) {
		valido = false;
		objetoValidacion.email = false;
		objetoValidacion.mensajeEmailError = 'El email es requerido';
	}

	// Validación del email como requerido
	if ((!usuarioRegister.email.length < 10 || usuarioRegister.email.length > 150) && objetoValidacion.email) {
		valido = false;
		objetoValidacion.email = false;
		objetoValidacion.mensajeEmailError = 'El email debe tener al menos 10 caracteres';
	}

	// Validación del email con regex
	if ((!regex.test(usuarioRegister.email)) && objetoValidacion.email) {
		valido = false;
		objetoValidacion.email = false;
		objetoValidacion.mensajeEmailError = 'El email debe ser válido';
	}

	// Validación de la contraseña como requerida
	if (!usuarioRegister.password_hash) {
		valido = false;
		objetoValidacion.password_hash = false;
		objetoValidacion.mensajePasswordError = 'La contraseña es requerida';
	}

	// Validación de la longitud de la contraseña
	if ((usuarioRegister.password_hash.length < 8 || usuarioRegister.password_hash.length > 255) && objetoValidacion.password_hash) {
		valido = false;
		objetoValidacion.password_hash = false;
		objetoValidacion.mensajePasswordError = 'La contraseña debe tener al menos 8 caracteres';
	}

	return [valido, objetoValidacion];
}

export { validarDatosLogin, validarDatosRegister };
