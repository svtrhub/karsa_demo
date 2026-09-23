import { execSync } from "child_process";
try {
  const out = execSync("netstat -ano | findstr :3000").toString();
  console.log("Port 3000 processes:\n", out);
} catch (err) {
  console.log("No process found on port 3000.");
}
