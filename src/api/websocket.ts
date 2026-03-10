type PriceCallback = (symbol: string, price: number) => void;

class FinnhubSocketManager {
  private ws: WebSocket | null = null;
  private apiKey: string = 'd6no4c9r01qse5qmeiv0d6no4c9r01qse5qmeivg';
  private subscribers = new Map<string, Set<PriceCallback>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private shouldReconnect = true;

  connect(apiKey: string): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;

    this.apiKey = apiKey;
    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      this.ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

      this.ws.onopen = () => {
        console.log('[FinnhubSocket] Connected');
        this.isConnecting = false;
        this.reconnectDelay = 1000;

        this.subscribers.forEach((_, symbol) => {
          this.sendSubscribe(symbol);
        });
      };

      this.ws.onmessage = (event: WebSocketMessageEvent) => {
        try {
          console.log('[FinnhubSocket] Incoming:', event.data);
          const data = JSON.parse(event.data);
          if (data.type === 'ping') {
            this.ws?.send(JSON.stringify({ type: 'pong' }));
            return;
          }

          if (data.type === 'trade' && Array.isArray(data.data)) {
            data.data.forEach(({ s: symbol, p: price }: { s: string; p: number }) => {
              const callbacks = this.subscribers.get(symbol);
              if (callbacks) {
                callbacks.forEach((cb) => cb(symbol, price));
              }
            });
          }
        } catch (err) {
          console.warn('[FinnhubSocket] Parse error:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('[FinnhubSocket] Error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('[FinnhubSocket] Disconnected. Reconnecting...');
        this.isConnecting = false;
        if (this.shouldReconnect && this.apiKey) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      this.connect(this.apiKey);
    }, this.reconnectDelay);
  }

  private sendSubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log(`[FinnhubSocket] Subscribe -> ${symbol}`);
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  private sendUnsubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log(`[FinnhubSocket] Unsubscribe -> ${symbol}`);
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  subscribe(symbol: string, callback: PriceCallback): void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.sendSubscribe(symbol);
    }
    this.subscribers.get(symbol)!.add(callback);
  }

  unsubscribe(symbol: string, callback: PriceCallback): void {
    const callbacks = this.subscribers.get(symbol);
    if (!callbacks) return;

    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.subscribers.delete(symbol);
      this.sendUnsubscribe(symbol);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.subscribers.clear();
  }
}

export const finnhubSocket = new FinnhubSocketManager();
