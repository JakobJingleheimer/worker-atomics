import { workerData, parentPort } from 'node:worker_threads';

const { lock, commPort } = workerData;

const handlers = {
	async resolve(v) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		return `./something/${v}.mjs`;
	}
};

commPort.on('message', handleSyncMessage);
parentPort.on('message', handleAsyncMessage);

Atomics.store(lock, 0, 1); // Send 'ready' signal to main
Atomics.notify(lock, 0); // Notify main of signal

async function handleSyncMessage({data, type}) {
	console.log('got sync message')
	const response = await handlers[type](data);
	commPort.postMessage(response);
	Atomics.store(lock, 0, 1); // send response to main
	Atomics.notify(lock, 0); // notify main of new response
}

async function handleAsyncMessage({id, data, type}) {
	console.log('got async message')
	const response = await handlers[type](data);
	parentPort.postMessage({id, message: response});
}