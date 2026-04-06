const Solicitud = require('../models/Solicitud');
const Evento = require('../models/Evento');
const Asesoria = require('../models/Asesoria');
const EventBus = require('../events/EventBus');
const ClasificadorService = require('./ClasificadorService');
const NotificacionService = require('./NotificacionService');

class SolicitudService {
  /**
   * Crear una nueva solicitud
   */
  async crearSolicitud(datos) {
    try {
      // Validar datos
      if (!datos.nombre_estudiante || !datos.curso || !datos.tema || !datos.descripcion) {
        throw new Error('Faltan datos requeridos');
      }

      // Crear solicitud
      const solicitud = new Solicitud({
        nombre_estudiante: datos.nombre_estudiante,
        email_estudiante: datos.email_estudiante || 'no-especificado@cecar.edu.co',
        curso: datos.curso,
        tema: datos.tema,
        descripcion: datos.descripcion,
        nivel_urgencia: datos.nivel_urgencia || 2,
        estado: 'pendiente',
        tipo_clasificacion: 'pendiente'
      });

      await solicitud.save();

      // 1. Emitir evento: solicitud_creada
      await EventBus.emit('solicitud_creada', {
        solicitud_id: solicitud._id,
        nombre_estudiante: solicitud.nombre_estudiante,
        curso: solicitud.curso,
        tema: solicitud.tema,
        nivel_urgencia: solicitud.nivel_urgencia,
        timestamp: new Date()
      });

      // Guardar el evento en la BD
      await this._guardarEvento('solicitud_creada', solicitud._id, {
        solicitud_id: solicitud._id,
        nombre_estudiante: solicitud.nombre_estudiante,
        curso: solicitud.curso
      });

      // 2. Clasificar la solicitud automáticamente
      await this.clasificarSolicitud(solicitud._id);

      return solicitud;
    } catch (error) {
      console.error('Error en crearSolicitud:', error.message);
      throw error;
    }
  }

  /**
   * Clasificar una solicitud automáticamente
   */
  async clasificarSolicitud(solicitudId) {
    try {
      const solicitud = await Solicitud.findById(solicitudId);
      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }

      // Ejecutar clasificación
      const resultado = ClasificadorService.clasificar({
        nivel_urgencia: solicitud.nivel_urgencia,
        descripcion: solicitud.descripcion,
        tema: solicitud.tema
      });

      // Actualizar solicitud
      solicitud.tipo_clasificacion = resultado.clasificacion;
      solicitud.puntuacion_clasificacion = resultado.puntuacion;
      solicitud.razon_clasificacion = resultado.razon;
      solicitud.fecha_clasificacion = new Date();
      // El estado siempre permanece como 'pendiente' hasta que el docente responda

      await solicitud.save();

      // 3. Emitir evento: solicitud_clasificada
      await EventBus.emit('solicitud_clasificada', {
        solicitud_id: solicitud._id,
        clasificacion: resultado.clasificacion,
        puntuacion: resultado.puntuacion,
        razon: resultado.razon,
        timestamp: new Date()
      });

      // Guardar evento
      await this._guardarEvento('solicitud_clasificada', solicitudId, {
        solicitud_id: solicitudId,
        clasificacion: resultado.clasificacion,
        puntuacion: resultado.puntuacion,
        razon: resultado.razon
      });

      // Si es compleja, emitir evento adicional
      if (resultado.clasificacion === 'compleja') {
        await EventBus.emit('requiere_asesoria', {
          solicitud_id: solicitud._id,
          clasificacion: 'compleja',
          puntuacion: resultado.puntuacion,
          timestamp: new Date()
        });

        await this._guardarEvento('requiere_asesoria', solicitudId, {
          solicitud_id: solicitudId,
          clasificacion: 'compleja'
        });
      }

      return solicitud;
    } catch (error) {
      console.error('Error en clasificarSolicitud:', error.message);
      throw error;
    }
  }

  /**
   * Enviar respuesta directa (para consultas simples)
   */
  async enviarRespuesta(solicitudId, respuesta, emailDocente) {
    try {
      console.log(`[enviarRespuesta] Iniciando para solicitud: ${solicitudId}`)
      const solicitud = await Solicitud.findById(solicitudId);
      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }

      console.log(`[enviarRespuesta] Tipo clasificación: ${solicitud.tipo_clasificacion}`)
      
      if (solicitud.tipo_clasificacion !== 'simple') {
        throw new Error('Solo se pueden responder directamente solicitudes simples');
      }

      solicitud.respuesta = respuesta;
      solicitud.email_docente = emailDocente;
      console.log(`[enviarRespuesta] Antes de guardar - estado: ${solicitud.estado}`)
      solicitud.estado = 'completada';
      console.log(`[enviarRespuesta] Después de asignar - estado: ${solicitud.estado}`)
      solicitud.fecha_respuesta = new Date();

      const resultado = await solicitud.save();
      console.log(`[enviarRespuesta] Después de save() - estado guardado: ${resultado.estado}`)

      // Emitir evento: respuesta_directa_enviada
      await EventBus.emit('respuesta_directa_enviada', {
        solicitud_id: solicitud._id,
        email_docente: emailDocente,
        tipo_respuesta: 'respuesta_directa',
        timestamp: new Date()
      });

      await this._guardarEvento('respuesta_directa_enviada', solicitudId, {
        solicitud_id: solicitudId,
        email_docente: emailDocente
      });

      return solicitud;
    } catch (error) {
      console.error('Error en enviarRespuesta:', error.message);
      throw error;
    }
  }

  /**
   * Programar asesoría (para consultas complejas)
   */
  async programarAsesoria(solicitudId, datosAsesoria) {
    try {
      console.log('[programarAsesoria] Iniciando para solicitud:', solicitudId);
      console.log('[programarAsesoria] Datos recibidos:', {
        respuesta: datosAsesoria.respuesta ? 'SÍ' : 'NO',
        fecha_programada: datosAsesoria.fecha_programada
      });

      const solicitud = await Solicitud.findById(solicitudId);
      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }

      if (solicitud.tipo_clasificacion !== 'compleja') {
        throw new Error('Solo se pueden agendar asesorías para solicitudes complejas');
      }

      // Crear asesoría
      const asesoria = new Asesoria({
        solicitud_id: solicitudId,
        docente_id: datosAsesoria.docente_id || 'DOC-001',
        email_docente: datosAsesoria.email_docente || 'docente@cecar.edu.co',
        nombre_estudiante: solicitud.nombre_estudiante,
        email_estudiante: solicitud.email_estudiante,
        fecha_programada: datosAsesoria.fecha_programada,
        duracion_minutos: datosAsesoria.duracion_minutos || 30,
        modalidad: datosAsesoria.modalidad || 'virtual',
        ubicacion: datosAsesoria.ubicacion || 'https://zoom.us/...'
      });

      await asesoria.save();

      // Actualizar solicitud
      solicitud.asesoria_id = asesoria._id;
      solicitud.email_docente = datosAsesoria.email_docente;
      solicitud.respuesta = datosAsesoria.respuesta || `Asesoría programada para ${new Date(datosAsesoria.fecha_programada).toLocaleDateString('es-ES')}`;
      solicitud.estado = 'completada';
      solicitud.fecha_respuesta = new Date();

      console.log('[programarAsesoria] Asignando respuesta:', solicitud.respuesta);
      console.log('[programarAsesoria] Asignando estado:', solicitud.estado);

      await solicitud.save();

      console.log('[programarAsesoria] Solicitud guardada en BD. Nuevo estado:', solicitud.estado, 'Respuesta guardada:', solicitud.respuesta ? 'SÍ' : 'NO');

      // 5. Emitir evento: asesoria_programada
      await EventBus.emit('asesoria_programada', {
        solicitud_id: solicitud._id,
        asesoria_id: asesoria._id,
        fecha: asesoria.fecha_programada,
        docente_id: asesoria.docente_id,
        timestamp: new Date()
      });

      await this._guardarEvento('asesoria_programada', solicitudId, {
        solicitud_id: solicitudId,
        asesoria_id: asesoria._id,
        fecha: asesoria.fecha_programada
      });

      return asesoria;
    } catch (error) {
      console.error('Error en programarAsesoria:', error.message);
      throw error;
    }
  }

  /**
   * Obtener solicitud por ID
   */
  async obtenerSolicitud(solicitudId) {
    try {
      const solicitud = await Solicitud.findById(solicitudId);
      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }
      return solicitud;
    } catch (error) {
      console.error('Error en obtenerSolicitud:', error.message);
      throw error;
    }
  }

  /**
   * Listar solicitudes del estudiante
   */
  async listarSolicitudesEstudiante(emailEstudiante) {
    try {
      const solicitudes = await Solicitud.find({ email_estudiante: emailEstudiante })
        .sort({ fecha_creacion: -1 });
      return solicitudes;
    } catch (error) {
      console.error('Error en listarSolicitudesEstudiante:', error.message);
      throw error;
    }
  }

  /**
   * Listar todas las solicitudes (admin)
   */
  async listarTodasSolicitudes(filtros = {}) {
    try {
      const query = {};
      
      if (filtros.estado) query.estado = filtros.estado;
      if (filtros.tipo_clasificacion) query.tipo_clasificacion = filtros.tipo_clasificacion;
      if (filtros.curso) query.curso = filtros.curso;

      const solicitudes = await Solicitud.find(query)
        .sort({ fecha_creacion: -1 })
        .limit(filtros.limit || 100);
      
      return solicitudes;
    } catch (error) {
      console.error('Error en listarTodasSolicitudes:', error.message);
      throw error;
    }
  }

  /**
   * Guardar evento en base de datos
   */
  async _guardarEvento(tipo, solicitudId, datos) {
    try {
      const evento = new Evento({
        tipo,
        solicitud_id: solicitudId,
        datos,
        timestamp: new Date()
      });

      await evento.save();
      return evento;
    } catch (error) {
      console.error('Error guardando evento:', error.message);
    }
  }

  /**
   * Obtener eventos de una solicitud
   */
  async obtenerEventosSolicitud(solicitudId) {
    try {
      const eventos = await Evento.find({ solicitud_id: solicitudId })
        .sort({ timestamp: -1 });
      return eventos;
    } catch (error) {
      console.error('Error en obtenerEventosSolicitud:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas
   */
  async obtenerEstadisticas() {
    try {
      const total = await Solicitud.countDocuments();
      const simples = await Solicitud.countDocuments({ tipo_clasificacion: 'simple' });
      const complejas = await Solicitud.countDocuments({ tipo_clasificacion: 'compleja' });
      const completadas = await Solicitud.countDocuments({ estado: 'completada' });

      return {
        total,
        simples,
        complejas,
        completada: completadas,
        porcentajeCompletion: total > 0 ? ((completadas / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar una solicitud
   */
  async eliminarSolicitud(solicitudId) {
    try {
      if (!solicitudId) {
        throw new Error('ID de solicitud requerido');
      }

      const solicitud = await Solicitud.findByIdAndDelete(solicitudId);
      
      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }

      // Emitir evento: solicitud_eliminada
      await EventBus.emit('solicitud_eliminada', {
        solicitud_id: solicitudId,
        nombre_estudiante: solicitud.nombre_estudiante,
        timestamp: new Date()
      });

      // Guardar evento
      await this._guardarEvento('solicitud_eliminada', solicitudId, {
        solicitud_id: solicitudId,
        nombre_estudiante: solicitud.nombre_estudiante
      });

      return solicitud;
    } catch (error) {
      console.error('Error en eliminarSolicitud:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar estado de una solicitud
   */
  async cambiarEstado(solicitudId, nuevoEstado) {
    try {
      if (!solicitudId) {
        throw new Error('ID de solicitud requerido');
      }

      const solicitud = await Solicitud.findById(solicitudId);
      
      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }

      const estadoAnterior = solicitud.estado;
      solicitud.estado = nuevoEstado;
      await solicitud.save();

      // Emitir evento según el nuevo estado
      let tipoEvento = 'solicitud_actualizada';
      if (nuevoEstado === 'completada') {
        tipoEvento = 'solicitud_completada';
      } else if (nuevoEstado === 'se requiere asesoria') {
        tipoEvento = 'requiere_asesoria';
      }

      await EventBus.emit(tipoEvento, {
        solicitud_id: solicitudId,
        nombre_estudiante: solicitud.nombre_estudiante,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado,
        timestamp: new Date()
      });

      // Guardar evento
      await this._guardarEvento('solicitud_actualizada', solicitudId, {
        solicitud_id: solicitudId,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado
      });

      return solicitud;
    } catch (error) {
      console.error('Error en cambiarEstado:', error.message);
      throw error;
    }
  }
}

module.exports = new SolicitudService();
