import { parentPort, workerData } from 'node:worker_threads';

console.log(process.hrtime(), '[worker]: initialised');

parentPort.on('message', ({ sab, requestor, type, value }) => {
	console.log(
		process.hrtime(),
		`[worker]: received a ${type} request for '${value}'`
	);

	setTimeout(() => {
		const output = handlers[type]?.(value);
		console.log(process.hrtime(), `[worker]: responding '${output}'`);
		requestor.postMessage(output);
		Atomics.notify(new Int32Array(sab), 0, 1);
	}, 1_000);
});

const handlers = {
	resolve(v) {
		return `./something/${v}.mjs`;
	},
};

Atomics.notify(new Int32Array(workerData.sab), 0, 1);
