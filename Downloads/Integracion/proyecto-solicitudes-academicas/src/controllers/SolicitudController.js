const SolicitudService = require('../services/SolicitudService');
const NotificacionService = require('../services/NotificacionService');

class SolicitudController {
  /**
   * POST /api/v1/solicitudes
   * Crear nueva solicitud académica
   */
  async crearSolicitud(req, res) {
    try {
      const { nombre_estudiante, curso, tema, descripcion, nivel_urgencia, email_estudiante } = req.body;

      // Validaciones
      if (!nombre_estudiante || nombre_estudiante.length < 3) {
        return res.status(400).json({ error: 'Nombre inválido (mínimo 3 caracteres)' });
      }

      if (!curso) {
        return res.status(400).json({ error: 'Curso requerido' });
      }

      if (!tema) {
        return res.status(400).json({ error: 'Tema requerido' });
      }

      if (!descripcion || descripcion.length < 10) {
        return res.status(400).json({ error: 'Descripción requerida (mínimo 10 caracteres)' });
      }

      if (nivel_urgencia && (nivel_urgencia < 1 || nivel_urgencia > 5)) {
        return res.status(400).json({ error: 'Nivel de urgencia debe estar entre 1 y 5' });
      }

      const solicitud = await SolicitudService.crearSolicitud({
        nombre_estudiante,
        email_estudiante,
        curso,
        tema,
        descripcion,
        nivel_urgencia: nivel_urgencia || 2
      });

      res.status(201).json({
        mensaje: 'Solicitud creada exitosamente',
        solicitud: {
          _id: solicitud._id,
          nombre_estudiante: solicitud.nombre_estudiante,
          curso: solicitud.curso,
          tipo_clasificacion: solicitud.tipo_clasificacion,
          estado: solicitud.estado,
          fecha_creacion: solicitud.fecha_creacion
        }
      });
    } catch (error) {
      console.error('Error en crearSolicitud:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/solicitudes/:id
   * Obtener detalles de una solicitud
   */
  async obtenerSolicitud(req, res) {
    try {
      const solicitud = await SolicitudService.obtenerSolicitud(req.params.id);
      res.json(solicitud);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/solicitudes
   * Listar solicitudes (del estudiante o todas si es admin)
   */
  async listarSolicitudes(req, res) {
    try {
      const { email_estudiante, estado, tipo_clasificacion, curso } = req.query;

      // Si se proporciona email_estudiante, listar solo sus solicitudes
      if (email_estudiante) {
        const solicitudes = await SolicitudService.listarSolicitudesEstudiante(email_estudiante);
        return res.json({
          total: solicitudes.length,
          solicitudes
        });
      }

      // Si no, listar todas con filtros (modo admin)
      const solicitudes = await SolicitudService.listarTodasSolicitudes({
        estado,
        tipo_clasificacion,
        curso,
        limit: req.query.limit ? parseInt(req.query.limit) : 100
      });

      res.json({
        total: solicitudes.length,
        solicitudes
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/solicitudes/:id/responder
   * Enviar respuesta directa (para solicitudes simples)
   */
  async responderSolicitud(req, res) {
    try {
      const { respuesta, email_docente } = req.body;

      if (!respuesta) {
        return res.status(400).json({ error: 'Respuesta requerida' });
      }

      if (!email_docente) {
        return res.status(400).json({ error: 'Email del docente requerido' });
      }

      const solicitud = await SolicitudService.enviarRespuesta(
        req.params.id,
        respuesta,
        email_docente
      );

      res.json({
        mensaje: 'Respuesta enviada exitosamente',
        solicitud: {
          _id: solicitud._id,
          estado: solicitud.estado,
          respuesta: solicitud.respuesta,
          fecha_respuesta: solicitud.fecha_respuesta,
          email_docente: solicitud.email_docente
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/v1/solicitudes/:id/agendar-asesoria
   * Programar asesoría (para solicitudes complejas)
   */
  async agendarAsesoria(req, res) {
    try {
      const { fecha_programada, docente_id, email_docente, duracion_minutos, modalidad, ubicacion, respuesta } = req.body;

      console.log('[agendarAsesoria] Datos recibidos:', { fecha_programada, email_docente, respuesta: respuesta ? 'SÍ' : 'NO' });

      if (!fecha_programada) {
        return res.status(400).json({ error: 'Fecha de asesoría requerida' });
      }

      const asesoria = await SolicitudService.programarAsesoria(
        req.params.id,
        {
          docente_id,
          email_docente,
          fecha_programada: new Date(fecha_programada),
          duracion_minutos,
          modalidad,
          ubicacion,
          respuesta
        }
      );

      console.log('[agendarAsesoria] Asesoría creada, obteniendo solicitud actualizada...');

      // Obtener la solicitud actualizada para devolver
      const solicitudActualizada = await SolicitudService.obtenerSolicitud(req.params.id);

      console.log('[agendarAsesoria] Solicitud actualizada:', { 
        estado: solicitudActualizada.estado,
        respuesta: solicitudActualizada.respuesta ? 'SÍ TIENE' : 'NO TIENE',
        fecha_respuesta: solicitudActualizada.fecha_respuesta
      });

      res.status(201).json({
        mensaje: 'Asesoría programada exitosamente',
        solicitud: {
          _id: solicitudActualizada._id,
          estado: solicitudActualizada.estado,
          respuesta: solicitudActualizada.respuesta,
          asesoria_id: solicitudActualizada.asesoria_id,
          fecha_respuesta: solicitudActualizada.fecha_respuesta
        },
        asesoria: {
          _id: asesoria._id,
          fecha_programada: asesoria.fecha_programada,
          modalidad: asesoria.modalidad,
          ubicacion: asesoria.ubicacion
        }
      });
    } catch (error) {
      console.error('[agendarAsesoria] Error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/solicitudes/:id/eventos
   * Obtener eventos de una solicitud
   */
  async obtenerEventos(req, res) {
    try {
      const eventos = await SolicitudService.obtenerEventosSolicitud(req.params.id);
      res.json({
        total: eventos.length,
        eventos
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/v1/estadisticas
   * Obtener estadísticas del sistema
   */
  async obtenerEstadisticas(req, res) {
    try {
      const stats = await SolicitudService.obtenerEstadisticas();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/v1/solicitudes/:id
   * Eliminar una solicitud
   */
  async eliminarSolicitud(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID de solicitud requerido' });
      }

      await SolicitudService.eliminarSolicitud(id);
      
      res.json({
        mensaje: 'Solicitud eliminada exitosamente',
        id: id
      });
    } catch (error) {
      console.error('Error en eliminarSolicitud:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PATCH /api/v1/solicitudes/:id/estado
   * Cambiar estado de una solicitud
   */
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de solicitud requerido' });
      }

      if (!estado || !['pendiente', 'se requiere asesoria', 'completada'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido. Debe ser: pendiente, se requiere asesoria o completada' });
      }

      const solicitud = await SolicitudService.cambiarEstado(id, estado);

      res.json({
        mensaje: 'Estado actualizado exitosamente',
        solicitud: {
          _id: solicitud._id,
          nombre_estudiante: solicitud.nombre_estudiante,
          estado: solicitud.estado
        }
      });
    } catch (error) {
      console.error('Error en cambiarEstado:', error.message);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SolicitudController();
