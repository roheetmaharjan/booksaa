
import { spawnSync } from "node:child_process";

const databases = {
  local: process.env.LOCAL_DATABASE_URL,
  staging: process.env.STAGING_DATABASE_URL,
  production: process.env.PRODUCTION_DATABASE_URL,
};

const comparisons = [
  ["local", "staging"],
  ["local", "production"],
  ["staging", "production"],
];

for (const [source, target] of comparisons) {
  const fromUrl = databases[source];
  const toUrl = databases[target];

  if (!fromUrl || !toUrl) {
    console.error(`Missing URL: ${source} or ${target}`);
    process.exitCode = 1;
    continue;
  }

  console.log(`\nComparing ${source} -> ${target}`);

  const result = spawnSync(
    process.execPath,
    [
      "node_modules/prisma/build/index.js",
      "migrate",
      "diff",
      "--from-url",
      fromUrl,
      "--to-url",
      toUrl,
      "--exit-code",
    ],
    {
      encoding: "utf8",
      env: process.env,
    }
  );

  if (result.error) {
    console.error(result.error.message);
    process.exitCode = 1;
    continue;
  }

  console.log(result.stdout || "");
  if (result.stderr) console.error(result.stderr);

  if (result.status === 0) {
    console.log("No Prisma-supported schema differences detected.");
  } else if (result.status === 2) {
    console.log("Schema differences detected.");
  } else {
    console.log(`Comparison failed (exit code ${result.status}).`);
    process.exitCode = 1;
  }
}
