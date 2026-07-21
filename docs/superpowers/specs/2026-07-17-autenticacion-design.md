# Diseño: Módulo de Autenticación (visual, sin backend)

## Contexto

Segunda pieza grande de Luck, después del catálogo de freelancers. Cubre el
registro/login de freelancers y clientes. Esta primera iteración es solo la capa
visual — formularios funcionales en el navegador (navegación real, validación de
campos), pero sin conexión a un backend de autenticación real todavía.

## Alcance de esta pieza (recortado a Login)

Se decidió construir primero **solo la pantalla de login** (`/login`), dejando
`/registro` (con sus dos flujos, freelancer y cliente) para una pieza siguiente, una
vez que el patrón visual del login esté validado.

Incluye:
- Página `/login` con fondo degradado decorativo + patrón de puntos, tarjeta blanca
  centrada con el formulario (según mockup del usuario).
- Header/logo de Luck arriba a la izquierda (versión de color, no la oscura que usa
  el navbar del catálogo — este fondo no es blanco).
- Campos: correo electrónico (con ícono de sobre) y contraseña (con ícono de
  candado + botón de mostrar/ocultar contraseña).
- Link "¿Olvidaste tu contraseña?" (sin funcionalidad real todavía).
- Botón "Iniciar sesión" (sin submit real).
- Separador "o continúa con" + botón "Continuar con Google" (logo oficial de
  Google en SVG, sin OAuth conectado).
- Link "¿No tienes una cuenta? Regístrate" → navega a `/registro` (aunque esa
  página se construya después, la ruta ya existe como placeholder).
- Botón "Ingresar" del navbar del catálogo pasa de placeholder a link real hacia
  `/login`.

Fuera de alcance (piezas futuras):
- Conexión real a Supabase Auth (crear cuenta, login real, sesión, recuperar
  contraseña).
- Login/registro con Google funcional.
- Rutas protegidas / persistencia de sesión.

## Alcance de esta pieza — Registro (`/registro`)

Login ya está construido (ver sección anterior). Esta es la segunda mitad del
módulo: la página de registro, a partir de un mockup del usuario.

**Cambio respecto al plan original:** en vez de una pantalla de elección de rol que
navega a dos rutas separadas (`/registro/freelancer`, `/registro/cliente`), es
**una sola página** `/registro` con un toggle de rol (💼 Freelancer / 🔍 Cliente,
Freelancer seleccionado por defecto) que no cambia los campos del formulario — son
los mismos para ambos roles, solo cambia qué rol quedaría asociado a la cuenta.

Incluye:
- Página `/registro` con el mismo fondo degradado + patrón de puntos + logo que
  `/login`.
- Toggle de rol tipo "pill": botón activo con fondo lavanda claro, borde índigo,
  texto índigo bold; botón inactivo blanco con borde gris.
- Campos: Nombre completo (ícono de persona), Correo electrónico (ícono de sobre),
  Contraseña (ícono de candado + mostrar/ocultar + texto de ayuda con los
  requisitos), Confirmar contraseña (ícono de candado + mostrar/ocultar).
- Checkbox "Acepto los Términos y Condiciones y la Política de Privacidad." (los
  dos nombres son links, sin funcionalidad real todavía).
- Botón "Crear cuenta": deshabilitado (lavanda claro) hasta que el checkbox esté
  marcado; habilitado (índigo sólido) una vez marcado. Sin submit real.
- Separador "o regístrate con" + botón "Registrarme con Google" (mismo estilo que
  el de login).
- Link "¿Ya tienes una cuenta? Iniciar sesión" → navega a `/login`.
- Botón "Registrarse" del navbar del catálogo pasa de placeholder a link real hacia
  `/registro`.

## Validación de registro (cliente, sin backend)

- Nombre completo: requerido.
- Email: requerido + formato válido (misma regla que login).
- Contraseña: mínimo 8 caracteres + al menos 1 mayúscula + al menos 1 número + al
  menos 1 carácter especial — un mensaje de error específico por cada regla que
  falle.
- Confirmar contraseña: requerido + debe coincidir con Contraseña.
- Errores se muestran debajo de cada campo solo después de un intento de envío
  fallido.
- El checkbox de Términos controla si el botón "Crear cuenta" está habilitado —
  esto es una condición de UI, no un error de validación de campo.

## Stack

- Next.js (App Router) + TypeScript, ruta `/login` (`src/app/login/page.tsx`).
- Nuevo módulo `src/modules/autenticacion/` con el formulario de login.
- Nuevos primitivos en `src/ui/`: `Input.tsx` (genérico, con ícono opcional a la
  izquierda y botón opcional a la derecha — reutilizado para email/contraseña).
- `ui/Button.tsx` se extiende con un prop `href` opcional: si se pasa, renderiza
  `next/link` con las mismas clases visuales en vez de un `<button>`.

## Componentes

- **`modules/autenticacion/LoginForm.tsx`**: arma el formulario completo (título,
  subtítulo, campos, links, botones), usando `ui/Input`, `ui/Button`.
- **`ui/Input.tsx`**: label (con asterisco rojo si `required`), input con ícono
  opcional a la izquierda (`leftIcon`) y elemento opcional a la derecha
  (`rightSlot`, usado para el ojo de mostrar/ocultar contraseña), mensaje de error
  opcional debajo.
- El fondo degradado + patrón de puntos y el logo se arman directo en
  `app/login/page.tsx` (es específico de esta página, no un primitivo reutilizable
  todavía).

## Validación (cliente, sin backend)

- Ambos campos requeridos (no vacíos) al intentar enviar.
- Email debe tener formato válido.
- Los errores se muestran debajo del campo correspondiente solo después de un
  intento de envío fallido (no mientras el usuario escribe).
- El botón "Iniciar sesión" no hace ninguna llamada real; si la validación pasa,
  no ocurre nada visible todavía (se conecta a Supabase en una pieza futura).

## Componentes de registro

- **`modules/autenticacion/RegisterForm.tsx`**: arma el formulario completo,
  usando `ui/Input`, `ui/Button`, `ui/Checkbox`, `RoleToggle`.
- **`modules/autenticacion/RoleToggle.tsx`**: dos botones "pill" (íconos
  `Briefcase`/`Search` de lucide-react), controla un estado `role: "freelancer" |
  "cliente"` que vive en `RegisterForm`.
- **`ui/Checkbox.tsx`**: nuevo primitivo genérico — checkbox + label (acepta
  `children` para poder anidar links dentro del texto).

## Testing

- Test unitario de `validateLoginForm` (`modules/autenticacion/validation.ts`):
  campos vacíos, email inválido, caso válido.
- Test unitario de `validateRegisterForm`
  (`modules/autenticacion/registerValidation.ts`): nombre vacío, email inválido,
  cada regla de contraseña incumplida individualmente, confirmación que no
  coincide, caso válido.
- Verificación manual en navegador: cargar `/login`, click en "Ingresar" del navbar
  navega ahí, probar validación (enviar vacío, email inválido), mostrar/ocultar
  contraseña funciona. Cargar `/registro`, click en "Registrarse" del navbar navega
  ahí, alternar el toggle de rol, probar validación de cada campo, confirmar que
  "Crear cuenta" está deshabilitado hasta marcar el checkbox de Términos.
