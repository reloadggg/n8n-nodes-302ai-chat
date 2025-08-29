// Export nodes
module.exports = {
	nodes: [
		require('./dist/nodes/ThreeZeroTwoAI/ThreeZeroTwoAi.node.js')
	],
	credentials: [
		require('./dist/credentials/ThreeZeroTwoAIApi.credentials.js')
	]
};