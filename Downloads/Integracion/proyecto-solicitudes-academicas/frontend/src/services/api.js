import axios from 'axios'

const API_BASE = 'http://localhost:3000/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Solicitudes
export const crearSolicitud = (datos) => api.post('/solicitudes', datos)
export const listarSolicitudes = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.estado) params.append('estado', filtros.estado)
  if (filtros.tipo_clasificacion) params.append('tipo_clasificacion', filtros.tipo_clasificacion)
  return api.get(`/solicitudes?${params.toString()}`)
}
export const obtenerSolicitud = (id) => api.get(`/solicitudes/${id}`)
export const responderSolicitud = (id, respuesta, email_docente) => 
  api.post(`/solicitudes/${id}/responder`, { respuesta, email_docente })
export const agendarAsesoria = (id, datos) => 
  api.post(`/solicitudes/${id}/agendar-asesoria`, datos)

// Eventos
export const obtenerEventos = (solicitudId) => 
  api.get(`/solicitudes/${solicitudId}/eventos`)

// Estadísticas
export const obtenerEstadisticas = () => 
  api.get('/admin/sistema/estadisticas')
