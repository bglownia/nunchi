import { useCallback } from 'react';
import { pnlPct } from './pnl';
import { useCurrentPrice } from './use-current-price';

type Position = {
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  size?: number;
};

const CurrentPrice = ({
  symbol,
  fractionDigits,
}: Pick<Position, 'symbol'> & { fractionDigits: number }) => {
  const currentPrice = useCurrentPrice(symbol);
  return <span>{currentPrice.data?.toFixed(fractionDigits)}</span>;
};

const useNotional = ({
  size,
  symbol,

  fractionDigits,
}: Pick<Position, 'size' | 'symbol'> & { fractionDigits: number }) =>
  useCurrentPrice(symbol, {
    select: useCallback(
      (price: number) => ((size || 0) * price).toFixed(fractionDigits),
      [size, fractionDigits]
    ),
  });

const Notional = (props: Parameters<typeof useNotional>[0]) => {
  const notional = useNotional(props);
  return <span>{notional.data || 0}</span>;
};

const usePnlPercentage = ({
  symbol,
  side,
  entryPrice,
  fractionDigits,
}: Omit<Position, 'size'> & { fractionDigits: number }) =>
  useCurrentPrice(symbol, {
    select: useCallback(
      (price: number) => {
        return pnlPct(side, entryPrice, price).toFixed(fractionDigits) + '%';
      },
      [side, entryPrice, fractionDigits]
    ),
  });

const PNLPercentage = (props: Parameters<typeof usePnlPercentage>[0]) => {
  const pnlPercentage = usePnlPercentage(props);
  return <SignColored value={pnlPercentage.data || 0} />;
};

const usePnl = ({
  symbol,
  side,
  entryPrice,
  size,
  fractionDigits,
}: Position & { fractionDigits: number }) =>
  useCurrentPrice(symbol, {
    select: useCallback(
      (price: number) =>
        (
          (price - entryPrice) *
          (side === 'long' ? 1 : -1) *
          (size || 0)
        ).toFixed(fractionDigits),
      [side, entryPrice, size, fractionDigits]
    ),
  });

const PNL = (props: Parameters<typeof usePnl>[0]) => {
  const pnl = usePnl(props);
  return <SignColored value={pnl.data || 0} />;
};

const SignColored = ({
  value,
  negative,
}: {
  value: number | string;
  negative?: boolean;
}) => {
  const valueAsString = `${value}`;
  const color =
    negative || valueAsString.startsWith('-')
      ? 'text-red-500'
      : 'text-green-500';
  return <span className={color}>{valueAsString.replace('-', '')}</span>;
};

const CardItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <>
      <dt className="mr-2">{label}</dt>
      <dd className="font-mono text-right">{value}</dd>
    </>
  );
};

export const TickerPnLCard = ({ symbol, side, entryPrice, size }: Position) => {
  return (
    <div className="border p-5 w-96">
      <h2 className="mb-2">
        <span className="mr-2">{symbol}</span>
      </h2>
      <dl className="grid grid-cols-2">
        <CardItem
          label="Size"
          value={<SignColored value={size || 0} negative={side === 'short'} />}
        />
        <CardItem
          label="Notional"
          value={<Notional symbol={symbol} size={size} fractionDigits={2} />}
        />
        <CardItem label="Entry Price" value={entryPrice.toFixed(2)} />
        <CardItem
          label="Current Price"
          value={<CurrentPrice symbol={symbol} fractionDigits={2} />}
        />
        <CardItem
          label="PNL"
          value={
            <PNL
              symbol={symbol}
              side={side}
              entryPrice={entryPrice}
              size={size}
              fractionDigits={2}
            />
          }
        />
        <CardItem
          label="PNL%"
          value={
            <PNLPercentage
              symbol={symbol}
              side={side}
              entryPrice={entryPrice}
              fractionDigits={2}
            />
          }
        />
      </dl>
    </div>
  );
};
