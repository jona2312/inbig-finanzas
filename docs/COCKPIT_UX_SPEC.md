# INBIG — COCKPIT UX SPEC

## Objetivo
La HOME privada de INBIG no funciona como dashboard estático. Funciona como cockpit contextual. Debe reorganizarse según el estado del mercado y el perfil del trader.

## Estados principales
### 1. Pre-mercado
Muestra:
- briefing personal del día
- calendario macro inmediato
- sesión que abre primero
- watchlist priorizada del usuario
- pregunta inicial del copiloto

### 2. En sesión
Muestra:
- activo o tema principal en foco
- evento macro cercano si existe
- radar de la sesión
- bloque de escenarios destacados
- copiloto contextual con recordatorio del plan

### 3. Post-sesión
Muestra:
- resumen del día
- trades abiertos/cerrados
- prompt para completar diario
- insight rápido del copiloto
- preparación para mañana

### 4. Fin de semana
Muestra:
- revisión semanal
- hábitos y patrones
- mejores / peores trades
- checklist de preparación semanal
- agenda macro de la próxima semana

## Datos que consume
### Perfil y memoria
- trader_profile
- copilot_memory
- daily_checkins
- trade_journal

### Briefings y escenarios
- user_briefings
- scenario_sessions

### Contexto de mercado
- calendario macro / eventos
- sesión activa
- watchlist del usuario
- bloques públicos del Diario Económico

## Comportamiento del copiloto por estado
### Pre-mercado
Hace una pregunta que entrene la intención del día.
Ejemplo: "¿Qué condición debe darse hoy para que NO operes?"

### En sesión
Recuerda el plan, alerta sobre riesgo contextual y evita sobreoperación.
Ejemplo: "Hay evento macro en 25 minutos. ¿Esto sigue alineado con tu plan?"

### Post-sesión
Pide cierre reflexivo corto y manda al diario.
Ejemplo: "¿La salida fue parte del plan o reacción emocional?"

### Fin de semana
Cambia a modo revisión y aprendizaje.
Ejemplo: "¿Qué patrón querés corregir la semana que viene?"

## Wireframe textual

```text
┌──────────────────────────────────────────────────────────────────┐
│ TOP BAR: sesión activa | reloj | evento macro | estado usuario  │
├──────────────────────────────────────────────────────────────────┤
│ HERO / BRIEFING PERSONAL                                        │
│ "Esto importa hoy para vos" + CTA Ver briefing completo        │
├───────────────────────┬──────────────────────────────────────────┤
│ WATCHLIST / RADAR     │ COPILOTO                                │
│ activos clave         │ pregunta del día                        │
│ cambios / alertas     │ recordatorio del plan                   │
├───────────────────────┼──────────────────────────────────────────┤
│ ESCENARIOS            │ CONTEXTO DE MERCADO                     │
│ demo o sesiones       │ calendario + sesión + riesgo            │
├───────────────────────┴──────────────────────────────────────────┤
│ DIARIO DEL TRADER: trades recientes + completar reflexión       │
└──────────────────────────────────────────────────────────────────┘
```

## Reglas de prioridad
1. primero el contexto urgente del mercado
2. después el briefing personal
3. después la pregunta del copiloto
4. después la watchlist y escenarios
5. después el diario del trader

## Regla UX
Cada bloque del cockpit debe responder una de estas preguntas:
- qué importa ahora
- qué me afecta a mí
- qué debería revisar antes de operar
- qué aprendí de mi comportamiento reciente
