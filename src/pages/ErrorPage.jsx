/**
 * @fileoverview Página de error para rutas no encontradas o errores de carga.
 * Muestra información sobre el error capturado por React Router.
 */
import { Link, useRouteError } from "react-router";

import { Grid } from "@mui/material";

/**
 * Componente que se renderiza cuando ocurre una excepción en el enrutamiento.
 * Utiliza el hook useRouteError para obtener detalles del error.
 * Mantiene la consistencia visual con el resto de la aplicación (Navbar/Footer).
 * 
 * @returns {JSX.Element} Página de error con mensaje y enlace de retorno.
 */
export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <>
      {/*minHeight: '100vh' -> Obliga a que la caja mida AL MENOS el 100% del alto de la ventana.
        flexDirection: 'column' -> Organiza los hijos uno debajo de otro (verticalmente).
        wrap="nowrap" -> Evita que se desborden cosas raras. */}
      <Grid
        container
        sx={{
          minHeight: "100vh",
          flexDirection: "column",
        }}
      >



        {/*flexGrow: 1 -> Hace que el contenido crezca y empuje el footer hacia abajo*/}
        <Grid sx={{ flexGrow: 1, p: 2, width: '100%' }}>
          <h1>Oops!</h1>
          <p>Ha ocurrido un error.</p>
          <p>
            <i>{error.statusText || error.message}</i>
          </p>
          <Link to="/">Volver a la página de inicio</Link>
        </Grid>



      </Grid>

    </>
  );
}