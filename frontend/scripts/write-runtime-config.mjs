import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(scriptDir, '..');
const repoRoot = resolve(frontendRoot, '..');
const runtimeConfigPath = resolve(
  frontendRoot,
  'apps/transformation-console/public/assets/runtime-config.js',
);

const env = {
  ...(await readEnvFile(resolve(repoRoot, '.env.local'))),
  ...(await readEnvFile(resolve(frontendRoot, '.env.local'))),
  ...process.env,
};

const mockApi = parseBoolean(env['LAR_FRONTEND_MOCK_API'], true);
const apiBaseUrl = env['LAR_FRONTEND_API_BASE_URL'] ?? (mockApi ? 'mock' : 'http://localhost:5029');
const environmentLabel =
  env['LAR_FRONTEND_ENVIRONMENT_LABEL'] ?? (mockApi ? 'Frontend mock mode' : 'Backend API mode');

const contents = `window.larRuntimeConfig = {
  apiBaseUrl: '${escapeJsString(apiBaseUrl)}',
  environmentLabel: '${escapeJsString(environmentLabel)}',
  mockApi: ${mockApi ? 'true' : 'false'},
};
`;

await writeFile(runtimeConfigPath, contents, 'utf8');

console.log(
  `Wrote ${relativePath(
    runtimeConfigPath,
  )} with apiBaseUrl=${apiBaseUrl} mockApi=${mockApi} environmentLabel=${environmentLabel}`,
);

async function readEnvFile(path) {
  try {
    const text = await readFile(path, 'utf8');
    return parseEnv(text);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

function parseEnv(text) {
  const values = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');

    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim();

    values[key] = stripQuotes(value);
  }

  return values;
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function escapeJsString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function relativePath(path) {
  return path.replace(`${repoRoot}/`, '');
}
