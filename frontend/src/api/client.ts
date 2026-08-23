const API_BASE = ''; // proxied via Vite to http://127.0.0.1:8000

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 45000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 204) {
      return {} as T;
    }

    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      let errorMessage = 'Request failed';
      if (responseData && typeof responseData === 'object') {
        if (responseData.detail) {
          errorMessage = typeof responseData.detail === 'string' ? responseData.detail : JSON.stringify(responseData.detail);
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (typeof responseData === 'string' && responseData) {
        errorMessage = responseData;
      }
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('OCR processing or request timed out after 45 seconds. Please retry.', 504);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network connection failed. Ensure backend server is running.', 0);
  }
}
