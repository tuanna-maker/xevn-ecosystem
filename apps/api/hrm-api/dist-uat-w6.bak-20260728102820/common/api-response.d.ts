export interface ApiSuccess<T> {
    success: true;
    code: string;
    message: string;
    data: T;
    timestamp: string;
}
export declare function ok<T>(data: T, code?: string, message?: string): ApiSuccess<T>;
