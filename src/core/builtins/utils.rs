pub mod bit_manipulation;
pub mod js_api;
pub mod sync_cell;

pub const ALL_STEPS_PER_LOOP: [usize; 11] = [
    1, 10, 500, 2000, 8000, 15000, 22500, 29250, 29500, 29750, 30000,
];
