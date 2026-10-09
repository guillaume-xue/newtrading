import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';

export const worker = setupWorker(...authHandlers);

await worker.start(); // Ne bloque pas /api/v1/market/**
