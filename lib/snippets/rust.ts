/**
 * Rust Code Snippets and Syntax Token Drills
 * Real-world patterns: Result, Option, pattern matching, structs, traits, closures.
 */

export const RUST_SNIPPETS: string[] = [
  `pub fn parse_and_sum(inputs: &[&str]) -> Result<i64, std::num::ParseIntError> {
  let mut total = 0i64;
  for s in inputs {
    let num: i64 = s.trim().parse()?;
    total += num;
  }
  Ok(total)
}`,

  `pub struct ConnectionPool<T> {
  connections: Vec<T>,
  max_size: usize,
}

impl<T> ConnectionPool<T> {
  pub fn new(max_size: usize) -> Self {
    Self { connections: Vec::with_capacity(max_size), max_size }
  }
  pub fn acquire(&mut self) -> Option<T> {
    self.connections.pop()
  }
}`,

  `pub fn evaluate_status(code: u16) -> &'static str {
  match code {
    200..=299 => "Success",
    400..=499 => "Client Error",
    500..=599 => "Server Error",
    _ => "Unknown Status",
  }
}`,

  `pub fn transform_data<T, F, R>(items: Vec<T>, mut predicate: F) -> Vec<R>
where
  F: FnMut(T) -> Option<R>,
{
  items.into_iter().filter_map(|item| predicate(item)).collect()
}`,

  `use std::sync::{Arc, Mutex};
use std::thread;

pub fn parallel_increment(threads: usize, iters: usize) -> usize {
  let counter = Arc::new(Mutex::new(0));
  let handles: Vec<_> = (0..threads).map(|_| {
    let c = Arc::clone(&counter);
    thread::spawn(move || {
      for _ in 0..iters {
        let mut guard = c.lock().unwrap();
        *guard += 1;
      }
    })
  }).collect();
  for h in handles { h.join().unwrap(); }
  let val = *counter.lock().unwrap();
  val
}`
];

export const RUST_DRILL_SYMBOLS = [
  '::', '->', '=>', '&mut', 'Option<T>', 'Result<T, E>', 'unwrap()', '?',
  'match', 'impl<T>', 'pub fn', 'Vec<T>', '|x|', 'Arc::clone', '*guard',
  '#[derive(Debug)]', '&self', '&mut self', 'usize', 'i64'
];

