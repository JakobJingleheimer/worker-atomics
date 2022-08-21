import { importMetaResolve } from './esmLoader.mjs';

console.log(process.hrtime(), '[main]: before');

console.log(process.hrtime(), `[main]: 'foo' yielded '${importMetaResolve('foo')}'`);
console.log(process.hrtime(), `[main]: 'bar' yielded '${importMetaResolve('bar')}'`);

console.log(process.hrtime(), '[main]: after');
