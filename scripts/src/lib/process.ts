import { spawn } from "node:child_process";

export interface RunCommandOptions {
  cwd?: string;
  dryRun?: boolean;
  stdio?: "inherit" | "pipe";
  useShell?: boolean;
}

export async function runCommand(
  command: string,
  args: string[] = [],
  options: RunCommandOptions = {}
): Promise<number> {
  if (options.dryRun) {
    return 0;
  }

  return new Promise<number>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: options.stdio ?? "inherit",
      shell: options.useShell ?? process.platform === "win32",
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code) => {
      if (code && code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }
      resolve(code ?? 0);
    });
  });
}
