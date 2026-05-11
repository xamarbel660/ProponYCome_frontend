import { Alert, Box, Zoom } from '@mui/material';
import { useEffect } from 'react';

function NotificacionPersonalizada({
    mensaje,
    severidad,
    mostrar,
    onClose,
    duracionMs = 5000,
}) {
    // useEffect para que el Alert desaparezca
    useEffect(() => {
        if (!mostrar) return;

        const timer = setTimeout(() => {
            onClose?.();
        }, duracionMs);

        return () => clearTimeout(timer);
    }, [mostrar, duracionMs, onClose]);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: '85%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2000,
                width: { xs: '90%', sm: 'auto' },
                minWidth: { sm: 300 },
            }}
        >
            <Zoom in={mostrar}>
                <Alert
                    severity={severidad}
                    variant="filled"
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                        width: '100%',
                    }}
                >
                    {mensaje}
                </Alert>
            </Zoom>
        </Box>
    );
}

export default NotificacionPersonalizada;