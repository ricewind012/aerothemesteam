import fs from "node:fs";
import path from "node:path";

const DIST_DIR = "dist";

const text = fs
	.readdirSync(DIST_DIR, { recursive: true })
	.filter((e) => e.endsWith(".css"))
	.map((e) => `@import "./${e}";`)
	.join("\n");
fs.writeFileSync(path.join(DIST_DIR, "index.css"), text);
