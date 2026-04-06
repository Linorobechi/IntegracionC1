import React, { useState } from 'react'
import FormSolicitud from './components/FormSolicitud'
import ListaSolicitudes from './components/ListaSolicitudes'
import Dashboard from './components/Dashboard'

export default function App() {
  const [userRole, setUserRole] = useState(null) // null, 'estudiante', 'docente'
  const [pestanaActiva, setPestanaActiva] = useState('dashboard')

  // Si no ha elegido rol, mostrar pantalla de inicio
  if (!userRole) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        {/* Encabezado */}
        <header style={{
          background: '#667eea',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 5px 0' }}>Sistema de Solicitudes Académicas</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Corporación Universitaria del Caribe - CECAR</p>
        </header>

        {/* Pantalla de Selección de Rol */}
        <main style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#333', marginBottom: '10px' }}>¿Quién eres?</h2>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>Elige tu rol para acceder al sistema</p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              {/* Botón Estudiante */}
              <button
                onClick={() => {
                  setUserRole('estudiante')
                  setPestanaActiva('dashboard')
                }}
                style={{
                  padding: '20px 30px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  flex: 1,
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                }}
                onMouseOver={(e) => e.target.style.background = '#059669'}
                onMouseOut={(e) => e.target.style.background = '#10b981'}
              >
                Soy Estudiante
              </button>

              {/* Botón Docente */}
              <button
                onClick={() => {
                  setUserRole('docente')
                  setPestanaActiva('dashboard')
                }}
                style={{
                  padding: '20px 30px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  background: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  flex: 1,
                  boxShadow: '0 2px 8px rgba(249,115,22,0.3)'
                }}
                onMouseOver={(e) => e.target.style.background = '#ea580c'}
                onMouseOut={(e) => e.target.style.background = '#f97316'}
              >
                Soy Docente
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          background: '#667eea',
          color: 'white',
          textAlign: 'center',
          padding: '20px',
          fontSize: '12px',
          marginTop: '40px'
        }}>
          <p>© CECAR - Sistema de Solicitudes Académicas</p>
        </footer>
      </div>
    )
  }

  // Definir pestañas según el rol
  const tabsEstudiante = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'solicitudes', label: 'Mis Solicitudes' },
    { id: 'crear', label: 'Crear Solicitud' }
  ]

  const tabsDocente = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'solicitudes', label: ' Solicitudes Pendientes' }
  ]

  const tabs = userRole === 'estudiante' ? tabsEstudiante : tabsDocente

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Encabezado */}
      <header style={{
        background: '#667eea',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 5px 0' }}> Sistema de Solicitudes Académicas</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Corporación Universitaria del Caribe - CECAR</p>
        </div>
        <div style={{ textAlign: 'right', position: 'absolute', right: '20px' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
            {userRole === 'estudiante' ? ' Modo Estudiante' : ' Modo Docente'}
          </p>
          <button
            onClick={() => setUserRole(null)}
            style={{
              padding: '8px 15px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Cambiar Rol
          </button>
        </div>
      </header>

      {/* Navegación */}
      <nav style={{
        background: '#667eea',
        padding: '0',
        display: 'flex',
        gap: '0'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id)}
            style={{
              flex: 1,
              padding: '15px',
              background: pestanaActiva === tab.id ? 'rgba(0,0,0,0.2)' : 'transparent',
              color: 'white',
              border: 'none',
              borderBottom: pestanaActiva === tab.id ? '3px solid white' : 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: pestanaActiva === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <main style={{
        maxWidth: '1200px',
        margin: '30px auto',
        padding: '0 20px'
      }}>
        {/* VISTAS ESTUDIANTE */}
        {userRole === 'estudiante' && (
          <>
            {pestanaActiva === 'dashboard' && <Dashboard />}
            {pestanaActiva === 'solicitudes' && <ListaSolicitudes userRole={userRole} />}
            {pestanaActiva === 'crear' && (
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <FormSolicitud onSolicitudCreada={() => setPestanaActiva('solicitudes')} />
              </div>
            )}
          </>
        )}

        {/* VISTAS DOCENTE */}
        {userRole === 'docente' && (
          <>
            {pestanaActiva === 'dashboard' && <Dashboard />}
            {pestanaActiva === 'solicitudes' && <ListaSolicitudes userRole={userRole} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#667eea',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        fontSize: '12px',
        marginTop: '40px'
      }}>
        <p>© CECAR - Sistema de Solicitudes Académicas</p>
      </footer>
    </div>
  )
}
