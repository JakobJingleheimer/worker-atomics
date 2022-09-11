import { parentPort, workerData } from 'node:worker_threads';

const { buf } = workerData;
const lock = new Int32Array(buf, 0, 4);
const data = new Uint8Array(buf, 4, 2044);

const handlers = {
	async resolve(v) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		return `./something/${v}.mjs`;
	}
};

parentPort.postMessage('initialized');

// event loop!
while (true) {
	// no need to block out own event loop
	Atomics.wait(lock, 0, 0);
	const request = JSON.parse(
		(new TextDecoder().decode(data))
			.replaceAll('\x00', '') // strip empty space
	);
	console.log('[Worker]:', { request })
	// async work is syncified
	const response = await handlers[request.type](request.data);
	data.fill(0);
	new TextEncoder().encodeInto(response, data);
	Atomics.store(lock, 0, 0);
	Atomics.notify(lock, 0);
}
