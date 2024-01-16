pub fn bool_from_u16(n: u16) -> bool {
    n != 0
}

pub fn u16_from_bool(b: bool) -> u16 {
    u16::from(b)
}

pub fn nbit16(n: u16, i: u8) -> bool {
    bool_from_u16((n >> i) & 1)
}

pub fn nbit16_0(n: u16) -> bool {
    bool_from_u16(n & 1)
}

fn placebit16(b: bool, i: u8) -> u16 {
    u16_from_bool(b) << i
}

fn placebit16_0(b: bool) -> u16 {
    u16_from_bool(b)
}

#[allow(clippy::too_many_arguments)]
pub fn word16_16(
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
    placebit16_0(a)
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

pub fn slice16_0to12(n: u16) -> u16 {
    n & 8191
}

pub fn slice16_0to13(n: u16) -> u16 {
    n & 16383
}

pub fn slice16_0to14(n: u16) -> u16 {
    n & 32767
}
