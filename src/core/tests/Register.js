/*function c(a: i32): StaticArray<boolean> {
    const ret = new StaticArray<boolean>(16);
    const thing: string[] = ('0000000000000000' + (a >>> 0).toString(2)).slice(-16).split('');
    for (let i = 0; i < ret.length; i++) {
        ret[i] = thing[i] === '1' ? true : false;
    }
    return ret;
}

export function test(): void {
    const reg = new Register();
    tick()
    console.log(`${reg.call(c(0), false).toString()===c(0).toString()}`);
    tock()
    console.log(`${reg.call(c(0), false).toString()===c(0).toString()}`);
    tick()
    console.log(`${reg.call(c(0), true).toString()===c(0).toString()}`);
    tock()
    console.log(`${reg.call(c(0), true).toString()===c(0).toString()}`);
    tick()
    console.log(`${reg.call(c(-32123), false).toString()===c(0).toString()}`);
    tock()
    console.log(`${reg.call(c(-32123), false).toString()===c(0).toString()}`);
    tick()
    console.log(`${reg.call(c(11111), false).toString()===c(0).toString()}`);
    tock()
    console.log(`${reg.call(c(11111), false).toString()===c(0).toString()}`);
    tick()
    console.log(`${reg.call(c(-32123), true).toString()===c(0).toString()}`);
    tock()
    console.log(`${reg.call(c(-32123), true).toString()===c(-32123).toString()}`);
    tick()
    console.log(`${reg.call(c(-32123), true).toString()===c(-32123).toString()}`);
    tock()
    console.log(`${reg.call(c(-32123), true).toString()===c(-32123).toString()}`);
    tick()
    console.log(`${reg.call(c(-32123), false).toString()===c(-32123).toString()}`);
    tock()
    console.log(`${reg.call(c(-32123), false).toString()===c(-32123).toString()}`);
    tick()
    console.log(`${reg.call(c(12345), true).toString()===c(-32123).toString()}`);
    tock()
    console.log(`${reg.call(c(12345), true).toString()===c(12345).toString()}`);
    tick()
    console.log(`${reg.call(c(0), false).toString()===c(12345).toString()}`);
    tock()
    console.log(`${reg.call(c(0), false).toString()===c(12345).toString()}`);
    tick()
    console.log(`${reg.call(c(0), true).toString()===c(12345).toString()}`);
    tock()
    console.log(`${reg.call(c(0), true).toString()===c(0).toString()}`);
    tick()
    console.log(`${reg.call(c(1), false).toString()===c(0).toString()}`);
    tock()
    console.log(`${reg.call(c(1), false).toString()===c(0).toString()}`);
    tick()
    console.log(`${reg.call(c(1), true).toString()===c(0).toString()}`);
    tock()
    console.log(`${reg.call(c(1), true).toString()===c(1).toString()}`);
    tick()
    console.log(`${reg.call(c(2), false).toString()===c(1).toString()}`);
    tock()
    console.log(`${reg.call(c(2), false).toString()===c(1).toString()}`);
    tick()
    console.log(`${reg.call(c(2), true).toString()===c(1).toString()}`);
    tock()
    console.log(`${reg.call(c(2), true).toString()===c(2).toString()}`);
    tick()
    console.log(`${reg.call(c(4), false).toString()===c(2).toString()}`);
    tock()
    console.log(`${reg.call(c(4), false).toString()===c(2).toString()}`);
    tick()
    console.log(`${reg.call(c(4), true).toString()===c(2).toString()}`);
    tock()
    console.log(`${reg.call(c(4), true).toString()===c(4).toString()}`);
    tick()
    console.log(`${reg.call(c(8), false).toString()===c(4).toString()}`);
    tock()
    console.log(`${reg.call(c(8), false).toString()===c(4).toString()}`);
    tick()
    console.log(`${reg.call(c(8), true).toString()===c(4).toString()}`);
    tock()
    console.log(`${reg.call(c(8), true).toString()===c(8).toString()}`);
    tick()
    console.log(`${reg.call(c(16), false).toString()===c(8).toString()}`);
    tock()
    console.log(`${reg.call(c(16), false).toString()===c(8).toString()}`);
    tick()
    console.log(`${reg.call(c(16), true).toString()===c(8).toString()}`);
    tock()
    console.log(`${reg.call(c(16), true).toString()===c(16).toString()}`);
    tick()
    console.log(`${reg.call(c(32), false).toString()===c(16).toString()}`);
    tock()
    console.log(`${reg.call(c(32), false).toString()===c(16).toString()}`);
    tick()
    console.log(`${reg.call(c(32), true).toString()===c(16).toString()}`);
    tock()
    console.log(`${reg.call(c(32), true).toString()===c(32).toString()}`);
    tick()
    console.log(`${reg.call(c(64), false).toString()===c(32).toString()}`);
    tock()
    console.log(`${reg.call(c(64), false).toString()===c(32).toString()}`);
    tick()
    console.log(`${reg.call(c(64), true).toString()===c(32).toString()}`);
    tock()
    console.log(`${reg.call(c(64), true).toString()===c(64).toString()}`);
    tick()
    console.log(`${reg.call(c(128), false).toString()===c(64).toString()}`);
    tock()
    console.log(`${reg.call(c(128), false).toString()===c(64).toString()}`);
    tick()
    console.log(`${reg.call(c(128), true).toString()===c(64).toString()}`);
    tock()
    console.log(`${reg.call(c(128), true).toString()===c(128).toString()}`);
    tick()
    console.log(`${reg.call(c(256), false).toString()===c(128).toString()}`);
    tock()
    console.log(`${reg.call(c(256), false).toString()===c(128).toString()}`);
    tick()
    console.log(`${reg.call(c(256), true).toString()===c(128).toString()}`);
    tock()
    console.log(`${reg.call(c(256), true).toString()===c(256).toString()}`);
    tick()
    console.log(`${reg.call(c(512), false).toString()===c(256).toString()}`);
    tock()
    console.log(`${reg.call(c(512), false).toString()===c(256).toString()}`);
    tick()
    console.log(`${reg.call(c(512), true).toString()===c(256).toString()}`);
    tock()
    console.log(`${reg.call(c(512), true).toString()===c(512).toString()}`);
    tick()
    console.log(`${reg.call(c(1024), false).toString()===c(512).toString()}`);
    tock()
    console.log(`${reg.call(c(1024), false).toString()===c(512).toString()}`);
    tick()
    console.log(`${reg.call(c(1024), true).toString()===c(512).toString()}`);
    tock()
    console.log(`${reg.call(c(1024), true).toString()===c(1024).toString()}`);
    tick()
    console.log(`${reg.call(c(2048), false).toString()===c(1024).toString()}`);
    tock()
    console.log(`${reg.call(c(2048), false).toString()===c(1024).toString()}`);
    tick()
    console.log(`${reg.call(c(2048), true).toString()===c(1024).toString()}`);
    tock()
    console.log(`${reg.call(c(2048), true).toString()===c(2048).toString()}`);
    tick()
    console.log(`${reg.call(c(4096), false).toString()===c(2048).toString()}`);
    tock()
    console.log(`${reg.call(c(4096), false).toString()===c(2048).toString()}`);
    tick()
    console.log(`${reg.call(c(4096), true).toString()===c(2048).toString()}`);
    tock()
    console.log(`${reg.call(c(4096), true).toString()===c(4096).toString()}`);
    tick()
    console.log(`${reg.call(c(8192), false).toString()===c(4096).toString()}`);
    tock()
    console.log(`${reg.call(c(8192), false).toString()===c(4096).toString()}`);
    tick()
    console.log(`${reg.call(c(8192), true).toString()===c(4096).toString()}`);
    tock()
    console.log(`${reg.call(c(8192), true).toString()===c(8192).toString()}`);
    tick()
    console.log(`${reg.call(c(16384), false).toString()===c(8192).toString()}`);
    tock()
    console.log(`${reg.call(c(16384), false).toString()===c(8192).toString()}`);
    tick()
    console.log(`${reg.call(c(16384), true).toString()===c(8192).toString()}`);
    tock()
    console.log(`${reg.call(c(16384), true).toString()===c(16384).toString()}`);
    tick()
    console.log(`${reg.call(c(-32768), false).toString()===c(16384).toString()}`);
    tock()
    console.log(`${reg.call(c(-32768), false).toString()===c(16384).toString()}`);
    tick()
    console.log(`${reg.call(c(-32768), true).toString()===c(16384).toString()}`);
    tock()
    console.log(`${reg.call(c(-32768), true).toString()===c(-32768).toString()}`);
    tick()
    console.log(`${reg.call(c(-2), false).toString()===c(-32768).toString()}`);
    tock()
    console.log(`${reg.call(c(-2), false).toString()===c(-32768).toString()}`);
    tick()
    console.log(`${reg.call(c(-2), true).toString()===c(-32768).toString()}`);
    tock()
    console.log(`${reg.call(c(-2), true).toString()===c(-2).toString()}`);
    tick()
    console.log(`${reg.call(c(-3), false).toString()===c(-2).toString()}`);
    tock()
    console.log(`${reg.call(c(-3), false).toString()===c(-2).toString()}`);
    tick()
    console.log(`${reg.call(c(-3), true).toString()===c(-2).toString()}`);
    tock()
    console.log(`${reg.call(c(-3), true).toString()===c(-3).toString()}`);
    tick()
    console.log(`${reg.call(c(-5), false).toString()===c(-3).toString()}`);
    tock()
    console.log(`${reg.call(c(-5), false).toString()===c(-3).toString()}`);
    tick()
    console.log(`${reg.call(c(-5), true).toString()===c(-3).toString()}`);
    tock()
    console.log(`${reg.call(c(-5), true).toString()===c(-5).toString()}`);
    tick()
    console.log(`${reg.call(c(-9), false).toString()===c(-5).toString()}`);
    tock()
    console.log(`${reg.call(c(-9), false).toString()===c(-5).toString()}`);
    tick()
    console.log(`${reg.call(c(-9), true).toString()===c(-5).toString()}`);
    tock()
    console.log(`${reg.call(c(-9), true).toString()===c(-9).toString()}`);
    tick()
    console.log(`${reg.call(c(-17), false).toString()===c(-9).toString()}`);
    tock()
    console.log(`${reg.call(c(-17), false).toString()===c(-9).toString()}`);
    tick()
    console.log(`${reg.call(c(-17), true).toString()===c(-9).toString()}`);
    tock()
    console.log(`${reg.call(c(-17), true).toString()===c(-17).toString()}`);
    tick()
    console.log(`${reg.call(c(-33), false).toString()===c(-17).toString()}`);
    tock()
    console.log(`${reg.call(c(-33), false).toString()===c(-17).toString()}`);
    tick()
    console.log(`${reg.call(c(-33), true).toString()===c(-17).toString()}`);
    tock()
    console.log(`${reg.call(c(-33), true).toString()===c(-33).toString()}`);
    tick()
    console.log(`${reg.call(c(-65), false).toString()===c(-33).toString()}`);
    tock()
    console.log(`${reg.call(c(-65), false).toString()===c(-33).toString()}`);
    tick()
    console.log(`${reg.call(c(-65), true).toString()===c(-33).toString()}`);
    tock()
    console.log(`${reg.call(c(-65), true).toString()===c(-65).toString()}`);
    tick()
    console.log(`${reg.call(c(-129), false).toString()===c(-65).toString()}`);
    tock()
    console.log(`${reg.call(c(-129), false).toString()===c(-65).toString()}`);
    tick()
    console.log(`${reg.call(c(-129), true).toString()===c(-65).toString()}`);
    tock()
    console.log(`${reg.call(c(-129), true).toString()===c(-129).toString()}`);
    tick()
    console.log(`${reg.call(c(-257), false).toString()===c(-129).toString()}`);
    tock()
    console.log(`${reg.call(c(-257), false).toString()===c(-129).toString()}`);
    tick()
    console.log(`${reg.call(c(-257), true).toString()===c(-129).toString()}`);
    tock()
    console.log(`${reg.call(c(-257), true).toString()===c(-257).toString()}`);
    tick()
    console.log(`${reg.call(c(-513), false).toString()===c(-257).toString()}`);
    tock()
    console.log(`${reg.call(c(-513), false).toString()===c(-257).toString()}`);
    tick()
    console.log(`${reg.call(c(-513), true).toString()===c(-257).toString()}`);
    tock()
    console.log(`${reg.call(c(-513), true).toString()===c(-513).toString()}`);
    tick()
    console.log(`${reg.call(c(-1025), false).toString()===c(-513).toString()}`);
    tock()
    console.log(`${reg.call(c(-1025), false).toString()===c(-513).toString()}`);
    tick()
    console.log(`${reg.call(c(-1025), true).toString()===c(-513).toString()}`);
    tock()
    console.log(`${reg.call(c(-1025), true).toString()===c(-1025).toString()}`);
    tick()
    console.log(`${reg.call(c(-2049), false).toString()===c(-1025).toString()}`);
    tock()
    console.log(`${reg.call(c(-2049), false).toString()===c(-1025).toString()}`);
    tick()
    console.log(`${reg.call(c(-2049), true).toString()===c(-1025).toString()}`);
    tock()
    console.log(`${reg.call(c(-2049), true).toString()===c(-2049).toString()}`);
    tick()
    console.log(`${reg.call(c(-4097), false).toString()===c(-2049).toString()}`);
    tock()
    console.log(`${reg.call(c(-4097), false).toString()===c(-2049).toString()}`);
    tick()
    console.log(`${reg.call(c(-4097), true).toString()===c(-2049).toString()}`);
    tock()
    console.log(`${reg.call(c(-4097), true).toString()===c(-4097).toString()}`);
    tick()
    console.log(`${reg.call(c(-8193), false).toString()===c(-4097).toString()}`);
    tock()
    console.log(`${reg.call(c(-8193), false).toString()===c(-4097).toString()}`);
    tick()
    console.log(`${reg.call(c(-8193), true).toString()===c(-4097).toString()}`);
    tock()
    console.log(`${reg.call(c(-8193), true).toString()===c(-8193).toString()}`);
    tick()
    console.log(`${reg.call(c(-16385), false).toString()===c(-8193).toString()}`);
    tock()
    console.log(`${reg.call(c(-16385), false).toString()===c(-8193).toString()}`);
    tick()
    console.log(`${reg.call(c(-16385), true).toString()===c(-8193).toString()}`);
    tock()
    console.log(`${reg.call(c(-16385), true).toString()===c(-16385).toString()}`);
    tick()
    console.log(`${reg.call(c(32767), false).toString()===c(-16385).toString()}`);
    tock()
    console.log(`${reg.call(c(32767), false).toString()===c(-16385).toString()}`);
    tick()
    console.log(`${reg.call(c(32767), true).toString()===c(-16385).toString()}`);
    tock()
    console.log(`${reg.call(c(32767), true).toString()===c(32767).toString()}`);
}*/