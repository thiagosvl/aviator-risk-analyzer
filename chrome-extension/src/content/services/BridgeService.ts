export enum BridgeMessageType {
  GAME_UPDATE = 'AVIATOR_ANALYZER_UPDATE',
  PING = 'AVIATOR_ANALYZER_PING',
}

export interface BridgeMessage<T = any> {
  type: BridgeMessageType;
  payload: T;
  timestamp: number;
  source: 'aviator-spy';
}

class BridgeService {
  private listeners: ((message: BridgeMessage) => void)[] = [];

  constructor() {
    this.initListener();
  }

  private initListener() {
    window.addEventListener('message', (event) => {
      // Security check: You might want to validate event.origin here if needed
      // For now, we accept all messages but filter by our custom type structure
      const data = event.data as BridgeMessage;
      
      if (data?.source === 'aviator-spy' && data.type) {
        this.notifyListeners(data);
      }
    });
  }

  /**
   * Sends a message from the iframe to the parent window
   */
  public sendToParent<T>(type: BridgeMessageType, payload: T) {
    if (window.parent && window.parent !== window) {
      const message: BridgeMessage<T> = {
        type,
        payload,
        timestamp: Date.now(),
        source: 'aviator-spy',
      };
      window.parent.postMessage(message, '*'); // TargetOrigin '*' allows any parent (convenient for extension)
    }
  }

  /**
   * Subscribe to messages (used by the Top Window / UI)
   */
  public onMessage(callback: (message: BridgeMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(message: BridgeMessage) {
    this.listeners.forEach(listener => listener(message));
  }
}

export const bridgeService = new BridgeService();
