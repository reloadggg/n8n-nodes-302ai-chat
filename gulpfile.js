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

	return src(credSource).pipe(dest(credDestination));
}

function createIndex(done) {
	const indexContent = `// Export nodes
module.exports = {
	nodes: [
		require('./nodes/ThreeZeroTwoAI/ThreeZeroTwoAi.node.js')
	],
	credentials: [
		require('./credentials/ThreeZeroTwoAIApi.credentials.js')
	]
};`;
	
	fs.writeFileSync(path.resolve('dist', 'index.js'), indexContent);
	done();
}
