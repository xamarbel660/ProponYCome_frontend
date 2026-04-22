/**
 * @fileoverview Dialogo para visualizar miembros de familia y gestionar permisos.
 */
import { Alert, Box, Button, Chip, IconButton, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Crown, LogOut, Shield, ShieldOff, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import DialogoConfirmacion from './DialogoConfirmacion';

/**
 * Dialogo de miembros con acciones administrativas (rol y expulsion).
 *
 * @param {{ open: boolean, onClose: () => void, idFamilia: number|string|null }} props - Control del dialogo.
 * @returns {JSX.Element}
 */
function DialogoVerMiembros({ open, onClose, idFamilia }) {
    const [familia, setFamilia] = useState(null);
    const [accionEnCurso, setAccionEnCurso] = useState(null);
    const [miembroAExpulsar, setMiembroAExpulsar] = useState(null);
    const [feedback, setFeedback] = useState({ tipo: '', mensaje: '' });

    /**
     * Recupera informacion de la familia y listado actualizado de miembros.
     *
     * @returns {Promise<void>}
     */
    const fetchFamilia = useCallback(async () => {
        try {
            const response = await api.post(`/familias/${idFamilia}`);
            const familia = response.datos;
            setFamilia(familia);
        } catch (error) {
            setFeedback({ tipo: 'error', mensaje: error.mensaje || 'No se pudo cargar la familia.' });
        }
    }, [idFamilia]);

    // Recuperar la familia por su ID
    useEffect(() => {
        if (open && idFamilia) {
            fetchFamilia();
        }
    }, [open, idFamilia, fetchFamilia]);

    useEffect(() => {
        if (!open) {
            setMiembroAExpulsar(null);
            setFeedback({ tipo: '', mensaje: '' });
        }
    }, [open]);

    /**
     * Otorga o revoca permisos de administrador a un miembro.
     *
     * @param {number|string} idUsuarioObjetivo - Usuario objetivo.
     * @param {boolean} esAdministrador - Estado deseado de rol admin.
     * @returns {Promise<void>}
     */
    const cambiarRolAdmin = async (idUsuarioObjetivo, esAdministrador) => {
        if (!idFamilia) return;

        setAccionEnCurso(`rol-${idUsuarioObjetivo}`);
        try {
            await api.post(`/familias/rol-admin/${idFamilia}/${idUsuarioObjetivo}`, {
                es_administrador: esAdministrador,
            });
            setFeedback({
                tipo: 'success',
                mensaje: esAdministrador ? 'Rol actualizado: ahora es administrador.' : 'Rol actualizado: ya no es administrador.',
            });
            await fetchFamilia();
        } catch (error) {
            setFeedback({ tipo: 'error', mensaje: error.mensaje || 'No se pudo actualizar el rol.' });
        } finally {
            setAccionEnCurso(null);
        }
    };

    /**
     * Expulsa al miembro seleccionado de la familia.
     *
     * @returns {Promise<void>}
     */
    const expulsarMiembro = async () => {
        if (!miembroAExpulsar?.id_usuario) return;
        if (!idFamilia) return;

        setAccionEnCurso(`expulsar-${miembroAExpulsar.id_usuario}`);
        try {
            await api.delete(`/familias/miembro/${idFamilia}/${miembroAExpulsar.id_usuario}`);
            setFeedback({ tipo: 'success', mensaje: `Se expulsó a ${miembroAExpulsar.nombre_usuario}.` });
            setMiembroAExpulsar(null);
            await fetchFamilia();
        } catch (error) {
            setFeedback({ tipo: 'error', mensaje: error.mensaje || 'No se pudo expulsar al miembro.' });
        } finally {
            setAccionEnCurso(null);
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
                        {familia?.familia?.nombre_familia || 'la familia'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block' }}>
                    {familia?.admin ? 'Gestiona los miembros y permisos de la familia' : 'Miembros de la familia'}
                    </Typography>
                </Box>
                <DialogContent>
                    {feedback.mensaje && (
                        <Alert
                            severity={feedback.tipo === 'error' ? 'error' : 'success'}
                            onClose={() => setFeedback({ tipo: '', mensaje: '' })}
                            sx={{ mb: 2 }}
                        >
                            {feedback.mensaje}
                        </Alert>
                    )}

                    {!familia && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Cargando miembros...
                        </Typography>
                    )}

                    {(familia?.usuarios || []).map(usuario => (
                        <Box key={usuario.id_usuario} sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {usuario.nombre_usuario}{' '}
                                {usuario.es_administrador ? (
                                    <Chip icon={<Crown size={14} />} label="Admin" size="small" />
                                ) : (
                                    <Chip label="Miembro" size="small" />
                                )}
                            </Typography>

                            {familia?.admin && !usuario.es_actual && (
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Button
                                        sx={{ color: 'text.primary', borderColor: 'divider' }}
                                        startIcon={usuario.es_administrador ? <ShieldOff size={14} /> : <Shield size={14} />}
                                        variant="outlined"
                                        size="small"
                                        disabled={accionEnCurso !== null}
                                        onClick={() => cambiarRolAdmin(usuario.id_usuario, !usuario.es_administrador)}
                                    >
                                        {usuario.es_administrador ? 'Quitar admin' : 'Hacer admin'}
                                    </Button>

                                    <Button
                                        startIcon={<LogOut size={14} />}
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        disabled={accionEnCurso !== null}
                                        onClick={() => setMiembroAExpulsar(usuario)}
                                    >
                                        Expulsar
                                    </Button>
                                </Box>
                            )}

                        </Box>
                    ))}

                </DialogContent>
            </Dialog>

            <DialogoConfirmacion
                open={Boolean(miembroAExpulsar)}
                onClose={() => setMiembroAExpulsar(null)}
                onConfirm={expulsarMiembro}
                titulo="Confirmar expulsión"
                mensaje={miembroAExpulsar
                    ? `¿Seguro que quieres expulsar a ${miembroAExpulsar.nombre_usuario} de la familia?`
                    : ''}
                isProcessing={accionEnCurso?.startsWith('expulsar-')}
                confirmText="Expulsar"
                cancelText="Cancelar"
            />
        </>
    )
}

export default DialogoVerMiembros