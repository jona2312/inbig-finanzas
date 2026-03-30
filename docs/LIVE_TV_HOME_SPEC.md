# LIVE TV HOME — Spec Técnica
## INbig Finanzas · v1.0 · 2026-03-30

---

## 1. Problema actual

El bloque `LiveChannelPlayer` usa IDs de video de YouTube hardcodeados (ej: `dp8PhLsUcFE`).
Estos IDs caducan cada vez que el canal reinicia su transmisión en vivo.
Resultado: iframe roto, pantalla negra, "El vídeo no está disponible".
**Regla de oro: jamás mostrar un iframe roto al usuario.**

---

## 2. Arquitectura de solución

### 2.1 Fuente de verdad de canales

Los IDs de YouTube de streams en vivo se almacenan en Supabase:

```sql
CREATE TABLE live_channels (
  id          TEXT PRIMARY KEY,        -- 'bloomberg', 'cnbc', 'dw', etc.
  label       TEXT NOT NULL,
  youtube_id  TEXT,                    -- NULL si no hay stream activo
  youtube_url TEXT,                    -- URL del canal (no el video)
  color       TEXT DEFAULT 'zinc',
  dot_color   TEXT DEFAULT 'bg-zinc-400',
  live        BOOLEAN DEFAULT true,
  active      BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

**Refresh policy:** La tabla se actualiza vía n8n o cron diario que consulta la API de YouTube
buscando el stream activo del canal y actualiza `youtube_id`.

### 2.2 Fallback inteligente (capas)

```
Capa 1: iframe YouTube embed  →  si falla onError → Capa 2
Capa 2: Tarjeta de fallback   →  muestra logo, nombre, descripción, "Abrir en YouTube" button
```

**Regla de detección de fallo:**
- `youtube_id === null` → ir directo a Capa 2 (ej: canal INBIG propio)
- `onError` del iframe → cambiar a Capa 2
- Timeout 8s sin `onLoad` → cambiar a Capa 2

### 2.3 Bloque TV en la Home

El bloque TV debe estar visible en la landing/home principal (no solo en `/terminal`).
Ubicación sugerida: sección inferior del dashboard de bienvenida, debajo de últimos briefings.
Diseño: compacto (max-height 400px), sin tabs de canales, muestra el canal más relevante del momento.

---

## 3. Componente `LiveChannelPlayer` — comportamiento esperado

### Estado por canal

```typescript
type ChannelStatus = 'loading' | 'playing' | 'error' | 'offline'

interface Channel {
  id: string
  label: string
  youtubeId: string | null
  youtubeChannelUrl: string      // URL del canal en YouTube (permanente)
  color: string
  dotColor: string
  live: boolean
  status?: ChannelStatus
}
```

### Lógica de render del iframe

```typescript
// Nunca mostrar iframe si youtubeId es null
if (!channel.youtubeId) return <ChannelFallback channel={channel} reason="offline" />

// Mostrar iframe con manejo de errores
return (
  <iframe
    key={channel.youtubeId}
    src={`https://www.youtube.com/embed/${channel.youtubeId}?autoplay=1&mute=0`}
    onError={() => setChannelStatus('error')}
    onLoad={() => setChannelStatus('playing')}
    ...
  />
)

// Si hay error, mostrar fallback
if (channelStatus === 'error') return <ChannelFallback channel={channel} reason="error" />
```

### Componente `ChannelFallback`

Mostrar siempre que el embed falle:
- Logo / nombre del canal (coloreado)
- Descripción del canal (1 línea)
- Estado: "Transmisión no disponible" o "Canal en desarrollo"
- Botón: "Abrir ${channel.label} en YouTube" → `youtubeChannelUrl`
- Badge EN VIVO pulsante solo si `channel.live === true` y `status !== 'error'`

---

## 4. Canales iniciales

| ID       | Label       | YouTube Channel URL                                      | Color       |
|----------|-------------|----------------------------------------------------------|-------------|
| bloomberg| Bloomberg   | https://www.youtube.com/@BloombergTelevision             | blue-400    |
| cnbc     | CNBC        | https://www.youtube.com/@CNBCtelevision                  | blue-300    |
| dw       | DW Español  | https://www.youtube.com/@DWEspanol                       | red-400     |
| ln       | LN+         | https://www.youtube.com/@lnmas                           | zinc-300    |
| neura    | Neura Media | https://www.youtube.com/@NeuraMedia                      | purple-400  |
| inbig    | INBIG       | null (propio, en desarrollo)                              | amber-400   |

---

## 5. Bloque TV en home — layout

```
┌─────────────────────────────────────────┐
│ 📺 EN VIVO  •  Bloomberg  ● EN VIVO     │
├─────────────────────────────────────────┤
│                                         │
│         [ iframe / fallback ]           │
│              (16:9)                     │
│                                         │
├─────────────────────────────────────────┤
│ ← Bloomberg  CNBC  DW  LN+  Neura  →   │
└─────────────────────────────────────────┘
```

Props del bloque home: `compact={true}`, `defaultChannel="bloomberg"`

---

## 6. Refresh de IDs de YouTube (automatización)

### n8n flow (recomendado)

1. **Trigger:** Cron cada 6 horas
2. **Acción:** Para cada canal activo, llamar a YouTube Data API v3:
   `GET /search?channelId={channelId}&eventType=live&type=video`
3. **Resultado:** Extraer el `videoId` del primer resultado
4. **Update:** `UPDATE live_channels SET youtube_id = '{videoId}', updated_at = now() WHERE id = '{channelId}'`
5. **Fallback:** Si no hay stream live → `SET youtube_id = null`

### Variables necesarias
- `YOUTUBE_API_KEY` en Supabase secrets / n8n env
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` ya configurados

---

## 7. Criterios de aceptación

- [ ] Nunca se muestra un iframe roto (pantalla negra o error de YouTube)
- [ ] Si el stream falla → se muestra fallback con botón a YouTube
- [ ] Bloque TV visible en la home principal
- [ ] Canal INBIG muestra su card de "próximamente" sin iframe
- [ ] Los IDs de YouTube son actualizables sin deploy (desde Supabase)
- [ ] Timeout de 8s activa el fallback automáticamente
