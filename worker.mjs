import { deserialize, serialize } from 'node:v8';
import { workerData } from 'node:worker_threads';

const { commsChannel } = workerData;
const lock = new Int32Array(commsChannel, 0, 4); // required by Atomics
const requestResponseData = new Uint8Array(commsChannel, 4, 2044); // for TextEncoder/TextDencoder

const handlers = {
	async resolve(v) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		return `./something/${v}.mjs`;
	}
};

Atomics.store(lock, 0, 1); // Send 'ready' signal to main
Atomics.notify(lock, 0); // Notify main of signal

while (true) { // event loop
	Atomics.wait(lock, 0, 1); // this pauses the while loop
	// worker is now active and main is sleeping
	const { data, type } = deserialize(requestResponseData);
	const response = await handlers[type](data);
	requestResponseData.fill(0);
	requestResponseData.set(serialize(response));
	Atomics.store(lock, 0, 1); // send response to main
	Atomics.notify(lock, 0); // notify main of new response
}
