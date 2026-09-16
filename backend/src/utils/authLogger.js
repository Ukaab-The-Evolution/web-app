const SAFE_CONTEXT_KEYS = new Set([
  'phase',
  'role',
  'authUserId',
  'applicationUserId',
  'table',
  'operation',
  'hasEmail',
  'hasPhone',
  'hasIdentifier',
  'hasPassword',
  'hasCurrentPassword',
  'hasNewPassword',
  'hasRecoveryToken',
  'hasToken',
  'statusCode',
  'resultCount',
]);

const safeContext = (context = {}) => Object.fromEntries(
  Object.entries(context).filter(([key, value]) => SAFE_CONTEXT_KEYS.has(key) && value !== undefined)
);

const redactAndLimit = (value) => {
  if (typeof value !== 'string') return value;
  const redacted = value.replace(
    /(password|access_token|refresh_token|confirmation_token|recovery_token)(\s*[=:]\s*)[^\s,;}]+/gi,
    '$1=[REDACTED]'
  );
  return redacted.length > 1000 ? `${redacted.slice(0, 1000)}…` : redacted;
};

const errorDetails = (error) => {
  if (!error) return { message: 'Unknown error' };
  if (typeof error === 'string') return { message: redactAndLimit(error) };

  return Object.fromEntries(
    Object.entries({
      name: error.name,
      message: redactAndLimit(error.message),
      code: error.code,
      status: error.status,
      statusCode: error.statusCode,
      details: redactAndLimit(error.details),
      hint: redactAndLimit(error.hint),
      stack: redactAndLimit(error.stack),
    }).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
};

const write = (method, event, context = {}, error) => {
  const entry = {
    scope: 'auth',
    event,
    timestamp: new Date().toISOString(),
    ...safeContext(context),
    ...(error ? { error: errorDetails(error) } : {}),
  };

  console[method](`[auth] ${JSON.stringify(entry)}`);
};

export const logAuthEvent = (event, context = {}) => write('info', event, context);

export const logAuthError = (event, error, context = {}) => write('error', event, context, error);
