const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
  // Información del estudiante
  nombre_estudiante: {
    type: String,
    required: [true, 'El nombre del estudiante es requerido'],
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email_estudiante: {
    type: String,
    required: [true, 'El email es requerido'],
    lowercase: true
  },
  
  // Información académica
  curso: {
    type: String,
    required: [true, 'El curso/asignatura es requerido']
  },
  tema: {
    type: String,
    required: [true, 'El tema es requerido']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  
  // Urgencia
  nivel_urgencia: {
    type: Number,
    required: [true, 'El nivel de urgencia es requerido'],
    enum: [1, 2, 3, 4, 5],
    default: 2
  },
  
  // Clasificación automática
  tipo_clasificacion: {
    type: String,
    enum: ['simple', 'compleja', 'pendiente'],
    default: 'pendiente'
  },
  puntuacion_clasificacion: {
    type: Number,
    min: 0,
    max: 10
  },
  razon_clasificacion: String,
  
  // Estado
  estado: {
    type: String,
    enum: ['pendiente', 'se requiere asesoria', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  
  // Respuesta directa (si es simple)
  respuesta: {
    type: String,
    maxlength: [2000, 'La respuesta no puede exceder 2000 caracteres']
  },
  email_docente: {
    type: String,
    lowercase: true
  },
  
  // Relación con asesoría (si es compleja)
  asesoria_id: mongoose.Schema.Types.ObjectId,
  
  // Timestamps
  fecha_creacion: {
    type: Date,
    default: Date.now
  },
  fecha_clasificacion: Date,
  fecha_respuesta: Date,
  fecha_actualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'solicitudes'
});

// Índices para búsquedas rápidas
solicitudSchema.index({ email_estudiante: 1 });
solicitudSchema.index({ estado: 1 });
solicitudSchema.index({ tipo_clasificacion: 1 });
solicitudSchema.index({ fecha_creacion: -1 });

module.exports = mongoose.model('Solicitud', solicitudSchema);
