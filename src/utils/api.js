import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR REQUEST (Salida) ---
api.interceptors.request.use((config) => {
  // Leemos el token directamente de Zustand
  const token = useAuthStore.getState().token;

  if (token) {
    // Creamos la cabecera 'Authorization' con el formato estándar 'Bearer TU_TOKEN'
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- INTERCEPTOR RESPONSE (Llegada) ---
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, retornamos los datos
    return response.data;
  },
  (error) => {
    // Manejo centralizado de errores
    let respuestaError = {
      ok: false,
      datos: null,
      mensaje: 'Error desconocido',
    };

    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      respuestaError.mensaje = error.response.data?.mensaje ||
        `Error: ${error.response.status} ${error.response.statusText}`;

      if (error.response.status === 404) {
        console.warn(`Recurso no encontrado: ${error.config.url}`);
      } else if (error.response.status === 400) {
        console.warn(`Solicitud inválida: ${error.config.url}`);
      } else if (error.response.status >= 500) {
        console.error(`Error del servidor: ${error.config.url} - Status: ${error.response.status}`);
      }
    } else if (error.request) {
      // La solicitud fue realizada pero no hubo respuesta
      respuestaError.mensaje = 'No hay respuesta del servidor. Verifica tu conexión.';
      console.error('No hay respuesta del servidor:', error.request);
    } else {
      // Algo sucedió al preparar la solicitud
      respuestaError.mensaje = error.message || 'Error al realizar la solicitud';
      console.error('Error en la solicitud:', error.message);
    }

    return Promise.reject(respuestaError);
  }
);

export default api;
