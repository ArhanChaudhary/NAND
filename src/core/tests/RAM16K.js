/**
            import { RAM16K, tick, tock } from "./build/release.js";
            window.RAM16K = RAM16K;
            window.c = a => [...('0000000000000000' + (a >>> 0).toString(2)).slice(-16)].map(i => i === '1' ? true : false);
            window.a = a => [...('0000000000000000' + (a >>> 0).toString(2)).slice(-14)].map(i => i === '1' ? true : false);
            function parse16BitBinary(binaryString) {
                const isNegative = binaryString[0] === '1';
                let decimalNumber = parseInt(binaryString.substring(1), 2);
                if (isNegative) {
                    decimalNumber = -(Math.pow(2, 15) - decimalNumber);
                }
                return decimalNumber;
            }
            window.i = a => parse16BitBinary(a.map(i => i ? '1' : '0').join(''));


tick()
console.log(i(RAM16K(c(0), false, a(0))) === 0)
tock()
console.log(i(RAM16K(c(0), false, a(0))) === 0)
tick()
console.log(i(RAM16K(c(0), true, a(0))) === 0)
tock()
console.log(i(RAM16K(c(0), true, a(0))) === 0)
tick()
console.log(i(RAM16K(c(4321), false, a(0))) === 0)
tock()
console.log(i(RAM16K(c(4321), false, a(0))) === 0)
tick()
console.log(i(RAM16K(c(4321), true, a(4321))) === 0)
tock()
console.log(i(RAM16K(c(4321), true, a(4321))) === 4321)
tick()
console.log(i(RAM16K(c(4321), false, a(0))) === 0)
tock()
console.log(i(RAM16K(c(4321), false, a(0))) === 0)
tick()
console.log(i(RAM16K(c(12345), false, a(12345))) === 0)
tock()
console.log(i(RAM16K(c(12345), false, a(12345))) === 0)
tick()
console.log(i(RAM16K(c(12345), true, a(12345))) === 0)
tock()
console.log(i(RAM16K(c(12345), true, a(12345))) === 12345)
tick()
console.log(i(RAM16K(c(12345), false, a(12345))) === 12345)
tock()
console.log(i(RAM16K(c(12345), false, a(12345))) === 12345)
tock()
console.log(i(RAM16K(c(12345), false, a(4321))) === 4321)
tick()
console.log(i(RAM16K(c(16383), false, a(4321))) === 4321)
tock()
console.log(i(RAM16K(c(16383), false, a(4321))) === 4321)
tick()
console.log(i(RAM16K(c(16383), true, a(16383))) === 0)
tock()
console.log(i(RAM16K(c(16383), true, a(16383))) === 16383)
tick()
console.log(i(RAM16K(c(16383), false, a(16383))) === 16383)
tock()
console.log(i(RAM16K(c(16383), false, a(16383))) === 16383)
tock()
console.log(i(RAM16K(c(16383), false, a(12345))) === 12345)
tock()
console.log(i(RAM16K(c(16383), false, a(16383))) === 16383)
tick()
console.log(i(RAM16K(c(16383), false, a(10920))) === 0)
tock()
console.log(i(RAM16K(c(16383), false, a(10920))) === 0)
tock()
console.log(i(RAM16K(c(16383), false, a(10921))) === 0)
tock()
console.log(i(RAM16K(c(16383), false, a(10922))) === 0)
tock()
console.log(i(RAM16K(c(16383), false, a(10923))) === 0)
tock()
console.log(i(RAM16K(c(16383), false, a(10924))) === 0)
tock()
console.log(i(RAM16K(c(16383), false, a(10925))) === 0)
tock()
console.log(i(RAM16K(c(16383), false, a(10926))) === 0)
tock()
console.log(i(RAM16K(c(16383), false, a(10927))) === 0)
tick()
console.log(i(RAM16K(c(21845), true, a(10920))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(10920))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10921))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(10921))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10922))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(10922))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10923))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(10923))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10924))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(10924))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10925))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(10925))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10926))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(10926))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10927))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(10920))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(10920))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(10920))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10920))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(10920))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(10921))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10921))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10921))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(10921))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(10922))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10922))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10922))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(10922))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(10923))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10923))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10923))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(10923))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(10924))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10924))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10924))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(10924))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(10925))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10925))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10925))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(10925))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(10926))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10926))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(10926))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(10926))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(10927))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(10927))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(10927))) === -21846)
tick()
console.log(i(RAM16K(c(21845), true, a(10927))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10920))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10921))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10922))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10923))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10924))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10925))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10926))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(10927))) === 21845)
tick()
console.log(i(RAM16K(c(21845), false, a(1365))) === 0)
tock()
console.log(i(RAM16K(c(21845), false, a(1365))) === 0)
tock()
console.log(i(RAM16K(c(21845), false, a(3413))) === 0)
tock()
console.log(i(RAM16K(c(21845), false, a(5461))) === 0)
tock()
console.log(i(RAM16K(c(21845), false, a(7509))) === 0)
tock()
console.log(i(RAM16K(c(21845), false, a(9557))) === 0)
tock()
console.log(i(RAM16K(c(21845), false, a(11605))) === 0)
tock()
console.log(i(RAM16K(c(21845), false, a(13653))) === 0)
tock()
console.log(i(RAM16K(c(21845), false, a(15701))) === 0)
tick()
console.log(i(RAM16K(c(21845), true, a(1365))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(1365))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(3413))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(3413))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(5461))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(5461))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(7509))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(7509))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(9557))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(9557))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(11605))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(11605))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(13653))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(13653))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(15701))) === 0)
tock()
console.log(i(RAM16K(c(21845), true, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(1365))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(1365))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(1365))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(1365))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(1365))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(3413))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(3413))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(3413))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(3413))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(5461))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(5461))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(5461))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(5461))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(7509))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(7509))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(7509))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(7509))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(9557))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(9557))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(9557))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(9557))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(11605))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(11605))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(11605))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(11605))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(13653))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(13653))) === -21846)
tock()
console.log(i(RAM16K(c(-21846), false, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), true, a(13653))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(13653))) === 21845)
tick()
console.log(i(RAM16K(c(-21846), true, a(15701))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), true, a(15701))) === -21846)
tick()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(-21846), false, a(15701))) === -21846)
tick()
console.log(i(RAM16K(c(21845), true, a(15701))) === -21846)
tock()
console.log(i(RAM16K(c(21845), true, a(15701))) === 21845)
tick()
console.log(i(RAM16K(c(21845), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(1365))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(3413))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(5461))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(7509))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(9557))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(11605))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(13653))) === 21845)
tock()
console.log(i(RAM16K(c(21845), false, a(15701))) === 21845)

 */