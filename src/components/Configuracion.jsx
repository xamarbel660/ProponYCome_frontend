import { Box, Button, Divider, IconButton, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { LogOut, X, Sun, Moon } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/useThemeStore';


function Configuracion({ open, onClose }) {
    const logout = useAuthStore(state => state.logout); // Leemos el logout
    const user = useAuthStore(state => state.user); // Leemos el usuario
    // Recuperamos la función para cambiar el modo (setMode) del store global.
    const { setMode } = useThemeStore();

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
                        Configuración
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block' }}>
                        Gestiona tus preferencias de la aplicación
                    </Typography>
                </Box>
                <DialogContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Apariencia
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Sun size={20} />}
                            onClick={() => setMode('light')}
                            sx={{
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    borderColor: 'primary.dark',
                                    backgroundColor: 'action.hover',
                                },
                            }}
                        >
                            Claro
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Moon size={20} />}
                            onClick={() => setMode('dark')}
                            sx={{
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    borderColor: 'primary.dark',
                                    backgroundColor: 'action.hover',
                                },
                            }}
                        >
                            Oscuro
                        </Button>
                    </Box>


                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Usuario: {user?.nombre}
                    </Typography>
                    <Typography variant="body2">
                        Email: {user?.email}
                    </Typography>
                    <Button
                        startIcon={<LogOut />}
                        onClick={logout}
                        fullWidth
                        variant="contained"
                        sx={{
                            bgcolor: 'error.main',
                            color: 'error.contrastText',
                            mt: 2,
                            '&:hover': {
                                bgcolor: 'error.dark',
                            },
                        }}
                    >
                        Cerrar sesión
                    </Button>

                </DialogContent>
            </Dialog>
        </>
    );
}

export default Configuracion;