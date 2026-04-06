/**
 * Configuración centralizada de la aplicación
 */

module.exports = {
  // Servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/solicitudes_academicas',

  // Webhooks
  WEBHOOK_URL: process.env.WEBHOOK_URL || null,

  // Logs
  LOG_EVENTS: process.env.LOG_EVENTS !== 'false',

  // Límites de solicitud
  MAX_DESCRIPCION: 1000,
  MIN_DESCRIPCION: 10,
  MAX_NOMBRE: 100,
  MIN_NOMBRE: 3,

  // Urgencia
  URGENCIA_MIN: 1,
  URGENCIA_MAX: 5,

  // Clasificación
  UMBRAL_COMPLEJIDAD: 5.5,
  PESO_URGENCIA: 0.4,
  PESO_PALABRAS: 0.35,
  PESO_LONGITUD: 0.25,

  // Palabras clave para clasificación
  PALABRAS_COMPLEJAS: [
    'revisar', 'código', 'proyecto', 'algoritmo', 'error',
    'ayuda', 'no funciona', 'problema', 'explicar',
    'análisis', 'depuración', 'implementación', 'fallo',
    'bug', 'debug', 'optimizar', 'refactorizar'
  ],

  PALABRAS_SIMPLES: [
    'concepto', 'definición', 'fórmula', 'significado',
    'qué es', 'cuál es', 'duda', 'pregunta',
    'diferencia entre', 'teoría'
  ]
};
