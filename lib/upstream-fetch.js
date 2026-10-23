// Outbound provider requests share bounded transport behavior and sanitized errors.
const SAFE_NETWORK_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
]);

export const DEFAULT_UPSTREAM_TIMEOUT_MS = 10_000;
export const MAX_UPSTREAM_RESPONSE_BYTES = 10 * 1024 * 1024;
export const MAX_UPSTREAM_REDIRECTS = 5;

export class UpstreamError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'UpstreamError';
    if (Number.isInteger(status)) this.status = status;
  }
}

function getSafeNetworkCode(error) {
  const code =
    typeof error?.code === 'string'
      ? error.code
      : typeof error?.cause?.code === 'string'
        ? error.cause.code
        : null;

  return code && SAFE_NETWORK_CODES.has(code) ? code : null;
}

function createSanitizedTransportError(error, timeoutSignal, callerSignal) {
  if (callerSignal?.aborted) {
    const abortError = new Error('Upstream request aborted');
    abortError.name = 'AbortError';
    return abortError;
  }

  if (timeoutSignal.aborted) {
    const timeoutError = new Error('Upstream request timed out');
    timeoutError.name = 'TimeoutError';
    timeoutError.code = 'ETIMEDOUT';
    return timeoutError;
  }

  const safeError = new Error('Upstream request failed');
  const safeCode = getSafeNetworkCode(error);

  // Keep only the small set used for delay classification. Provider URLs,
  // response bodies, arbitrary error codes and original causes may be sensitive.
  if (safeCode) safeError.code = safeCode;
  return safeError;
}

function createSafeRequestExecutor(fetchImplementation, timeoutMs) {
  if (typeof fetchImplementation !== 'function') {
    throw new TypeError('A fetch implementation is required.');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError('The upstream timeout must be a positive finite number.');
  }

  return async function executeSafeRequest(url, options = {}) {
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new UpstreamError('Invalid upstream URL.');
    }

    // All configured provider destinations use HTTPS. Do not let caller input
    // turn this shared outbound-request boundary into a non-TLS fetch.
    if (parsedUrl.protocol !== 'https:') {
      throw new UpstreamError('Upstream URL must use HTTPS.');
    }

    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const callerSignal = options.signal;
    const signal = callerSignal
      ? AbortSignal.any([callerSignal, timeoutSignal])
      : timeoutSignal;

    // Callers cannot disable or weaken shared transport caps.
    const requestOptions = {
      ...options,
      follow: MAX_UPSTREAM_REDIRECTS,
      size: MAX_UPSTREAM_RESPONSE_BYTES,
      signal,
    };

    let response;
    try {
      response = await fetchImplementation(parsedUrl, requestOptions);
    } catch (error) {
      throw createSanitizedTransportError(error, timeoutSignal, callerSignal);
    }

    return { response, timeoutSignal, callerSignal };
  };
}

// This variant preserves HTTP responses for flows with provider-specific status/fallback rules.
export function createSafeRequest(
  fetchImplementation,
  timeoutMs = DEFAULT_UPSTREAM_TIMEOUT_MS
) {
  const execute = createSafeRequestExecutor(fetchImplementation, timeoutMs);
  return async function safeRequest(url, options = {}) {
    const { response } = await execute(url, options);
    return response;
  };
}

export function createSafeFetch(
  fetchImplementation,
  timeoutMs = DEFAULT_UPSTREAM_TIMEOUT_MS
) {
  const execute = createSafeRequestExecutor(fetchImplementation, timeoutMs);

  return async function safeFetch(url, options = {}) {
    const { response, timeoutSignal, callerSignal } = await execute(url, options);

    if (!response.ok) {
      throw new UpstreamError(
        `Upstream responded with HTTP ${response.status}`,
        response.status
      );
    }

    try {
      return await response.json();
    } catch (error) {
      if (
        timeoutSignal.aborted ||
        callerSignal?.aborted ||
        getSafeNetworkCode(error) ||
        getSafeNetworkCode(error?.cause)
      ) {
        throw createSanitizedTransportError(error, timeoutSignal, callerSignal);
      }

      // JSON parser messages may include provider-controlled payload text.
      throw new UpstreamError('Upstream response was not valid JSON.', response.status);
    }
  };
}
