console.log('[Main]:', 'Resolve foo');
const fooVal = await import.meta.resolve('./foo');
console.log('[Main]:', 'Foo is', fooVal);

console.log('[Main]:', 'Resolve bar');
const barVal = await import.meta.resolve('./bar');
console.log('[Main]:', 'Bar is', barVal);
