/**
 * @fileoverview Dialogo para proponer una receta en un turno/dia del planning.
 */
import { Autocomplete, Button, Card, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { formatearFechaAmigable } from "../utils/formatosFechas";


/**
 * Dialogo de seleccion y envio de propuesta de receta al planning familiar.
 *
 * @param {{
 *  open: boolean,
 *  onClose: () => void,
 *  dia: Date,
 *  turno: string,
 *  recetasRecuperadas: Array<any>,
 *  cargarRecetasUsuario: () => Promise<void>|undefined,
 *  familiaSeleccionada: number|string,
 *  onPropuestaCreada?: () => Promise<void>|void
 * }} props - Datos necesarios para crear la propuesta.
 * @returns {JSX.Element}
 */
function DialogoProponerReceta({ open, onClose, dia, turno, recetasRecuperadas, cargarRecetasUsuario, familiaSeleccionada, onPropuestaCreada }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState('');

    // Receta seleccionada para proponer
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
    const [inputReceta, setInputReceta] = useState('');

    // Cargamos las recetas del usuario
    useEffect(() => {
        if (!open) {
            return;
        }

        setErrorFormulario('');
        setRecetaSeleccionada(null);
        setInputReceta('');
        cargarRecetasUsuario();
    }, [open, cargarRecetasUsuario]);

    /**
     * Serializa una fecha local en formato YYYY-MM-DD para backend.
     *
     * @param {Date} fecha - Fecha a formatear.
     * @returns {string}
     */
    const formatearFechaApi = (fecha) => {
        const y = fecha.getFullYear();
        const m = String(fecha.getMonth() + 1).padStart(2, '0');
        const d = String(fecha.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    /**
     * Envia la propuesta de receta seleccionada al backend.
     *
     * @returns {Promise<void>}
     */
    const handleSubmit = async () => {
        // Evitamos envíos duplicados por pulsar el botón tras el mensaje de inserción correcta
        if (isUpdating) return;

        if (!dia || !turno || !familiaSeleccionada || !recetaSeleccionada?.id_receta) {
            setErrorFormulario('Debes seleccionar una receta válida antes de enviar.');
            return;
        }

        // Bloqueamos botones y enviamos
        setIsUpdating(true);
        setErrorFormulario('');

        // Construimos el objeto final tal y como lo pide el backend
        const payload = {
            fecha: formatearFechaApi(dia),
            turno_comida: turno,
            id_familia: familiaSeleccionada,
            id_receta: recetaSeleccionada.id_receta
        };

        try {
            await api.post(`/planning/new`, { 'propuesta': payload });
            setRecetaSeleccionada(null);
            setInputReceta('');
            onClose();
            if (onPropuestaCreada) {
                await onPropuestaCreada();
            }

        } catch (error) {
            console.log('Error guardando:', error);
            setErrorFormulario(error?.mensaje || 'No se pudo guardar la propuesta');
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
        my: 2
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="proponer-receta-dialog"
            >
                <DialogTitle id="proponer-receta-dialog">
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Proponer Comida
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Propón una comida para el {turno} del día {formatearFechaAmigable(dia)}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Selecciona una receta de tu cuaderno:
                    </Typography>

                    {/* Busqueda de recetas */}
                    <Autocomplete
                        options={recetasRecuperadas || []}
                        value={recetaSeleccionada}
                        inputValue={inputReceta}
                        onChange={(event, newValue) => {
                            setRecetaSeleccionada(newValue);
                            setInputReceta(newValue?.titulo || '');
                            setErrorFormulario('');
                        }}
                        onInputChange={(event, newInputValue, reason) => {
                            setInputReceta(newInputValue);

                            // Si se limpia el texto, también se limpia la selección para deshabilitar el botón.
                            if (reason === 'clear' || newInputValue === '') {
                                setRecetaSeleccionada(null);
                            }
                        }}
                        getOptionLabel={(option) => {
                            if (typeof option === 'string') return option;
                            return option?.titulo || '';
                        }}
                        isOptionEqualToValue={(option, value) => option.id_receta === value?.id_receta}
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="Nombre de la Receta"
                                size="small"
                                fullWidth
                                sx={inputStyles}
                            />
                        )}
                    />

                    {errorFormulario && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                            {errorFormulario}
                        </Typography>
                    )}

                    {recetaSeleccionada && (
                        <Card sx={{ p: 2, mt: 1, mb: 2, borderRadius: '12px' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {recetaSeleccionada.titulo || 'Sin titulo'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {recetaSeleccionada.descripcion || 'Sin descripcion disponible.'}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                Dificultad: {recetaSeleccionada.dificultad || 'No especificada'}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                Ingredientes: {recetaSeleccionada.cantidadIngredientes ?? 'No especificado'}
                            </Typography>
                        </Card>
                    )}


                    {/* Botón para enviar la propuesta */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isUpdating || !recetaSeleccionada?.id_receta}
                    >
                        Enviar Propuesta
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default DialogoProponerReceta