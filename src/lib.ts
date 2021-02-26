import { spawn, exec } from "child_process";
import readline from "readline";

export async function askInput(question: string): Promise<string> {
    return await new Promise((resolve, reject) => {
        let answer = "";
        let rl: readline.Interface | null = readline.createInterface(
            process.stdin,
            process.stdout,
            undefined,
            true
        );
        rl.setPrompt(question);
        rl.on("line", (inp) => {
            answer = inp;
            rl?.close();
        });
        rl.on("close", () => {
            rl = null;
            resolve(answer);
        });
        rl.prompt();
    });
}

export async function spawnAsync(
    command: string,
    ...args: string[]
): Promise<number | null> {
    return await new Promise((resolve, reject) => {
        let proc = spawn(command, args, { stdio: "inherit" });
        let didError = false;
        proc.on("error", (err) => {
            didError = true;
            reject(err);
        });
        proc.on("exit", (code, sig) => {
            if (!didError) {
                if (sig != null) {
                    reject(sig);
                } else {
                    resolve(code);
                }
            }
        });
    });
}

export async function execAsync(
    command: string
): Promise<{ stdout: string | Buffer; stderr: string | Buffer }> {
    return await new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err != null) reject(err);
            else resolve({ stdout, stderr });
        });
    });
}
