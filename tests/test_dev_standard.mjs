import { spawn } from "child_process";

const child = spawn(
  "C:\\Program Files\\nodejs\\node.exe",
  ["node_modules/next/dist/bin/next", "dev", "-p", "3007"],
  {
    cwd: process.cwd(),
    env: { ...process.env, PATH: "C:\\Program Files\\nodejs;" + process.env.PATH },
  }
);

child.stdout.on("data", async (d) => {
  const s = d.toString();
  process.stdout.write("[NEXT STDOUT] " + s);
  if (s.includes("Ready in")) {
    console.log("Server ready on 3007! Testing fetch with 60s timeout...");
    try {
      const res = await fetch("http://localhost:3007");
      console.log("FETCH STATUS:", res.status);
      const text = await res.text();
      console.log("FETCH text preview:", text.slice(0, 150));
    } catch (e) {
      console.error("Fetch failed:", e);
    } finally {
      child.kill();
      process.exit(0);
    }
  }
});

child.stderr.on("data", (d) => {
  process.stderr.write("[NEXT STDERR] " + d.toString());
});

setTimeout(() => {
  console.log("Timeout waiting for server");
  child.kill();
  process.exit(1);
}, 60000);
