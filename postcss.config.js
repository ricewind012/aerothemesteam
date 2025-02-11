import fs from "node:fs";
import path from "node:path";
import yargs from "yargs";
import postcssFunctions from "postcss-functions";
import postcssSassParser from "postcss-scss";
import postcssSassPlugin from "@csstools/postcss-sass";
import { selectorReplacerPlugin } from "steam-theming-utils/postcss-plugin";

const { argv } = yargs(process.argv);

// Recreate the CSS output directory
fs.rmSync(argv.dir, { recursive: true, force: true });
fs.mkdirSync(argv.dir);

// Generate an index.css file that imports everything
const text = fs
	.readdirSync(argv.base, { recursive: true })
	.filter((e) => e.endsWith(".scss"))
	.map((e) => `@import "${e.replace(/\\/g, "/").replace("scss", "css")}";`)
	.join("\n");
fs.writeFileSync(path.join(argv.dir, "index.css"), text);

/**
 * `icon("name")` => `url("data:image/png;base64,${base64}")`
 *
 * @param {string} name File name without the extension.
 */
function icon(name) {
	const file = path.join("assets", "icons", `${name.replace(/"/g, "")}.png`);
	const base64 = fs.readFileSync(file, { encoding: "base64" });

	return `url("data:image/png;base64,${base64}")`;
}

/** @type {import("postcss-load-config").Config} */
export default {
	map: false,
	parser: postcssSassParser,
	plugins: [
		postcssSassPlugin({
			// TODO: use "loadPaths" when @csstools/postcss-sass switches to
			// normal sass API.
			includePaths: ["theme"],
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
