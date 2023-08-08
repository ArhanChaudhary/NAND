async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    CPU(inM, instruction, reset) {
      // assembly/architecture/CPU(u16, u16, bool) => ~lib/staticarray/StaticArray<u16>
      reset = reset ? 1 : 0;
      return __liftStaticArray(__getU16, 1, exports.CPU(inM, instruction, reset) >>> 0);
    },
    step(reset) {
      // assembly/architecture/step(bool?) => void
      reset = reset ? 1 : 0;
      exports.__setArgumentsLength(arguments.length);
      exports.step(reset);
    },
    NAND(a, b) {
      // assembly/builtins/NAND(bool, bool) => bool
      a = a ? 1 : 0;
      b = b ? 1 : 0;
      return exports.NAND(a, b) != 0;
    },
    nBit16(n, i) {
      // assembly/builtins/nBit16(u16, u8) => bool
      return exports.nBit16(n, i) != 0;
    },
    nBit16_0(n) {
      // assembly/builtins/nBit16_0(u16) => bool
      return exports.nBit16_0(n) != 0;
    },
    word16_16(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
      // assembly/builtins/word16_16(bool, bool, bool, bool, bool, bool, bool, bool, bool, bool, bool, bool, bool, bool, bool, bool) => u16
      a = a ? 1 : 0;
      b = b ? 1 : 0;
      c = c ? 1 : 0;
      d = d ? 1 : 0;
      e = e ? 1 : 0;
      f = f ? 1 : 0;
      g = g ? 1 : 0;
      h = h ? 1 : 0;
      i = i ? 1 : 0;
      j = j ? 1 : 0;
      k = k ? 1 : 0;
      l = l ? 1 : 0;
      m = m ? 1 : 0;
      n = n ? 1 : 0;
      o = o ? 1 : 0;
      p = p ? 1 : 0;
      return exports.word16_16(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
    },
    DRegister(in_, load) {
      // assembly/builtins/DRegister(u16, bool) => u16
      load = load ? 1 : 0;
      return exports.DRegister(in_, load);
    },
    ARegister(in_, load) {
      // assembly/builtins/ARegister(u16, bool) => u16
      load = load ? 1 : 0;
      return exports.ARegister(in_, load);
    },
    RAM16K(in_, load, address) {
      // assembly/builtins/RAM16K(u16, bool, u16) => u16
      load = load ? 1 : 0;
      return exports.RAM16K(in_, load, address);
    },
    Screen(in_, load, address) {
      // assembly/builtins/Screen(u16, bool, u16) => u16
      load = load ? 1 : 0;
      return exports.Screen(in_, load, address);
    },
    Keyboard(load, pressed) {
      // assembly/builtins/Keyboard(bool?, u16?) => u16
      load = load ? 1 : 0;
      exports.__setArgumentsLength(arguments.length);
      return exports.Keyboard(load, pressed);
    },
    loadROM(in_) {
      // assembly/builtins/loadROM(~lib/staticarray/StaticArray<~lib/string/String>) => void
      in_ = __lowerStaticArray((pointer, value) => { __setU32(pointer, __lowerString(value) || __notnull()); }, 5, 2, in_) || __notnull();
      exports.loadROM(in_);
    },
    getRAM() {
      // assembly/builtins/getRAM() => ~lib/staticarray/StaticArray<u16>
      return __liftStaticArray(__getU16, 1, exports.getRAM() >>> 0);
    },
    getScreen() {
      // assembly/builtins/getScreen() => ~lib/staticarray/StaticArray<u16>
      return __liftStaticArray(__getU16, 1, exports.getScreen() >>> 0);
    },
  }, exports);
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __lowerString(value) {
    if (value == null) return 0;
    const
      length = value.length,
      pointer = exports.__new(length << 1, 2) >>> 0,
      memoryU16 = new Uint16Array(memory.buffer);
    for (let i = 0; i < length; ++i) memoryU16[(pointer >>> 1) + i] = value.charCodeAt(i);
    return pointer;
  }
  function __liftStaticArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const
      length = __getU32(pointer - 4) >>> align,
      values = new Array(length);
    for (let i = 0; i < length; ++i) values[i] = liftElement(pointer + (i << align >>> 0));
    return values;
  }
  function __lowerStaticArray(lowerElement, id, align, values, typedConstructor) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, id)) >>> 0;
    if (typedConstructor) {
      new typedConstructor(memory.buffer, buffer, length).set(values);
    } else {
      for (let i = 0; i < length; i++) lowerElement(buffer + (i << align >>> 0), values[i]);
    }
    exports.__unpin(buffer);
    return buffer;
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  let __dataview = new DataView(memory.buffer);
  function __setU32(pointer, value) {
    try {
      __dataview.setUint32(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint32(pointer, value, true);
    }
  }
  function __getU16(pointer) {
    try {
      return __dataview.getUint16(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint16(pointer, true);
    }
  }
  function __getU32(pointer) {
    try {
      return __dataview.getUint32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint32(pointer, true);
    }
  }
  return adaptedExports;
}
export const {
  memory,
  CPU,
  step,
  NAND,
  tick,
  tock,
  nBit16,
  nBit16_0,
  word16_16,
  slice16_0to12,
  slice16_0to14,
  slice16_13to14,
  PC_reg,
  DRegister,
  ARegister,
  RAM16K,
  ROM32K,
  Screen,
  Keyboard,
  loadROM,
  getRAM,
  getScreen,
} = await (async url => instantiate(
  await (async () => {
    try { return await globalThis.WebAssembly.compileStreaming(globalThis.fetch(url)); }
    catch { return globalThis.WebAssembly.compile(await (await import("node:fs/promises")).readFile(url)); }
  })(), {
  }
))(new URL("release.wasm", import.meta.url));
