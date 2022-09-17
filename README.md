This experiment creates a minimal, representative proof of concept for an asynchronous ESMLoader behaving synchronously. The most complex features of ESM are `import.meta.resolve()` and dynamic `import()` because both of them happen outside the initial module graph yet depend on it (some modules are stateful, like jest and testdouble), so the simplest solution would seamlessly persist state.

This uses a [worker](https://nodejs.org/api/worker_threads.html) and [Atomics](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Atomics). The Atomics serve as both the communication and data transport vehicles: the main sleeps whenever the worker is active, and the worker sleeps whenever the main is active.

Run the experiment:

```console
node main.mjs
```
