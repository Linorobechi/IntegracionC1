require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importar conexión a BD
const { connectDB } = require('./config/database');

// Importar rutas
const solicitudesRoutes = require('./routes/solicitudes');
const adminRoutes = require('./routes/admin');

// Importar EventBus y servicios
const EventBus = require('./events/EventBus');
const NotificacionService = require('./services/NotificacionService');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/api/v1/solicitudes', solicitudesRoutes);
app.use('/api/v1/admin', adminRoutes);

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

/**
 * Página principal con información del API
 */
app.get('/', (req, res) => {
  res.json({
    nombre: 'Sistema de Gestión de Solicitudes Académicas - CECAR',
    version: '1.0.0',
    endpoints: {
      solicitudes: '/api/v1/solicitudes',
      admin: '/api/v1/admin',
      health: '/health'
    }
  });
});

/**
 * CONFIGURAR LISTENERS DE EVENTOS
 * Los distintos servicios se suscriben a eventos aquí
 */
function configurarEventListeners() {
  console.log('[EVENTOS] Configurando listeners...');

  // Escuchar: solicitud_creada
  EventBus.on('solicitud_creada', async (datos) => {
    console.log('[LISTENER] solicitud_creada:', datos);
    await NotificacionService.enviarWebhook('solicitud_creada', datos);
  });

  // Escuchar: solicitud_clasificada
  EventBus.on('solicitud_clasificada', async (datos) => {
    console.log('[LISTENER] solicitud_clasificada:', datos);
    await NotificacionService.enviarWebhook('solicitud_clasificada', datos);
  });

  // Escuchar: respuesta_directa_enviada
  EventBus.on('respuesta_directa_enviada', async (datos) => {
    console.log('[LISTENER] respuesta_directa_enviada:', datos);
    await NotificacionService.enviarWebhook('respuesta_directa_enviada', datos);
    
    // Notificar al docente
    await NotificacionService.enviarEmail(
      datos.email_docente,
      'Nueva solicitud para responder - CECAR',
      'Debe responder una solicitud académica.'
    );
  });

  // Escuchar: requiere_asesoria
  EventBus.on('requiere_asesoria', async (datos) => {
    console.log('[LISTENER] requiere_asesoria:', datos);
    await NotificacionService.enviarWebhook('requiere_asesoria', datos);
  });

  // Escuchar: asesoria_programada
  EventBus.on('asesoria_programada', async (datos) => {
    console.log('[LISTENER] asesoria_programada:', datos);
    await NotificacionService.enviarWebhook('asesoria_programada', datos);
  });

  // Escuchar: solicitud_eliminada
  EventBus.on('solicitud_eliminada', async (datos) => {
    console.log('[LISTENER] solicitud_eliminada:', datos);
    await NotificacionService.enviarWebhook('solicitud_eliminada', datos);
  });

  console.log('[EVENTOS] Listeners configurados correctamente');
}

/**
 * INICIALIZAR SERVIDOR
 */
async function iniciarServidor() {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Configurar listeners de eventos
    configurarEventListeners();

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✓ Servidor iniciado en puerto ${PORT}`);
      console.log(`✓ Acceda a http://localhost:${PORT}`);
      console.log(`✓ API REST disponible en http://localhost:${PORT}/api/v1`);
      console.log(`${'='.repeat(60)}\n`);
    });

  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Iniciar
iniciarServidor();

module.exports = app;
