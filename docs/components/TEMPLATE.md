# Miru App — Documentación de Componentes

> Template para documentar cada componente del frontend.
> Crear un archivo `<nombre>.component.md` en `docs/components/`
> por cada componente desarrollado.

---

# Componente: `{{nombre-del-componente}}`

## Datos del componente

| Propiedad | Valor |
|-----------|-------|
| **Selector** | `app-{{nombre}}` |
| **Ruta** | `frontend/src/app/{{modulo}}/{{nombre}}/` |
| **Módulo** | `{{modulo}}` |
| **Tipo** | `{{page / modal / shared / widget}}` |
| **Standalone** | `true` |

---

## Propósito

> {{Descripción clara de qué hace el componente, en qué pantalla se usa y qué problema resuelve.}}

---

## API del componente

### Inputs

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|:---------:|:-------:|-------------|
| `{{prop}}` | `{{tipo}}` | ✅ / ❌ | `{{default}}` | {{descripción}} |

### Outputs

| Evento | Tipo | Descripción |
|--------|:----:|-------------|
| `{{evento}}` | `EventEmitter<{{tipo}}>` | {{descripción}} |

---

## Estados visuales

### 1. Default
> {{Descripción del estado normal / relleno}}

```
{{diagrama o layout visual}}
```

### 2. Loading (Skeleton)
> {{Descripción del esqueleto mientras cargan los datos}}

- {{elemento visual 1: ej. "Rectángulo de 40×40px con shimmer"}}
- {{elemento visual 2}}

### 3. Empty
> {{Qué se muestra cuando no hay datos}}

- Ícono: `{{nombre}}` Lucide, {{tamaño}}px, `#{{color}}`
- Texto: *"{{mensaje}}"*
- {{botón CTA si aplica}}

### 4. Error
> {{Qué se muestra cuando falla la carga}}

- Mensaje: *"{{mensaje de error}}"* — `#F87171`
- Acción: Botón "Reintentar" o similar

### 5. Disabled (si aplica)
> {{Descripción del estado deshabilitado}}

---

## Dependencias

### Servicios
| Servicio | Métodos usados |
|----------|----------------|
| `{{servicio}}` | `{{método}}` |

### Componentes hijos
| Componente | Propósito |
|------------|-----------|
| `app-{{hijo}}` | {{propósito}} |

### Pipes
| Pipe | Uso |
|------|-----|
| `{{pipe}}` | {{descripción}} |

### Directivas
| Directiva | Uso |
|-----------|-----|
| `{{directiva}}` | {{descripción}} |

---

## Rutas asociadas

| Ruta | Método HTTP | Endpoint |
|------|:-----------:|----------|
| `{{ruta frontend}}` | `{{method}}` | `{{api endpoint}}` |

---

## Comportamiento

- {{Acción 1}}: {{descripción}}
- {{Acción 2}}: {{descripción}}

---

## Notas de diseño

- {{nota 1}}
- {{nota 2}}

---

## Mock data (para testing visual)

```typescript
export const MOCK_{{NOMBRE}}: {{Tipo}} = {
  // ... datos mock representativos
}
```

---

## Screenshot / Wireframe

> *(Insertar captura de pantalla o referencia a la vista en `docs/ui/views/`)*

Ver especificación visual en: `docs/ui/views/{{XX-nombre-vista}}.md`
