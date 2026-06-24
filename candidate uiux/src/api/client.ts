import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/mock-api',
  timeout: 800,
});

export async function mockDelay<T>(value: T, delay = 250): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return value;
}
