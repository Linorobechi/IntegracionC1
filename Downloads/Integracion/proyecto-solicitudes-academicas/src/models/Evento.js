const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: [
      'solicitud_creada',
      'solicitud_clasificada',
      'respuesta_directa_enviada',
      'requiere_asesoria',
      'asesoria_programada',
      'solicitud_completada',
      'solicitud_eliminada',
      'solicitud_actualizada',
      'solicitud_en_curso'
    ],
    required: true
  },
  
  solicitud_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solicitud'
  },
  
  datos: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  procesado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'eventos'
});

// Índices
eventoSchema.index({ tipo: 1 });
eventoSchema.index({ solicitud_id: 1 });
eventoSchema.index({ timestamp: -1 });
eventoSchema.index({ procesado: 1 });

module.exports = mongoose.model('Evento', eventoSchema);
