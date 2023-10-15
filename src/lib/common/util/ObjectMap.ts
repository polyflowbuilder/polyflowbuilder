// like a regular Map except the keys can be objects
// that can be compared non-referentially via the need
// for a key function to transform K into a string

interface ObjectMapConstructorOptions<K, V> {
  keyFunction: (input: K) => string;
  initItems: [K, V][];
}
export class ObjectMap<K, V> {
  _map: Map<string, V>;
  _keyFunction: (input: K) => string;

  constructor(options: Partial<ObjectMapConstructorOptions<K, V>> = {}) {
    this._map = new Map();

    if (options.keyFunction) {
      this._keyFunction = options.keyFunction;
    }

    if (options.initItems) {
      for (const [k, v] of options.initItems) {
        this.set(k, v);
      }
    }
  }

  get size() {
    return this._map.size;
  }

  delete(key: K) {
    const stringKey = this._keyFunction(key);
    return this._map.delete(stringKey);
  }

  entries() {
    return this._map.entries();
  }

  get(key: K) {
    const stringKey = this._keyFunction(key);
    return this._map.get(stringKey);
  }

  has(key: K) {
    const stringKey = this._keyFunction(key);
    return this._map.has(stringKey);
  }

  keys() {
    return this._map.keys();
  }

  set(key: K, value: V) {
    const stringKey = this._keyFunction(key);
    return this._map.set(stringKey, value);
  }

  values() {
    return this._map.values();
  }
}
