/**
 * @fileoverview Dialogo para crear familia o unirse mediante codigo.
 */
import { Box, Button, IconButton, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import api from '../utils/api';

/**
 * Formulario modal de familias en modo "Nueva" o "Unirme".
 *
 * @param {{
 *  modo: 'Nueva'|'Unirme',
 *  open: boolean,
 *  onClose: () => void,
 *  onSuccess: (modo: 'Nueva'|'Unirme') => void
 * }} props - Configuracion del dialogo y callback de exito.
 * @returns {JSX.Element}
 */
function DialogoFamilia({ modo, open, onClose, onSuccess }) {
    // Hay dos modos, "Nueva" y "Unirme"
    // Familia que se está creando
    const [familiaActual, setFamiliaActual] = useState({
        nombre_familia: '',
    });
    // Código de invitación para unirse a una familia
    const [codigoInvitacion, setCodigoInvitacion] = useState('');
    // Indica si se está procesando el envío
    const [isUpdating, setIsUpdating] = useState(false);

    // Indica si hay errores en el formulario
    const [errores, setErrores] = useState({});

    /**
     * Actualiza el estado del formulario para crear familia.
     *
     * @param {import('react').ChangeEvent<HTMLInputElement>} e - Evento de input.
     */
    const handleChange = e => {
        setFamiliaActual({ ...familiaActual, [e.target.name]: e.target.value });
        // Limpiamos el error de este campo concreto cuando el usuario escribe
        if (errores[e.target.name]) {
            setErrores({ ...errores, [e.target.name]: null });
        }
    };

    /**
     * Ejecuta validacion y envia la accion correspondiente (crear/unirse).
     *
     * @returns {Promise<void>}
     */
    const handleSubmit = async () => {
        // Evitamos envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
        if (isUpdating) return;
        // Validación. Si falla, nos detenemos aquí
        if (!validarDatos()) return;
        // Bloqueamos botones y enviamos
        setIsUpdating(true);

        try {
            if (modo === 'Nueva') {
                await api.post('/familias/new', { familia: familiaActual });
            } else {
                await api.post('/familias/entrar/' + codigoInvitacion);
            }
            setFamiliaActual({ nombre_familia: '' });
            setCodigoInvitacion('');
            // Si todo va bien, avisamos al padre (Recetas.jsx)
            onSuccess(modo);
        } catch (error) {
            console.log('Error guardando:', error);
            // Podrías poner aquí un setErrores({ global: "Error en el servidor" }) si quisieras
        } finally {
            setIsUpdating(false);
        }
    };

    // Estilos de los TextField
    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            bgcolor: 'action.hover',
            borderRadius: '12px',
        },
    };

    /**
     * Valida campos del formulario segun el modo actual.
     *
     * @returns {boolean} true si el formulario es valido.
     */
    const validarDatos = () => {
        const nuevosErrores = {};
        if (modo === 'Nueva') {
            // Validación del Nombre de la Familia
            if (!familiaActual.nombre_familia || !familiaActual.nombre_familia.trim()) {
                nuevosErrores.nombre_familia = 'El nombre de la familia es obligatorio.';
            } else if (familiaActual.nombre_familia.length < 3) {
                nuevosErrores.nombre_familia = 'El nombre de la familia es demasiado corto (mín. 3 letras).';
            } else if (familiaActual.nombre_familia.length > 100) {
                nuevosErrores.nombre_familia = 'El nombre de la familia es demasiado largo (máx. 100 letras).';
            }
        }
        // Validación del Código de Invitación (solo para unirse)
        if (modo === 'Unirme') {
            if (!codigoInvitacion || !codigoInvitacion.trim()) {
                nuevosErrores.codigo_invitacion = 'El código de invitación es obligatorio para unirse a una familia.';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
                {/* Titulo, subtitulo y boton de cerrar */}
                <Box sx={{ pt: 2, textAlign: 'center', position: 'relative' }}>
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
                    >
                        <X size={25} />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {modo === 'Nueva' ? 'Crear Nueva Familia' : 'Unirse a una Familia'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {modo === 'Nueva' ? 'Crea un grupo para planificar comidas juntos' : 'Ingresa el código de invitación'}
                    </Typography>
                </Box>
                {/* Formulario para crear/unirme a una nueva familia */}
                <DialogContent>
                    {modo === 'Nueva' ? (
                        <TextField
                            label="Nombre de la Familia"
                            id="nombre_familia"
                            name="nombre_familia"
                            fullWidth
                            placeholder="Ej: Familia Pérez"
                            type="text"
                            variant="outlined"
                            sx={inputStyles}
                            value={familiaActual.nombre_familia}
                            onChange={handleChange}
                            error={!!errores.nombre_familia}
                            helperText={errores.nombre_familia}
                        />
                    ) : (
                        <TextField
                            label="Código de Invitación"
                            id="codigo_invitacion"
                            name="codigo_invitacion"
                            fullWidth
                            placeholder="Ej: FDSV9H"
                            type="text"
                            variant="outlined"
                            sx={inputStyles}
                            value={codigoInvitacion}
                            onChange={(e) => setCodigoInvitacion(e.target.value)}
                            error={!!errores.codigo_invitacion}
                            helperText={errores.codigo_invitacion}
                        />
                    )}

                </DialogContent>
                {/* Modificamos el DialogActions para darle un poco de padding lateral y abajo */}
                <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Button
                        startIcon={<Check />}
                        onClick={handleSubmit}
                        fullWidth
                        variant="contained"
                        disabled={isUpdating}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            py: 1.5, // Le da un poco más de altura para que sea más fácil de tocar en móvil
                            borderRadius: '8px', // Bordes un poco redondeados
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            textTransform: 'none', // Para que no ponga todo el texto en mayúsculas
                            '&:hover': {
                                bgcolor: 'primary.dark', // Un naranja un pelín más oscuro al pasar el ratón o pulsar
                            },
                        }}
                    >
                        {modo === 'Nueva' ? 'Crear Familia' : 'Unirse a la Familia'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DialogoFamilia