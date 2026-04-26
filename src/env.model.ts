export interface Env {
    MY_VAR: string;
    OPENAI_API_KEY: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: number;
    POSTGRES_DB: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    JWT_SECRET: string;

    SUPERADMIN_EMAIL: string;
    SUPERADMIN_PASSWORD: string;

    MP_ACCESS_TOKEN: string;
    MP_PUBLIC_KEY: string;
    MP_WEBHOOK_SECRET: string;
    FRONTEND_URL: string;
    MP_NOTIFICATION_URL: string;
    RESEND_API_KEY: string;
  }