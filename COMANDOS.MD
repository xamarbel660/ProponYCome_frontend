# Comandos de creación de proyectos e instalación de librerias

## React.js

### Crear plantilla de proyecto Vite con React

npm create vite@latest nombre_proyecto -- --template react

cd nombre_proyecto
npm install
npm run dev

### Saltar error de tipos del Linter en validación de props - linea 19 configuración linter

"react/prop-types": 0

### Instalar React Router

npm i react-router

### Instalar Axios

npm install axios

### Instalar Zustand

npm install zustand

### Instalar libreria MUI

npm install @mui/material @emotion/react @emotion/styled

### Fuente Roboto para MUI o MDBoostrap

npm install @fontsource/roboto

// Agregar en main.jsx
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

### Material icons MUI

npm install @mui/icons-material

### Instalar libreria MDBootstrap para React

npm install mdb-react-ui-kit
npm install @fortawesome/fontawesome-free

// Agregar importación en main.jsx para todo el proyecto
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";

### Librería Kendo UI

npm install --save @progress/kendo-react-charts @progress/kendo-react-buttons

[Enlace para instalar más componentes de Kendo UI](https://www.telerik.com/kendo-react-ui/components/getting-started/add-to-existing-project/)

### Instalar librería Recharts

Libreria para crear gráficos en React

npm install recharts

### Instalar libreria jsPDF

Libreria para crear PDFs en React

npm install jspdf --save

### Instalar libreria html2canvas

Libreria para crear PDFs en React

npm install --save html2canvas

### Instalar libreria react-pdf

Libreria para crear PDFs en React

npm install @react-pdf/renderer --save

## Capacitor

### Instalar Capacitor

npm i @capacitor/core
npm i -D @capacitor/cli

### Inicializar Capacitor

npx cap init

### Instalar plugins de Capacitor

npm i @capacitor/android @capacitor/ios

### Crear proyecto de Android e IOS

npx cap add android
npx cap add ios

### Sincronizar el código web con tu proyecto nativo

npx cap sync

`npx cap sync` Copiará el paquete web creado que se espera encontrar en webDir (dist) de la configuración de capacitor. Instala las dependencias del proyecto nativo.

### Abrir el proyecto de Android e IOS

npx cap open android
npx cap open ios

### Proceso para probar la app

npm run build
npx cap sync
npx cap run android
