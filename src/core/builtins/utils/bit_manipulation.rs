pub const fn nbit16(n: u16, i: u8) -> bool {
    (n >> i) & 1 != 0
}

const fn placebit16(b: bool, i: u8) -> u16 {
    (b as u16) << i
}

#[allow(clippy::too_many_arguments)]
pub const fn word16_16(
    a: bool,
    b: bool,
    c: bool,
    d: bool,
    e: bool,
    f: bool,
    g: bool,
    h: bool,
    i: bool,
    j: bool,
    k: bool,
    l: bool,
    m: bool,
    n: bool,
    o: bool,
    p: bool,
) -> u16 {
    placebit16(a, 0)
        | placebit16(b, 1)
        | placebit16(c, 2)
        | placebit16(d, 3)
        | placebit16(e, 4)
        | placebit16(f, 5)
        | placebit16(g, 6)
        | placebit16(h, 7)
        | placebit16(i, 8)
        | placebit16(j, 9)
        | placebit16(k, 10)
        | placebit16(l, 11)
        | placebit16(m, 12)
        | placebit16(n, 13)
        | placebit16(o, 14)
        | placebit16(p, 15)
}

pub const fn slice16_0to12(n: u16) -> u16 {
    n & 8191
}

pub const fn slice16_0to13(n: u16) -> u16 {
    n & 16383
}

pub const fn slice16_0to14(n: u16) -> u16 {
    n & 32767
}
