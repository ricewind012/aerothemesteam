import fs from "node:fs";
import path from "node:path";
import postcssFunctions from "postcss-functions";
import removeComments from "postcss-discard-comments";
import postcssSassParser from "postcss-scss";
import postcssSassPlugin from "@csstools/postcss-sass";
import {
	appendImportantPlugin,
	selectorReplacerPlugin,
} from "steam-theming-utils/postcss-plugins";

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
		removeComments(),
		selectorReplacerPlugin(),
		appendImportantPlugin({
			filter: [/^:root/],
		}),
	],
};
