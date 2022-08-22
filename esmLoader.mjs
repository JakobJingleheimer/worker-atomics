import { MessageChannel, Worker } from 'node:worker_threads';

const sab = new SharedArrayBuffer(4);
const lock = new Int32Array(sab);
const worker = new Worker('./worker.mjs', {
	workerData: {
		sab,
	},
});
worker.unref();

Atomics.wait(lock, 0, 0);

export function importMetaResolve(specifier) {
	let output;

	const sab = new SharedArrayBuffer(4);
	const lock = new Int32Array(sab);
	const { port1: responder, port2: requestor } = new MessageChannel();
	responder.once('message', (msg) => {
		console.log(process.hrtime(), `[ESMLoader]: incoming message '${msg}'`);
		output = msg;
	});
	worker.postMessage(
		{
			sab,
			requestor,
			type: 'resolve',
			value: specifier,
		},
		[requestor]
	);

	Atomics.wait(lock, 0, 0);

	console.log(
		process.hrtime(),
		`[ESMLoader]: '${specifier}' awakened with '${output}'`
	);

	return output;
}
