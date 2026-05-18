# Propon y Come Frontend

<!-- markdownlint-disable MD033 -->
<img src="./assets/icon-only.png" alt="Logo de Propon y Come" width="120" />
<!-- markdownlint-enable MD033 -->

Aplicación móvil para organizar comidas en familia o en grupo de forma colaborativa.

## ¿Qué es Propon y Come?

Propon y Come ayuda a planificar el menu semanal entre varias personas. Cada usuario puede guardar sus recetas y participar en una o varias familias, donde se proponen comidas por franja del dia (desayuno, almuerzo, merienda, cena o categorias personalizadas).

El objetivo es pasar de ideas sueltas a una planificación clara y, una vez cerrada la semana, facilitar la compra con una lista consolidada de ingredientes.

## Funcionalidades principales

- Registro e inicio de sesion con rutas publicas y privadas.
- Gestión de familias: crear, unirse por código y ver miembros.
- Cuaderno de recetas personal.
- Planificador semanal por familia.
- Vista de compras para apoyar la preparación semanal.
- Módulo IA en desarrollo para sugerencias de recetas.
- Tema claro/oscuro persistente.

## Tecnologias usadas

- React 19
- Vite 7
- React Router 7
- Zustand (estado global y persistencia de sesión)
- Axios (cliente HTTP)
- Material UI + Emotion
- Capacitor 8 (ejecución móvil)
- ESLint 9

## Estructura funcional

- Auth: login y control de acceso por rutas.
- Recetas: alta, consulta y gestión de recetas del usuario.
- Familias: colaboración por grupos.
- Planning: organización semanal de comidas.
- Compras: apoyo para lista de la compra.
- IA: área reservada para asistente de cocina.

## Requisitos

- Node.js 20 o superior recomendado.
- npm.
- Backend de Propon y Come en ejecución.

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

1. Arranca en desarrollo:

```bash
npm run dev
```

1. Build de producción:

```bash
npm run build
```

1. Previsualizar build:

```bash
npm run preview
```

## Ejecución en Android con Capacitor

1. Genera build web:

```bash
npm run build
```

1. Sincroniza con proyecto nativo:

```bash
npx cap sync
```

1. Ejecuta en Android:

```bash
npx cap run android
```

## Configuración de API

El cliente HTTP está en [src/utils/api.js](src/utils/api.js) y usa la variable de entorno `VITE_API_URL`.

- Archivo de ejemplo versionado: [.env.example](.env.example)
- Archivo recomendado para entorno local: `.env.local`

Ejemplo:

```bash
VITE_API_URL=http://localhost:3000/api
```

En Vite, las variables expuestas al frontend deben empezar por `VITE_`.
Si ejecutas en móvil real con Capacitor, no uses localhost: usa la IP LAN o un dominio accesible desde el dispositivo.

## Scripts disponibles

- `npm run dev`: entorno de desarrollo.
- `npm run build`: build de producción.
- `npm run preview`: prueba local del build.
- `npm run lint`: análisis estático.

## Estado del proyecto

Proyecto funcional en su flujo principal de autenticación, recetas, familias, planning y compras. El asistente de IA está planteado y preparado para evolucionarse en siguientes iteraciones.
