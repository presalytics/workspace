import { strict as assert } from 'assert'

String.prototype.interpolate = function(params: unknown) {
  assert(typeof params === 'object')
  assert(params !== null)
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}

export {}