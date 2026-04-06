const express = require('express');
const router = express.Router();
const SolicitudController = require('../controllers/SolicitudController');

// Crear solicitud
router.post('/', (req, res) => SolicitudController.crearSolicitud(req, res));

// Listar solicitudes
router.get('/', (req, res) => SolicitudController.listarSolicitudes(req, res));

// Obtener solicitud por ID
router.get('/:id', (req, res) => SolicitudController.obtenerSolicitud(req, res));

// Responder solicitud (simple)
router.post('/:id/responder', (req, res) => SolicitudController.responderSolicitud(req, res));

// Agendar asesoría (compleja)
router.post('/:id/agendar-asesoria', (req, res) => SolicitudController.agendarAsesoria(req, res));

// Obtener eventos de solicitud
router.get('/:id/eventos', (req, res) => SolicitudController.obtenerEventos(req, res));

// Eliminar solicitud
router.delete('/:id', (req, res) => SolicitudController.eliminarSolicitud(req, res));

// Cambiar estado de la solicitud
router.patch('/:id/estado', (req, res) => SolicitudController.cambiarEstado(req, res));

module.exports = router;
