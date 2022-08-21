import { parentPort, workerData } from 'node:worker_threads';

console.log(Date.now(), '[worker]: initialised');

parentPort.on('message', ({ lock, requestor, type, value }) => {
	console.log(Date.now(), `[worker]: received a ${type} request for '${value}'`);

	setTimeout(() => {
		const output = handlers[type]?.(value);
		console.log(Date.now(), `[worker]: responding '${output}'`);
		requestor.postMessage(output);
		Atomics.notify(lock, 0);
	}, 1_000);
});

const handlers = {
	resolve(v) {
		return `./something/${v}.mjs`;
	},
};

Atomics.notify(workerData.lock, 0);
