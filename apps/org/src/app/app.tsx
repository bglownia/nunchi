import { TickerPnLCard } from './ticker-pnl-card';

export function App() {
  return (
    <div className="p-5">
      <div className="flex gap-2">
        <TickerPnLCard
          symbol="BTC-PERP"
          side="long" // "long" | "short"
          entryPrice={67250} // number
          size={50} // number (optional; used if you show PnL $)
        />
        <TickerPnLCard
          symbol="BTC-PERP"
          side="short" // "long" | "short"
          entryPrice={67250} // number
          size={70} // number (optional; used if you show PnL $)
        />
      </div>
    </div>
  );
}

export default App;
