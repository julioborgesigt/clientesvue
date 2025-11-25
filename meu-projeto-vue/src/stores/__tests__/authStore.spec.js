import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../authStore';

// Mocking a valid JWT for an admin user
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiYWRtaW4iLCJleHAiOjI1MTYyMzkwMjJ9.uP_wD1-8tWcK2x1dYdD-gWsa8n4b4c0i8j4iJjR-sCo';

// Mocking a valid JWT for a regular user
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEiLCJuYW1lIjoiSmFuZSBEb2UiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MjUxNjIzOTAyMn0.Y-s3BcN1fK_H4h0bZzg4j0gJjR-wD1-8tWcK2x1dYdD';

describe('authStore', () => {
  // Setup Pinia for each test to ensure a clean state
  beforeEach(() => {
    setActivePinia(createPinia());
    // Clear any session storage items to ensure a clean slate for each test
    sessionStorage.clear();
  });

  // Test 1: Initial State
  it('deve ter um estado inicial correto', () => {
    const authStore = useAuthStore();
    expect(authStore.accessToken).toBe(null);
    expect(authStore.refreshToken).toBe(null);
    expect(authStore.user).toBe(null);
    expect(authStore.tokenExpiry).toBe(null);
  });

  // Test 2: Getters with Initial State
  it('getters devem retornar valores corretos no estado inicial', () => {
    const authStore = useAuthStore();
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.isAdmin).toBe(false);
  });

  // Test 3: setAuthState action
  describe('setAuthState', () => {
    it('deve decodificar e definir o estado corretamente para um usuário admin', () => {
      const authStore = useAuthStore();
      authStore.setAuthState(adminToken, 'fake-refresh-token');

      expect(authStore.accessToken).toBe(adminToken);
      expect(authStore.user).not.toBe(null);
      expect(authStore.user.role).toBe('admin');
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.isAdmin).toBe(true);
      expect(sessionStorage.getItem('accessToken')).toBe(adminToken);
      expect(JSON.parse(sessionStorage.getItem('user')).role).toBe('admin');
    });

    it('deve decodificar e definir o estado corretamente para um usuário não-admin', () => {
      const authStore = useAuthStore();
      authStore.setAuthState(userToken, 'fake-refresh-token');

      expect(authStore.accessToken).toBe(userToken);
      expect(authStore.user).not.toBe(null);
      expect(authStore.user.role).toBeUndefined(); // Assumes no role field for regular users
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.isAdmin).toBe(false);
      expect(sessionStorage.getItem('accessToken')).toBe(userToken);
    });
  });

  // Test 4: logout action
  it('logout deve limpar todo o estado de autenticação', () => {
    const authStore = useAuthStore();
    // First, set a logged-in state
    authStore.setAuthState(adminToken, 'fake-refresh-token');
    expect(authStore.isAuthenticated).toBe(true);

    // Then, logout
    authStore.logout();

    expect(authStore.accessToken).toBe(null);
    expect(authStore.refreshToken).toBe(null);
    expect(authStore.user).toBe(null);
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.isAdmin).toBe(false);
    expect(sessionStorage.getItem('accessToken')).toBe(null);
    expect(sessionStorage.getItem('user')).toBe(null);
  });
});
