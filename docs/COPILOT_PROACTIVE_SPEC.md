# INBIG — COPILOT PROACTIVE SPEC

## Objetivo
Contrato funcional del copiloto proactivo para backend, n8n y UI. El copiloto entrena comportamiento. Nunca da consejos de inversión. Siempre habla en español.

---

## 1. Triggers del copiloto

### 1.1 Post check-in matutino
**Dispara cuando:**
- existe `daily_checkins` del día
- el usuario no tiene trade abierto
- no se envió mensaje proactivo en la sesión actual

**Condiciones principales:**
- `mood_score <= 4`
- `focus_score <= 4`
- `stress_score >= 7` si existe
- combinación de mood/focus bajos + evento macro relevante del día

**Objetivo:** entrenar intención, bajar impulsividad y reforzar plan.

---

### 1.2 Post-trade registrado
**Dispara cuando:**
- se crea o actualiza un registro en `trade_journal`
- el trade queda cerrado o tiene datos suficientes para evaluación
- no hubo otro mensaje proactivo en la sesión actual

**Variables a evaluar:**
- `outcome`
- `emotion_pre`, `emotion_during`, `emotion_post`
- `r_multiple`
- `followed_plan`
- `trade_quality_score`
- `error_tag`

**Casos mínimos:**
- loss + fear/anxiety alta
- gain + mala ejecución
- buen trade con resultado negativo
- R múltiple extremo

**Objetivo:** separar resultado de calidad, fijar aprendizaje y empujar journaling corto.

---

### 1.3 Post-sesión
**Dispara cuando:**
- termina la sesión principal del usuario o el job nocturno detecta actividad incompleta
- no hubo check-in del día o no registró trades pese a actividad visible
- no se emitió mensaje proactivo en la sesión actual

**Casos:**
- sin check-in
- sin journaling
- operó pero no cerró reflexión
- sesión activa sin aprendizaje guardado

**Objetivo:** cerrar el ciclo y empujar al Diario del Trader.

---

### 1.4 Inactividad 3+ días
**Dispara cuando:**
- no hay login o actividad relevante en 72h+
- no hay trade abierto
- no existe briefing leído en el período

**Objetivo:** reactivar sin culpa y traer de vuelta al hábito con una acción simple.

---

### 1.5 Patrón detectado
**Dispara cuando:**
- `copilot_memory` o job analítico detecta patrón significativo
- no hay trade abierto
- `confidence_score >= 0.7`
- no se emitió mensaje proactivo en la sesión actual

**Ejemplos:**
- 3 trades seguidos con loss + fear
- 2 sesiones seguidas con sobreoperación
- win rate cae en un horario específico
- mejora al seguir checklist y empeora cuando no lo completa

**Objetivo:** volver visible lo invisible y transformar patrón en pregunta útil.

---

## 2. Ranking de prioridad entre triggers

Cuando más de un trigger sea elegible al mismo tiempo, usar este orden:

1. `pattern_detected`
2. `post_checkin`
3. `post_trade`
4. `post_session`
5. `inactivity`

**Regla:** ejecutar solo el trigger de mayor prioridad en la sesión actual.

---

## 3. Definición de sesión

### Problema
`last_message_sent_at` no alcanza para decidir si ya hubo mensaje en la sesión actual.

### Campo requerido en `copilot_memory`
Agregar:
- `session_date` (date)

### Regla funcional
Una sesión se considera, como mínimo, el día operativo actual del usuario. Si `session_date = hoy` y ya existe `last_message_sent_at`, no emitir otro mensaje proactivo.

**Nota:** si luego se implementa sesión por bloque horario, mantener `session_date` como fallback simple.

---

## 4. Estructura del mensaje del copiloto

### Formato base
- `message_type`: `pregunta` | `insight` | `alerta` | `felicitacion`
- tono: entrenador, nunca juez
- longitud máxima: 2 líneas
- idioma: español
- CTA: una acción concreta y simple

### Regla de copy
Cada mensaje debe incluir:
1. contexto breve
2. observación o pregunta
3. CTA claro

### Ejemplos
**pregunta**
- "Hoy tu foco está bajo. ¿Qué condición tendría que darse para no operar?"
- CTA: `abrir_checklist`

**insight**
- "Tus mejores trades aparecen cuando definís el stop antes de entrar. Repetí ese patrón hoy."
- CTA: `abrir_diario`

**alerta**
- "Hay evento macro cerca y venís con ansiedad alta. Frená un minuto antes de abrir otra posición."
- CTA: `ver_briefing`

**felicitacion**
- "Buen cierre: seguís el plan aunque el resultado no haya sido perfecto. Eso también es progreso."
- CTA: `registrar_aprendizaje`

---

## 5. Fuentes de datos que lee

### 5.1 `copilot_memory`
Campos para contexto persistente:
- `user_id`
- `pattern_type`
- `pattern_summary`
- `confidence_score`
- `last_detected_at`
- `times_detected`
- `suggested_next_action`
- `last_message_sent_at`
- `last_message_type`
- `last_cta`
- `session_date`
- `active_flag`

**Uso principal:** detectar patrones repetidos, evitar repetición de mensajes y personalizar tono/CTA.

### 5.2 `trade_journal`
Consultas mínimas sugeridas:
- últimos 10 trades cerrados
- últimos 3 trades del mismo activo
- últimos trades por emoción dominante
- últimos trades por outcome
- trades con `followed_plan = false`
- trades con `r_multiple < 0`
- trades con `trade_quality_score` alto aunque outcome negativo

**Campos relevantes:**
- `status`
- `asset`
- `direction`
- `outcome`
- `r_multiple`
- `followed_plan`
- `emotion_pre`
- `emotion_during`
- `emotion_post`
- `trade_quality_score`
- `error_tag`
- `opened_at`
- `closed_at`

### 5.3 `daily_checkins`
Campos relevantes:
- `checkin_date`
- `mood_score`
- `focus_score`
- `stress_score`
- `energy_score`
- `notes`
- `session_plan`
- `risk_today`

### 5.4 `user_briefings`
**Cuándo los genera:** job nocturno/matutino en n8n.

**Cuándo los lee el copiloto:**
- para no duplicar mensaje ya cubierto por briefing
- para priorizar CTA a `ver_briefing`
- para usar `main_risk`, `main_focus`, `main_question`

**Campos sugeridos:**
- `briefing_date`
- `summary` o `content`
- `main_focus`
- `main_risk`
- `main_question`
- `recommended_action`
- `status`

---

## 6. Reglas de negocio

1. máximo 1 mensaje proactivo por sesión
2. no interrumpe si el trader tiene un trade abierto
3. nunca da consejos de inversión; solo entrena comportamiento
4. idioma siempre español
5. no repetir el mismo patrón o CTA dos sesiones seguidas salvo empeoramiento
6. si hay briefing no leído del día, priorizar CTA al briefing antes que generar mensaje largo
7. si el usuario está en estado emocional crítico (`mood_score <= 2` o `stress_score >= 9`), el mensaje debe bajar actividad, no impulsar acción operativa
8. si existe `last_message_sent_at` y `session_date = hoy`, no generar nuevo mensaje
9. el copiloto puede felicitar calidad de proceso aunque el trade haya dado pérdida
10. toda salida debe poder trazarse al trigger que la generó

---

## 7. Feedback loop y analytics

### Problema
Sin feedback loop no se puede medir si el usuario actuó sobre el CTA ni mejorar el sistema.

### Recomendación mínima
Registrar interacción posterior al mensaje con estos campos:
- `cta_action`
- `cta_clicked` (boolean)
- `cta_clicked_at`
- `resolved` (boolean opcional)

### Ubicación sugerida
- en `copilot_messages_log` como historial completo
- o en una tabla de eventos de analytics si ya existe

---

## 8. Tabla sugerida: `copilot_messages_log`

### Objetivo
Auditar, medir fatiga, analizar tono y hacer A/B testing futuro.

### Campos mínimos sugeridos
- `id`
- `user_id`
- `session_date`
- `trigger_type`
- `message_type`
- `message`
- `cta_action`
- `cta_label`
- `briefing_id`
- `trade_id`
- `checkin_id`
- `pattern_type`
- `created_at`
- `cta_clicked`
- `cta_clicked_at`

### Reglas
1. escribir una fila por cada mensaje emitido
2. nunca sobreescribir histórico
3. usar esta tabla para analytics y control de fatiga

---

## 9. Formato del output para n8n

### JSON de salida
```json
{
  "user_id": "uuid",
  "session_date": "YYYY-MM-DD",
  "trigger_type": "post_checkin|post_trade|post_session|inactivity|pattern_detected",
  "message_type": "pregunta|insight|alerta|felicitacion",
  "tone": "entrenador",
  "message": "Texto máximo 2 líneas en español.",
  "cta": {
    "action": "abrir_checklist|abrir_diario|ver_briefing|registrar_aprendizaje|ver_patron",
    "label": "Texto corto del botón"
  },
  "context": {
    "briefing_id": null,
    "trade_id": null,
    "checkin_id": null,
    "pattern_type": null
  },
  "metadata": {
    "generated_at": "ISO-8601",
    "language": "es",
    "max_lines": 2,
    "source": "copilot-proactive-engine",
    "confidence_score": 0.0
  }
}
```

---

## 10. Qué campos escribe / actualiza

### `user_briefings`
Cuando el trigger derive en briefing o complemente briefing:
- `user_id`
- `briefing_date`
- `content` o `summary`
- `main_focus`
- `main_risk`
- `main_question`
- `recommended_action`
- `status`
- `generated_by = n8n_copilot`

### `copilot_memory`
Actualizar:
- `last_detected_at`
- `times_detected`
- `last_message_sent_at`
- `last_message_type`
- `last_cta`
- `pattern_summary`
- `suggested_next_action`
- `session_date`
- `active_flag`

### `copilot_messages_log`
Insertar una fila nueva por mensaje emitido.

---

## 11. Orden de evaluación sugerido

1. verificar si existe trade abierto
2. verificar si ya hubo mensaje en la sesión actual
3. evaluar triggers elegibles
4. aplicar ranking de prioridad
5. revisar briefing no leído
6. generar mensaje corto
7. persistir en `copilot_memory`
8. insertar en `copilot_messages_log`
9. devolver JSON a n8n/UI

---

## 12. Criterio de éxito

El copiloto proactivo funciona bien cuando:
- aumenta el porcentaje de check-ins completados
- aumenta el porcentaje de trades con cierre reflexivo
- aumenta la lectura de briefings
- reduce repetición de errores visibles
- se percibe como entrenador, no como juez ni como bot de señales
