/** @type {import("steam-theming-utils").Config} */
export default {
	paths: {
		classMaps: "class_maps",
		dist: "dist",
		src: {
			client: "src",
		},
		ignore: {
			client: ["shared"],
		},
	},
	sass: {
		use: true,
		options: {},
	},
};
