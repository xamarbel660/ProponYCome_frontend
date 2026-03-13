import { Box, Button, Dialog, DialogActions, Typography } from '@mui/material';
import { Trash2, X } from 'lucide-react';

function DialogoConfirmacion({ open, onClose, onConfirm, titulo, mensaje, isProcessing }) {
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
						bgcolor: '#d32f2f',
						color: 'white',
						py: 1.5,
						borderRadius: '8px',
						fontWeight: 'bold',
						textTransform: 'none',
						'&:hover': { bgcolor: '#e73333ff' },
					}}
				>
					Borrar
				</Button>
				<Button
					startIcon={<X />}
					onClick={onClose}
					fullWidth
					variant="contained"
					disabled={isProcessing}
					sx={{
						bgcolor: '#2e7d32',
						color: 'white',
						py: 1.5,
						borderRadius: '8px',
						fontWeight: 'bold',
						textTransform: 'none',
						'&:hover': { bgcolor: '#338f38ff' },
					}}
				>
					Cancelar
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default DialogoConfirmacion;
