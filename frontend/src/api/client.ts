import axios, { AxiosError } from 'axios';
import { ApiResponse, ApiError } from '../types/api.types';

const baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5184/api' : '/api');

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to uniformly handle and extract API errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    let apiError: ApiError = {
      message: 'An unexpected network error occurred.',
      statusCode: error.response?.status,
    };

    if (error.response?.data) {
      const data = error.response.data;
      apiError = {
        message: data.message || (error.response.statusText ?? 'Request failed'),
        errors: data.errors || undefined,
        statusCode: data.statusCode || error.response.status,
      };
    } else if (error.message) {
      apiError.message = error.message;
    }

    return Promise.reject(apiError);
  }
);
