/**
 * SQL Code Snippets and Syntax Token Drills
 */

export const SQL_SNIPPETS: string[] = [
  `WITH RankedScores AS (
  SELECT
    user_id,
    score,
    ROW_NUMBER() OVER (PARTITION BY game_id ORDER BY score DESC) as rank
  FROM leaderboard_entries
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT user_id, score
FROM RankedScores
WHERE rank <= 10;`,

  `SELECT
  c.customer_id,
  c.email,
  COUNT(o.order_id) AS total_orders,
  COALESCE(SUM(o.amount), 0.0) AS lifetime_value
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.email
HAVING COUNT(o.order_id) >= 5
ORDER BY lifetime_value DESC;`,

  `CREATE INDEX CONCURRENTLY idx_users_active_lookup
ON users (tenant_id, status)
WHERE deleted_at IS NULL;`
];

export const SQL_DRILL_SYMBOLS = [
  'SELECT', 'WHERE', 'JOIN', 'LEFT JOIN', 'GROUP BY', 'HAVING', 'ORDER BY',
  'COUNT()', 'SUM()', 'COALESCE()', '<=', '>=', '!=', '::uuid', '->>', 'RETURNING *;'
];

