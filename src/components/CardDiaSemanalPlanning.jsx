/**
 * @fileoverview Tarjeta de dia para el planning semanal.
 * Organiza propuestas por turno y habilita acciones de proponer/aprobar/rechazar.
 */
import {
    Card,
    CardContent,
    Chip,
    Typography
} from '@mui/material';
import { Coffee, Moon, Sun, Sunset } from 'lucide-react';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { formatearFechaAmigable } from '../utils/formatosFechas';
import DialogoProponerReceta from './DialogoProponerReceta';
import CardTurnoPlanning from './CardTurnoPlanning';

const TURNOS_CONFIG = [
    { clave: 'DESAYUNO', titulo: 'Desayuno', icono: <Coffee size={23} color='#ff6900' /> },
    { clave: 'ALMUERZO', titulo: 'Almuerzo', icono: <Sun size={23} color='#ff6900' /> },
    { clave: 'MERIENDA', titulo: 'Merienda', icono: <Sunset size={23} color='#ff6900' /> },
    { clave: 'CENA', titulo: 'Cena', icono: <Moon size={23} color='#ff6900' /> }
];

/**
 * Extrae el id de usuario desde el payload del JWT cuando no viene en store.user.
 *
 * @param {string|null} token - JWT del usuario autenticado.
 * @returns {number|string|null} Id de usuario o null si no se puede decodificar.
 */
const extraerIdUsuarioDesdeToken = (token) => {
    if (!token) return null;

    try {
        const segmentoPayload = token.split('.')[1];
        if (!segmentoPayload) return null;

        const base64 = segmentoPayload.replace(/-/g, '+').replace(/_/g, '/');
        const base64Padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const binario = atob(base64Padded);
        const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
        const payload = JSON.parse(new TextDecoder().decode(bytes));

        return payload?.id_usuario || null;
    } catch {
        return null;
    }
};

/**
 * Renderiza la tarjeta de un dia con sus turnos y propuestas.
 *
 * @param {{
 *  propuestasDelDia: Array<any>,
 *  diaObj: Date,
 *  index: number,
 *  recetasRecuperadas: Array<any>,
 *  cargarRecetasUsuario: () => Promise<void>|undefined,
 *  familiaSeleccionada: number|string,
 *  onPropuestaCreada?: () => Promise<void>|void,
 *  esAdminFamilia: boolean
 * }} props - Propiedades del componente.
 * @returns {JSX.Element}
 */
function CardDiaSemanalPlanning({ propuestasDelDia, diaObj, index, recetasRecuperadas, cargarRecetasUsuario, familiaSeleccionada, onPropuestaCreada, esAdminFamilia }) {
    const fechaDia = new Date(diaObj);
    const hoy = new Date();
    const fechaValida = !Number.isNaN(fechaDia.getTime());
    const esHoy =
        fechaValida &&
        fechaDia.getDate() === hoy.getDate() &&
        fechaDia.getMonth() === hoy.getMonth() &&
        fechaDia.getFullYear() === hoy.getFullYear();

    // Estado para controlar la apertura del diálogo de proponer receta
    const [openDialogo, setOpenDialogo] = useState(false);
    // Estado para guardar el turno (desayuno, almuerzo, merienda, cena) al que se quiere proponer receta
    const [turno, setTurno] = useState('');
    const usuarioActual = useAuthStore(state => state.user);
    const tokenUsuario = useAuthStore(state => state.token);
    const idUsuarioActual = usuarioActual?.id_usuario || extraerIdUsuarioDesdeToken(tokenUsuario);

    const [isUpdating, setIsUpdating] = useState(false);
    const [propuestasVisibles, setPropuestasVisibles] = useState(propuestasDelDia || []);

    useEffect(() => {
        setPropuestasVisibles(propuestasDelDia || []);
    }, [propuestasDelDia]);

    /**
     * Actualiza el estado de una propuesta (aprobado/rechazado) por accion del admin.
     *
     * @param {'APROBADO'|'RECHAZADO'} estadoElegido - Estado de salida.
     * @param {number|string} id_planning - Identificador de propuesta.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (estadoElegido, id_planning) => {
        // Evitamos envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
        if (isUpdating) return;

        // Bloqueamos botones y enviamos
        setIsUpdating(true);

        // Construimos el objeto final tal y como lo pide el backend
        const payload = {
            id_familia: familiaSeleccionada,
            id_planning: id_planning,
            estado: estadoElegido
        };

        try {
            await api.put(`/planning/estado`, { 'respuestaAdmin': payload });

            setPropuestasVisibles(prev => {
                if (estadoElegido === 'RECHAZADO') {
                    return prev.filter(p => p.id_planning !== id_planning);
                }

                return prev.map(p =>
                    p.id_planning === id_planning
                        ? { ...p, estado: estadoElegido }
                        : p
                );
            });

            if (onPropuestaCreada) {
                await onPropuestaCreada();
            }

        } catch (error) {
            console.log('Error guardando:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    /**
     * Filtra propuestas visibles para un turno de comida.
     *
     * @param {string} turnoComida - Clave de turno (DESAYUNO, ALMUERZO, ...).
     * @returns {Array<any>}
     */
    const propuestasPorTurno = (turnoComida) =>
        propuestasVisibles.filter(p => p.turno_comida === turnoComida && p.estado !== 'RECHAZADO');

    /**
     * Determina si el usuario actual ya propuso receta en el turno indicado.
     *
     * @param {string} turnoComida - Clave de turno a evaluar.
     * @returns {boolean}
     */
    const usuarioYaPropusoEnTurno = (turnoComida) => {
        if (!idUsuarioActual) return false;

        return propuestasPorTurno(turnoComida).some(
            propuesta => {
                const idUsuarioPropuesta = propuesta.usuario?.id_usuario_propone || propuesta.usuario?.id_usuario;
                return idUsuarioPropuesta && String(idUsuarioPropuesta) === String(idUsuarioActual);
            }
        );
    };

    return (
        <>
            <Card
                key={index}
                sx={{
                    border: esHoy ? '2px solid #ff6900' : '1px solid #ccc',
                    borderRadius: 2,
                    p: 2,
                    position: 'relative'
                }}
            >
                <CardContent>
                    {esHoy && (
                        <Chip
                            label='Hoy'
                            size='small'
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                bgcolor: '#ff6900',
                                color: '#fff',
                                fontWeight: 600
                            }}
                        />
                    )}

                    {/* Dia de la semana (Ej: lun, 6 abr) */}
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {formatearFechaAmigable(diaObj)}
                    </Typography>

                    {TURNOS_CONFIG.map(({ clave, titulo, icono }) => (
                        <CardTurnoPlanning
                            key={clave}
                            titulo={titulo}
                            icono={icono}
                            propuestas={propuestasPorTurno(clave)}
                            esAdminFamilia={esAdminFamilia}
                            onResponder={handleSubmit}
                            onProponer={() => {
                                setTurno(clave);
                                setOpenDialogo(true);
                            }}
                            mostrarBotonProponer={!usuarioYaPropusoEnTurno(clave)}
                        />
                    ))}
                </CardContent>
            </Card>

            <DialogoProponerReceta
                open={openDialogo}
                onClose={() => setOpenDialogo(false)}
                dia={diaObj}
                turno={turno}
                recetasRecuperadas={recetasRecuperadas}
                cargarRecetasUsuario={cargarRecetasUsuario}
                familiaSeleccionada={familiaSeleccionada}
                onPropuestaCreada={onPropuestaCreada}
            />
        </>
    )
}

export default CardDiaSemanalPlanning;