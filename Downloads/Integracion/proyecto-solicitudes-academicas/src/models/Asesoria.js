const mongoose = require('mongoose');

const asesoriaSchema = new mongoose.Schema({
  solicitud_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solicitud',
    required: true
  },
  
  docente_id: {
    type: String,
    required: true
  },
  
  email_docente: {
    type: String,
    required: true,
    lowercase: true
  },
  
  nombre_estudiante: String,
  email_estudiante: String,
  
  fecha_programada: {
    type: Date,
    required: true
  },
  
  duracion_minutos: {
    type: Number,
    default: 30
  },
  
  modalidad: {
    type: String,
    enum: ['presencial', 'virtual'],
    default: 'virtual'
  },
  
  ubicacion: String, // Zoom link, aula, etc.
  
  estado: {
    type: String,
    enum: ['programada', 'iniciada', 'completada', 'cancelada'],
    default: 'programada'
  },
  
  notas: String,
  
  notificacion_enviada: {
    type: Boolean,
    default: false
  },
  
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'asesorias'
});

// Índices
asesoriaSchema.index({ solicitud_id: 1 });
asesoriaSchema.index({ email_docente: 1 });
asesoriaSchema.index({ fecha_programada: 1 });
asesoriaSchema.index({ estado: 1 });

module.exports = mongoose.model('Asesoria', asesoriaSchema);
