# INBIG — COPILOT PROACTIVE SPEC

## Objetivo
Contrato funcional del copiloto proactivo. Entrena comportamiento. No da consejos de inversión. Idioma siempre español.

## 1. Triggers
### Post check-in matutino
Dispara si existe check-in del día, no hay trade abierto y no hubo mensaje en la sesión.
Condiciones: mood/focus bajos o estrés alto.
Salida esperada: pregunta breve para reforzar el plan.

### Post-trade registrado
Dispara cuando se crea o actualiza un trade con datos suficientes para evaluación y no hubo mensaje en la sesión.
Variables: outcome, emoción, R múltiple, seguimiento del plan, score de calidad.
Salida esperada: insight o pregunta para separar resultado de calidad.

### Post-sesión
Dispara al cierre de sesión si faltó check-in, faltó journaling o hubo actividad sin reflexión.
Salida esperada: CTA a cerrar el día en el diario.

### Inactividad 3+ días
Dispara si no hay actividad relevante en 72h+, no hay trade abierto y no se leyó briefing reciente.
Salida esperada: reactivar hábito sin culpa.

### Patrón detectado
Dispara si copilot_memory detecta patrón significativo y no hay trade abierto.
Ejemplo: 3 losses seguidos con fear.
Salida esperada: pregunta para revisar patrón.

## 2. Estructura del mensaje
- tipo: pregunta | insight | alerta | felicitacion
- tono: entrenador, nunca juez
- máximo: 2 líneas
- CTA: una acción simple

Plantilla:
1. contexto corto
2. observación o pregunta
3. CTA claro

## 3. Fuentes de datos
### copilot_memory
Usa: pattern_type, pattern_summary, confidence_score, last_detected_at, times_detected, suggested_next_action, last_message_sent_at.

### trade_journal
Consulta: últimos 10 trades, últimos 3 por activo, trades por emoción, trades por outcome, follow_plan false, r_multiple negativo, score alto con outcome malo.
Campos: outcome, r_multiple, emotion_pre, emotion_during, emotion_post, followed_plan, trade_quality_score, error_tag.

### daily_checkins
Campos: mood_score, focus_score, stress_score, energy_score, notes, session_plan, risk_today.

### user_briefings
Lee: briefing_date, summary, main_focus, main_risk, main_question, recommended_action, status.
Genera: job nocturno n8n.

## 4. Reglas de negocio
1. máximo 1 mensaje proactivo por sesión
2. no interrumpe si hay trade abierto
3. nunca da consejos de inversión
4. idioma español
5. no repite patrón o CTA dos sesiones seguidas salvo empeoramiento
6. si hay briefing no leído, prioriza CTA al briefing
7. toda salida debe trazarse al trigger

## 5. JSON para n8n
```json
{
  "user_id": "uuid",
  "trigger_type": "post_checkin|post_trade|post_session|inactivity|pattern_detected",
  "message_type": "pregunta|insight|alerta|felicitacion",
  "tone": "entrenador",
  "message": "texto corto en español",
  "cta": {
    "action": "abrir_checklist|abrir_diario|ver_briefing|registrar_aprendizaje|ver_patron",
    "label": "texto corto"
  },
  "context": {
    "briefing_id": null,
    "trade_id": null,
    "checkin_id": null,
    "pattern_type": null
  }
}
```

## 6. Campos que escribe / actualiza
### user_briefings
user_id, briefing_date, summary, main_focus, main_risk, main_question, recommended_action, status, generated_by.

### copilot_memory
last_detected_at, times_detected, last_message_sent_at, last_message_type, last_cta, pattern_summary, suggested_next_action, active_flag.

## 7. Orden de evaluación
1. verificar trade abierto
2. verificar mensaje ya emitido en sesión
3. elegir trigger de mayor urgencia
4. revisar briefing no leído
5. generar mensaje corto
6. persistir en copilot_memory
