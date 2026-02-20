/**
 * @fileoverview Componente de página de inicio (Landing Page).
 * Muestra el mensaje de bienvenida y el propósito de la aplicación.
 */
import { Button, Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";

/**
 * Componente funcional para la pantalla de inicio.
 * Utiliza un Grid centrado para presentar el título y subtítulo.
 * 
 * @returns {JSX.Element} Vista de bienvenida.
 */
function Inicio() {
    return (
        <Grid container justifyContent="center" alignItems="center">
            <Typography variant="h1" component="h1" gutterBottom>
                Bienvenido a ProponYCome
            </Typography>

            <Link to="/recetas">
                <Button variant="contained" color="primary">
                    Ver Recetas
                </Button>
            </Link>

        </Grid>
    )
}

export default Inicio;