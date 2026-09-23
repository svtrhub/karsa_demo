import { spawn } from "child_process";

async function testMode(flag) {
  console.log(`Testing next dev ${flag} -p 3006...`);
  return new Promise((resolve) => {
    const child = spawn(
      "C:\\Program Files\\nodejs\\node.exe",
      ["node_modules/next/dist/bin/next", "dev", flag, "-p", "3006"],
      {
        cwd: process.cwd(),
        env: { ...process.env, PATH: "C:\\Program Files\\nodejs;" + process.env.PATH },
      }
    );

    let resolved = false;

    child.stdout.on("data", async (d) => {
      const s = d.toString();
      process.stdout.write(`[${flag} STDOUT] ` + s);
      if (s.includes("Ready in") && !resolved) {
        resolved = true;
        console.log(`Server ready with ${flag}! Trying fetch...`);
        try {
          const res = await fetch("http://localhost:3006");
          console.log(`FETCH STATUS (${flag}):`, res.status);
          const text = await res.text();
          console.log(`HTML (${flag}) length:`, text.length);
          if (res.status === 200) {
            console.log(`SUCCESS WITH ${flag}!`);
          }
        } catch (e) {
          console.error(`Fetch error with ${flag}:`, e.message);
        } finally {
          child.kill();
          resolve(true);
        }
      }
    });

    child.stderr.on("data", (d) => {
      process.stderr.write(`[${flag} STDERR] ` + d.toString());
    });

    child.on("exit", (code) => {
      console.log(`Child (${flag}) exited with code:`, code);
      if (!resolved) resolve(false);
    });

    setTimeout(() => {
      if (!resolved) {
        console.log(`Timeout with ${flag}`);
        child.kill();
        resolve(false);
      }
    }, 15000);
  });
}

async function run() {
  await testMode("--turbo");
}

run();
