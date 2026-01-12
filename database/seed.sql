-- =========================
-- USERS
-- =========================
INSERT INTO users (username, email, password_hash, role, is_verified)
VALUES
('admin', 'admin@ecoexchange.com', 'hash_admin', 'ADMIN', TRUE),
('mod1', 'mod1@ecoexchange.com', 'hash_mod1', 'MODERATOR', TRUE),
('rahul', 'rahul@gmail.com', 'hash_rahul', 'USER', TRUE),
('priya', 'priya@gmail.com', 'hash_priya', 'USER', TRUE),
('amit', 'amit@gmail.com', 'hash_amit', 'USER', TRUE);

-- =========================
-- ADDRESSES
-- =========================
INSERT INTO address (user_id, line1, city, state, pincode, phone, is_default)
VALUES
(3, 'MG Road', 'Bangalore', 'Karnataka', '560001', '9876543210', TRUE),
(3, 'BTM Layout', 'Bangalore', 'Karnataka', '560076', '9876543211', FALSE),
(4, 'Salt Lake', 'Kolkata', 'West Bengal', '700091', '9123456789', TRUE),
(5, 'Sector 18', 'Noida', 'Uttar Pradesh', '201301', '9988776655', TRUE);

-- =========================
-- CATEGORY
-- =========================
INSERT INTO category (name, description)
VALUES
('Plastic', 'Plastic waste materials'),
('Metal', 'Scrap metal items'),
('Paper', 'Paper and cardboard waste'),
('Electronics', 'E-waste and electronic scrap');

-- =========================
-- WASTE TYPE
-- =========================
INSERT INTO waste_type (name, description)
VALUES
('Recyclable', 'Can be recycled'),
('Non-Recyclable', 'Cannot be recycled easily'),
('Hazardous', 'Requires special handling');

-- =========================
-- PRODUCTS
-- =========================
INSERT INTO product (
    seller_id, category_id, waste_type_id,
    title, description, price, quantity_available,
    status, approved_by
)
VALUES
(3, 1, 1, 'Plastic Bottles Bulk',
 'Used PET bottles, clean condition',
 200.00, 50, 'APPROVED', 1),

(3, 2, 1, 'Aluminium Scrap',
 'Mixed aluminium scrap',
 350.00, 30, 'APPROVED', 1),

(4, 3, 1, 'Old Newspapers',
 'Bundled old newspapers',
 120.00, 100, 'APPROVED', 1),

(5, 4, 3, 'Broken Mobile Phones',
 'Non-working smartphones for recycling',
 500.00, 20, 'PENDING', NULL);

-- =========================
-- PRODUCT IMAGES
-- =========================
INSERT INTO product_image (product_id, image_url, is_primary)
VALUES
(1, 'https://example.com/plastic1.jpg', TRUE),
(1, 'https://example.com/plastic2.jpg', FALSE),
(2, 'https://example.com/aluminium.jpg', TRUE),
(3, 'https://example.com/newspaper.jpg', TRUE);

-- =========================
-- ORDERS
-- =========================
INSERT INTO orders (
    buyer_id, seller_id, delivery_address_id,
    order_status, total_amount
)
VALUES
(4, 3, 3, 'COMPLETED', 400.00),
(5, 3, 4, 'SHIPPED', 350.00);

-- =========================
-- ORDER ITEMS
-- =========================
INSERT INTO order_item (
    order_id, product_id, quantity, price_at_purchase
)
VALUES
(1, 1, 2, 200.00),
(2, 2, 1, 350.00);

-- =========================
-- PAYMENTS
-- =========================
INSERT INTO payment (
    order_id, payment_method, payment_status,
    transaction_reference, paid_at
)
VALUES
(1, 'UPI', 'SUCCESS', 'TXN123456', NOW()),
(2, 'CARD', 'PENDING', 'TXN789012', NULL);

-- =========================
-- REVIEWS
-- =========================
INSERT INTO review (
    order_id, reviewer_id, product_id,
    seller_id, rating, comment
)
VALUES
(1, 4, 1, 3, 5, 'Good quality waste, delivered on time');

