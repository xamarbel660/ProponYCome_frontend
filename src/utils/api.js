/**
 * @fileoverview Cliente HTTP centralizado para el frontend.
 * Incluye configuracion base y manejo uniforme de errores.
 */
import axios from 'axios';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';

/**
 * URL base de backend inyectada por Vite.
 *
 * @type {string|undefined}
 */
const API_URL = 'http://32.196.4.217:3000/api';

/**
 * Instancia compartida de Axios para todas las peticiones de la app.
 *
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR REQUEST (Salida) ---
// Inyecta automaticamente el token JWT en cada request autenticada.
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
// Normaliza la salida para que la app consuma directamente response.data
// y convierte errores de red/servidor en una estructura comun.
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, retornamos los datos
    return response.data;
  },
  (error) => {
    const notifyError = (mensaje) => {
      // Permite desactivar la notificación global por request si hiciera falta.
      if (error?.config?.silentNotification) return;

      try {
        useNotificationStore.getState().showNotification({
          mensaje,
          severidad: 'error',
          duracionMs: 5000,
        });
      } catch {
        // Evita romper la promesa si por alguna razón el store no está disponible.
      }
    };

    const getMensajeUsuario = () => {
      // Timeout (Axios)
      if (error?.code === 'ECONNABORTED' || String(error?.message || '').toLowerCase().includes('timeout')) {
        return 'La solicitud ha tardado demasiado. Inténtalo de nuevo.';
      }

      if (error?.response) {
        const status = error.response.status;

        if (status === 401 || status === 403) {
          return 'Tu sesión ha caducado. Inicia sesión de nuevo.';
        }
        if (status === 404) {
          return 'No se ha encontrado el recurso solicitado.';
        }
        if (status === 400) {
          return 'No se pudo completar la solicitud. Revisa los datos e inténtalo de nuevo.';
        }
        if (status >= 500) {
          return 'Ha ocurrido un error del servidor. Inténtalo más tarde.';
        }

        return 'Ha ocurrido un error. Inténtalo de nuevo.';
      }

      if (error?.request) {
        return 'No se pudo conectar con el servidor. Revisa tu conexión.';
      }

      return 'Ha ocurrido un error. Inténtalo de nuevo.';
    };

    // Manejo centralizado de errores
    let respuestaError = {
      ok: false,
      datos: null,
      mensaje: 'Error desconocido',
    };

    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      // Si el backend indica que el token es inválido/expiró, cerramos sesión.
      if (error.response.status === 401 || error.response.status === 403) {
        const { logout } = useAuthStore.getState();
        logout();
      }

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

    // Notificación global (mensaje genérico para usuario)
    notifyError(getMensajeUsuario());

    return Promise.reject(respuestaError);
  }
);

export default api;
