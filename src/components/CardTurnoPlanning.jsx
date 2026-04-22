/**
 * @fileoverview Tarjeta de turno dentro del planning diario.
 * Lista propuestas por turno y habilita acciones del administrador.
 */
import {
    Button,
    Card,
    CardActions,
    Grid,
    Typography
} from '@mui/material';
import { Check, Plus, X } from 'lucide-react';

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
    return (
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
                    <Typography variant="body2">
                        Propuesto por {propuesta.usuario?.nombre || 'Usuario'}
                    </Typography>

                    {esAdminFamilia && propuesta.estado === 'PENDIENTE' && (
                        <CardActions sx={{ justifyContent: 'space-between' }}>
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
    );
}

export default CardTurnoPlanning;
