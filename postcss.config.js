import postcssSassPlugin from "@csstools/postcss-sass";
import removeComments from "postcss-discard-comments";
import postcssFunctions from "postcss-functions";
import postcssSassParser from "postcss-scss";
import {
	appendImportantPlugin,
	selectorReplacerPlugin,
} from "steam-theming-utils/postcss-plugins";

import fs from "node:fs";
import path from "node:path";

const functions = {
	/**
	 * Output: `file("name")` => `url("data:image/png;base64,${base64}")`
	 *
	 * @param {string} name File name without the extension.
	 */
	file: (name) => {
		const file = path.join("assets", "icons", `${name.replace(/"/g, "")}.png`);
		const base64 = fs.readFileSync(file, { encoding: "base64" });

		return `url("data:image/png;base64,${base64}")`;
	},

	/**
	 * Output: `icon("name")` => `var(--icon-${name})`
	 *
	 * @param {string} name File name without the extension.
	 */
	icon: (name) => {
		return `var(--icon-${unquote(name)})`;
	},
};

/** @type {import("postcss-load-config").Config} */
export default {
	map: false,
	parser: postcssSassParser,
	plugins: [
		postcssSassPlugin({
			// TODO: use "loadPaths" when @csstools/postcss-sass switches to
			// normal sass API.
			includePaths: ["src"],
			silenceDeprecations: ["legacy-js-api"],
		}),
		postcssFunctions({ functions }),
		removeComments(),
		selectorReplacerPlugin(),
		appendImportantPlugin({
			filter: [/^:root/],
		}),
	],
};
