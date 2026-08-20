export type FetchWithTimeoutAndRetryOptions = RequestInit & {
    timeoutMs?: number;
    maxAttempts?: number;
};
export declare function fetchWithTimeoutAndRetry(url: string, init?: FetchWithTimeoutAndRetryOptions): Promise<Response>;
