export const isArray = Array.isArray

export function isUndef (v: any): v is undefined | null {
  return v === undefined || v === null
}

export function isUndefined (v: any): v is undefined {
  return v === undefined
}

export function isFalse (v: any): v is false {
  return v === false
}

export function isTrue (v: any): v is true {
  return v === true
}

export function isDef<T> (v: T): v is NonNullable<T> {
  return v !== undefined && v !== null
}

export function isBoolean (v: any): boolean {
  return typeof v === 'boolean'
}

export function isString (str: any): str is string {
  return typeof str === 'string'
}

export function isFunction (value: any): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function isNumber (val: any): val is Number {
  return typeof val === 'number'
}

export function isObject (obj: any): boolean {
  return obj !== null && typeof obj === 'object'
}

const _toString = Object.prototype.toString

export function isPlainObject (obj: any): boolean {
  return _toString.call(obj) === '[object Object]'
}

export function isRegExp (v: any): v is RegExp {
  return _toString.call(v) === '[object RegExp]'
}
