import { importMetaResolve } from './esmLoader.mjs';

console.log(Date.now(), '[main]: before');

console.log(Date.now(), `[main]: 'foo' yielded '${importMetaResolve('foo')}'`);
console.log(Date.now(), `[main]: 'bar' yielded '${importMetaResolve('bar')}'`);

console.log(Date.now(), '[main]: after');
