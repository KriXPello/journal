import { type PiniaColadaOptions } from '@pinia/colada';

export const piniaColadaConfig = {
  queryOptions: {
    staleTime: 30_000,
  },
} satisfies PiniaColadaOptions;
