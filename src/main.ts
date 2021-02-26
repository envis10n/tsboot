import { execAsync, spawnAsync } from "./lib";
import * as fs from "./fs";
import path from "path";
import * as lib from "./lib";

function log(...args: any[]): void {
    console.log("[TSBOOT]", ...args);
}

const CWD = process.cwd();
const ASSET_DIR = path.resolve(__dirname, "../assets");

const DEV_DEPS = [
    "@types/jest",
    "@types/node",
    "jest",
    "prettier",
    "ts-jest",
    "typescript",
];

function asset(...p: string[]): string {
    return path.resolve(ASSET_DIR, ...p);
}

function cwd(...p: string[]): string {
    return path.resolve(CWD, ...p);
}

async function askYarn(): Promise<boolean> {
    const answer = (await lib.askInput("Use yarn? (Y/n): ")).toLowerCase();
    if (answer[0] == "n" || answer == "no") {
        return false;
    } else if (answer[0] == "y" || answer == "yes") {
        return true;
    } else {
        return await askYarn();
    }
}

async function main(): Promise<void> {
    // Check if directory is empty

    if ((await fs.readdir(CWD)).length > 0) {
        log("Directory is not empty.");
        process.exit(1);
    }

    // Init via NPM or Yarn
    const manager = (await askYarn()) ? "yarn" : "npm";
    await spawnAsync(manager, "init");

    // Modify package.json
    log("Modifying package...");
    const pkg = JSON.parse(
        await fs.readFile(path.resolve(CWD, "package.json"), {
            encoding: "utf-8",
        })
    );
    if (pkg.scripts == undefined) pkg.scripts = {};
    pkg.scripts["test"] = "jest";
    pkg.scripts["build"] = "tsc";
    pkg.scripts["clean"] = "node scripts/clean.js";
    pkg.scripts["start"] = `${manager} run build && node .`;
    pkg.main = "build/index.js";
    await fs.writeFile(cwd("package.json"), JSON.stringify(pkg, null, 4));

    // Install dependencies.
    log("Installing dependencies...");
    await spawnAsync(
        manager,
        manager == "npm" ? "i" : "add",
        "-D",
        ...DEV_DEPS
    );

    // Make directory structure
    log("Building directory structure...");
    await fs.mkdir(cwd("src/__tests__"), { recursive: true });
    await fs.mkdir(cwd("scripts"), { recursive: true });

    // Copy source files.
    log("Copying source files...");
    await fs.copyFile(asset("index.ts.default"), cwd("src/index.ts"));
    await fs.copyFile(
        asset("demo.test.ts.default"),
        cwd("src/__tests__/demo.test.ts")
    );
    await fs.copyFile(
        asset("scripts/clean.js.default"),
        cwd("scripts/clean.js")
    );

    // Copy config files.
    log("Copying config files...");
    await fs.copyFile(asset("jest.config.js.default"), cwd("jest.config.js"));
    await fs.copyFile(asset("tsconfig.json.default"), cwd("tsconfig.json"));
    await fs.copyFile(asset("prettierrc.default"), cwd(".prettierrc"));

    log("Your Typescript project is ready to go!");
}

main()
    .then(() => {})
    .catch((err) => {
        console.error(err);
    });
