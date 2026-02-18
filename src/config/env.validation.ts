type Environment = {
  PORT: number;
  NODE_ENV: 'development' | 'test' | 'production';
  CORS_ORIGIN: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SSL: boolean;
  DB_SSL_REJECT_UNAUTHORIZED: boolean;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_FOLDER: string;
  CLOUDINARY_PROFILE_PHOTOS_FOLDER: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
};

function getRequiredString(value: string | undefined, key: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value.trim();
}

function getNumber(value: string | undefined, key: string): number {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  return parsed;
}

function getBoolean(value: string | undefined, key: string): boolean {
  const normalized = (value ?? '').trim().toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  throw new Error(`Environment variable ${key} must be true or false`);
}

function getOptionalString(value: string | undefined, fallback = ''): string {
  return value?.trim() ?? fallback;
}

export function validateEnv(raw: Record<string, unknown>): Environment {
  const env = raw as Record<string, string | undefined>;
  const nodeEnv = (env.NODE_ENV ?? 'development') as Environment['NODE_ENV'];

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  return {
    PORT: getNumber(env.PORT ?? '3000', 'PORT'),
    NODE_ENV: nodeEnv,
    CORS_ORIGIN: env.CORS_ORIGIN?.trim() ?? '*',
    DB_HOST: getRequiredString(env.DB_HOST, 'DB_HOST'),
    DB_PORT: getNumber(env.DB_PORT ?? '5432', 'DB_PORT'),
    DB_USERNAME: getRequiredString(env.DB_USERNAME, 'DB_USERNAME'),
    DB_PASSWORD: getRequiredString(env.DB_PASSWORD, 'DB_PASSWORD'),
    DB_NAME: getRequiredString(env.DB_NAME, 'DB_NAME'),
    DB_SSL: getBoolean(env.DB_SSL ?? 'false', 'DB_SSL'),
    DB_SSL_REJECT_UNAUTHORIZED: getBoolean(
      env.DB_SSL_REJECT_UNAUTHORIZED ?? 'true',
      'DB_SSL_REJECT_UNAUTHORIZED',
    ),
    CLOUDINARY_CLOUD_NAME: getOptionalString(env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: getOptionalString(env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: getOptionalString(env.CLOUDINARY_API_SECRET),
    CLOUDINARY_FOLDER: getOptionalString(
      env.CLOUDINARY_FOLDER,
      'gmc-academy/certificates',
    ),
    CLOUDINARY_PROFILE_PHOTOS_FOLDER: getOptionalString(
      env.CLOUDINARY_PROFILE_PHOTOS_FOLDER,
      'gmc-academy/profile-photos',
    ),
    JWT_ACCESS_SECRET: getRequiredString(
      env.JWT_ACCESS_SECRET,
      'JWT_ACCESS_SECRET',
    ),
    JWT_REFRESH_SECRET: getRequiredString(
      env.JWT_REFRESH_SECRET,
      'JWT_REFRESH_SECRET',
    ),
    JWT_ACCESS_EXPIRES_IN: getRequiredString(
      env.JWT_ACCESS_EXPIRES_IN,
      'JWT_ACCESS_EXPIRES_IN',
    ),
    JWT_REFRESH_EXPIRES_IN: getRequiredString(
      env.JWT_REFRESH_EXPIRES_IN,
      'JWT_REFRESH_EXPIRES_IN',
    ),
    BCRYPT_ROUNDS: getNumber(env.BCRYPT_ROUNDS ?? '12', 'BCRYPT_ROUNDS'),
  };
}
