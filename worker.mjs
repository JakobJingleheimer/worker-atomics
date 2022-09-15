import { parentPort, workerData } from 'node:worker_threads';

const { buf } = workerData;
const lock = new Int32Array(buf, 0, 4); // required by Atomics
const data = new Uint8Array(buf, 4, 2044); // for TextEncoder/TextDencoder

const handlers = {
	async resolve(v) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		return `./something/${v}.mjs`;
	}
};

parentPort.postMessage('initialized');

while (true) { // event loop
	Atomics.wait(lock, 0, 0); // this pauses the while loop
	// worker is now active and main is sleeping
	const request = JSON.parse(
		(new TextDecoder().decode(data))
			.replaceAll('\x00', '') // strip empty space (not a great solution)
	);
	const response = await handlers[request.type](request.data);
	data.fill(0);
	new TextEncoder().encodeInto(response, data);
	Atomics.store(lock, 0, 0); // send response to main
	Atomics.notify(lock, 0); // notify main of new response
}
