const express = require('express');
const router = express.Router();
const SolicitudController = require('../controllers/SolicitudController');

// Estadísticas del sistema
router.get('/sistema/estadisticas', (req, res) => SolicitudController.obtenerEstadisticas(req, res));

module.exports = router;
