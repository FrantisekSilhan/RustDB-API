import { EnvValidatex, type Constraints } from "env-validatex";

const constraints: Constraints = {
  PORT: {
    type: "number",
    required: true,
    default: 6969,
  },
  NODE_ENV: {
    type: "enum",
    required: true,
    default: "development",
    values: ["development", "production", "test"],
  },
  DATABASE_URL: {
    type: "string",
    required: true,
  },
  REDIS_URL: {
    type: "string",
    required: false,
  },
  CACHE_DURATION: {
    type: "number",
    required: false,
    default: 300,
  },
};

const validator = new EnvValidatex(constraints, {
  basePath: process.cwd(),
  files: [".env"],
  exitOnError: true,
  applyDefaults: true,
  silent: false,
});

validator.loadAndValidate();