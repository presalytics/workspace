import { isObject, has, get } from 'lodash-es'
import { strict as assert } from 'assert'

export function assertObject(value: unknown): boolean {
  assert(isObject(value))
  return true
}

export function getString(obj: unknown, key: string, defaultValue?: string): string {
  assertObject(obj)
  let value
  if (!has(obj, key)) {
    if (typeof defaultValue !== 'undefined') {
      if (typeof defaultValue !== "string") {
        throw new TypeError('Argument "defaultValue" must be of type "string"')
      }
      value = defaultValue
    } else {
      throw new Error(`Input object "obj" has no property "${key}"`)
    }
  } else {
    value = get(obj, key) as string
  }
  if (typeof value !== "string") {
    throw new TypeError(`Property "${key}" in object "obj" is not of type "string"`)
  }
  return value
}

export function getNumber(obj: unknown, key: string, defaultValue?: number): number {
  assertObject(obj)
  let value
  if (!has(obj, key)) {
    if (typeof defaultValue !== 'undefined') {
      if (typeof defaultValue !== 'number') {
        throw new TypeError('Argument "defaultValue" must be of type "number"')
      }
      value = defaultValue
    } else {
      throw new Error(`Input object "obj" has no property "${key}"`)
    }
  } else {
    value = get(obj, key) as number
  }
  if (typeof value !== "number") {
    throw new TypeError(`Property "${key}" in object "obj" is not of type "number"`)
  }
  return value
}


export function getUnknownChildObject(obj: unknown, key: string, defaultValue?: unknown): unknown {
  assertObject(obj)
  let value
  if (!has(obj, key)) {
    if (typeof defaultValue !== 'undefined') {
      if (typeof defaultValue !== 'object') {
        throw new TypeError('Argument "defaultValue" must be of type "object"')
      }
      value = defaultValue
    } else {
      throw new Error(`Input object "obj" has no property "${key}"`)
    }
  } else {
    value = get(obj, key) as unknown
  }
  if (typeof value !== "object") {
    throw new TypeError(`Property "${key}" in object "obj" is not of type "string"`)
  }
  return value
}


export function getBoolean(obj: unknown, key: string, defaultValue?: boolean): boolean {
  assertObject(obj)
  let value
  if (!has(obj, key)) {
    if (typeof defaultValue !== 'undefined') {
      if (typeof defaultValue !== 'boolean') {
        throw new TypeError('Argument "defaultValue" must be of type "boolean"')
      }
      value = defaultValue
    } else {
      throw new Error(`Input object "obj" has no property "${key}"`)
    }

  }
  value = get(obj, key) as boolean
  if (typeof value !== "boolean") {
    throw new TypeError(`Property "${key}" in object "obj" is not of type "boolean"`)
  }
  return value
}

export function getUnknownChildArray(obj: unknown, key: string, defaultValue?: Array<unknown>): Array<unknown> {
  assertObject(obj)
  let value
  if (!has(obj, key)) {
    if (typeof defaultValue !== 'undefined') {
      if (!Array.isArray(defaultValue)) {
        throw new TypeError('Argument "defaultValue" must be an array')
      }
      value = defaultValue
    }
    throw new Error(`Input object "obj" has no property "${key}"`)
  }
  value = get(obj, key) as Array<unknown>
  if (!Array.isArray(value)) {
    throw new TypeError(`Property "${key}" in object "obj" is not an array`)
  }
  return value
}
