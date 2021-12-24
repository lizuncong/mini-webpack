
// 从modules及其依赖中提取简化信息
const extraceBlockInfoMap = compilation => {
	const blockInfoMap = new Map();
	let currentModule;
	let block;
	let blockQueue;
	let blockInfoModules;
	let blockInfoBlocks;

    // 遍历compilation.modules，对每一个module，遍历module.dependencies
    // 获取每个依赖对应的module，构造module和module所依赖的模块的对应关系
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
				modules: blockInfoModules, // 是一个集合，保存着模块所依赖的模块
				blocks: blockInfoBlocks // 对主流程来讲是个空数组
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


    // PART ONE, 为inputChunkGroups即entry point的_moduleIndices，_moduleIndices2
    // 赋值
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
