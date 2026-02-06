import type { InjectionKey } from 'vue';
import type { DateObject, CalculationDay, Calculation } from '~/types/entities';

export type PayloadCalculationDayCreateOrUpdate = {
  date: DateObject;
  calculations: Calculation[];
};

export type RepositoryCalculationDay = {
  getByDate: (date: DateObject) => Promise<CalculationDay | undefined>;
  createOrUpdate: (data: PayloadCalculationDayCreateOrUpdate) => Promise<CalculationDay>;
};

export const REPOSITORY_KEY_CALCULATION_DAY = Symbol('repo-calculation-day') as InjectionKey<RepositoryCalculationDay>;
