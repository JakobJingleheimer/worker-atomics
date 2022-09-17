import { Worker } from 'node:worker_threads';

const buf = new SharedArrayBuffer(2048);
const lock = new Int32Array(buf, 0, 4); // required by Atomics

// request / response memory space
const data = new Uint8Array(buf, 4, 2044); // for TextEncoder/TextDencoder

const worker = new Worker('./worker.mjs', {
	workerData: { buf },
});
worker.on('exit', () => console.log(`[ESMLoader]: worker ${worker.threadId} terminated`))
worker.on('error', (err) => console.error(`[ESMLoader]: worker ${worker.threadId}`, err))

// This intentionally blocks this "ESMLoader" module until the worker is ready.
await new Promise(resolve => worker.once('message', resolve));

worker.unref(); // allow the process to exit when the worker is in its final sleep

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
