/**
 * Python Code Snippets and Syntax Token Drills
 */

export const PYTHON_SNIPPETS: string[] = [
  `from typing import List, Optional, Dict

def binary_search(arr: List[int], target: int) -> Optional[int]:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return None`,

  `import asyncio
from dataclasses import dataclass

@dataclass
class TaskResult:
    task_id: str
    status: str
    duration_ms: float = 0.0

async def process_batch(items: list[dict]) -> list[TaskResult]:
    async with asyncio.TaskGroup() as tg:
        results = [tg.create_task(run_single(item)) for item in items]
    return [r.result() for r in results]`,

  `class Matrix:
    def __init__(self, rows: int, cols: int, default: float = 0.0):
        self.grid = [[default for _ in range(cols)] for _ in range(rows)]
        self.shape = (rows, cols)

    def __getitem__(self, idx: tuple[int, int]) -> float:
        r, c = idx
        return self.grid[r][c]`
];

export const PYTHON_DRILL_SYMBOLS = [
  '->', ':', '__init__', '[]', '()', '{}', '==', '!=', '<=', '>=', '//', '**',
  'self.', 'async def', '@dataclass', 'lambda x:', 'in range('
];

