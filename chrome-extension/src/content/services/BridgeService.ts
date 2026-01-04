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
      // Validate origin if needed (for now accept all, but filter by source)
      const data = event.data as BridgeMessage;

      if (data && data.source === 'AVIATOR_SPY' && data.type) {
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

    // Send to parent (Top Frame)
    window.parent.postMessage(message, '*');
  }

  // Listen for messages (Usually in Top Frame receiving from Iframe)
  public on<T>(type: MessageType, callback: (payload: T) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  private notifyListeners(type: MessageType, payload: any) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
  }
}

export const bridge = BridgeService.getInstance();
