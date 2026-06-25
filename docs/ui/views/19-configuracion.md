# Miru App — Configuración

---

## Descripción general

Pantalla de ajustes de la aplicación. Agrupa todas las preferencias del usuario y del grupo en secciones organizadas. Diseño limpio y escaneable — cada sección tiene un propósito claro.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí (puede ser larga)
- **Bottom navigation:** oculta
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Perfil           Configuración
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5` (vuelve a Perfil)
- **Centro:** *"Configuración"* — Inter 700, 20px, `#F0F2F5`

---

### 2. Sección: Cuenta
Margin top: 20px.

- **Header de sección:** *"Cuenta"* — Inter 600, 12px, `#8A95A8`, uppercase, letter-spacing 1px

Items:

**Información personal** → Editar nombre, email, teléfono
```
[user]  Información personal           >
```

**Cambiar contraseña** → Formulario de cambio de contraseña
```
[lock]  Cambiar contraseña             >
```

**Idioma** → Selector de idioma (Español / English)
```
[globe]  Idioma                      Español >
```

**Moneda** → Selector de moneda (ARS, USD, etc.)
```
[dollar-sign]  Moneda               $ ARS >
```

Cada item:
- Padding: 14px 0
- Borde inferior: `rgba(255,255,255,0.04)`, 1px
- Ícono: 20px, `#8A95A8`
- Label: Inter 500, 14px, `#F0F2F5`
- Valor actual (si aplica): Inter 400, 14px, `#697586`
- Flecha derecha: `chevron-right` Lucide, 16px, `#697586`

---

### 3. Sección: Grupo familiar
Margin top: 24px.

- **Header:** *"GRUPO FAMILIAR"* — mismo estilo

**Nombre del grupo** → Editar nombre del grupo
```
[users]  Nombre del grupo       Familia García >
```

**Administrar miembros** → Navega a Miembros
```
[user-cog]  Administrar miembros           >
```

**Preferencias del grupo** → Toggles de configuración grupal
Items con toggle switch:

| Label | Descripción | Por defecto |
|---|---|---|
| *"Notificar nuevos gastos"* | A todos los miembros | ON |
| *"Aprobación de gastos grandes"* | Requiere aprobación > $10,000 | OFF |
| *"Visibilidad de saldos"* | Todos ven los saldos individuales | ON |

Cada item:
- Padding: 12px 0
- Ícono: 18px, `#697586`
- Label: Inter 500, 14px, `#F0F2F5`
- Subtexto: Inter 400, 11px, `#697586`
- Toggle: 44×24px, radio 999px
  - ON: fondo `#E4B3E9`, círculo `#F0F2F5`
  - OFF: fondo `#1E2530`, círculo `#697586`

---

### 4. Sección: Notificaciones
Margin top: 24px.

- **Header:** *"NOTIFICACIONES"*

Items con toggle:

| Label | Por defecto |
|---|---|
| *"Recordatorios de pago"* | ON |
| *"Metas de ahorro"* | ON |
| *"Resumen semanal"* | OFF |
| *"Invitaciones"* | ON |
| *"Sonido"* | ON |
| *"Vibración"* | ON |

---

### 5. Sección: Apariencia
Margin top: 24px.

- **Header:** *"APARIENCIA"*

**Tema:**
- Label: *"Tema oscuro"* — Inter 500, 14px, `#F0F2F5`
- Subtexto: *"Solo modo oscuro disponible por ahora"* — Inter 400, 11px, `#697586`
- Toggle: ON y deshabilitado (no se puede cambiar) — fondo `#E4B3E9`

**Tamaño de texto:**
- Label: *"Tamaño de texto"*
- Selector con 3 opciones: *"Pequeño"* / *"Mediano"* / *"Grande"*
- Chips horizontales, seleccionado *"Mediano"* por defecto

---

### 6. Sección: Datos y privacidad
Margin top: 24px.

- **Header:** *"DATOS Y PRIVACIDAD"*

Items:

```
[download]  Exportar datos                >
[trash-2]   Eliminar cuenta               >
[file-text]  Términos y condiciones        >
[shield]    Política de privacidad         >
```

- "Exportar datos": modal con formato a exportar (PDF/CSV/Excel)
- "Eliminar cuenta": modal de confirmación con input de contraseña y texto *"Esta acción no se puede deshacer"*
- Los dos últimos son links externos que abren en in-app browser

---

### 7. Sección: Información
Margin top: 24px.

- **Header:** *"INFORMACIÓN"*

```
[info]  Versión de la app          v2.0.0
[cpu]   Entorno                 Producción
```

- Items informativos, no tocables
- Label: Inter 500, 14px, `#F0F2F5`
- Valor: Inter 400, 14px, `#697586`
- Sin flecha, sin borde inferior en el último

---

### 8. Footer
Margin top: 40px. Centrado.

- **Logo:** `miru-icon.svg`, 24×24px, opacidad 0.3
- **Texto:** *"Miru v2.0.0"* — Inter 400, 12px, `#697586`
- **Copyright:** *"© 2026 Miru App. Todos los derechos reservados."* — Inter 400, 11px, `#697586`

---

## Comportamiento

- Cada item al tocar: navega a su sub-pantalla o ejecuta la acción correspondiente
- Los toggles cambian de estado con animación de 150ms
- "Eliminar cuenta" abre un flujo de confirmación de 2 pasos (confirmación + contraseña)
- Los cambios en esta pantalla se guardan automáticamente (no requiere botón "Guardar")
- Al cambiar moneda o idioma, la app se actualiza en tiempo real

---

## Notas de diseño

- Las secciones con headers en uppercase y letter-spacing ayudan a la escaneabilidad
- Los toggles deben tener labels descriptivos — no asumir que el usuario sabe qué hace cada uno
- Mantener los items esenciales arriba (Cuenta, Grupo) y los menos usados abajo (Datos, Información)
- La sección de Apariencia es corta porque Miru es solo dark theme
- "Eliminar cuenta" debe estar visible pero no ser fácil de tocar por accidente
- Los links legales son obligatorios pero no deben interrumpir el flujo
- En v2: más opciones de apariencia, personalización de colores, backup en la nube
