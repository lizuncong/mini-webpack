
// 从modules及其依赖中提取简化信息
const extraceBlockInfoMap = compilation => {
	const blockInfoMap = new Map();
	let currentModule;
	let block;
	let blockQueue;
	let blockInfoModules;
	let blockInfoBlocks;

	for (const module of compilation.modules) {
		blockQueue = [module];
		currentModule = module;
		while (blockQueue.length > 0) {
			block = blockQueue.pop();
			blockInfoModules = new Set();
			blockInfoBlocks = [];

			for (const dep of block.dependencies) {
                blockInfoModules.add(dep.module)
            };

			const blockInfo = {
				modules: blockInfoModules,
				blocks: blockInfoBlocks
			};
			blockInfoMap.set(block, blockInfo);
		}
	}
	return blockInfoMap;
};
const visitModules = (
	compilation,
	inputChunkGroups,
	chunkGroupInfoMap,
	blockConnections,
	blocksWithNestedBlocks,
	allCreatedChunkGroups
) => {
	const { namedChunkGroups } = compilation;

	const blockInfoMap = extraceBlockInfoMap(compilation);
	const reduceChunkGroupToQueueItem = (queue, chunkGroup) => {
		for (const chunk of chunkGroup.chunks) {
			const module = chunk.entryModule;
			queue.push({
				action: 1,
				block: module,
				module,
				chunk,
				chunkGroup
			});
		}
		chunkGroupInfoMap.set(chunkGroup, {
			chunkGroup,
			minAvailableModules: new Set(),
			minAvailableModulesOwned: true,
			availableModulesToBeMerged: [],
			skippedItems: [],
			resultingAvailableModules: undefined,
			children: undefined
		});
		return queue;
	};
    let queue = inputChunkGroups
		.reduce(reduceChunkGroupToQueueItem, [])
		.reverse();
    console.log('queue===', queue)
};


const buildChunkGraph = (compilation, inputChunkGroups) => {
	const blockConnections = new Map();
	const allCreatedChunkGroups = new Set();
	const chunkGroupInfoMap = new Map();
	const blocksWithNestedBlocks = new Set();


    // PART ONE
	visitModules(
		compilation,
		inputChunkGroups,
		chunkGroupInfoMap,
		blockConnections,
		blocksWithNestedBlocks,
		allCreatedChunkGroups
	);
};

module.exports = buildChunkGraph;
