import { useEffect } from 'react';
import { createMockPriceStream } from './priceStream';
import {
  QueryFunction,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

const streams: Partial<
  Record<string, ReturnType<typeof createMockPriceStream>>
> = {};

const subscribers: Partial<Record<string, number>> = {};

const queryFn: QueryFunction<number, ['price', string]> = (context) => {
  const { queryKey } = context;
  const symbol = queryKey[1];
  if (!streams[symbol]) {
    streams[symbol] = createMockPriceStream();
  }
  return new Promise<number>((resolve) => {
    streams[symbol]?.subscribe((t) => {
      context.client.setQueryData(['price', symbol], t.price);
      resolve(t.price);
    });
  });
};

export const useCurrentPrice = <T = number>(
  symbol: string,
  options: Omit<
    UseQueryOptions<number, Error, T, ['price', string]>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  const query = useQuery({
    queryKey: ['price', symbol],
    queryFn,
    ...options,
  });
  useEffect(() => {
    subscribers[symbol] = (subscribers[symbol] || 0) + 1;
    return () => {
      subscribers[symbol] = (subscribers[symbol] || 1) - 1;
      if (subscribers[symbol] === 0) {
        streams[symbol]?.close();
        delete streams[symbol];
      }
    };
  }, [symbol]);
  return query;
};
