const path = require('path');
const fs = require('fs');
const { task, src, dest } = require('gulp');

task('build:icons', copyIcons);
task('create:index', createIndex);

function copyIcons() {
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
	const nodeDestination = path.resolve('dist', 'nodes');

	src(nodeSource).pipe(dest(nodeDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');

	src(credSource).pipe(dest(credDestination));

	// Copy icons from icons directory
	const iconSource = path.resolve('icons', '*.{png,svg}');
	const iconDestination = path.resolve('dist', 'icons');

	return src(iconSource).pipe(dest(iconDestination));
}

function createIndex(done) {
	const indexContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreeZeroTwoAI = void 0;
const ThreeZeroTwoAi_node_1 = require("./nodes/ThreeZeroTwoAI/ThreeZeroTwoAi.node");
exports.ThreeZeroTwoAI = ThreeZeroTwoAi_node_1.ThreeZeroTwoAI;`;
	
	fs.writeFileSync(path.resolve('dist', 'index.js'), indexContent);
	done();
}
