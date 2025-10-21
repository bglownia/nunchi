import { useCallback } from 'react';
import { pnlAbsFromPct, pnlPct } from './pnl';
import { useCurrentPrice } from './use-current-price';
import { usePriceFeed } from './use-price-feed';

type Position = {
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  size?: number;
};

const CurrentPrice = ({ symbol }: Pick<Position, 'symbol'>) => {
  const currentPrice = useCurrentPrice(symbol);
  return <span>{currentPrice.data}</span>;
};

const PNLPercentage = ({
  symbol,
  side,
  entryPrice,
  fractionDigits,
}: Omit<Position, 'size'> & { fractionDigits: number }) => {
  const currentPrice = useCurrentPrice(symbol, {
    select: useCallback(
      (price: number) => {
        return pnlPct(side, entryPrice, price).toFixed(fractionDigits) + '%';
      },
      [side, entryPrice, fractionDigits]
    ),
  });
  return <span>{currentPrice.data}</span>;
};

const PNLAbsolute = ({
  symbol,
  side,
  entryPrice,
  size,
  fractionDigits,
}: Position & { fractionDigits: number }) => {
  const currentPrice = useCurrentPrice(symbol, {
    select: useCallback(
      (price: number) => {
        return pnlAbsFromPct(
          pnlPct(side, entryPrice, price),
          size || 0
        ).toFixed(fractionDigits);
      },
      [side, entryPrice, size, fractionDigits]
    ),
  });
  return <span>{currentPrice.data}</span>;
};

export const TickerPnLCard = ({ symbol, side, entryPrice, size }: Position) => {
  return (
    <div className="border p-5 w-96">
      <h2 className="mb-2">
        {symbol} {side === 'long' ? '' : '-'}
        {size} @ {entryPrice}
      </h2>
      <p>
        <span className="mr-2">Current Price:</span>
        <CurrentPrice symbol={symbol} />
      </p>
      <p>
        <span className="mr-2">PNL%:</span>
        <PNLPercentage
          symbol={symbol}
          side={side}
          entryPrice={entryPrice}
          fractionDigits={2}
        />
      </p>
      <p>
        <span className="mr-2">PNL:</span>
        <PNLAbsolute
          symbol={symbol}
          side={side}
          entryPrice={entryPrice}
          size={size}
          fractionDigits={4}
        />
      </p>
    </div>
  );
};
