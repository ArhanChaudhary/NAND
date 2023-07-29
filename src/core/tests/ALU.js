import assert from "assert";
import { ALU } from "../build/debug.js";
assert.strictEqual(ALU(0, -1, 21), 0)
assert.strictEqual(ALU(0, -1, 63), 1)
assert.strictEqual(ALU(0, -1, 23), 65535)
assert.strictEqual(ALU(0, -1, 12), 0)
assert.strictEqual(ALU(0, -1, 3), 65535)
assert.strictEqual(ALU(0, -1, 44), 65535)
assert.strictEqual(ALU(0, -1, 35), 0)
assert.strictEqual(ALU(0, -1, 60), 0)
assert.strictEqual(ALU(0, -1, 51), 1)
assert.strictEqual(ALU(0, -1, 62), 1)
assert.strictEqual(ALU(0, -1, 59), 0)
assert.strictEqual(ALU(0, -1, 28), 65535)
assert.strictEqual(ALU(0, -1, 19), 65534)
assert.strictEqual(ALU(0, -1, 16), 65535)
assert.strictEqual(ALU(0, -1, 50), 1)
assert.strictEqual(ALU(0, -1, 56), 65535)
assert.strictEqual(ALU(0, -1, 0), 0)
assert.strictEqual(ALU(0, -1, 42), 65535)
assert.strictEqual(ALU(17, 3, 21), 0)
assert.strictEqual(ALU(17, 3, 63), 1)
assert.strictEqual(ALU(17, 3, 23), 65535)
assert.strictEqual(ALU(17, 3, 12), 17)
assert.strictEqual(ALU(17, 3, 3), 3)
assert.strictEqual(ALU(17, 3, 44), 65518)
assert.strictEqual(ALU(17, 3, 35), 65532)
assert.strictEqual(ALU(17, 3, 60), 65519)
assert.strictEqual(ALU(17, 3, 51), 65533)
assert.strictEqual(ALU(17, 3, 62), 18)
assert.strictEqual(ALU(17, 3, 59), 4)
assert.strictEqual(ALU(17, 3, 28), 16)
assert.strictEqual(ALU(17, 3, 19), 2)
assert.strictEqual(ALU(17, 3, 16), 20)
assert.strictEqual(ALU(17, 3, 50), 14)
assert.strictEqual(ALU(17, 3, 56), 65522)
assert.strictEqual(ALU(17, 3, 0), 1)
assert.strictEqual(ALU(17, 3, 42), 19)
console.log("All arithmetic test cases passed");