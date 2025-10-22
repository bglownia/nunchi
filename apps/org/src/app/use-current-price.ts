import { useEffect } from 'react';
import { createMockPriceStream } from './priceStream';
import {
  QueryClient,
  QueryFunction,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

const streams: Partial<
  Record<string, ReturnType<typeof createMockPriceStream>>
> = {};

const subscribers: Partial<Record<string, number>> = {};

const subscriptions: Partial<Record<string, () => void>> = {};
const unsubscribe = (symbol: string) => {
  subscriptions[symbol]?.();
  delete subscriptions[symbol];
};
const subscribe = (
  symbol: string,
  client: QueryClient,
  resolve?: (price: number) => void
) => {
  if (!streams[symbol]) {
    streams[symbol] = createMockPriceStream();
  }
  if (subscriptions[symbol]) {
    return;
  }
  subscriptions[symbol] = streams[symbol]?.subscribe((t) => {
    client.setQueryData(['price', symbol], t.price);
    resolve?.(t.price);
  });
};

const registerSubscriber = (symbol: string, client: QueryClient) => {
  subscribers[symbol] = (subscribers[symbol] || 0) + 1;
  subscribe(symbol, client);
  return () => {
    subscribers[symbol] = (subscribers[symbol] || 1) - 1;
    if (subscribers[symbol] === 0) {
      unsubscribe(symbol);
    }
  };
};

const queryFn: QueryFunction<number, ['price', string]> = (context) => {
  return new Promise<number>((resolve) => {
    subscribe(context.queryKey[1], context.client, resolve);
  });
};

export const useCurrentPrice = <T = number>(
  symbol: string,
  options: Omit<
    UseQueryOptions<number, Error, T, ['price', string]>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['price', symbol],
    queryFn,
    ...options,
  });
  useEffect(() => registerSubscriber(symbol, client), [symbol, client]);
  return query;
};
