// Funcion para sacar los dias de la semana actual
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

function formatearFechaAmigable(fecha) {
    return fecha.toLocaleDateString('es-ES', {
        weekday: 'short', // "lun"
        day: 'numeric',   // "30"
        month: 'short'    // "mar"
    });
}

export { obtenerLimitesSemana, formatearFechaAmigable };