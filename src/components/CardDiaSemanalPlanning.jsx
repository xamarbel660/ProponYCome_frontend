import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography
} from '@mui/material';
import { Coffee, Sun, Sunset, Moon, Plus } from 'lucide-react';
import { formatearFechaAmigable } from '../utils/diasSemana';

function CardDiaSemanalPlanning({ propuestasDelDia, diaObj, index }) {
    return (
        <>
            <Card key={index} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
                <CardContent>

                    {/* Título de la tarjeta (Ej: Lunes, 30 Mar) */}
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {formatearFechaAmigable(diaObj)}
                    </Typography>

                    {/* --- SECCIÓN DESAYUNO --- */}
                    <Card sx={{ mb: 2, p: 2 }}>
                        <Typography variant="subtitle1" color="primary"><Coffee /> Desayuno</Typography>

                        {/* Filtramos otra vez, pero ahora para sacar SOLO los desayunos de este día */}
                        {propuestasDelDia
                            .filter(p => p.turno_comida === 'DESAYUNO')
                            .map(propuesta => (
                                <Box key={propuesta.id_planning} sx={{ p: 1, border: '1px dashed orange', mt: 1 }}>
                                    {/* Aquí iría el nombre de la receta sacado con el id_receta */}
                                    Receta ID: {propuesta.id_receta} - Estado: {propuesta.estado}
                                </Box>
                            ))
                        }
                        {/* El botón de proponer comida que abra tu modal */}
                        <Button
                            startIcon={<Plus />}
                        >
                            Proponer comida
                        </Button>
                    </Card>

                    <Card sx={{ mb: 2, p: 2 }}>
                        <Typography variant="subtitle1" color="primary"><Sun /> Almuerzo</Typography>

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
                        <Button
                            startIcon={<Plus />}
                        >
                            Proponer comida
                        </Button>
                    </Card>

                    <Card sx={{ mb: 2, p: 2 }}>
                        <Typography variant="subtitle1" color="primary"><Sunset /> Merienda</Typography>

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
                        <Button
                            startIcon={<Plus />}
                        >
                            Proponer comida
                        </Button>
                    </Card>

                    <Card sx={{ mb: 2, p: 2 }}>
                        <Typography variant="subtitle1" color="primary"><Moon /> Cena</Typography>

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
                        <Button
                            startIcon={<Plus />}
                        >
                            Proponer comida
                        </Button>
                    </Card>
                </CardContent>
            </Card>
        </>
    )
}

export default CardDiaSemanalPlanning;