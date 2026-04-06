/**
 * Clasificador automático de solicitudes
 * Determina si una solicitud es simple o compleja según la urgencia
 * 
 * Lógica:
 * - Urgencia 4-5 → COMPLEJA (requiere asesoría)
 * - Urgencia 1-3 → SIMPLE (requiere respuesta directa)
 */

class ClasificadorSolicitud {
  /**
   * Clasificar una solicitud
   * @param {Object} solicitud - Solicitud con nivel_urgencia
   * @returns {Object} { clasificacion, puntuacion, razon }
   */
  clasificar(solicitud) {
    const { nivel_urgencia = 2 } = solicitud;

    // Clasificar según urgencia
    const esCompleja = nivel_urgencia >= 4;
    const clasificacion = esCompleja ? 'compleja' : 'simple';

    // Generar razón clara
    let razon = '';
    if (nivel_urgencia >= 4) {
      razon = `Urgencia ${nivel_urgencia}/5 - Requiere asesoría profesional`;
    } else {
      razon = `Urgencia ${nivel_urgencia}/5 - Puede responderse directamente`;
    }

    return {
      clasificacion,
      puntuacion: nivel_urgencia,
      razon
    };
  }
}

module.exports = new ClasificadorSolicitud();
