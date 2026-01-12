CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')),
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE address (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    phone VARCHAR(15),
    is_default BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_address_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE waste_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);


CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    waste_type_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
    status VARCHAR(20) CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'SOLD', 'REMOVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER,

    CONSTRAINT fk_product_seller
        FOREIGN KEY (seller_id)
        REFERENCES users(id),

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES category(id),

    CONSTRAINT fk_product_waste_type
        FOREIGN KEY (waste_type_id)
        REFERENCES waste_type(id),

    CONSTRAINT fk_product_approved_by
        FOREIGN KEY (approved_by)
        REFERENCES users(id)
);


CREATE TABLE product_image (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_image_product
        FOREIGN KEY (product_id)
        REFERENCES product(id)
        ON DELETE CASCADE
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    delivery_address_id INTEGER NOT NULL,
    order_status VARCHAR(20) CHECK (
        order_status IN ('PLACED', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED')
    ),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_buyer
        FOREIGN KEY (buyer_id)
        REFERENCES users(id),

    CONSTRAINT fk_order_seller
        FOREIGN KEY (seller_id)
        REFERENCES users(id),

    CONSTRAINT fk_order_address
        FOREIGN KEY (delivery_address_id)
        REFERENCES address(id)
);


CREATE TABLE order_item (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(10,2) NOT NULL CHECK (price_at_purchase >= 0),

    CONSTRAINT fk_item_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_product
        FOREIGN KEY (product_id)
        REFERENCES product(id)
);


CREATE TABLE payment (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE,
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) CHECK (
        payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')
    ),
    transaction_reference VARCHAR(100),
    paid_at TIMESTAMP,

    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);


CREATE TABLE review (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_user
        FOREIGN KEY (reviewer_id)
        REFERENCES users(id),

    CONSTRAINT fk_review_product
        FOREIGN KEY (product_id)
        REFERENCES product(id),

    CONSTRAINT fk_review_seller
        FOREIGN KEY (seller_id)
        REFERENCES users(id)
);

