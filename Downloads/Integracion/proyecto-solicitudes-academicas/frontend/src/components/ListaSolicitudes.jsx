import React, { useState, useEffect } from 'react'

export default function ListaSolicitudes({ userRole = 'estudiante' }) {
  const [solicitudes, setSolicitudes] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [cargando, setCargando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)
  const [respuesta, setRespuesta] = useState('')
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false)

  useEffect(() => {
    cargarSolicitudes()
    // Recargar cada 3 segundos
    const interval = setInterval(cargarSolicitudes, 3000)
    return () => clearInterval(interval)
  }, [filtro])

  const cargarSolicitudes = async () => {
    setCargando(true)
    try {
      const url = filtro === 'todas' 
        ? 'http://localhost:3000/api/v1/solicitudes'
        : `http://localhost:3000/api/v1/solicitudes?tipo_clasificacion=${filtro}`
      
      const response = await fetch(url)
      const data = await response.json()
      setSolicitudes(data.solicitudes || [])
    } catch (err) {
      console.error('Error cargando solicitudes:', err)
    } finally {
      setCargando(false)
    }
  }

  const eliminarSolicitud = async (id, nombre, e) => {
    e.stopPropagation()
    if (window.confirm(`¿Eliminar la solicitud de ${nombre}?`)) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/solicitudes/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          alert('Solicitud eliminada')
          cargarSolicitudes()
        } else {
          alert('Error al eliminar solicitud')
        }
      } catch (err) {
        console.error('Error:', err)
        alert('Error al eliminar solicitud')
      }
    }
  }

  const abrirModal = async (solicitud) => {
    try {
      console.log('=== ABRIENDO MODAL ===')
      console.log('Solicitud inicial:', solicitud)
      
      // Primer: mostrar la solicitud mientras cargamos datos frescos
      setSolicitudSeleccionada(solicitud)
      setRespuesta('')
      setModalAbierto(true)

      // Luego: fetch datos frescos del servidor
      console.log('Fetching solicitud fresca con ID:', solicitud._id)
      const response = await fetch(`http://localhost:3000/api/v1/solicitudes/${solicitud._id}`)
      
      if (!response.ok) {
        console.error('Error en fetch:', response.status)
        return
      }
      
      const solicitudFresca = await response.json()
      console.log('Solicitud fresca recibida:',  {
        id: solicitudFresca._id,
        estado: solicitudFresca.estado,
        respuesta: solicitudFresca.respuesta ? 'SÍ TIENE' : 'NO TIENE'
      })
      
      // Actualizar con datos frescos del servidor
      setSolicitudSeleccionada(solicitudFresca)
    } catch (err) {
      console.error('Error cargando solicitud fresca:', err)
    }
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setSolicitudSeleccionada(null)
    setRespuesta('')
  }

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) {
      alert('Por favor escribe una respuesta')
      return
    }

    setEnviandoRespuesta(true)
    try {
      // Determinar endpoint según clasificación automática
      const endpoint = solicitudSeleccionada.tipo_clasificacion === 'simple' 
        ? 'responder' 
        : 'agendar-asesoria'

      const payload = {
        respuesta: respuesta,
        fecha_programada: new Date().toISOString().split('T')[0],
        email_docente: 'docente@cecar.edu.co'
      }

      console.log('[Frontend] Enviando al endpoint:', endpoint);
      console.log('[Frontend] Payload:', payload);

      const response = await fetch(
        `http://localhost:3000/api/v1/solicitudes/${solicitudSeleccionada._id}/${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      const data = await response.json()
      console.log('[Frontend] Respuesta del servidor:', data);

      if (response.ok) {
        
        // El servidor devuelve diferentes estructuras según el endpoint
        const respuestaData = data.solicitud || data;
        
        console.log('[Frontend] RespuestaData extraída:', respuestaData);
        console.log('[Frontend] Respuesta guardada:', respuestaData.respuesta ? 'SÍ' : 'NO');

        // Actualizar el estado local INMEDIATAMENTE para ver el cambio en tiempo real
        setSolicitudSeleccionada({
          ...solicitudSeleccionada,
          respuesta: respuestaData.respuesta || respuesta,
          estado: respuestaData.estado || 'completada',
          fecha_respuesta: respuestaData.fecha_respuesta || new Date().toISOString(),
          email_docente: respuestaData.email_docente || 'docente@cecar.edu.co'
        })
        
        setRespuesta('')
        
        const tipoRespuesta = solicitudSeleccionada.tipo_clasificacion === 'simple' 
          ? 'Respuesta enviada'
          : '📅 Asesoría agendada'
        alert(tipoRespuesta)
        
        // Recargar la lista en background (sin cerrar el modal)
        cargarSolicitudes()
      } else {
        alert('Error al enviar respuesta')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error al enviar respuesta')
    } finally {
      setEnviandoRespuesta(false)
    }
  }

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>Solicitudes Académicas</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['todas', 'simple', 'compleja'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '8px 16px',
              background: filtro === f ? '#667eea' : '#f0f0f0',
              color: filtro === f ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {cargando && <p>Cargando...</p>}

      {solicitudes.length === 0 && !cargando ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
          {filtro === 'todas' ? 'No hay solicitudes registradas aún' : `No hay solicitudes ${filtro}s`}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
          {solicitudes.map(s => (
            <div 
              key={s._id}
              onClick={() => abrirModal(s)}
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                background: s.tipo_clasificacion === 'simple' ? '#f0f9ff' : '#fef3c7',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{s.nombre_estudiante}</h3>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                <strong>{s.curso}</strong>
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                Tema: {s.tema}
              </p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  background: s.tipo_clasificacion === 'simple' ? '#10b981' : '#f97316',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {s.tipo_clasificacion?.toUpperCase() || 'PENDIENTE'}
                </span>
                <span style={{
                  background: '#e5e7eb',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {s.estado}
                </span>
                <button
                  onClick={(e) => eliminarSolicitud(s._id, s.nombre_estudiante, e)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para responder */}
      {modalAbierto && solicitudSeleccionada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, color: '#667eea' }}>
              {solicitudSeleccionada.estado === 'completada' && solicitudSeleccionada.respuesta
                ? 'Solicitud Respondida' 
                : solicitudSeleccionada.tipo_clasificacion === 'simple' 
                  ? 'Responder Solicitud' 
                  : 'Información de Asesoria'}
            </h2>

            <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '6px' }}>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Estudiante:</strong> {solicitudSeleccionada.nombre_estudiante}
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Email:</strong> {solicitudSeleccionada.email_estudiante}
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Curso:</strong> {solicitudSeleccionada.curso}
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Tema:</strong> {solicitudSeleccionada.tema}
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Urgencia:</strong> {solicitudSeleccionada.nivel_urgencia}/5
              </p>
            </div>

            <div style={{ marginBottom: '20px', background: '#fafafa', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #667eea' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                <strong>Descripción de la solicitud:</strong>
              </p>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#333' }}>
                {solicitudSeleccionada.descripcion}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              {solicitudSeleccionada.estado === 'completada' && solicitudSeleccionada.respuesta ? (
                // Mostrar respuesta ya enviada
                <div style={{ background: '#d4edda', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #28a745' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold', color: '#155724' }}>
                    RESPUESTA ENVIADA
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                    <strong>Docente:</strong> {solicitudSeleccionada.email_docente || 'docente@cecar.edu.co'}
                  </p>
                  {solicitudSeleccionada.fecha_respuesta && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                      <strong>Fecha:</strong> {new Date(solicitudSeleccionada.fecha_respuesta).toLocaleDateString('es-ES')}
                    </p>
                  )}
                  <div style={{ marginTop: '10px', background: 'white', padding: '12px', borderRadius: '4px' }}>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
                      {solicitudSeleccionada.respuesta}
                    </p>
                  </div>
                </div>
              ) : userRole === 'docente' ? (
                // DOCENTE: Mostrar formulario para responder
                <>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    {solicitudSeleccionada.tipo_clasificacion === 'simple' 
                      ? 'Tu respuesta:' 
                      : 'Detalles de la asesoría:'}
                  </label>
                  <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder={solicitudSeleccionada.tipo_clasificacion === 'simple' 
                      ? 'Escribe tu respuesta a esta solicitud...' 
                      : 'Proporciona detalles de la asesoría (fecha, hora, plataforma, enlace zoom, etc)...'}
                    style={{
                      width: '100%',
                      minHeight: '140px',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontFamily: 'Arial',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </>
              ) : (
                // ESTUDIANTE: Mostrar mensaje de pendiente
                <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #ff9800' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#856404', fontWeight: '500' }}>
                    Pendiente de respuesta del docente
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {userRole === 'docente' && solicitudSeleccionada.estado !== 'completada' && !solicitudSeleccionada.respuesta && (
                <button
                  onClick={enviarRespuesta}
                  disabled={enviandoRespuesta}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: enviandoRespuesta ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: enviandoRespuesta ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}
                >
                  {enviandoRespuesta ? 'Enviando...' : 'Enviar Respuesta'}
                </button>
              )}
              <button
                onClick={cerrarModal}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}
              >
                {solicitudSeleccionada.estado === 'completada' ? 'Cerrar' : 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
