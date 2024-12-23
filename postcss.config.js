import fs from "node:fs";
import path from "node:path";
import postcssFunctions from "postcss-functions";

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
		postcssFunctions({
			functions: {
				icon,
			},
		}),
	],
};
