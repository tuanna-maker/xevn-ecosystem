export interface ApiSuccess<T> {
  success: true;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export function ok<T>(data: T, code = 'OK', message = 'Success'): ApiSuccess<T> {
  return {
    success: true,
    code,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}
