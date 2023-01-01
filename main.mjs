import { importMetaResolve, asyncResolve, terminate } from './esmLoader.mjs';

console.log('[Main]:', 'Resolve foo');
const fooVal = importMetaResolve('foo');
console.log('[Main]:', 'Foo is', fooVal);

Promise.all([
  asyncResolve('foo'),
  asyncResolve('bar'),
]).then(vals => console.log('[Main]:', 'Resolve async', vals));

console.log('[Main]:', 'Resolve bar');
const barVal = importMetaResolve('bar');
console.log('[Main]:', 'Bar is', barVal);

// Keep the thread alive a bit to get the last logs.
setTimeout(terminate, 100);
