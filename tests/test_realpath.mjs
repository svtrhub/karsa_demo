import fs from "fs";
console.log("CWD:", process.cwd());
console.log("Realpath CWD:", fs.realpathSync(process.cwd()));
