/**
 * SCRIPT DE PRUEBA DEL SISTEMA
 * Simula el flujo completo de solicitudes académicas
 * 
 * Uso: node tests/demo.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SolicitudService = require('../src/services/SolicitudService');
const EventBus = require('../src/events/EventBus');
const { connectDB, disconnectDB } = require('../src/config/database');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

async function demo() {
  try {
    console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
    console.log(`${colors.blue}DEMOSTRACIÓN: Sistema de Gestión de Solicitudes Académicas${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);

    // Conectar a BD
    console.log(`${colors.yellow}[1] Conectando a MongoDB...${colors.reset}`);
    await connectDB();
    console.log(`${colors.green}✓ MongoDB conectado${colors.reset}\n`);

    // DEMO 1: Solicitud Simple
    console.log(`${colors.yellow}[2] DEMO 1: Crear solicitud SIMPLE${colors.reset}`);
    console.log(`    Estudiante: María García`);
    console.log(`    Pregunta: ¿Cuál es la fórmula de la pendiente?\n`);

    const solicitud1 = await SolicitudService.crearSolicitud({
      nombre_estudiante: 'María García',
      email_estudiante: 'maria@cecar.edu.co',
      curso: 'Matemáticas I',
      tema: 'Geometría Analítica',
      descripcion: '¿Cuál es la fórmula de la pendiente?',
      nivel_urgencia: 1
    });

    console.log(`${colors.green}✓ Solicitud creada: ${solicitud1._id}${colors.reset}`);
    console.log(`  Clasificación: ${solicitud1.tipo_clasificacion}`);
    console.log(`  Estado: ${solicitud1.estado}\n`);

    // Esperar un poco para eventos
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Responder solicitud simple
    console.log(`${colors.yellow}[3] Docente responde a solicitud simple${colors.reset}`);
    const solicitudRespondida = await SolicitudService.enviarRespuesta(
      solicitud1._id,
      'La fórmula de la pendiente es m = (y2 - y1) / (x2 - x1). Esta mide la inclinación de una línea recta.',
      'docente@cecar.edu.co'
    );

    console.log(`${colors.green}✓ Respuesta enviada${colors.reset}`);
    console.log(`  Estado: ${solicitudRespondida.estado}\n`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // DEMO 2: Solicitud Compleja
    console.log(`${colors.yellow}[4] DEMO 2: Crear solicitud COMPLEJA${colors.reset}`);
    console.log(`    Estudiante: Carlos Rodríguez`);
    console.log(`    Problema: No puedo implementar un algoritmo de ordenamiento\n`);

    const solicitud2 = await SolicitudService.crearSolicitud({
      nombre_estudiante: 'Carlos Rodríguez',
      email_estudiante: 'carlos@cecar.edu.co',
      curso: 'Programación I',
      tema: 'Algoritmos de Ordenamiento',
      descripcion: 'Hola, necesito ayuda con mi proyecto de algoritmos. Estoy intentando implementar un quicksort pero no funciona correctamente. He revisado el código varias veces y no encuentro el error. ¿Me puedes ayudar a depurarlo?',
      nivel_urgencia: 4
    });

    console.log(`${colors.green}✓ Solicitud creada: ${solicitud2._id}${colors.reset}`);
    console.log(`  Clasificación: ${solicitud2.tipo_clasificacion}`);
    console.log(`  Estado: ${solicitud2.estado}\n`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Agendar asesoría
    console.log(`${colors.yellow}[5] Sistema programa asesoría para solicitud compleja${colors.reset}`);
    
    const fechaAsesoria = new Date();
    fechaAsesoria.setDate(fechaAsesoria.getDate() + 2); // 2 días después
    fechaAsesoria.setHours(14, 0, 0, 0);

    const asesoria = await SolicitudService.programarAsesoria(
      solicitud2._id,
      {
        docente_id: 'DOC-001',
        email_docente: 'docente@cecar.edu.co',
        fecha_programada: fechaAsesoria,
        modalidad: 'virtual',
        ubicacion: 'https://zoom.us/j/123456789'
      }
    );

    console.log(`${colors.green}✓ Asesoría programada${colors.reset}`);
    console.log(`  Fecha: ${asesoria.fecha_programada.toLocaleString()}`);
    console.log(`  Modalidad: ${asesoria.modalidad}`);
    console.log(`  Link: ${asesoria.ubicacion}\n`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // DEMO 3: Obtener estadísticas
    console.log(`${colors.yellow}[6] Estadísticas del sistema${colors.reset}`);
    const stats = await SolicitudService.obtenerEstadisticas();
    
    console.log(`${colors.green}✓ Datos ${colors.reset}`);
    console.log(`  Total de solicitudes: ${stats.total}`);
    console.log(`  Solicitudes simples: ${stats.simples}`);
    console.log(`  Solicitudes complejas: ${stats.complejas}`);
    console.log(`  Completadas: ${stats.completadas}`);
    console.log(`  % Completadas: ${stats.porcentajeCompletion}%\n`);

    // DEMO 4: Obtener eventos
    console.log(`${colors.yellow}[7] Eventos generados para solicitud 1${colors.reset}`);
    const eventos1 = await SolicitudService.obtenerEventosSolicitud(solicitud1._id.toString());
    
    console.log(`${colors.green}✓ Eventos (${eventos1.length} total)${colors.reset}`);
    for (let i = 0; i < eventos1.length; i++) {
      console.log(`  ${i + 1}. ${eventos1[i].tipo}`);
    }
    console.log();

    // DEMO 5: Consultar solicitudes por estudiante
    console.log(`${colors.yellow}[8] Solicitudes del estudiante María García${colors.reset}`);
    const solicitudesMaría = await SolicitudService.listarSolicitudesEstudiante('maria@cecar.edu.co');
    
    console.log(`${colors.green}✓ Encontradas ${solicitudesMaría.length} solicitud(es)${colors.reset}`);
    solicitudesMaría.forEach(s => {
      console.log(`  - ${s.tema} (${s.tipo_clasificacion})`);
    });
    console.log();

    console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}`);
    console.log(`${colors.green}✓ DEMOSTRACIÓN COMPLETADA EXITOSAMENTE${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(70)}\n`);

    // Desconectar
    await disconnectDB();

  } catch (error) {
    console.error(`${colors.red}✗ Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Ejecutar demostración
demo();
