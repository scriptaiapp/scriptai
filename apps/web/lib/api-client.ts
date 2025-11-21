/**
 * Centralized API client for backend requests
 * Handles authentication, error handling, and type safety
 * Client-side only - use in components and hooks
 */

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Array<{ path: string; message: string }>;
  error?: string;
}

export class ApiClientError extends Error {
  statusCode: number;
  errors?: Array<{ path: string; message: string }>;

  constructor(message: string, statusCode: number, errors?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = 'ServerClientError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  accessToken?: string;
}

/**
 * Get the backend URL from environment variables
 */
function getBackendUrl(): string {
  if (typeof window === 'undefined') {
    throw new Error('server-client can only be used on the client side');
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
}

/**
 * Make a request to the backend API
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('server-client can only be used on the client side');
  }

  const { requireAuth = false, accessToken, headers = {}, ...fetchOptions } = options;

  const backendUrl = getBackendUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${backendUrl}${endpoint}`;

  // Build headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authentication token if required
  if (requireAuth || accessToken) {
    let token = accessToken;

    if (!token && requireAuth) {
      // Try to get token from Supabase session (client-side)
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token ?? undefined;
      } catch (error) {
        console.error('Error getting session:', error);
      }
    }

    if (token) {
      (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    } else if (requireAuth) {
      throw new ApiClientError('Authentication required', 401);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Parse response
    let data: T;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // If JSON parsing fails but response is ok, return empty object
        if (response.ok) {
          return {} as T;
        }
        throw new ApiClientError(
          response.statusText || 'An error occurred',
          response.status
        );
      }
    } else {
      // Non-JSON response
      if (!response.ok) {
        const text = await response.text();
        throw new ApiClientError(
          text || response.statusText || 'An error occurred',
          response.status
        );
      }
      return {} as T;
    }

    // Handle error responses
    if (!response.ok) {
      const errorResponse = data as unknown as ApiErrorResponse & { statusCode?: number };

      // Handle NestJS validation errors format
      if (errorResponse.errors && Array.isArray(errorResponse.errors) && errorResponse.errors.length > 0) {
        const errorMessages = errorResponse.errors
          .map(err => `${err.path ? err.path + ': ' : ''}${err.message}`)
          .join(', ');
        throw new ApiClientError(
          errorMessages || errorResponse.message || 'Validation failed',
          response.status,
          errorResponse.errors
        );
      }

      // Handle NestJS standard error format (statusCode, message)
      const errorMessage = errorResponse.message || errorResponse.error || response.statusText || 'An error occurred';
      throw new ApiClientError(
        errorMessage,
        response.status || errorResponse.statusCode || 500
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiClientError(
        'Network error. Please check your connection and try again.',
        0
      );
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

