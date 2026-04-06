import React, { useState } from 'react'

export default function FormSolicitud({ onSolicitudCreada }) {
  const [formData, setFormData] = useState({
    nombre_estudiante: '',
    email_estudiante: '',
    curso: '',
    tema: '',
    descripcion: '',
    nivel_urgencia: 2
  })
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nivel_urgencia' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    try {
      const response = await fetch('http://localhost:3000/api/v1/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMensaje({ tipo: 'éxito', texto: `Solicitud creada exitosamente (ID: ${data.solicitud._id})` })
        setFormData({
          nombre_estudiante: '',
          email_estudiante: '',
          curso: '',
          tema: '',
          descripcion: '',
          nivel_urgencia: 2
        })
        
        if (onSolicitudCreada) {
          setTimeout(() => onSolicitudCreada(), 500)
        }
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al crear solicitud' })
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor' })
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>Crear Nueva Solicitud</h2>
      
      {mensaje && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '4px',
          background: mensaje.tipo === 'éxito' ? '#d1fae5' : '#fee2e2',
          color: mensaje.tipo === 'éxito' ? '#065f46' : '#991b1b'
        }}>
          {mensaje.texto}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nombre del Estudiante *</label>
          <input
            type="text"
            name="nombre_estudiante"
            value={formData.nombre_estudiante}
            onChange={handleChange}
            placeholder="Ej: Juan Pérez"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input
            type="email"
            name="email_estudiante"
            value={formData.email_estudiante}
            onChange={handleChange}
            placeholder="Ej: juan@cecar.edu.co"
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Curso *</label>
          <input
            type="text"
            name="curso"
            value={formData.curso}
            onChange={handleChange}
            placeholder="Ej: Programación I"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Tema *</label>
          <input
            type="text"
            name="tema"
            value={formData.tema}
            onChange={handleChange}
            placeholder="Ej: Bucles en Python"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Descripción *</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Describe tu duda en detalle..."
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', minHeight: '100px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Urgencia (1-5) *</label>
          <select
            name="nivel_urgencia"
            value={formData.nivel_urgencia}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="1">1 - Baja</option>
            <option value="2">2 - Media-Baja</option>
            <option value="3">3 - Media</option>
            <option value="4">4 - Alta</option>
            <option value="5">5 - Crítica</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            width: '100%',
            padding: '10px',
            background: cargando ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: cargando ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {cargando ? 'Enviando...' : 'Enviar Solicitud'}
        </button>
      </form>
    </div>
  )
}
