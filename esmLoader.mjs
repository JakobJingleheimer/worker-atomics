import { Worker, MessageChannel, receiveMessageOnPort } from 'node:worker_threads';

const lock = new Int32Array(new SharedArrayBuffer(4)); // required by Atomics
// lock = 0 → main sleeps

const synchronousCommChannel = new MessageChannel();

const worker = new Worker('./worker.mjs', {
	workerData: { lock, commPort: synchronousCommChannel.port2 },
	transferList: [synchronousCommChannel.port2]
});

let jobId = 0;
const jobs = new Map();
worker.on('message', ({id, message}) => {
	jobs.get(id).resolve(message);
	jobs.delete(id);
});

lockThread();

export function importMetaResolve(specifier) {
	return doSyncWork({data: specifier, type: 'resolve'});
}


export function asyncResolve(specifier) {
	return doAsyncWork({data: specifier, type: 'resolve'});
}

export function terminate() {
	worker.terminate();
}

function doSyncWork(message) {
	synchronousCommChannel.port1.postMessage(message);
	lockThread();
	return receiveMessageOnPort(synchronousCommChannel.port1).message;
}

function doAsyncWork(message) {
	return new Promise((resolve) => {
		const id = jobId++;
		jobs.set(id, {resolve});
		worker.postMessage({id, ...message});
	});
}

function lockThread() {
	Atomics.store(lock, 0, 0);
	Atomics.wait(lock, 0, 0);
}
