# 📋 DOCUMENTO DE ENTREGA
## Sistema de Gestión de Solicitudes Académicas - CECAR

**Grupo:** [Nombre del grupo]  
**Institución:** Corporación Universitaria del Caribe - CECAR  
**Fecha:** 3 de abril de 2026  
**Versión del Sistema:** 1.0  

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Definición de API REST](#definición-de-api-rest)
4. [Definición de Eventos](#definición-de-eventos)
5. [Reglas de Clasificación](#reglas-de-clasificación)
6. [Interoperabilidad](#interoperabilidad)
7. [Conclusiones](#conclusiones)

---

## RESUMEN EJECUTIVO

### Problema Identificado
En CECAR, las solicitudes académicas de estudiantes no cuentan con un sistema estructurado que:
- Gestione solicitudes de manera oportuna
- Clasifique consultas automáticamente
- Proporcione seguimiento y trazabilidad
- Implemente notificaciones automáticas

### Solución Propuesta
Un **sistema digital basado en eventos e interoperabilidad** que:
- Automatiza el registro y clasificación de solicitudes
- Diferencia entre consultas simples (respuesta directa) y complejas (asesoría)
- Genera eventos para cada cambio importante
- Proporciona API REST para integración con otros sistemas
- Emite webhooks para notificación a sistemas externos

### Beneficios
✅ **Respuesta más rápida** a consultas de estudiantes  
✅ **Clasificación automática** reduciendo trabajo manual  
✅ **Trazabilidad completa** mediante eventos  
✅ **Interoperabilidad** con otros sistemas CECAR  
✅ **Dashboard en tiempo real** para seguimiento  

---

## ARQUITECTURA DEL SISTEMA

### 3.1 Diagrama Arquitectónico

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend React)                  │
│              (Estudiantes / Docentes / Admins)              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/JSON
┌────────────────────────▼────────────────────────────────────┐
│                   API REST (Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /solicitudes │  │  /admin      │  │ /health      │      │
│  │              │  │  /estadisticas
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────┐
│            SERVICIOS DE NEGOCIO                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • SolicitudService (CRUD)                          │   │
│  │ • ClasificadorService (análisis automático)        │   │
│  │ • NotificacionService (envíos de notificaciones)   │   │
│  │ • EventBus (emisión de eventos)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────────────────────────────┬──┘
             │                                              │
    ┌────────▼─────────┐                        ┌──────────▼────┐
    │   MongoDB        │                        │  Event Bus    │
    │                  │                        │ (En memoria)   │
    │ • Solicitudes    │                        │               │
    │ • Eventos        │                        │ • Listeners   │
    │ • Asesorías      │                        │ • Emitters    │
    │                  │                        │               │
    └──────────────────┘                        └────────────────┘
```

### 3.2 Componentes Principales

| Componente | Tecnología | Responsabilidad |
|-----------|-----------|---|
| **Frontend** | React 18.2 + Vite 4.2 | Interfaz de usuario, formularios, dashboards |
| **Backend API** | Node.js + Express.js | Gestión de solicitudes, lógica de negocio |
| **Base de Datos** | MongoDB | Persistencia de solicitudes, eventos, asesorías |
| **Event Bus** | JavaScript (En memoria) | Emisión/escucha de eventos, desacoplamiento de servicios |
| **Clasificador** | ClasificadorService | Análisis automático de urgencia |

---

## DEFINICIÓN DE API REST

### Información General
- **URL Base:** `http://localhost:3000/api/v1`
- **Formato:** JSON
- **Autenticación:** Bearer Token (en producción)
- **Error Status:** 400 (Bad Request), 404 (Not Found), 500 (Server Error)

### Endpoints

#### 1️⃣ Crear Solicitud
```
POST /solicitudes
Content-Type: application/json

REQUEST:
{
  "nombre_estudiante": "Juan Pérez",
  "curso": "Programación I",
  "tema": "Bucles en Python",
  "descripcion": "No entiendo cómo funcionan los bucles for",
  "nivel_urgencia": 2
}

RESPONSE (201 Created):
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre_estudiante": "Juan Pérez",
  "curso": "Programación I",
  "tema": "Bucles en Python",
  "descripcion": "No entiendo cómo funcionan los bucles for",
  "nivel_urgencia": 2,
  "tipo_clasificacion": "simple",
  "estado": "pendiente",
  "fecha_creacion": "2026-04-03T10:30:00Z"
}
```

#### 2️⃣ Obtener Todas las Solicitudes
```
GET /solicitudes
RESPONSE (200 OK): [{ solicitud }, { solicitud }, ...]
```

#### 3️⃣ Obtener Solicitud por ID
```
GET /solicitudes/:id
RESPONSE (200 OK): { solicitud }
```

#### 4️⃣ Responder Solicitud (Docente - Simple)
```
POST /solicitudes/:id/responder
Content-Type: application/json

REQUEST:
{
  "respuesta": "Los bucles for recorren elementos de una secuencia...",
  "email_docente": "docente@cecar.edu.co"
}

RESPONSE (200 OK):
{
  "_id": "507f1f77bcf86cd799439011",
  "estado": "completada",
  "respuesta": "Los bucles for recorren elementos...",
  "fecha_respuesta": "2026-04-03T10:31:00Z"
}
```

#### 5️⃣ Agendar Asesoría (Docente - Compleja)
```
POST /solicitudes/:id/agendar-asesoria
Content-Type: application/json

REQUEST:
{
  "fecha": "2026-04-04T14:00:00Z",
  "docente_id": "507f1f77bcf86cd799439012",
  "respuesta": "He revisado tu solicitud. Necesitamos una asesoría para revisar tu código..."
}

RESPONSE (200 OK):
{
  "_id": "507f1f77bcf86cd799439011",
  "estado": "completada",
  "asesoria_id": "507f1f77bcf86cd799439013",
  "fecha_asesoria": "2026-04-04T14:00:00Z"
}
```

#### 6️⃣ Obtener Estadísticas
```
GET /admin/sistema/estadisticas
RESPONSE (200 OK):
{
  "total_solicitudes": 15,
  "solicitudes_simples": 9,
  "solicitudes_complejas": 6,
  "solicitudes_completadas": 12,
  "solicitudes_pendientes": 3,
  "porcentaje_completadas": 80.0
}
```

#### 7️⃣ Eliminar Solicitud
```
DELETE /solicitudes/:id
RESPONSE (200 OK): { message: "Solicitud eliminada correctamente" }
```

---

## DEFINICIÓN DE EVENTOS

El sistema emite eventos para permitir auditoría completa y integración con sistemas externos.

### Tipos de Eventos Emitidos

#### 🔔 evento: `solicitud_creada`
**Cuándo:** Cuando un estudiante crea una nueva solicitud  
**Propósito:** Registrar inicio de proceso

```json
{
  "tipo": "solicitud_creada",
  "timestamp": "2026-04-03T10:30:00Z",
  "datos": {
    "solicitud_id": "507f1f77bcf86cd799439011",
    "nombre_estudiante": "Juan Pérez",
    "curso": "Programación I",
    "tema": "Bucles en Python",
    "nivel_urgencia": 2
  }
}
```

#### 🔔 Evento: `solicitud_clasificada`
**Cuándo:** Inmediatamente después de clasificarse  
**Propósito:** Registrar decisión del clasificador

```json
{
  "tipo": "solicitud_clasificada",
  "timestamp": "2026-04-03T10:30:05Z",
  "datos": {
    "solicitud_id": "507f1f77bcf86cd799439011",
    "clasificacion": "simple",
    "puntuacion": 2,
    "razon": "Urgencia 2/5 - Puede responderse directamente"
  }
}
```

#### 🔔 Evento: `respuesta_directa_enviada`
**Cuándo:** Cuando docente responde una solicitud simple  
**Propósito:** Registrar resolución de consulta

```json
{
  "tipo": "respuesta_directa_enviada",
  "timestamp": "2026-04-03T10:31:00Z",
  "datos": {
    "solicitud_id": "507f1f77bcf86cd799439011",
    "email_docente": "docente@cecar.edu.co",
    "tipo_respuesta": "respuesta_directa"
  }
}
```

#### 🔔 Evento: `requiere_asesoria`
**Cuándo:** Cuando se clasifica como compleja  
**Propósito:** Notificar que requiere asesoría profesional

```json
{
  "tipo": "requiere_asesoria",
  "timestamp": "2026-04-03T10:30:05Z",
  "datos": {
    "solicitud_id": "507f1f77bcf86cd799439011",
    "clasificacion": "compleja",
    "puntuacion": 4,
    "razon": "Urgencia 4/5 - Requiere asesoría profesional"
  }
}
```

#### 🔔 Evento: `asesoria_programada`
**Cuándo:** Cuando docente agenda una asesoría  
**Propósito:** Confirmar programación de cita

```json
{
  "tipo": "asesoria_programada",
  "timestamp": "2026-04-03T10:32:00Z",
  "datos": {
    "solicitud_id": "507f1f77bcf86cd799439011",
    "asesoria_id": "507f1f77bcf86cd799439013",
    "fecha": "2026-04-04T14:00:00Z",
    "docente_id": "507f1f77bcf86cd799439012"
  }
}
```

---

## REGLAS DE CLASIFICACIÓN

### Algoritmo de Clasificación

La clasificación automática es simple y se basa en el **nivel de urgencia indicado por el estudiante**:

```
SI nivel_urgencia >= 4:
    tipo_clasificacion = "compleja"  → Requiere asesoría
SINO (nivel_urgencia 1-3):
    tipo_clasificacion = "simple"    → Respuesta directa
```

### Escala de Urgencia

| Nivel | Descripción | Clasificación | Acción |
|-------|-------------|---|---|
| 1 | Baja | Simple | Respuesta directa en 24h |
| 2 | Baja-Media | Simple | Respuesta directa en 12h |
| 3 | Media | Simple | Respuesta detallada en 6h |
| 4 | Alta | Compleja | Agendar asesoría en 2h |
| 5 | Crítica | Compleja | Asesoría inmediata |

### Ejemplos de Aplicación

**Ejemplo 1: Solicitud Simple**
```
Entrada:
- Estudiante: "¿Qué es recursión?"
- Nivel urgencia: 1

Salida:
- Clasificación: SIMPLE
- Acción: Docente responde directamente
- Respuesta esperada: "Recursión es cuando una función se llama a sí misma..."
```

**Ejemplo 2: Solicitud Compleja**
```
Entrada:
- Estudiante: "¡URGENTE! Mi proyecto no funciona, tiene 5 errores"
- Nivel urgencia: 5

Salida:
- Clasificación: COMPLEJA
- Acción: Docente agenda asesoría inmediata
- Resultado: Asesoría profesional 1-a-1
```

---

## INTEROPERABILIDAD

### Nivel Técnico (HTTP + JSON)

**Protocolo:** HTTP/HTTPS  
**Método:** REST (GET, POST, PUT, DELETE)  
**Formato:** JSON  
**Encoding:** UTF-8  

**Ejemplo de integración:**
```bash
# Un sistema externo puede crear una solicitud
curl -X POST http://localhost:3000/api/v1/solicitudes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_estudiante": "Ana García",
    "curso": "Matemáticas",
    "tema": "Derivadas",
    "descripcion": "No entiendo la regla de la cadena",
    "nivel_urgencia": 2
  }'
```

### Nivel Sintáctico (Estructura de Datos)

Estructura estándar de solicitud validada:

```json
{
  "_id": "607f1f77bcf86cd799439011",        // ID único (MongoDB ObjectId)
  "nombre_estudiante": "string",             // [Requerido] 3-100 caracteres
  "curso": "string",                         // [Requerido] Nombre asignatura
  "tema": "string",                          // [Requerido] Unidad específica
  "descripcion": "string",                   // [Requerido] 10-1000 caracteres
  "nivel_urgencia": "number",                // [Requerido] 1-5
  "email_estudiante": "string",              // Email válido
  "tipo_clasificacion": "simple|compleja",   // Resultado automático
  "puntuacion_clasificacion": "number",      // 1-5 (mismo que urgencia)
  "estado": "pendiente|completada",          // Estado actual
  "respuesta": "string",                     // Respuesta docente (si aplica)
  "asesoria_id": "ObjectId",                 // Si requiere asesoría
  "fecha_creacion": "ISO 8601",              // Timestamp
  "fecha_respuesta": "ISO 8601",             // Cuando fue respondida
  "email_docente": "string"                  // Docente responsable
}
```

### Nivel Semántico (Definiciones de Negocio)

**Consulta Simple:**
- Pregunta que puede ser resuelta con respuesta directa
- Requiere < 15 minutos de docente
- Ejemplos: definiciones, fórmulas, conceptos básicos

**Consulta Compleja:**
- Requiere análisis profundo o revisión personalizada
- Requiere > 30 minutos de docente
- Ejemplos: revisión de código, análisis de proyectos, depuración

### Nivel Organizacional (Roles y Flujos)

#### Roles del Sistema

**ESTUDIANTE:**
- Crear solicitudes académicas
- Ver estado de sus solicitudes
- Recibir respuestas y notificaciones
- Asistir a asesorías agendadas

**DOCENTE:**
- Ver solicitudes asignadas
- Responder solicitudes simples
- Agendar asesorías para complejas
- Proporcionar retroalimentación

**ADMINISTRADOR:**
- Acceder a todas las solicitudes
- Generar reportes y estadísticas
- Configurar parámetros del sistema
- Ver auditoría completa

#### Flujo Estándar de Solicitud Simple

```
1. ESTUDIANTE crea solicitud (urgencia 1-3)
   ↓
2. SISTEMA clasifica automáticamente como "simple"
   ↓ [EVENTO: solicitud_creada, solicitud_clasificada]
3. DOCENTE recibe notificación
   ↓
4. DOCENTE lee solicitud en dashboard
   ↓
5. DOCENTE redacta respuesta directa
   ↓
6. DOCENTE envía respuesta
   ↓ [EVENTO: respuesta_directa_enviada]
7. SISTEMA marca como "completada"
   ↓
8. ESTUDIANTE recibe notificación con respuesta
   ↓
9. ESTUDIANTE puede ver historial de eventos
```

#### Flujo Estándar de Solicitud Compleja

```
1. ESTUDIANTE crea solicitud (urgencia 4-5)
   ↓
2. SISTEMA clasifica automáticamente como "compleja"
   ↓ [EVENTO: solicitud_creada, solicitud_clasificada, requiere_asesoria]
3. DOCENTE recibe notificación
   ↓
4. DOCENTE revisa solicitud
   ↓
5. DOCENTE agenda asesoría en calendario
   ↓ [EVENTO: asesoria_programada]
6. DOCENTE proporciona fecha y detalles
   ↓
7. ESTUDIANTE recibe confirmación con hora
   ↓
8. DOCENTE y ESTUDIANTE se reúnen en asesoría
   ↓
9. SISTEMA marca como "completada"
   ↓
10. Auditoría completa disponible con todos los eventos
```

---

## CONCLUSIONES

### Logros Alcanzados

✅ **Sistema completamente funcional** que cumple todos los requisitos  
✅ **Automatización inteligente** mediante clasificación basada en urgencia  
✅ **Trazabilidad completa** con 5 tipos de eventos  
✅ **API REST interoperable** con estructura JSON estándar  
✅ **Interfaz web intuitiva** para estudiantes y docentes  
✅ **Dashboard en tiempo real** con estadísticas actualizadas  

### Ventajas del Diseño

1. **Simplicidad:** Clasificación clara basada en un solo criterio (urgencia)
2. **Escalabilidad:** Arquitectura de servicios permite agregar funcionalidades
3. **Interoperabilidad:** API REST estándar permite integración con otros sistemas
4. **Auditoría:** Todos los cambios quedan registrados como eventos
5. **Usabilidad:** Interfaz clara tanto para estudiantes como para docentes

### Impacto Esperado

- **Para estudiantes:** Respuestas más rápidas y clasificación justa
- **Para docentes:** Mejor organización del tiempo y claridad de prioridades
- **Para CECAR:** Mejor servicio académico y datos para mejora continua

### Recomendaciones Futuras

1. Implementar autenticación OAuth/OIDAC para integración con sistema CECAR
2. Agregar notificaciones por email automáticas
3. Historial de asesorías para análisis de patrones
4. Machine learning para mejorar clasificación
5. Integración con Google Calendar para coordinación de asesorías

### Observaciones Finales

El sistema demuestra el valor de la **interoperabilidad mediante eventos**. Cada componente es independiente pero comunica cambios importantes, permitiendo que otros sistemas se enteren en tiempo real sin acoplamiento. Esto es la base de arquitecturas modernas escalables.

---

**Documento preparado para sustentación**  
**CECAR - Abril 2026**

