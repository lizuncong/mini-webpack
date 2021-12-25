
// 从modules及其依赖中提取简化信息
const extraceBlockInfoMap = compilation => {
	const blockInfoMap = new Map();
	let blockInfoModules;

    // 遍历compilation.modules，对每一个module，遍历module.dependencies
    // 获取每个依赖对应的module，构造module和module所依赖的模块的对应关系
	for (const module of compilation.modules) {
		blockInfoModules = new Set();

		for (const dep of module.dependencies) {
            blockInfoModules.add(dep.module)
        };

		const blockInfo = {
			modules: blockInfoModules, // 是一个集合，保存着模块所依赖的模块
			blocks: [] // 对主流程来讲是个空数组
		};
		blockInfoMap.set(module, blockInfo);
		
	}
	return blockInfoMap;
};


// 对每一个入口entry对应的入口模块，从入口模块开始，
// 递归处理依赖模块
// 1.关联入口chunk和module。遍历每一个module，将其依赖模块添加进入口chunk中
// 2.
const visitModules = (
	compilation,
	inputChunkGroups,
	chunkGroupInfoMap,
) => {

	const blockInfoMap = extraceBlockInfoMap(compilation);
	
	const chunkGroupCounters = new Map();
	for (const chunkGroup of inputChunkGroups) {
		chunkGroupCounters.set(chunkGroup, {
			index: 0,
			index2: 0
		});
	}

	let nextFreeModuleIndex = 0;
	let nextFreeModuleIndex2 = 0;


	// 添加模块，进入模块，处理模块，离开模块
	const ADD_AND_ENTER_MODULE = 0;
	const ENTER_MODULE = 1;
	const PROCESS_BLOCK = 2;
	const LEAVE_MODULE = 3;
	
	const reduceChunkGroupToQueueItem = (queue, chunkGroup) => {
		for (const chunk of chunkGroup.chunks) {
			const module = chunk.entryModule;
			queue.push({
				action: ENTER_MODULE,
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
	// 将inputChunkGroups里面的chunks扁平化
    let queue = inputChunkGroups
		.reduce(reduceChunkGroupToQueueItem, [])
		.reverse();
	
	let module;
	let chunk;
	let block;
	let chunkGroup;
	let chunkGroupInfo;

	while (queue.length) {
		while(queue.length){
			const queueItem = queue.pop();
			// block和module引用的都是module对象
			module = queueItem.module;
			block = queueItem.block;
			chunk = queueItem.chunk;
			if (chunkGroup !== queueItem.chunkGroup) {
				chunkGroup = queueItem.chunkGroup;
				chunkGroupInfo = chunkGroupInfoMap.get(chunkGroup);
			}

			switch (queueItem.action) {
				case ADD_AND_ENTER_MODULE: {
		
					// We connect Module and Chunk when not already done
					if (chunk.addModule(module)) {
						module.addChunk(chunk);
					} else {
						// already connected, skip it
						break;
					}
				}
				// fallthrough
				case ENTER_MODULE: {
					if (chunkGroup !== undefined) {
						const index = chunkGroup.getModuleIndex(module);
						if (index === undefined) {
							chunkGroup.setModuleIndex(
								module,
								chunkGroupCounters.get(chunkGroup).index++
							);
						}
					}
					if (module.index === null) {
						module.index = nextFreeModuleIndex++;
					}

					queue.push({
						action: LEAVE_MODULE,
						block,
						module,
						chunk,
						chunkGroup
					});
				}
				// fallthrough
				case PROCESS_BLOCK: {
					// get prepared block info
					const blockInfo = blockInfoMap.get(block);

					// Buffer items because order need to be reverse to get indicies correct
					const skipBuffer = [];
					const queueBuffer = [];
					// Traverse all referenced modules
					for (const refModule of blockInfo.modules) {
						// enqueue the add and enter to enter in the correct order
						// this is relevant with circular dependencies
						queueBuffer.push({
							action: ADD_AND_ENTER_MODULE,
							block: refModule,
							module: refModule,
							chunk,
							chunkGroup
						});
					}
			
					for (let i = queueBuffer.length - 1; i >= 0; i--) {
						queue.push(queueBuffer[i]);
					}

					break;
				}
				case LEAVE_MODULE: {
					if (chunkGroup !== undefined) {
						const index = chunkGroup.getModuleIndex2(module);
						if (index === undefined) {
							chunkGroup.setModuleIndex2(
								module,
								chunkGroupCounters.get(chunkGroup).index2++
							);
						}
					}

					if (module.index2 === null) {
						module.index2 = nextFreeModuleIndex2++;
					}

					break;
				}
			}
		}
	}
};


const buildChunkGraph = (compilation, inputChunkGroups) => {
	const chunkGroupInfoMap = new Map();


    // PART ONE, 为inputChunkGroups即entry point的_moduleIndices，_moduleIndices2
    // 赋值
	visitModules(
		compilation,
		inputChunkGroups,
		chunkGroupInfoMap
	);
};

module.exports = buildChunkGraph;
