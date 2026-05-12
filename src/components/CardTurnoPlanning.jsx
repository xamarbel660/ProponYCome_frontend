/**
 * @fileoverview Tarjeta de turno dentro del planning diario.
 * Lista propuestas por turno y habilita acciones del administrador.
 */
import {
    Button,
    Card,
    CardActions,
    Chip,
    Grid,
    Typography
} from '@mui/material';
import { Check, Eye, Plus, X } from 'lucide-react';
import { useState } from 'react';
import DialogoVerReceta from './DialogoVerReceta';

/**
 * Renderiza un turno de comida con sus propuestas y acciones.
 *
 * @param {{
 *  titulo: string,
 *  icono: import('react').ReactNode,
 *  propuestas: Array<any>,
 *  esAdminFamilia: boolean,
 *  onResponder: (estado: 'APROBADO'|'RECHAZADO', idPlanning: number|string) => void,
 *  onProponer: () => void,
 *  mostrarBotonProponer: boolean
 * }} props - Configuracion visual y callbacks del turno.
 * @returns {JSX.Element}
 */
function CardTurnoPlanning({
    titulo,
    icono,
    propuestas,
    esAdminFamilia,
    onResponder,
    onProponer,
    mostrarBotonProponer
}) {
    // Estado para abrir y cerrar el dialog de ver receta
    const [openDialogVerReceta, setOpenDialogVerReceta] = useState(false);
    // ID de la receta
    const [idRecetaActiva, setIdRecetaActiva] = useState(null);

    const handleClickOpenDialog = (id = null) => {
        setIdRecetaActiva(id);
        setOpenDialogVerReceta(true);
    };

    const handleCloseDialog = () => {
        setOpenDialogVerReceta(false);
    };

    return (
        <>
            <Card sx={{ mb: 2, p: 2, }}>
                <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    {icono}
                    <Typography variant="subtitle1">{titulo}</Typography>
                </Grid>

                {propuestas.map(propuesta => (
                    <Card key={propuesta.id_planning} sx={{ px: 2, py: 2, my: 2, borderColor: 'primary.main' }}>
                        <Typography variant="body1">
                            {propuesta.receta?.titulo || 'Receta sin titulo'}
                        </Typography>
                        <Chip label={propuesta.estado} size="extraSmall" color={propuesta.estado === 'APROBADO' ? 'success' : 'warning'} sx={{ borderRadius: 1 }} />
                        <Typography variant="body2">
                            Propuesto por {propuesta.usuario?.nombre || 'Usuario'}
                        </Typography>

                        <Button
                            aria-label="Ver Receta"
                            startIcon={<Eye color="#ff6900" size={18} />}
                            size="small"
                            sx={{
                                p: 1,
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                            onClick={() => handleClickOpenDialog(propuesta.receta?.id_receta)}
                        >
                            Ver Receta
                        </Button>

                        {esAdminFamilia && propuesta.estado === 'PENDIENTE' && (
                            <CardActions sx={{ justifyContent: 'space-between', mt: 2 }}>
                                <Button
                                    startIcon={<Check />}
                                    size="small"
                                    sx={{
                                        bgcolor: 'success.main',
                                        color: 'success.contrastText',
                                        p: 1,
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'success.dark' }
                                    }}
                                    onClick={() => onResponder('APROBADO', propuesta.id_planning)}
                                >
                                    Aceptar
                                </Button>
                                <Button
                                    startIcon={<X />}
                                    size="small"
                                    sx={{
                                        bgcolor: 'error.main',
                                        color: 'error.contrastText',
                                        p: 1,
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'error.dark' }
                                    }}
                                    onClick={() => onResponder('RECHAZADO', propuesta.id_planning)}
                                >
                                    Rechazar
                                </Button>
                            </CardActions>
                        )}
                    </Card>
                ))}

                {mostrarBotonProponer && (
                    <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Plus />}
                            onClick={onProponer}
                        >
                            Proponer comida
                        </Button>
                    </Grid>
                )}
            </Card>

            <DialogoVerReceta
                idReceta={idRecetaActiva}
                open={openDialogVerReceta}
                onClose={() => handleCloseDialog('Ver')}
            />
        </>
    );
}

export default CardTurnoPlanning;
