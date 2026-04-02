import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const defaultTarget = resolve(projectRoot, "fixtures", "demo-repo");
const target = process.argv[2] ? resolve(process.argv[2]) : defaultTarget;

function write(relativePath, contents) {
  const filePath = resolve(target, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
}

function git(args, env = {}) {
  execFileSync("git", args, {
    cwd: target,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      ...env,
    },
  });
}

function commit(message, isoDate) {
  const env = {
    GIT_AUTHOR_DATE: isoDate,
    GIT_COMMITTER_DATE: isoDate,
  };

  git(["add", "."], env);
  git(["commit", "-m", message], env);
}

function seedBaseRepo() {
  rmSync(target, { force: true, recursive: true });
  mkdirSync(target, { recursive: true });

  git(["init", "-b", "main"]);
  git(["config", "user.name", "Decision Archaeologist Fixture"]);
  git(["config", "user.email", "fixture@decision-archaeologist.local"]);

  write(
    "package.json",
    JSON.stringify(
      {
        name: "strata-board",
        private: true,
        scripts: {
          build: "webpack",
          test: "jest",
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
        },
        devDependencies: {
          "@babel/core": "^7.24.0",
          "@babel/preset-react": "^7.24.0",
          jest: "^29.7.0",
          webpack: "^5.90.0",
        },
      },
      null,
      2,
    ),
  );
  write(
    "webpack.config.js",
    `module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
  },
};`,
  );
  write(
    "config/app.config.json",
    JSON.stringify(
      {
        mode: "field-lab",
        cacheWindow: 30,
        routes: ["timeline", "artifacts"],
      },
      null,
      2,
    ),
  );
  write(
    "src/index.tsx",
    `import { createRoot } from "react-dom/client";
import { Timeline } from "./components/Timeline";
import { ArtifactList } from "./components/ArtifactList";

function App() {
  return (
    <main>
      <Timeline />
      <ArtifactList />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);`,
  );
  write(
    "src/components/Timeline.tsx",
    `export function Timeline() {
  return <section>Timeline trench</section>;
}`,
  );
  write(
    "src/components/ArtifactList.tsx",
    `export function ArtifactList() {
  return <section>Artifact shelf</section>;
}`,
  );
  write(
    "README.md",
    "# Strata Board\n\nA small lab repo used to demo decision archaeology.\n",
  );
  commit("bootstrap excavation board with webpack and jest", "2025-01-08T09:00:00Z");

  write(
    "src/components/DecisionLedger.tsx",
    `export function DecisionLedger() {
  return <aside>Ledger of excavation calls</aside>;
}`,
  );
  write(
    "src/lib/archive.ts",
    `export const archiveSlots = ["timeline", "artifact-shelf", "ledger"];`,
  );
  write(
    "src/index.tsx",
    `import { createRoot } from "react-dom/client";
import { Timeline } from "./components/Timeline";
import { ArtifactList } from "./components/ArtifactList";
import { DecisionLedger } from "./components/DecisionLedger";

function App() {
  return (
    <main>
      <Timeline />
      <ArtifactList />
      <DecisionLedger />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);`,
  );
  commit("expand the ledger domain and archive mapping", "2025-01-13T09:00:00Z");

  mkdirSync(resolve(target, "src/features/timeline"), { recursive: true });
  mkdirSync(resolve(target, "src/features/archive"), { recursive: true });
  mkdirSync(resolve(target, "src/core"), { recursive: true });
  git(["mv", "src/components/Timeline.tsx", "src/features/timeline/StrataTimeline.tsx"]);
  git(["mv", "src/components/ArtifactList.tsx", "src/features/archive/ArtifactShelf.tsx"]);
  write(
    "src/core/AppShell.tsx",
    `import { Timeline as StrataTimeline } from "../features/timeline/StrataTimeline";
import { ArtifactList as ArtifactShelf } from "../features/archive/ArtifactShelf";
import { DecisionLedger } from "../components/DecisionLedger";

export function AppShell() {
  return (
    <main>
      <StrataTimeline />
      <ArtifactShelf />
      <DecisionLedger />
    </main>
  );
}`,
  );
  write(
    "src/features/timeline/StrataTimeline.tsx",
    `export function Timeline() {
  return <section>Timeline trench</section>;
}`,
  );
  write(
    "src/features/archive/ArtifactShelf.tsx",
    `export function ArtifactList() {
  return <section>Artifact shelf</section>;
}`,
  );
  write(
    "src/index.tsx",
    `import { createRoot } from "react-dom/client";
import { AppShell } from "./core/AppShell";

createRoot(document.getElementById("root")!).render(<AppShell />);`,
  );
  commit("reorganize modules into feature strata and shared core", "2025-02-02T09:00:00Z");

  write(
    "package.json",
    JSON.stringify(
      {
        name: "strata-board",
        private: true,
        scripts: {
          dev: "vite",
          build: "vite build",
          test: "vitest run",
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
        },
        devDependencies: {
          vite: "^5.4.0",
          vitest: "^2.1.8",
        },
      },
      null,
      2,
    ),
  );
  rmSync(resolve(target, "webpack.config.js"), { force: true });
  write(
    "vite.config.ts",
    `import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 4173,
  },
});`,
  );
  write(
    "vitest.config.ts",
    `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});`,
  );
  commit("switch the toolchain from webpack and jest to vite and vitest", "2025-03-01T09:00:00Z");

  write(
    "package.json",
    JSON.stringify(
      {
        name: "strata-board",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          test: "vitest run",
        },
        dependencies: {
          next: "^15.1.0",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
        },
        devDependencies: {
          eslint: "^9.0.0",
          "eslint-config-next": "^15.1.0",
          typescript: "^5.6.0",
          vitest: "^2.1.8",
        },
      },
      null,
      2,
    ),
  );
  rmSync(resolve(target, "vite.config.ts"), { force: true });
  write(
    "next.config.mjs",
    `const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;`,
  );
  write(
    "app/layout.tsx",
    `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
  );
  write(
    "app/page.tsx",
    `import { AppShell } from "../src/core/AppShell";

export default function Page() {
  return <AppShell />;
}`,
  );
  rmSync(resolve(target, "src/index.tsx"), { force: true });
  commit("migrate the excavation board to Next.js app router", "2025-04-09T09:00:00Z");

  write(
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["dom", "es2022"],
          strict: true,
          noEmit: true,
          moduleResolution: "bundler",
        },
      },
      null,
      2,
    ),
  );
  write(
    "eslint.config.mjs",
    `import nextVitals from "eslint-config-next/core-web-vitals";

export default [...nextVitals];`,
  );
  write(
    "src/lib/cache.ts",
    `export const cacheWindowMinutes = 15;
export const routeBudget = 3;`,
  );
  write(
    "config/app.config.json",
    JSON.stringify(
      {
        mode: "field-lab",
        cacheWindow: 15,
        routes: ["timeline", "artifacts", "ledger"],
        strictRouting: true,
      },
      null,
      2,
    ),
  );
  commit(
    "stabilize routing, cache, and strict configuration for the new runtime",
    "2025-05-03T09:00:00Z",
  );
}

seedBaseRepo();

if (existsSync(resolve(target, ".git"))) {
  console.log(`Demo repo ready at ${target}`);
}


