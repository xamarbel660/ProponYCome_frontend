import { Autocomplete, Button, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material"
import { formatearFechaAmigable } from "../utils/diasSemana"
import { useEffect, useState } from "react";
import api from "../utils/api";


function DialogoProponerReceta({ open, onClose, dia, turno, recetasRecuperadas, cargarRecetasUsuario, familiaSeleccionada, onPropuestaCreada }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState('');

    // Receta seleccionada para proponer
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);

    // Cargamos las recetas del usuario
    useEffect(() => {
        if (!open) {
            return;
        }

        setErrorFormulario('');
        cargarRecetasUsuario();
    }, [open, cargarRecetasUsuario]);

    // Evita errores por zona horaria al convertir Date -> YYYY-MM-DD
    const formatearFechaApi = (fecha) => {
        const y = fecha.getFullYear();
        const m = String(fecha.getMonth() + 1).padStart(2, '0');
        const d = String(fecha.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Enviamos la propuesta al backend
    // Cuando se pulsa el botón de actualizar código, se ejecuta esta función
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
        mb: 2,
        mt: 2
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
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        Propón una comida para el {turno} del día {formatearFechaAmigable(dia)}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Selecciona una receta de tu cuaderno.
                    </Typography>

                    {/* Busqueda de recetas */}
                    <Autocomplete
                        options={recetasRecuperadas || []}
                        value={recetaSeleccionada}
                        onChange={(event, newValue) => {
                            setRecetaSeleccionada(newValue);
                            setErrorFormulario('');
                        }}
                        getOptionLabel={(option) => option?.titulo || ''}
                        isOptionEqualToValue={(option, value) => option.id_receta === value?.id_receta}
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="Nombre de la Receta"
                                size="small"
                                fullWidth
                                sx={inputStyles}
                                InputProps={{
                                    ...params.InputProps,
                                    type: 'search'
                                }}
                            />
                        )}
                    />

                    {errorFormulario && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                            {errorFormulario}
                        </Typography>
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