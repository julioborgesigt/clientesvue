// Setup global para testes
import { vi } from 'vitest';

// Mock global do console para evitar poluição nos logs de teste
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  debug: vi.fn(),
};

// Mock para ignorar imports de CSS
vi.mock('*.css', () => ({}));
vi.mock('*.scss', () => ({}));
vi.mock('*.sass', () => ({}));
