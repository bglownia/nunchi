export type PriceTick = { ts: number; price: number };
export function createMockPriceStream(opts?: { start?: number }) {
  let price = opts?.start ?? 67000;
  let active = true;
  const subscribers = new Set<(t: PriceTick) => void>();

  const tick = () => {
    if (!active) return;
    const drift = (Math.random() - 0.5) * 30; // random walk
    price = Math.max(100, price + drift);
    const msg = { ts: Date.now(), price: Number(price.toFixed(2)) };
    subscribers.forEach((fn) => fn(msg));
  };

  const id = setInterval(tick, 350);

  return {
    subscribe(fn: (t: PriceTick) => void) {
      subscribers.add(fn);
      fn({ ts: Date.now(), price });
      return () => subscribers.delete(fn);
    },
    pause() {
      active = false;
    },
    resume() {
      active = true;
    },
    close() {
      clearInterval(id as any);
      subscribers.clear();
    },
  };
}
