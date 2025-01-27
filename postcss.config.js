import fs from "node:fs";
import path from "node:path";
import yargs from "yargs";
import postcssFunctions from "postcss-functions";
import postcssSass from "@csstools/postcss-sass";
import { selectorReplacerPlugin } from "steam-theming-utils/postcss-plugin";

// Generate an index.css file that imports everything
const { argv } = yargs(process.argv);
const text = fs
	.readdirSync(argv.base, { recursive: true })
	.filter((e) => e.endsWith(".scss"))
	.map((e) => `@import "${e.replace("scss", "css")}";`)
	.join("\n");
fs.writeFileSync(path.join(argv.dir, "index.css"), text);

/**
 * `icon("name")` => `url("data:image/png;base64,${base64}")`
 *
 * @param {string} name File name without the extension.
 */
function icon(name) {
	const file = path.join("assets", `${name.replace(/"/g, "")}.png`);
	const base64 = fs.readFileSync(file, { encoding: "base64" });

	return `url("data:image/png;base64,${base64}")`;
}

/** @type {import("postcss-load-config").Config} */
export default {
	map: false,
	plugins: [
		postcssSass({
			silenceDeprecations: ["legacy-js-api"],
		}),
		postcssFunctions({
			functions: {
				icon,
			},
		}),
		selectorReplacerPlugin(),
	],
};
