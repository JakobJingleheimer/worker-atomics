import { deserialize, serialize } from 'node:v8';
import { Worker } from 'node:worker_threads';

const commsChannel = new SharedArrayBuffer(2048);
const lock = new Int32Array(commsChannel, 0, 4); // required by Atomics
// lock = 0 → main sleeps
// lock = 1 → worker sleeps
const requestResponseData = new Uint8Array(commsChannel, 4, 2044); // for TextEncoder/TextDencoder

const worker = new Worker('./worker.mjs', {
	workerData: { commsChannel },
});
worker.unref(); // ! Allow the process to eventually exit when worker is in its final sleep.

Atomics.wait(lock, 0, 0); // ! Block this module until the worker is ready.

export function importMetaResolve(specifier) {
	requestResponseData.fill(0);
	const request = serialize({
		data: specifier,
		type: 'resolve',
	});
	requestResponseData.set(request);
	Atomics.store(lock, 0, 0); // send request to worker
	Atomics.notify(lock, 0); // notify worker of new request
	Atomics.wait(lock, 0, 0); // sleep until worker responds
	return deserialize(requestResponseData);
}
