# Diseño: Catálogo de Freelancers (Luck)

## Contexto

Luck es una plataforma freelancer con modelo de suscripción: los freelancers publican
planes de servicio recurrente (ej. "Diseño ilimitado - $250/mes") y los clientes se
suscriben a un plan específico de un freelancer.

Esta es la primera pieza a construir: el catálogo público donde un cliente puede
explorar freelancers y buscar/filtrar antes de que existan cuentas, perfiles o pagos
reales. El resto de la plataforma (auth, perfiles, planes reales, suscripciones/pagos)
se diseñará en piezas posteriores.

## Alcance de esta pieza

Incluye:
- Grid de tarjetas de freelancers (basado en mockup proporcionado por el usuario).
- Barra de búsqueda por texto + filtros por categoría, país y precio, funcionando
  contra datos de prueba.
- Header con logo y botones "Ingresar"/"Registrarse" (placeholders, sin auth real).

Fuera de alcance (para piezas futuras):
- Página de perfil de freelancer y detalle de sus planes.
- Autenticación real.
- Conexión a Supabase, modelo de datos persistente, suscripciones y pagos.

## Stack

- Next.js (App Router) + TypeScript.
- Supabase queda instalado como dependencia del proyecto para uso futuro, pero esta
  pieza no lo usa: los datos son un archivo JSON estático.
- Sin backend/API routes en esta pieza; todo el filtrado ocurre en el cliente (React
  state).

## Estructura de carpetas

Siguiendo las convenciones de Next.js App Router (código de aplicación fuera de
`app/`, `app/` reservado para rutas):

```
luck/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # catálogo (ruta "/")
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FreelancerCard.tsx
│   │   └── FreelancerGrid.tsx
│   ├── data/
│   │   └── freelancers.json  # ~55 registros de prueba
│   ├── lib/
│   │   └── filterFreelancers.ts  # lógica de búsqueda/filtrado, testeable aparte de la UI
│   └── types/
│       └── freelancer.ts     # tipo Freelancer compartido
├── public/
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Modelo de datos (tipo `Freelancer`)

```ts
interface Freelancer {
  id: string;
  name: string;
  initials: string;
  rating: number;
  reviewCount: number;
  specialty: string;      // ej. "Full Stack Developer"
  category: string;       // ej. "Desarrollo" — usado por el filtro de categoría
  country: string;
  countryFlag: string;    // emoji de bandera
  skills: string[];
  projectCount: number;
  monthlyPriceFrom: number; // precio del plan más barato del freelancer
}
```

## Componentes

- **Header**: logo "Luck" + botones "Ingresar"/"Registrarse" sin funcionalidad.
- **SearchBar**: input de texto + 3 selects (categoría, país, rango de precio).
  Mantiene el estado de búsqueda/filtros y lo eleva a `page.tsx`.
- **FreelancerCard**: muestra avatar (iniciales sobre color derivado del nombre),
  nombre, ⭐ rating (nº reseñas), specialty, bandera+país, tags de skills, "N
  proyectos", "Desde $X/mes", botón "Ver perfil" (placeholder).
- **FreelancerGrid**: contador "N freelancers encontrados" + grid responsive de
  `FreelancerCard`.

## Lógica de filtrado (`lib/filterFreelancers.ts`)

Función pura `filterFreelancers(freelancers, filters)`:
- **Texto**: coincide (case-insensitive, substring) contra `name`, `specialty` o
  cualquier elemento de `skills`.
- **Categoría**: coincide exacto contra `category`, o "Todas las categorías" (sin
  filtrar).
- **País**: coincide exacto contra `country`, o "Todos los países" (sin filtrar).
- **Precio**: rangos predefinidos aplicados sobre `monthlyPriceFrom`:
  - Cualquier precio (sin filtrar)
  - Menos de $200/mes
  - $200–$300/mes
  - Más de $300/mes
- Todos los filtros son combinables con AND. Se separa de la UI para poder
  testearla de forma aislada.

## Datos de prueba

`src/data/freelancers.json` con ~55 registros variados: mezcla de categorías
(Desarrollo, Diseño, Marketing, Producto, DevOps, Redacción), países
latinoamericanos y europeos, y precios distribuidos en los 3 rangos de filtro para
que la demo sea realista.

## Testing

- Tests unitarios de `filterFreelancers` cubriendo cada filtro individual y
  combinaciones.
- Verificación manual en navegador: cargar `/`, probar búsqueda y cada filtro,
  confirmar el contador de resultados.
