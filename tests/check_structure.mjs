import fs from "fs";
import path from "path";

function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f === "node_modules" || f === ".next" || f === ".git") continue;
    console.log(full);
    if (fs.statSync(full).isDirectory()) {
      scan(full);
    }
  }
}

scan(".");
