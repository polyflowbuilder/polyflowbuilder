// ObjectSet class behaves like a set, but for deep objects
// takes a function to map objects of a certain type to a string ID,
// used as the key in the internal Map

export class ObjectSet<T> {
  #itemMap: Map<string, T>;
  #keyFunction: (input: T) => string;

  constructor(keyFunction: (input: T) => string, items: T[] = []) {
    this.#itemMap = new Map<string, T>();
    this.#keyFunction = keyFunction;

    for (const item of items) {
      this.add(item);
    }
  }

  get size() {
    return this.#itemMap.size;
  }

  add(item: T) {
    const key = this.#keyFunction(item);
    if (!this.#itemMap.has(key)) {
      this.#itemMap.set(key, item);
    }
  }

  get(key: string) {
    return this.#itemMap.get(key);
  }

  clear() {
    this.#itemMap.clear();
  }

  delete(item: T) {
    const key = this.#keyFunction(item);
    return this.deleteByKey(key);
  }

  deleteByKey(key: string) {
    return this.#itemMap.delete(key);
  }

  keys() {
    return this.#itemMap.keys();
  }

  values() {
    return this.#itemMap.values();
  }

  has(item: T) {
    const key = this.#keyFunction(item);
    return this.#itemMap.has(key);
  }
}
