#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 700;

async function loadLocalEnvFiles() {
  const candidateFiles = [".env.local", ".env"];

  for (const file of candidateFiles) {
    try {
      const content = await readFile(file, "utf8");
      const lines = content.split(/\r?\n/);

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
          continue;
        }

        const separatorIndex = line.indexOf("=");
        if (separatorIndex <= 0) {
          continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        let value = line.slice(separatorIndex + 1).trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch {
      // File does not exist or cannot be read; continue with next candidate.
    }
  }
}

function printHelp() {
  console.log(`
HF Space CLI

Usage:
  node scripts/hf-space-cli.mjs [options]

Options:
  --space <owner/name|url>   Space Hugging Face (default: HF_DEFAULT_SPACE_ID)
  --path <path>              Path to fetch (default: /agents.md)
  --method <HTTP_METHOD>     GET, POST, PUT, PATCH, DELETE (default: GET)
  --data <json>              JSON payload (for POST/PUT/PATCH)
  --header <k:v>             Additional header (repeatable)
  --timeout <ms>             Request timeout in ms (default: 30000)
  --retries <n>              Number of retries on 429/5xx (default: 2)
  --retry-delay <ms>         Base retry delay in ms (default: 700)
  --output <file>            Write response body to file
  --json                     Force JSON response parsing
  --text                     Force text response parsing
  --help                     Show this help

Environment variables:
  HF_TOKEN or HUGGINGFACEHUB_API_TOKEN
  HF_DEFAULT_SPACE_ID

Examples:
  node scripts/hf-space-cli.mjs --space amapic/my-space --path /agents.md --text
  node scripts/hf-space-cli.mjs --space https://huggingface.co/spaces/mrfakename/Z-Image-Turbo --path /agents.md --output agents.md
`);
}

function parseArgs(argv) {
  const args = {
    space: process.env.HF_DEFAULT_SPACE_ID ?? "",
    path: "/agents.md",
    method: "GET",
    data: undefined,
    headers: [],
    timeout: DEFAULT_TIMEOUT_MS,
    retries: DEFAULT_RETRIES,
    retryDelay: DEFAULT_RETRY_DELAY_MS,
    output: "",
    forceJson: false,
    forceText: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help") {
      args.help = true;
      continue;
    }

    if (token === "--json") {
      args.forceJson = true;
      continue;
    }

    if (token === "--text") {
      args.forceText = true;
      continue;
    }

    if (
      token === "--space" ||
      token === "--path" ||
      token === "--method" ||
      token === "--data" ||
      token === "--header" ||
      token === "--timeout" ||
      token === "--retries" ||
      token === "--retry-delay" ||
      token === "--output"
    ) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Missing value for ${token}`);
      }
      i += 1;

      if (token === "--space") args.space = value;
      else if (token === "--path") args.path = value;
      else if (token === "--method") args.method = value.toUpperCase();
      else if (token === "--data") args.data = value;
      else if (token === "--header") args.headers.push(value);
      else if (token === "--timeout") args.timeout = Number(value);
      else if (token === "--retries") args.retries = Number(value);
      else if (token === "--retry-delay") args.retryDelay = Number(value);
      else if (token === "--output") args.output = value;
      continue;
    }

    throw new Error(`Unknown option: ${token}`);
  }

  return args;
}

function normalizeSpaceRef(spaceRef) {
  const trimmed = (spaceRef ?? "").trim();
  if (!trimmed) {
    throw new Error(
      "No space provided. Use --space owner/name or set HF_DEFAULT_SPACE_ID."
    );
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const parsed = new URL(trimmed);
    const chunks = parsed.pathname.split("/").filter(Boolean);
    if (chunks.length >= 3 && chunks[0] === "spaces") {
      return `${chunks[1]}/${chunks[2]}`;
    }
    throw new Error(
      "Invalid space URL. Expected https://huggingface.co/spaces/owner/name"
    );
  }

  return trimmed;
}

function buildSpaceUrl(spaceRef, path) {
  const normalizedSpace = normalizeSpaceRef(spaceRef);
  if (!normalizedSpace.includes("/")) {
    throw new Error('Invalid space format. Expected "owner/name".');
  }

  const [owner, name] = normalizedSpace.split("/");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(
    `https://huggingface.co/spaces/${owner}/${name}${normalizedPath}`
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await loadLocalEnvFiles();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const url = buildSpaceUrl(args.space, args.path);
  const token =
    process.env.HF_TOKEN ?? process.env.HUGGINGFACEHUB_API_TOKEN ?? "";

  const headers = {
    "User-Agent": "dev2site3-hf-space-cli/1.0",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  for (const headerLine of args.headers) {
    const separatorIndex = headerLine.indexOf(":");
    if (separatorIndex < 1) {
      throw new Error(`Invalid --header value: ${headerLine}`);
    }

    const key = headerLine.slice(0, separatorIndex).trim();
    const value = headerLine.slice(separatorIndex + 1).trim();
    headers[key] = value;
  }

  let body;
  if (args.data) {
    JSON.parse(args.data);
    body = args.data;
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  for (let attempt = 0; attempt <= args.retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), args.timeout);

    try {
      const response = await fetch(url, {
        method: args.method,
        headers,
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && attempt < args.retries) {
          clearTimeout(timeoutHandle);
          await sleep(args.retryDelay * (attempt + 1));
          continue;
        }

        const errorBody = await response.text();
        throw new Error(
          `HTTP ${response.status} ${response.statusText}\n${errorBody}`
        );
      }

      const contentType = response.headers.get("content-type") ?? "";
      let payload;
      let stringOutput;

      if (args.forceText) {
        stringOutput = await response.text();
      } else if (args.forceJson || contentType.includes("application/json")) {
        payload = await response.json();
        stringOutput = JSON.stringify(payload, null, 2);
      } else {
        stringOutput = await response.text();
      }

      if (args.output) {
        await writeFile(args.output, stringOutput, "utf8");
        console.log(`Saved response to ${args.output}`);
      } else {
        console.log(stringOutput);
      }

      return;
    } catch (error) {
      if (attempt < args.retries) {
        await sleep(args.retryDelay * (attempt + 1));
        continue;
      }

      if (error instanceof Error && error.name === "AbortError") {
        console.error(`Request timeout after ${args.timeout}ms`);
      } else {
        console.error(error instanceof Error ? error.message : String(error));
      }
      process.exitCode = 1;
      return;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
