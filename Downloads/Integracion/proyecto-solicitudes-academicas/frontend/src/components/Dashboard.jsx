import React, { useState, useEffect } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    simples: 0,
    complejas: 0,
    completada: 0,
    porcentajeCompletion: 0
  })

  useEffect(() => {
    cargarEstadisticas()
    const interval = setInterval(cargarEstadisticas, 3000)
    return () => clearInterval(interval)
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/admin/sistema/estadisticas')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.log('No se pudo conectar al backend, usando valores por defecto')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
      <div style={{ background: '#667eea', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Total de Solicitudes</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.total}</p>
      </div>

      <div style={{ background: '#10b981', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Solicitudes Simples</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.simples}</p>
      </div>

      <div style={{ background: '#f97316', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Solicitudes Complejas</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.complejas}</p>
      </div>

      <div style={{ background: '#0ea5e9', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Completadas</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.completada}</p>
      </div>

      <div style={{ background: '#8b5cf6', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>% Completadas</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{stats.porcentajeCompletion}%</p>
      </div>

      <div style={{ background: '#ec4899', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Pendientes</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>{Math.max(0, stats.total - stats.completada)}</p>
      </div>
    </div>
  )
}
