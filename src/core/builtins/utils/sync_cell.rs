use std::cell::{LazyCell, OnceCell};
use std::ops::Deref;

// I chose to have my own newtypes instead of using LazyLock
// and OnceLock because they have other threading and atomic
// logic I don't want

// Honestly thinking about it again it probably doesnt
// matter but I've already coded it so here you go

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

pub struct SyncOnceCell<T>(OnceCell<T>);
impl<T> SyncOnceCell<T> {
    pub const fn new() -> Self {
        Self(OnceCell::new())
    }
}
impl<T> Deref for SyncOnceCell<T> {
    type Target = OnceCell<T>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
unsafe impl<T> Sync for SyncOnceCell<T> {}
unsafe impl<T> Send for SyncOnceCell<T> {}
