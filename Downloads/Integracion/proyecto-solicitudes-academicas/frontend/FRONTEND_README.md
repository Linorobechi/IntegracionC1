# Frontend - Sistema de Solicitudes Académicas

## Descripción

Interfaz web profesional construida con **React 18** + **Vite** para el Sistema de Gestión de Solicitudes Académicas de CECAR.

## Características

✅ **Dashboard**: Panel de control con estadísticas en tiempo real
✅ **Crear Solicitud**: Formulario para registrar nuevas solicitudes académicas
✅ **Listar Solicitudes**: Visualización con filtros por estado y clasificación
✅ **Detalles**: Modal con información completa e historial de eventos
✅ **Responsive**: Diseño adaptable a diferentes dispositivos
✅ **Diseño Profesional**: Interfaz moderna con gradientes y animaciones

## Instalación

### Requisitos Previos

- **Node.js** ≥ 14 (recomendado: 16+)
- **npm** ≥ 6
- Backend ejecutándose en `http://localhost:3000`

### Pasos de Instalación

1. **Navega a la carpeta del frontend**
```bash
cd frontend
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

El navegador se abrirá automáticamente en `http://localhost:5173`

## Uso

### 1. Dashboard (📊)
- Visualiza estadísticas en tiempo real
- Muestra total de solicitudes, simples, complejas, completadas
- Se actualiza automáticamente cada 5 segundos
- Indicadores visuales con gradientes de color

### 2. Solicitudes (📋)
- **Listar**: Visualiza todas las solicitudes registradas
- **Filtros**: Filtra por tipo (simples/complejas) o estado (completadas)
- **Acciones**:
  - **Responder**: Envía respuesta directa a solicitudes simples
  - **Agendar Asesoría**: Programa asesoría para solicitudes complejas
  - **Detalles**: Ver información completa e historial de eventos
- **Modal de Detalles**: Muestra descripción completa, puntuación, respuesta y eventos

### 3. Crear Solicitud (✏️)
- **Formulario completo** con campos:
  - Nombre del estudiante
  - Email del estudiante
  - Curso/Asignatura
  - Tema específico
  - Descripción detallada
  - Nivel de urgencia (1-5)

- **Validaciones**: Campos requeridos y longitud mínima
- **Feedback**: Mensajes de éxito o error
- **Redirección**: Automáticamente va a pestaña de Solicitudes tras crear una

## API Integration

El frontend se conecta al backend en `http://localhost:3000/api/v1/` mediante **Axios**.

### Endpoints Utilizados

| Método | Endpoint | Función |
|--------|----------|---------|
| POST | `/solicitudes` | Crear solicitud |
| GET | `/solicitudes` | Listar solicitudes (con filtros) |
| GET | `/solicitudes/:id` | Obtener solicitud específica |
| POST | `/solicitudes/:id/responder` | Enviar respuesta |
| POST | `/solicitudes/:id/agendar-asesoria` | Agendar asesoría |
| GET | `/solicitudes/:id/eventos` | Obtener eventos de solicitud |
| GET | `/admin/sistema/estadisticas` | Obtener estadísticas |

### Configuración de Proxy

**Vite** está configurado para hacer proxy de `/api` al backend:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

Esto permite que el frontend en `localhost:5173` se comunique directamente con el backend en `localhost:3000` sin problemas CORS.

## Estructura de Carpetas

```
frontend/
├── src/
│   ├── App.jsx                 # Componente principal con navegación
│   ├── index.jsx               # Punto de entrada de React
│   ├── index.css               # Estilos globales y sistema de diseño
│   ├── components/
│   │   ├── FormSolicitud.jsx   # Formulario para crear solicitud
│   │   ├── ListaSolicitudes.jsx # Lista con filtros y detalles
│   │   └── Dashboard.jsx       # Panel de control con estadísticas
│   └── services/
│       └── api.js              # Cliente Axios y funciones de API
├── public/
│   └── index.html              # HTML de entrada
├── package.json                # Dependencias del proyecto
├── vite.config.js              # Configuración de Vite
└── README.md                   # Este archivo
```

## Componentes

### App.jsx
- Componente raíz que gestiona navegación entre pestañas
- Encabezado y pie de página
- Sistema de pestañas (Dashboard, Solicitudes, Crear)
- Manejo de refrescado automático

### FormSolicitud.jsx
- Formulario con validación cliente
- Manejo de estados (cargando, error, éxito)
- Reset automático tras envío exitoso
- Callback para notificar creación

### ListaSolicitudes.jsx
- Carga y visualización de solicitudes
- Filtros por clasificación y estado
- Modal de detalles con historial de eventos
- Botones de acción (Responder, Agendar, Detalles)
- Cargas de eventos asincrónicas

### Dashboard.jsx
- Tarjetas con gradientes de color
- Actualización automática cada 5 segundos
- Cálculo de porcentaje de completación
- Métricas: total, simples, complejas, completadas, pendientes

## Estilos (index.css)

Sistema de diseño completo con:

- **CSS Variables**: Tokens de color, espaciado, sombras
- **Utilidades**: .btn, .card, .badge, .form-group, .alert, .grid
- **Animaciones**: Loading spinner
- **Responsive**: Media queries para móvil/tablet
- **Colores**:
  - Primario: #2563eb (azul)
  - Éxito: #10b981 (verde)
  - Peligro: #ef4444 (rojo)
  - Advertencia: #f97316 (naranja)

## Scripts NPM

```bash
# Desarrollo
npm run dev              # Inicia servidor Vite en puerto 5173

# Producción
npm run build           # Compila para producción
npm run preview         # Previsualiza build de producción
```

## Flujo de Uso Completo

1. **Inicia el Backend**
   ```bash
   npm start  # en la raíz del proyecto
   ```

2. **Inicia el Frontend**
   ```bash
   cd frontend && npm run dev
   ```

3. **Crea una Solicitud** (pestaña "Crear Solicitud")
   - Rellena el formulario
   - Presiona "Enviar Solicitud"

4. **Visualiza el Dashboard** (pestaña "Dashboard")
   - Ve las estadísticas actualizadas
   - Observa los números cambiar en tiempo real

5. **Gestiona Solicitudes** (pestaña "Solicitudes")
   - Filtra por tipo o estado
   - Usa "Detalles" para ver eventos completos
   - Responde a solicitudes simples o agenda asesorías

## Troubleshooting

### Error: "Cannot connect to backend"
- Verifica que el backend esté ejecutándose en `http://localhost:3000`
- Revisa la consola del navegador (F12) para ver errores específicos

### Error: "Port 5173 already in use"
```bash
npm run dev -- --port 5174  # Usa otro puerto
```

### Cambios no se actualizan
- Abre DevTools (F12) y vacía caché (Ctrl+Shift+R en Windows/Linux)
- Vite tiene recarga en caliente (HMR), debería actualizarse automáticamente

### Los datos no se actualizan en Dashboard
- Verifica que las estadísticas se estén llamando cada 5 segundos
- Mira en Network (F12) si las peticiones se están haciendo

## Desarrollo

### Agregar un nuevo componente

1. Crea archivo en `src/components/MiComponente.jsx`
2. Importa en `App.jsx`
3. Usa en la JSX correspondiente

### Agregar un nuevo endpoint de API

1. Abre `src/services/api.js`
2. Agrega nueva función exportada:
   ```javascript
   export const miEndpoint = (params) => api.get('/ruta', { params })
   ```
3. Importa en el componente que lo necesite
4. Llamalo con `try/catch` para manejar errores

## Dependencias

- **react** (18.2.0): Framework UI
- **react-dom** (18.2.0): Renderizado de React
- **axios** (1.3.4): Cliente HTTP
- **vite** (4.2.0): Build tool
- **@vitejs/plugin-react** (3.1.0): Plugin React para Vite

## Notas de Sustentación

El frontend demuestra:
- ✅ Interfaz profesional y moderna
- ✅ Integración REST con backend
- ✅ Manejo de estados y efectos en React
- ✅ Validación de formularios
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Modales y componentes reutilizables
- ✅ Diseño responsive con CSS moderno
- ✅ UX clara y navegación intuitiva

---

**Desarrollado para CECAR - Corporación Universitaria del Caribe**
**Cliente técnico: React 18 + Vite | Servidor: Node.js + Express + MongoDB**
