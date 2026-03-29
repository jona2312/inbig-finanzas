# INBIG — WATCHLIST SPEC

## Objetivo
Definir la watchlist personal del usuario para CockpitHome. La watchlist sirve como capa de foco: concentra los activos que el trader sigue de cerca y alimenta tanto el bloque visual del cockpit como las menciones contextuales del copiloto.

---

## 1. Modelo de datos

### Tabla: `watchlist_items`
Campos:
- `id`
- `user_id`
- `symbol`
- `asset_type`
- `notes`
- `alert_price`
- `created_at`

### Reglas del modelo
1. cada fila representa un activo seguido por un usuario
2. `symbol` debe guardarse normalizado
3. `asset_type` debe distinguir al menos: `stock`, `forex`, `crypto`, `index`, `commodity`, `arg_asset`
4. `notes` es opcional y puede usarse para sesgo, nivel o recordatorio
5. `alert_price` es opcional
6. `created_at` sirve para orden por recencia si no hay otro criterio

---

## 2. API

### GET `/api/watchlist`
Devuelve la watchlist del usuario autenticado.

**Respuesta esperada**
- lista de items de `watchlist_items`
- orden sugerido: por `created_at desc`

### POST `/api/watchlist`
Crea un nuevo item en la watchlist.

**Body mínimo**
```json
{
  "symbol": "AAPL",
  "asset_type": "stock",
  "notes": "resistencia semanal",
  "alert_price": 210
}
```

**Reglas**
1. no crear duplicados exactos de `symbol` por usuario
2. validar `symbol` no vacío
3. validar `asset_type` permitido
4. si ya existe, devolver error semántico o ignorar según decisión de implementación

### DELETE `/api/watchlist/[id]`
Elimina un item de la watchlist del usuario autenticado.

**Reglas**
1. validar propiedad del item por `user_id`
2. responder con éxito idempotente si el item ya no existe

---

## 3. UI

### Componente: `WatchlistBlock`
Se usa dentro de `CockpitHome`.

### Límite visual
**Máximo 8 items visibles.**

### Qué muestra cada item
- `symbol`
- `asset_type`
- `notes` si existen
- `alert_price` si existe
- variación o dato contextual si luego se conecta a mercado en tiempo real

### Acciones mínimas
- agregar item
- eliminar item
- click para ver detalle / ir al activo

### Regla UX
La watchlist no es una tabla fría. Es un bloque de foco del trader. Debe responder: **“qué activos importan hoy para mí”**.

---

## 4. Uso en CockpitHome

### Ubicación
Bloque principal o secundario del cockpit según estado del mercado.

### Prioridad
- en pre-mercado: mostrar watchlist junto a briefing y agenda
- en sesión: mostrar watchlist junto a radar y escenarios
- post-sesión: mantener visible solo si ayuda a preparar mañana

### Comportamiento esperado
- si el usuario no tiene items, mostrar CTA simple para crear su watchlist
- si tiene items, mostrar hasta 8 priorizados

---

## 5. Relación con el copiloto

El copiloto puede mencionar activos del watchlist del usuario para hacer el mensaje más contextual.

### Ejemplos
- "Hoy tu watchlist tiene AAPL y NVDA en foco. ¿Cuál de los dos realmente encaja con tu plan?"
- "Veo que seguís EUR/USD y oro. ¿Querés revisar cuál está más alineado con el contexto de hoy?"

### Reglas
1. el copiloto no debe mencionar más de 2 activos por mensaje
2. solo usar activos de watchlist si el mensaje gana claridad
3. nunca convertir la mención del watchlist en consejo de inversión

---

## 6. Reglas de negocio

1. cada usuario maneja su watchlist privada
2. el máximo visual en cockpit es 8, aunque backend pueda guardar más si luego se decide
3. símbolos duplicados por usuario no deben repetirse
4. el watchlist debe ser liviano y de carga rápida
5. el copiloto puede leerla, pero no modificarla automáticamente

---

## 7. Relación con otras capas
- `watchlist_items` alimenta `CockpitHome`
- el copiloto puede leer watchlist para contexto
- futuros escenarios pueden usar watchlist como semilla de activos prioritarios
- briefings personalizados pueden priorizar activos del watchlist del usuario
