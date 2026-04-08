class Memory {
  constructor() {
    this.store = {};
  }

  set(key, value) {
    this.store[key] = value;
  }

  get(key) {
    return this.store[key];
  }

  getAll() {
    return this.store;
  }
}

export { Memory };