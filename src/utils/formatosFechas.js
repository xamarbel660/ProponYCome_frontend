/**
 * @fileoverview Utilidades para calcular y formatear fechas en el planning.
 */

/**
 * Calcula los limites de semana (lunes-domingo) para una fecha base.
 *
 * @param {Date} [fechaBase=new Date()] - Fecha sobre la que se calcula la semana.
 * @returns {{ lunes: Date, domingo: Date }} Fechas de inicio y fin de semana.
 */
function obtenerLimitesSemana(fechaBase = new Date()) {
    const fecha = new Date(fechaBase);

    // getDay() devuelve 0 para Domingo, 1 para Lunes, etc.
    const diaSemana = fecha.getDay();

    // Ajustamos porque para JS la semana empieza en domingo, pero para nosotros en lunes.
    const diferenciaAlLunes = fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);

    // Calculamos Lunes y Domingo
    const lunes = new Date(fecha.setDate(diferenciaAlLunes));
    // Clonamos el lunes y le sumamos 6 días para sacar el domingo
    const domingo = new Date(new Date(lunes).setDate(lunes.getDate() + 6));

    return { lunes, domingo };
}

/**
 * Convierte una fecha en formato corto legible para UI en espanol.
 *
 * @param {Date} fecha - Fecha a mostrar.
 * @returns {string} Texto del tipo "lun, 30 mar".
 */
function formatearFechaAmigable(fecha) {
    return fecha.toLocaleDateString('es-ES', {
        weekday: 'short', // "lun"
        day: 'numeric',   // "30"
        month: 'short'    // "mar"
    });
}

/**
 * Formatea una fecha como YYYY-MM-DD usando componentes locales.
 * Evita desfases de zona horaria derivados de toISOString().
 *
 * @param {Date} fecha - Fecha a serializar para API.
 * @returns {string} Fecha local en formato YYYY-MM-DD.
 */
const formatearFechaApi = (fecha) => {
	const y = fecha.getFullYear();
	const m = String(fecha.getMonth() + 1).padStart(2, '0');
	const d = String(fecha.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
};

export { obtenerLimitesSemana, formatearFechaAmigable, formatearFechaApi };