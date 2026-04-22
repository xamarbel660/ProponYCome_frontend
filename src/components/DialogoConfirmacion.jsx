/**
 * @fileoverview Dialogo de confirmacion reutilizable para acciones destructivas.
 */
import { Box, Button, Dialog, DialogActions, Typography } from '@mui/material';
import { Trash2, X } from 'lucide-react';

/**
 * Dialogo generico de confirmacion con botones confirmar/cancelar.
 *
 * @param {{
 *  open: boolean,
 *  onClose: () => void,
 *  onConfirm: () => void,
 *  titulo: string,
 *  mensaje: string,
 *  isProcessing?: boolean,
 *  confirmText?: string,
 *  cancelText?: string
 * }} props - Configuracion del dialogo y callbacks.
 * @returns {JSX.Element}
 */
function DialogoConfirmacion({
	open,
	onClose,
	onConfirm,
	titulo,
	mensaje,
	isProcessing,
	confirmText = 'Borrar',
	cancelText = 'Cancelar',
}) {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<Box sx={{ p: 2, textAlign: 'center' }}>
				<Typography variant="h6" sx={{ fontWeight: 'bold' }}>
					{titulo}
				</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
					{mensaje}
				</Typography>
			</Box>
			<DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
				<Button
					startIcon={<Trash2 />}
					onClick={onConfirm}
					fullWidth
					variant="contained"
					disabled={isProcessing}
					sx={{
						bgcolor: 'error.main',
						color: 'error.contrastText',
						py: 1.5,
						borderRadius: '8px',
						fontWeight: 'bold',
						textTransform: 'none',
						'&:hover': { bgcolor: 'error.dark' },
					}}
				>
					{confirmText}
				</Button>
				<Button
					startIcon={<X />}
					onClick={onClose}
					fullWidth
					variant="contained"
					disabled={isProcessing}
					sx={{
						bgcolor: 'success.main',
						color: 'success.contrastText',
						py: 1.5,
						borderRadius: '8px',
						fontWeight: 'bold',
						textTransform: 'none',
						'&:hover': { bgcolor: 'success.dark' },
					}}
				>
					{cancelText}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default DialogoConfirmacion;
