import { Worker } from 'node:worker_threads';

const comsChannel = new SharedArrayBuffer(2048);
const lock = new Int32Array(comsChannel, 0, 4); // required by Atomics

// request / response memory space
const data = new Uint8Array(comsChannel, 4, 2044); // for TextEncoder/TextDencoder

const worker = new Worker('./worker.mjs', {
	workerData: { comsChannel },
});
worker.unref(); // ! Allow the process to eventually exit when worker is in its final sleep.

Atomics.wait(lock, 0, 1); // ! Block this module until the worker is ready.

export function importMetaResolve(specifier) {
	data.fill(0);
	const request = JSON.stringify({
		data: specifier,
		type: 'resolve',
	});
	new TextEncoder().encodeInto(request, data);
	Atomics.store(lock, 0, 1); // send request to worker
	Atomics.notify(lock, 0); // notify worker of new request
	Atomics.wait(lock, 0, 1); // sleep until worker responds
	return new TextDecoder().decode(data);
}
