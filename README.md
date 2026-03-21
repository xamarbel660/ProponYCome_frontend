# Propon y Come Frontend

Aplicacion movil para organizar comidas en familia o en grupo de forma colaborativa.

## ¿Que es Propon y Come?

Propon y Come ayuda a planificar el menu semanal entre varias personas. Cada usuario puede guardar sus recetas y participar en una o varias familias, donde se proponen comidas por franja del dia (desayuno, almuerzo, merienda, cena o categorias personalizadas).

El objetivo es pasar de ideas sueltas a una planificacion clara y, una vez cerrada la semana, facilitar la compra con una lista consolidada de ingredientes.

## Funcionalidades principales

- Registro e inicio de sesion con rutas publicas y privadas.
- Gestion de familias: crear, unirse por codigo y ver miembros.
- Cuaderno de recetas personal.
- Planificador semanal por familia.
- Vista de compras para apoyar la preparacion semanal.
- Modulo IA en desarrollo para sugerencias de recetas.
- Tema claro/oscuro persistente.

## Tecnologias usadas

- React 19
- Vite 7
- React Router 7
- Zustand (estado global y persistencia de sesion)
- Axios (cliente HTTP)
- Material UI + Emotion
- Capacitor 8 (ejecucion movil)
- ESLint 9

## Estructura funcional

- Auth: login y control de acceso por rutas.
- Recetas: alta, consulta y gestion de recetas del usuario.
- Familias: colaboracion por grupos.
- Planning: organizacion semanal de comidas.
- Compras: apoyo para lista de la compra.
- IA: area reservada para asistente de cocina.

## Requisitos

- Node.js 20 o superior recomendado.
- npm.
- Backend de Propon y Come en ejecucion.

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Arranca en desarrollo:

```bash
npm run dev
```

3. Build de produccion:

```bash
npm run build
```

4. Previsualizar build:

```bash
npm run preview
```

## Ejecucion en Android con Capacitor

1. Genera build web:

```bash
npm run build
```

2. Sincroniza con proyecto nativo:

```bash
npx cap sync
```

3. Ejecuta en Android:

```bash
npx cap run android
```

## Configuracion de API

El cliente HTTP esta en src/utils/api.js y usa la variable de entorno VITE_API_URL.

- Archivo de ejemplo versionado: .env.example
- Archivo recomendado para entorno local: .env.local

Ejemplo:

```bash
VITE_API_URL=http://localhost:3000/api
```

En Vite, las variables expuestas al frontend deben empezar por VITE_.
Si ejecutas en movil real con Capacitor, no uses localhost: usa la IP LAN o un dominio accesible desde el dispositivo.

## Scripts disponibles

- npm run dev: entorno de desarrollo.
- npm run build: build de produccion.
- npm run preview: prueba local del build.
- npm run lint: analisis estatico.

## Estado del proyecto

Proyecto funcional en su flujo principal de autenticacion, recetas, familias, planning y compras. El asistente de IA esta planteado y preparado para evolucionarse en siguientes iteraciones.
