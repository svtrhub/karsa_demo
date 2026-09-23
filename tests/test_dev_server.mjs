import { spawn } from "child_process";

const child = spawn("C:\\Program Files\\nodejs\\node.exe", ["node_modules/next/dist/bin/next", "dev", "-p", "3005"], {
  cwd: process.cwd(),
  env: { ...process.env, PATH: "C:\\Program Files\\nodejs;" + process.env.PATH },
});

child.stdout.on("data", (d) => {
  const s = d.toString();
  process.stdout.write("[NEXT STDOUT] " + s);
  if (s.includes("Ready in")) {
    console.log("Server is ready! Testing fetch...");
    setTimeout(async () => {
      try {
        const r = await fetch("http://localhost:3005");
        console.log("FETCH STATUS:", r.status);
        const html = await r.text();
        console.log("HTML length:", html.length);
        console.log("HTML preview:", html.slice(0, 150));
      } catch (e) {
        console.error("Fetch failed:", e);
      } finally {
        child.kill();
      }
    }, 1000);
  }
});

child.stderr.on("data", (d) => {
  process.stderr.write("[NEXT STDERR] " + d.toString());
});

child.on("exit", (code) => {
  console.log("Child exited with code:", code);
  process.exit(0);
});
