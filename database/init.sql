-- ==============================================================================
-- RecommendX Database Verification & Quick Health Check
-- ==============================================================================

-- 1. Check Table Counts
SELECT 
    'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 
    'products' AS table_name, COUNT(*) AS total_records FROM products
UNION ALL
SELECT 
    'user_behavior' AS table_name, COUNT(*) AS total_records FROM user_behavior
UNION ALL
SELECT 
    'recommendations' AS table_name, COUNT(*) AS total_records FROM recommendations;

-- 2. Inspect Sample Products with JSONB tags
SELECT id, name, category, price, tags FROM products LIMIT 5;

-- 3. Inspect Precomputed Recommendations with joins
SELECT 
    r.id,
    u.username,
    p.name AS recommended_product,
    r.score,
    r.reason,
    r.computed_at
FROM recommendations r
JOIN users u ON u.id = r.user_id
JOIN products p ON p.id = r.product_id
ORDER BY r.score DESC;
