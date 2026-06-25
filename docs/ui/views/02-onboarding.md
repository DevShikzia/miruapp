# Miru App — Onboarding

---

## Descripción general

Flujo de bienvenida de 3 pasos (slides). Se muestra únicamente la primera vez que el usuario abre la app. Cada slide comunica un beneficio emocional de Miru, no una funcionalidad técnica. El tono es cálido, cercano y nunca intimidante.

---

## Estructura global

- **Fondo:** `#0C0F14`
- **Paginación:** 3 puntos indicadores centrados horizontalmente, en la parte inferior del área de contenido
- **Punto activo:** `#E4B3E9`, 8px de diámetro
- **Punto inactivo:** `rgba(255,255,255,0.15)`, 6px de diámetro
- **Navegación:** swipe horizontal nativo + botón "Siguiente"
- **Transición entre slides:** slide horizontal, 150ms ease-in-out

---

## SLIDE 1 — "Todo en un lugar"

### Ilustración
Ocupa el 55% superior de la pantalla. Fondo de la ilustración: `#161B24` con radio 32px, centrado.
- Una familia de íconos flotantes: casa, corazón, dinero, estrella, todos en tonos `#E4B3E9` y `#B98AEF`
- Estilo flat, trazo fino (1.75px), redondeado
- Sutil animación de float: cada ícono sube y baja 6px con diferente timing (stagger de 200ms entre elementos)
- En el centro de la ilustración, el isotipo de Miru a 48px con glow suave `#E4B3E9` al 12%

### Texto
Debajo de la ilustración, padding horizontal 32px:
- **Título:** Inter 700, 28px, `#F0F2F5`
  *"Tu familia, organizada."*
- **Descripción:** Inter 400, 14px, `#8A95A8`, line-height 1.6, margin-top 12px
  *"Miru te ayuda a ver tus ingresos, gastos y deudas en un solo lugar. Sin estrés, sin complicaciones."*

---

## SLIDE 2 — "Juntos es mejor"

### Ilustración
- Dos figuras abstractas y amigables (estilo minimal, no humanas realistas) conectadas por una línea suave color `#E4B3E9`
- A su alrededor: íconos de check, corazón y moneda flotando
- Misma paleta que slide 1

### Texto
- **Título:** *"Compártanlo en familia."*
- **Descripción:** *"Invitá a tu pareja o a quien quieras. Todos ven lo mismo, en tiempo real. Sin secretos, sin sorpresas."*

---

## SLIDE 3 — "Sin juicios"

### Ilustración
- Un gato kawaii minimalista (guiño al logo de Miru), sentado, con ojos tranquilos
- Color del gato: gradiente de `#F2C8F6` a `#B98AEF`
- Alrededor: estrellitas pequeñas `#E4B3E9`
- Expresión serena, no alerta ni preocupada

### Texto
- **Título:** *"Miru no te juzga."*
- **Descripción:** *"Acá no hay errores, solo pasos. Te acompañamos a ordenar tu economía a tu ritmo, con calma."*

---

## Parte inferior — Controles

Fija en la parte baja de la pantalla, a 48px del borde inferior. Padding horizontal 24px.

### Slides 1 y 2

```
[ ··· Paginación ··· ]

[    Siguiente    ]         (Primary Button, ancho completo)

        Saltar              (texto plano, Inter 14px, #8A95A8, tocable)
```

- Botón "Siguiente": fondo `#E4B3E9`, texto `#0C0F14`, altura 44px, radio 999px, ancho 100%
- "Saltar": toque lleva directamente al Login. Color `#8A95A8`, sin subrayado, centrado

### Slide 3 (último)

```
[ ··· Paginación ··· ]

[  Crear mi cuenta  ]      (Primary Button)

[  Ya tengo cuenta  ]      (Secondary Button)
```

- Botón primario: mismo estilo que "Siguiente"
- Botón secundario: fondo transparente, borde 1px `#E4B3E9`, texto `#E4B3E9`, altura 44px, radio 999px

---

## Comportamiento

- Al completar el onboarding, se guarda un flag local `onboarding_visto: true`
- No se vuelve a mostrar nunca (salvo reinstalación)
- El botón "Saltar" en cualquier slide va al Login
- "Crear mi cuenta" va al Registro
- "Ya tengo cuenta" va al Login

---

## Notas de diseño

- Las ilustraciones no deben verse técnicas ni financieras
- El gato del slide 3 es el primer guiño al carácter de Miru — debe sentirse cálido
- Evitar íconos de banco, billete con símbolo de dólar excesivo, gráficos de velas
- El espacio en blanco es intencional — la pantalla no debe sentirse llena

---

## Documentación relacionada

| Documento | Descripción |
|---|---|
| [`docs/miru-estructura.md`](../miru-estructura.md) | Estructura del proyecto, rutas, modelos y endpoints |
| [`docs/miru-reglas-frontend.md`](../miru-reglas-frontend.md) | Reglas de desarrollo frontend |
| [`docs/ui/design-system.md`](design-system.md) | Sistema de diseño (colores, tipografía, componentes) |
| [`docs/api/api-schemas.md`](../api/api-schemas.md) | Schemas de validación y DTOs de la API |
| [`docs/api/shared-types.md`](../api/shared-types.md) | Tipos compartidos entre frontend y backend |
| [`docs/api/miru-roles.md`](../api/miru-roles.md) | Roles y permisos del sistema |
| [`docs/components/TEMPLATE.md`](../components/TEMPLATE.md) | Template para documentar componentes |

## Endpoints relacionados

*(Ninguno — pantalla puramente visual)*

## Dependencias del backend

*(Ninguna — no consume datos del backend)*
