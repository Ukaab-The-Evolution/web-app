import dotenv from 'dotenv';

dotenv.config();

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

const required = (env, key) => {
  const value = env[key];
  if (!value || !String(value).trim()) {
    throw new ConfigurationError(`Missing required environment variable: ${key}`);
  }
  return String(value).trim();
};

const validateUrl = (env, key) => {
  const value = required(env, key);
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new ConfigurationError(`${key} must be a valid URL`);
  }

  if (value.endsWith('.')) {
    throw new ConfigurationError(`${key} must not end with a period`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new ConfigurationError(`${key} must use http or https`);
  }

  return value;
};

export const loadEnv = (env = process.env) => {
  const port = Number(env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError('PORT must be an integer between 1 and 65535');
  }

  return {
    supabaseUrl: validateUrl(env, 'SUPABASE_URL'),
    supabaseAnonKey: required(env, 'SUPABASE_KEY'),
    supabaseServiceRoleKey: required(env, 'SUPABASE_SERVICE_ROLE_KEY'),
    port,
    frontendUrl: validateUrl(env, 'FRONTEND_URL'),
    nodeEnv: env.NODE_ENV || 'development',
  };
};
