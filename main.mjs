import { importMetaResolve } from './esmLoader.mjs';

console.log('Resolve foo');
const fooVal = importMetaResolve('foo');
console.log(`Foo is ${fooVal}`);

console.log('Resolve bar');
const barVal = importMetaResolve('bar');
console.log(`Bar is ${barVal}`);
