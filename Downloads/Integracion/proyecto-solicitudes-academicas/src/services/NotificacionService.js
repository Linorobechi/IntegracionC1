const axios = require('axios');

class NotificacionService {
  /**
   * Enviar evento a MÚLTIPLES webhooks (Make + webhook.site)
   */
  async enviarWebhook(tipoEvento, datos) {
    try {
      const payload = {
        tipo_evento: tipoEvento,
        timestamp: new Date(),
        datos
      };

      // Obtener las dos URLs
      const webhookUrlMake = process.env.WEBHOOK_URL;
      const webhookUrlSite = process.env.WEBHOOK_URL_SITE;

      // Enviar a Make (si está configurado)
      if (webhookUrlMake) {
        try {
          console.log(`[WEBHOOK-MAKE] Enviando ${tipoEvento}`);
          await axios.post(webhookUrlMake, payload, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
          });
          console.log(`[WEBHOOK-MAKE] ✓ Enviado correctamente`);
        } catch (error) {
          console.error(`[WEBHOOK-MAKE] ✗ Error: ${error.message}`);
        }
      }

      // Enviar a webhook.site (si está configurado)
      if (webhookUrlSite) {
        try {
          console.log(`[WEBHOOK-SITE] Enviando ${tipoEvento}`);
          await axios.post(webhookUrlSite, payload, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
          });
          console.log(`[WEBHOOK-SITE] ✓ Enviado correctamente`);
        } catch (error) {
          console.error(`[WEBHOOK-SITE] ✗ Error: ${error.message}`);
        }
      }

      return null;
    } catch (error) {
      console.error(`[WEBHOOK] Error general: ${error.message}`);
      return null;
    }
  }

  /**
   * Notificar por email (simulado)
   */
  async enviarEmail(to, asunto, contenido) {
    console.log(`[EMAIL] Enviando a ${to}:`);
    console.log(`        Asunto: ${asunto}`);
    console.log(`        Contenido: ${contenido}`);
  }
}

module.exports = new NotificacionService();
