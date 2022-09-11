import { importMetaResolve } from './esmLoader.mjs';

console.log('[Main]:', 'Resolve foo');
const fooVal = importMetaResolve('foo');
console.log('[Main]:', `Foo is ${fooVal}`);

console.log('[Main]:', 'Resolve bar');
const barVal = importMetaResolve('bar');
console.log('[Main]:', `Bar is ${barVal}`);
