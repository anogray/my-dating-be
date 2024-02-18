import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config();

// Knex CLI migrations
process.env.NODE_CONFIG_DIR =
  process.env.NODE_CONFIG_DIR ?? path.join(__dirname, "../../src/config");
import configPackage from "config";

interface Config {
  env: string;
  port: number;
  apiKey: string;
  swagger: Swagger;
  rateLimit: RateLimit;
  cors: Cors;
  validator: Validator;
  logging: Logging;
}

interface Swagger {
  enabled: boolean;
  endpoint: string;
  title: string;
  description: string;
  contact: SwaggerContact;
}

interface SwaggerContact {
  name: string; 
  url: string;
  email: string;
}

interface RateLimit {
  enabled: boolean;
  max: number;
  timeWindow: string;
}

interface Cors {
  origins: string;
  methods: string;
  allowedHeaders: string;
}

interface Validator {
  forbidUnknown: true;
}

interface Logging {
  timestampFormat: string;
  logDataConsole: boolean;
}

export const config: Config = configPackage as unknown as Config;

export function bool(value: boolean | string): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
}
