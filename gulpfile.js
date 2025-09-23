const path = require("path");
const { src, dest, task } = require("gulp");

function copyIcons() {
	const nodeSource = path.resolve("nodes", "**", "*.{png,svg}");
	const nodeDestination = path.resolve("dist", "nodes");

	src(nodeSource).pipe(dest(nodeDestination));

	const credentialSource = path.resolve("credentials", "**", "*.{png,svg}");
	const credentialDestination = path.resolve("dist", "credentials");

	return src(credentialSource).pipe(dest(credentialDestination));
}

task("build:icons", copyIcons);

module.exports = {
	copyIcons,
};
