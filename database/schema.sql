-- ============================================
-- Expense Tracker Database Schema (New)
-- MySQL 8.0+
-- ============================================

CREATE DATABASE IF NOT EXISTS expense_tracker
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    currency CHAR(3) DEFAULT 'USD',
    profile_image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_email (email),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: categories
-- ============================================
CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'tag',
    color CHAR(7) DEFAULT '#6B7280',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_category_per_user (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: expenses
-- ============================================
CREATE TABLE expenses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED DEFAULT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT DEFAULT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_category_id (category_id),
    INDEX idx_user_date (user_id, expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: refresh_tokens
-- ============================================
CREATE TABLE refresh_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token(255)),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Default Categories
-- ============================================
INSERT INTO categories (user_id, name, icon, color, is_default) VALUES
(NULL, 'Food & Dining', 'utensils', '#EF4444', TRUE),
(NULL, 'Transportation', 'car', '#F59E0B', TRUE),
(NULL, 'Bills & Utilities', 'file-text', '#3B82F6', TRUE),
(NULL, 'Entertainment', 'film', '#8B5CF6', TRUE),
(NULL, 'Shopping', 'shopping-bag', '#EC4899', TRUE),
(NULL, 'Healthcare', 'heart', '#10B981', TRUE),
(NULL, 'Education', 'book', '#6366F1', TRUE),
(NULL, 'Others', 'more-horizontal', '#6B7280', TRUE);

-- Show tables
SHOW TABLES;
