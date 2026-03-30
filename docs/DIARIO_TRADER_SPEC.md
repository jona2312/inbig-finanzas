# INBIG — DIARIO DEL TRADER SPEC

## Objetivo
El Diario del Trader es el registro estructurado de entrenamiento del usuario. No es solo journaling manual: combina inputs del usuario con cálculos del sistema y lecturas del copiloto para convertir actividad en aprendizaje.

## Flujo del trade
### 1. Antes del trade
El usuario registra:
- activo
- dirección
- tipo de setup
- timeframe
- motivo de entrada
- nivel de entrada esperado
- stop / take profit
- riesgo máximo
- estado emocional previo
- checklist del plan

### 2. Durante el trade
El usuario o el sistema actualiza:
- entrada ejecutada
- tamaño real
- cambios de stop
- cambios de take profit
- notas intratrade
- desvíos del plan
- emoción durante la operación

### 3. Después del trade
El usuario registra:
- salida
- resultado percibido
- aprendizaje subjetivo
- si siguió o no el plan
- si volvería a tomar el trade

El sistema calcula:
- PnL
- R múltiple
- duración
- slippage si corresponde
- cumplimiento del plan
- etiqueta del error dominante
- score de calidad del trade

## Campos visibles para el usuario
### Manuales
- activo
- dirección
- setup
- timeframe
- entrada
- stop
- take profit
- tamaño
- emoción
- notas
- aprendizaje
- checklist

### Calculados visibles
- PnL
- R:R
- duración
- score del trade
- alineación con el plan
- tags automáticos

## Campos internos del sistema
- patrones detectados
- correlación con emociones previas
- clustering por horario / activo / setup
- frecuencia de errores
- drawdown contextual
- confianza histórica del usuario en ese tipo de trade
- señales para copilot_memory

## Cómo lee esto el copiloto
El copiloto no usa el diario para felicitar o criticar. Lo usa para entrenar.

### Ejemplos de lectura
- "Veo que tus mejores trades aparecen cuando definís stop antes de entrar."
- "Perdés más cuando operás después de eventos macro."
- "Hoy saliste antes del objetivo por ansiedad. ¿Qué gatilló eso?"
- "Tu patrón mejora en swing y empeora en scalping rápido."

## Outputs del sistema basados en el diario
- insight post-trade
- insight diario
- insight semanal
- input para briefing del día siguiente
- trigger del copiloto
- resumen de progreso

## Reglas funcionales
1. cada trade debe poder existir en estado borrador
2. el usuario puede crear trade antes de ejecutarlo
3. el sistema debe distinguir entre dato manual y dato calculado
4. el diario debe ser útil aunque el usuario cargue poco
5. el copiloto debe usar el diario para hacer preguntas, no para emitir órdenes

## Relación con tablas
- trade_journal = fuente principal
- daily_checkins = contexto emocional
- copilot_memory = patrones persistentes
- user_briefings = resumen del aprendizaje reciente
- trader_profile = perfil actualizado del usuario
