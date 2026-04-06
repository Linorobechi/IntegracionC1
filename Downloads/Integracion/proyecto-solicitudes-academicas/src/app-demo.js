import express from 'express'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

// Base de datos en memoria (para demo)
let solicitudes = []
let eventos = []
let contadorId = 1

// Endpoint: Crear solicitud
app.post('/api/v1/solicitudes', (req, res) => {
  const { nombre_estudiante, email_estudiante, curso, tema, descripcion, nivel_urgencia } = req.body
  
  const id = contadorId++
  const puntuacion = (nivel_urgencia * 0.4) + (descripcion.split(' ').length * 0.35) + (descripcion.length * 0.25)
  const tipo = puntuacion >= 5.5 ? 'compleja' : 'simple'
  
  const solicitud = {
    _id: id,
    nombre_estudiante,
    email_estudiante,
    curso,
    tema,
    descripcion,
    nivel_urgencia,
    tipo_clasificacion: tipo,
    puntuacion_clasificacion: Math.round(puntuacion * 100) / 100,
    estado: 'pendiente',
    respuesta: null,
    asesoria_id: null,
    fecha_creacion: new Date()
  }
  
  solicitudes.push(solicitud)
  
  // Registrar eventos
  eventos.push({
    _id: eventos.length + 1,
    tipo: 'solicitud_creada',
    solicitud_id: id,
    timestamp: new Date()
  })
  
  eventos.push({
    _id: eventos.length + 1,
    tipo: 'solicitud_clasificada',
    solicitud_id: id,
    datos: { tipo, puntuacion },
    timestamp: new Date()
  })
  
  if (tipo === 'compleja') {
    eventos.push({
      _id: eventos.length + 1,
      tipo: 'requiere_asesoria',
      solicitud_id: id,
      timestamp: new Date()
    })
  }
  
  res.json({ solicitud })
})

// Endpoint: Listar solicitudes
app.get('/api/v1/solicitudes', (req, res) => {
  const { tipo_clasificacion, estado } = req.query
  
  let filtered = solicitudes
  
  if (tipo_clasificacion) {
    filtered = filtered.filter(s => s.tipo_clasificacion === tipo_clasificacion)
  }
  
  if (estado) {
    filtered = filtered.filter(s => s.estado === estado)
  }
  
  res.json({ solicitudes: filtered })
})

// Endpoint: Obtener solicitud específica
app.get('/api/v1/solicitudes/:id', (req, res) => {
  const solicitud = solicitudes.find(s => s._id == req.params.id)
  if (!solicitud) return res.status(404).json({ error: 'No encontrada' })
  res.json({ solicitud })
})

// Endpoint: Responder solicitud
app.post('/api/v1/solicitudes/:id/responder', (req, res) => {
  const { respuesta, email_docente } = req.body
  const solicitud = solicitudes.find(s => s._id == req.params.id)
  
  if (!solicitud) return res.status(404).json({ error: 'No encontrada' })
  
  solicitud.respuesta = respuesta
  solicitud.estado = 'completada'
  
  eventos.push({
    _id: eventos.length + 1,
    tipo: 'respuesta_directa_enviada',
    solicitud_id: solicitud._id,
    timestamp: new Date()
  })
  
  res.json({ solicitud })
})

// Endpoint: Agendar asesoría
app.post('/api/v1/solicitudes/:id/agendar-asesoria', (req, res) => {
  const { fecha_programada, email_docente } = req.body
  const solicitud = solicitudes.find(s => s._id == req.params.id)
  
  if (!solicitud) return res.status(404).json({ error: 'No encontrada' })
  
  solicitud.asesoria_id = `asesor_${Date.now()}`
  solicitud.estado = 'completada'
  
  eventos.push({
    _id: eventos.length + 1,
    tipo: 'asesoria_programada',
    solicitud_id: solicitud._id,
    datos: { fecha_programada },
    timestamp: new Date()
  })
  
  res.json({ solicitud })
})

// Endpoint: Ver eventos
app.get('/api/v1/solicitudes/:id/eventos', (req, res) => {
  const solicitudEventos = eventos.filter(e => e.solicitud_id == req.params.id)
  res.json({ eventos: solicitudEventos })
})

// Endpoint: Estadísticas
app.get('/api/v1/admin/sistema/estadisticas', (req, res) => {
  const total = solicitudes.length
  const simples = solicitudes.filter(s => s.tipo_clasificacion === 'simple').length
  const complejas = solicitudes.filter(s => s.tipo_clasificacion === 'compleja').length
  const completadas = solicitudes.filter(s => s.estado === 'completada').length
  const porcentajeCompletion = total > 0 ? Math.round((completadas / total) * 100) : 0
  
  res.json({
    total,
    simples,
    complejas,
    completada: completadas,
    porcentajeCompletion,
    eventos_totales: eventos.length
  })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en http://localhost:${PORT}`)
  console.log(`✓ Base de datos en memoria (sin MongoDB)`)
  console.log(`✓ API lista para procesar solicitudes`)
})
