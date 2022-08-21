import { MessageChannel, Worker } from 'node:worker_threads';

const lock = new Int32Array(new SharedArrayBuffer(4));
const worker = new Worker('./worker.mjs', {
	workerData: {
		lock,
	}
});

Atomics.wait(lock, 0, 0);

export function importMetaResolve(specifier) {
	let output;

	const lock = new Int32Array(new SharedArrayBuffer(4));
	const {
		port1: responder,
		port2: requestor,
	} = new MessageChannel();
	responder.once('message', (msg) => {
		console.log(Date.now(), `[ESMLoader]: incoming message '${msg }'`);
		output = msg;
	});
	worker.postMessage({
		lock,
		requestor,
		type: 'resolve',
		value: specifier,
	}, [requestor]);

	Atomics.wait(lock, 0, 0);

	console.log(Date.now(), `[ESMLoader]: '${specifier}' awakened with '${output}'`);

	return output;
}
