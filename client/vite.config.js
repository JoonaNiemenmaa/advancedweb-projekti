import { resolve } from "path";

export default {
	root: resolve(__dirname, "src"),
	build: {
		outDir: "dist",
	},
	server: {
		port: 8080,
	},

	/* This bit silences sass deprecation warnings that come with bootstrap */
	css: {
		preprocessorOptions: {
			scss: {
				silenceDeprecations: [
					"import",
					"mixed-decls",
					"color-functions",
					"global-builtin",
					"if-function",
				],
			},
		},
	},
};
