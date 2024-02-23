use std::{cell::LazyCell, ops::Deref};

pub struct SyncLazyCell<T>(LazyCell<T>);
impl<T> SyncLazyCell<T> {
    pub const fn new(callback: fn() -> T) -> Self {
        Self(LazyCell::new(callback))
    }
}
impl<T> Deref for SyncLazyCell<T> {
    type Target = T;
    fn deref(&self) -> &T {
        self.0.deref()
    }
}
unsafe impl<T> Sync for SyncLazyCell<T> {}
unsafe impl<T> Send for SyncLazyCell<T> {}
