import { BridgeMessage, MessageType } from '@src/bridge/messageTypes';

class BridgeService {
  private static instance: BridgeService;
  private listeners: Map<MessageType, Function[]> = new Map();
  private isListening = false;

  private constructor() {
    this.initListener();
  }

  public static getInstance(): BridgeService {
    if (!BridgeService.instance) {
      BridgeService.instance = new BridgeService();
    }
    return BridgeService.instance;
  }

  private initListener() {
    if (this.isListening) return;
    
    window.addEventListener('message', (event) => {
      const data = event.data as BridgeMessage;

      if (data && data.source === 'AVIATOR_SPY' && data.type) {
        console.log(`[Aviator Analyzer] Bridge: Recebido ${data.type}`);
        this.notifyListeners(data.type, data.payload);
      }
    });

    this.isListening = true;
  }

  // Send message FROM Iframe TO Top Frame
  public sendToTop<T>(type: MessageType, payload: T) {
    const message: BridgeMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'AVIATOR_SPY'
    };

    // Send to top frame (Highest window)
    if (window.top) {
        console.log(`[Aviator Analyzer] Bridge: Enviando ${type} para o topo...`);
        window.top.postMessage(message, '*');
    }
  }

  // Listen for messages (Usually in Top Frame receiving from Iframe)
  public on<T>(type: MessageType, callback: (payload: T) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
    
    // Return unsubscribe function
    return () => {
        const callbacks = this.listeners.get(type);
        if (callbacks) {
            this.listeners.set(type, callbacks.filter(cb => cb !== callback));
        }
    };
  }

  private notifyListeners(type: MessageType, payload: any) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
  }
}

export const bridge = BridgeService.getInstance();
