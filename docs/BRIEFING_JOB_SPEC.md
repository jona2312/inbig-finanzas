# INBIG — BRIEFING JOB SPEC

## Objetivo
Definir el job nocturno/matutino que genera briefings personalizados por usuario. El briefing resume contexto reciente, estado del trader y foco del día. Sirve como capa de entrenamiento y de apertura del cockpit.

---

## 1. Cron

### Ejecución
**06:00 AM** en n8n.

### Tipo de briefing
- `morning`
- `evening` queda reservado para expansión futura, pero el job actual debe escribir `morning`.

---

## 2. Inputs que lee

### `trader_profile`
Usa perfil persistente del usuario.

Campos sugeridos:
- estilo operativo
- activos preferidos
- horario principal
- errores frecuentes
- fortalezas detectadas
- sesgo del sistema si existe

### `trading_plan`
Usa el plan operativo del trader.

Campos sugeridos:
- reglas de entrada
- reglas de no-operación
- riesgo máximo diario
- mercados habilitados
- horario o sesión objetivo

### `daily_checkins` (últimos 7 días)
Consulta ventana de 7 días.

Usa para:
- tendencia de mood/focus
- estrés acumulado
- consistencia del hábito
- estado emocional reciente

### `trade_journal` (10 operaciones recientes)
Consulta últimas 10 operaciones relevantes.

Usa para:
- outcomes recientes
- R múltiple promedio
- adherence al plan
- errores repetidos
- emoción dominante
- mejoras o deterioro visibles

---

## 3. Proceso del job

1. seleccionar usuarios elegibles
2. leer `trader_profile`
3. leer `trading_plan`
4. leer `daily_checkins` últimos 7 días
5. leer `trade_journal` últimas 10 operaciones
6. construir prompt base para Claude API
7. generar briefing
8. guardar en `user_briefings`
9. opcionalmente marcar metadata para lectura posterior en cockpit/copiloto

---

## 4. Output en `user_briefings`

Tabla objetivo: `user_briefings`

Campos mínimos a guardar:
- `user_id`
- `content`
- `briefing_date`
- `type` = `morning`

Campos recomendados si existen o se amplían luego:
- `main_focus`
- `main_risk`
- `main_question`
- `recommended_action`
- `status`
- `generated_by`

---

## 5. Prompt base

### Intención
Claude no debe dar señales ni consejos de inversión. Debe generar un briefing breve, útil y orientado a entrenamiento.

### Prompt base sugerido
```text
Sos el copiloto educativo de INBIG Finanzas.
Tu tarea es generar un briefing matutino personalizado para un trader retail de LATAM.

Objetivo:
- resumir qué importa hoy para este trader
- destacar un foco principal
- marcar un riesgo conductual o contextual
- hacer una pregunta que lo entrene antes de operar
- mantener tono de entrenador, nunca juez
- no dar recomendaciones de inversión ni señales
- responder siempre en español

Usá este contexto del usuario:
- trader_profile: {{trader_profile}}
- trading_plan: {{trading_plan}}
- daily_checkins_7d: {{daily_checkins}}
- recent_trades_10: {{trade_journal}}

Devolvé JSON con:
- content
- main_focus
- main_risk
- main_question
- recommended_action
```

---

## 6. Forma esperada del resultado de Claude

```json
{
  "content": "Texto breve del briefing en español.",
  "main_focus": "Tema principal del día.",
  "main_risk": "Riesgo principal conductual o contextual.",
  "main_question": "Pregunta que entrena al trader antes de operar.",
  "recommended_action": "Acción simple y no transaccional."
}
```

---

## 7. Edge cases

### Usuario sin `trade_journal`
Generar briefing apoyado en `trader_profile`, `trading_plan` y `daily_checkins`.
Enfocar en preparación y hábito, no en performance histórica.

### Usuario sin `daily_checkins`
No bloquear el briefing.
Usar plan + trades recientes + perfil.
Agregar sesgo de "primero definí tu estado antes de operar" si corresponde.

### Usuario sin `trading_plan`
Generar briefing más general y empujar CTA a completar plan.

### Usuario inactivo
Si no hay actividad reciente, el briefing debe servir para reentrada suave.
No asumir operativa activa.

### Datos contradictorios o pobres
Priorizar prudencia, claridad y entrenamiento.
No inventar precisión.

---

## 8. Reglas de negocio

1. un briefing por usuario por día por tipo
2. si ya existe briefing `morning` del día, no duplicar
3. idioma siempre español
4. tono entrenador, nunca juez
5. no dar señales ni recomendaciones de inversión
6. si faltan fuentes, degradar con gracia y seguir generando briefing
7. el briefing debe poder leerse en cockpit y reutilizarse por el copiloto

---

## 9. Relación con otras capas
- `user_briefings` alimenta `CockpitHome`
- el copiloto puede leer el briefing para no duplicar mensajes
- el briefing usa memoria reciente del trader
- la watchlist futura puede enriquecer el foco principal del briefing
