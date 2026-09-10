const required = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? "/api",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
};
