/**
 * Event Bus - Sistema de emisión y escucha de eventos
 * Permite que diferentes servicios se comuniquen sin acoplamiento
 */

class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Suscribirse a un evento
   * @param {string} eventType - Tipo de evento
   * @param {Function} callback - Función a ejecutar
   */
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  /**
   * Emitir un evento
   * @param {string} eventType - Tipo de evento
   * @param {Object} data - Datos del evento
   */
  async emit(eventType, data) {
    console.log(`[EVENT] ${eventType} emitido`, JSON.stringify(data, null, 2));
    
    if (this.listeners[eventType]) {
      for (const callback of this.listeners[eventType]) {
        try {
          await callback(data);
        } catch (error) {
          console.error(`Error en listener de ${eventType}:`, error.message);
        }
      }
    }
  }

  /**
   * Desuscribirse de un evento
   * @param {string} eventType - Tipo de evento
   * @param {Function} callback - Función a remover
   */
  off(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        listener => listener !== callback
      );
    }
  }

  /**
   * Limpiar todos los listeners
   */
  clear() {
    this.listeners = {};
  }
}

// Instancia global del EventBus
module.exports = new EventBus();
