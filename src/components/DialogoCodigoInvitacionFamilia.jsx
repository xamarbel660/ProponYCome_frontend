/**
 * @fileoverview Dialogo para visualizar, copiar y regenerar codigo de invitacion familiar.
 */
import { Box, Button, IconButton, Typography, Alert } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import { Clipboard, X, Check, Sparkle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clipboard as ClipboardAPI } from '@capacitor/clipboard';

/**
 * Dialogo de gestion de codigo de invitacion de una familia.
 *
 * @param {{
 *  open: boolean,
 *  onClose: () => void,
 *  esAdmin: boolean,
 *  nombreFamilia: string,
 *  codigoInvitacion: string,
 *  idFamilia: number|string,
 *  onCodigoActualizado?: (codigo: string) => void
 * }} props - Estado, datos de familia y callbacks.
 * @returns {JSX.Element}
 */
function DialogoCodigoInvitacion({ open, onClose, esAdmin, nombreFamilia, codigoInvitacion, idFamilia, onCodigoActualizado }) {
    // Indica si se está procesando el envío
    const [isUpdating, setIsUpdating] = useState(false);
    // Estado para mostrar si se copió correctamente
    const [copiado, setCopiado] = useState(false);
    // Estado para mostrar generar nuevo codigo de invitacion
    const [generado, setGenerado] = useState(false);
    // Estado local del código de invitación
    const [codigoLocal, setCodigoLocal] = useState(codigoInvitacion);

    // Sincronizar el código local con la prop cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            setCodigoLocal(codigoInvitacion);
        }
    }, [open, codigoInvitacion]);

    /**
     * Solicita al backend la regeneracion del codigo de invitacion.
     *
     * @returns {Promise<void>}
     */
    const handleSubmit = async () => {
        // Evitamos envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
        if (isUpdating) return;
        // Bloqueamos botones y enviamos
        setIsUpdating(true);

        try {
            const response = await api.post(`/familias/actualizarCodigo/${idFamilia}`);

            // Si se actualiza correctamente, actualizamos el código local
            const codigoActualizado = response.datos;
            setCodigoLocal(codigoActualizado);
            setGenerado(true);

            // Notificamos al padre que se actualizó el código
            if (onCodigoActualizado) {
                onCodigoActualizado(codigoActualizado);
            }

            // Después de 3 segundos, ocultamos el mensaje
            setTimeout(() => setGenerado(false), 3000);
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
     * Copia el codigo actual al portapapeles.
     * Prioriza plugin de Capacitor y usa navegador como fallback.
     *
     * @returns {Promise<void>}
     */
    const writeToClipboard = async () => {
        try {
            await ClipboardAPI.write({
                string: codigoLocal
            });
            setCopiado(true);
            // Después de 3 segundos, ocultamos el mensaje
            setTimeout(() => setCopiado(false), 3000);
        } catch (error) {
            console.error('Error al copiar:', error);
            // Si falla Capacitor, intentamos con la API nativa del navegador
            try {
                await navigator.clipboard.writeText(codigoLocal);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 3000);
            } catch (err) {
                console.error('Error con ambos métodos:', err);
            }
        }
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
                        {/* Código QR - {nombreFamilia} */}
                        Copie el código de invitación
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block' }}>
                        {/* Escanea este código QR para unirte a la familia */}
                        Código de invitación de {nombreFamilia}
                    </Typography>
                </Box>
                {/* Formulario para crear/unirme a una nueva familia */}
                <DialogContent>
                    {copiado && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            ¡Código copiado al portapapeles!
                        </Alert>
                    )}
                    <TextField
                        label="Codigo de invitación"
                        id="codigo_invitacion"
                        name="codigo_invitacion"
                        fullWidth
                        disabled
                        placeholder="Ej: Familia Pérez"
                        type="text"
                        variant="outlined"
                        sx={inputStyles}
                        value={codigoLocal}
                    />

                    {esAdmin && (
                        <Button
                            startIcon={generado ? <Check /> : <Sparkle />}
                            onClick={handleSubmit}
                            fullWidth
                            variant="contained"
                            sx={{
                                bgcolor: generado ? '#4caf50' : '#9817fa',
                                color: 'common.white',
                                py: 1.5,
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                mt: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: generado ? '#45a049' : '#9817facd',
                                },
                            }}
                        >
                            {generado ? 'Generado' : 'Generar nuevo código'}
                        </Button>)}


                    <Button
                        startIcon={copiado ? <Check /> : <Clipboard />}
                        onClick={writeToClipboard}
                        fullWidth
                        variant="contained"
                        sx={{
                            bgcolor: copiado ? '#4caf50' : '#ff6900',
                            color: 'common.white',
                            py: 1.5,
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            mt: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: copiado ? '#45a049' : '#e65c00',
                            },
                        }}
                    >
                        {copiado ? '¡Copiado!' : 'Copiar'}
                    </Button>

                </DialogContent>
            </Dialog>
        </>
    )
}

export default DialogoCodigoInvitacion