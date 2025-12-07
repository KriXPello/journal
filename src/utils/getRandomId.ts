import { ulid } from 'ulid';

export const getRandomId = () => {
  return ulid();
};
