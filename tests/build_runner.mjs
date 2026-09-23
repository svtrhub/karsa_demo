import { spawn } from "child_process";

console.log("Starting build runner...");
const proc = spawn("cmd.exe", ["/c", "npm run build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    PATH: "C:\\Program Files\\nodejs;" + process.env.PATH,
  },
});

proc.on("exit", (code) => {
  console.log("Build runner exited with code:", code);
  process.exit(code || 0);
});
