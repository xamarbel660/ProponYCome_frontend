import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    Typography
} from '@mui/material';
import { Coffee, Sun, Sunset, Moon, Plus } from 'lucide-react';
import { formatearFechaAmigable } from '../utils/diasSemana';
import DialogoProponerReceta from './DialogoProponerReceta';
import { useState } from 'react';

function CardDiaSemanalPlanning({ propuestasDelDia, diaObj, index, recetasRecuperadas, cargarRecetasUsuario, familiaSeleccionada, onPropuestaCreada }) {
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

                    {/* DESAYUNO */}
                    <Card sx={{ mb: 2, p: 2 }}>
                        <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Coffee size={23} color='#ff6900' />
                            <Typography variant="subtitle1">Desayuno</Typography>
                        </Grid>

                        {/* Filtramos otra vez, pero ahora para sacar SOLO los desayunos de este día */}
                        {propuestasDelDia
                            .filter(p => p.turno_comida === 'DESAYUNO')
                            .map(propuesta => (
                                <Card key={propuesta.id_planning} sx={{ p: 2, my: 2 }}>
                                <Typography variant='h5'>
                                {propuesta.id_receta}
                                </Typography>
                                    <CardContent>
                                        {/* Aquí iría el nombre de la receta sacado con el id_receta */}
                                        Receta ID: {propuesta.id_receta} - Estado: {propuesta.estado}
                                    </CardContent>
                                </Card>
                            ))
                        }
                        {/* El botón de proponer comida que abra tu modal */}
                        <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                fullWidth
                                variant='outlined'
                                startIcon={<Plus />}
                                onClick={() => {
                                    setTurno('DESAYUNO');
                                    setOpenDialogo(true);
                                }}
                            >
                                Proponer comida
                            </Button>
                        </Grid>
                    </Card>

                    {/* ALMUERZO */}
                    <Card sx={{ mb: 2, p: 2 }}>
                        <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Sun size={23} color='#ff6900' />
                            <Typography variant="subtitle1">Almuerzo</Typography>
                        </Grid>

                        {/* Filtramos otra vez, pero ahora para sacar SOLO los desayunos de este día */}
                        {propuestasDelDia
                            .filter(p => p.turno_comida === 'ALMUERZO')
                            .map(propuesta => (
                                <Box key={propuesta.id_planning} sx={{ p: 1, border: '1px dashed orange', mt: 1 }}>
                                    {/* Aquí iría el nombre de la receta sacado con el id_receta */}
                                    Receta ID: {propuesta.id_receta} - Estado: {propuesta.estado}
                                </Box>
                            ))
                        }
                        {/* El botón de proponer comida que abra tu modal */}
                        <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                fullWidth
                                variant='outlined'
                                startIcon={<Plus />}
                                onClick={() => {
                                    setTurno('ALMUERZO');
                                    setOpenDialogo(true);
                                }}
                            >
                                Proponer comida
                            </Button>
                        </Grid>
                    </Card>

                    {/* MERIENDA */}
                    <Card sx={{ mb: 2, p: 2 }}>
                        <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Sunset size={23} color='#ff6900' />
                            <Typography variant="subtitle1">Merienda</Typography>
                        </Grid>

                        {/* Filtramos otra vez, pero ahora para sacar SOLO los desayunos de este día */}
                        {propuestasDelDia
                            .filter(p => p.turno_comida === 'MERIENDA')
                            .map(propuesta => (
                                <Box key={propuesta.id_planning} sx={{ p: 1, border: '1px dashed orange', mt: 1 }}>
                                    {/* Aquí iría el nombre de la receta sacado con el id_receta */}
                                    Receta ID: {propuesta.id_receta} - Estado: {propuesta.estado}
                                </Box>
                            ))
                        }
                        {/* El botón de proponer comida que abra tu modal */}
                        <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                fullWidth
                                variant='outlined'
                                startIcon={<Plus />}
                                onClick={() => {
                                    setTurno('MERIENDA');
                                    setOpenDialogo(true);
                                }}
                            >
                                Proponer comida
                            </Button>
                        </Grid>
                    </Card>

                    {/* CENA */}
                    <Card sx={{ mb: 2, p: 2 }}>
                        <Grid sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Moon size={23} color='#ff6900' />
                            <Typography variant="subtitle1">Cena</Typography>
                        </Grid>

                        {/* Filtramos otra vez, pero ahora para sacar SOLO los desayunos de este día */}
                        {propuestasDelDia
                            .filter(p => p.turno_comida === 'CENA')
                            .map(propuesta => (
                                <Box key={propuesta.id_planning} sx={{ p: 1, border: '1px dashed orange', mt: 1 }}>
                                    {/* Aquí iría el nombre de la receta sacado con el id_receta */}
                                    Receta ID: {propuesta.id_receta} - Estado: {propuesta.estado}
                                </Box>
                            ))
                        }
                        {/* El botón de proponer comida que abra tu modal */}
                        <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                fullWidth
                                variant='outlined'
                                startIcon={<Plus />}
                                onClick={() => {
                                    setTurno('CENA');
                                    setOpenDialogo(true);
                                }}
                            >
                                Proponer comida
                            </Button>
                        </Grid>
                    </Card>
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