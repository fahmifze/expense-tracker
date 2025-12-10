-- ============================================
-- Expense Tracker Database Schema (v2.0)
-- MySQL 8.0+
-- Features: Budget, Income, Recurring, Insights
-- ============================================

CREATE DATABASE IF NOT EXISTS expense_tracker
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

-- Drop tables if they exist (for clean setup)
-- Drop in reverse order of dependencies
DROP TABLE IF EXISTS expense_tags;
DROP TABLE IF EXISTS recurring_rules;
DROP TABLE IF EXISTS incomes;
DROP TABLE IF EXISTS income_categories;
DROP TABLE IF EXISTS budgets;
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
    language VARCHAR(10) DEFAULT 'en',
    profile_image_url VARCHAR(500) DEFAULT NULL,
    dashboard_config JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_email (email),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: categories (Expense Categories)
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
-- Table: income_categories
-- ============================================
CREATE TABLE income_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'dollar-sign',
    color CHAR(7) DEFAULT '#10B981',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_income_category_per_user (user_id, name)
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
    notes TEXT DEFAULT NULL,
    receipt_url VARCHAR(500) DEFAULT NULL,
    expense_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_rule_id INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_category_id (category_id),
    INDEX idx_user_date (user_id, expense_date),
    INDEX idx_user_category (user_id, category_id),
    INDEX idx_recurring (recurring_rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: expense_tags
-- ============================================
CREATE TABLE expense_tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expense_id INT UNSIGNED NOT NULL,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    INDEX idx_expense_id (expense_id),
    INDEX idx_tag (tag),
    UNIQUE KEY unique_tag_per_expense (expense_id, tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: incomes
-- ============================================
CREATE TABLE incomes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED DEFAULT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    income_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_rule_id INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES income_categories(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_income_date (income_date),
    INDEX idx_category_id (category_id),
    INDEX idx_user_date (user_id, income_date),
    INDEX idx_recurring (recurring_rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: budgets
-- ============================================
CREATE TABLE budgets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED DEFAULT NULL,  -- NULL = overall budget (all categories)
    amount DECIMAL(12, 2) NOT NULL,
    period ENUM('weekly', 'monthly', 'yearly') DEFAULT 'monthly',
    alert_at_80 BOOLEAN DEFAULT TRUE,
    alert_at_100 BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT NULL,  -- NULL = always active
    end_date DATE DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_active (is_active),
    UNIQUE KEY unique_budget_per_user_category_period (user_id, category_id, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: recurring_rules
-- ============================================
CREATE TABLE recurring_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    type ENUM('expense', 'income') NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT DEFAULT NULL,
    frequency ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    interval_value INT UNSIGNED DEFAULT 1,  -- e.g., every 2 weeks
    day_of_week TINYINT UNSIGNED DEFAULT NULL,  -- 0=Sunday, 6=Saturday (for weekly)
    day_of_month TINYINT UNSIGNED DEFAULT NULL,  -- 1-31 (for monthly)
    month_of_year TINYINT UNSIGNED DEFAULT NULL,  -- 1-12 (for yearly)
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    next_occurrence DATE NOT NULL,
    last_processed DATE DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_next_occurrence (next_occurrence),
    INDEX idx_active (is_active),
    INDEX idx_active_next (is_active, next_occurrence)
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
-- Default Expense Categories
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

-- ============================================
-- Default Income Categories
-- ============================================
INSERT INTO income_categories (user_id, name, icon, color, is_default) VALUES
(NULL, 'Salary', 'briefcase', '#10B981', TRUE),
(NULL, 'Freelance', 'laptop', '#3B82F6', TRUE),
(NULL, 'Investment', 'trending-up', '#8B5CF6', TRUE),
(NULL, 'Business', 'building', '#F59E0B', TRUE),
(NULL, 'Rental', 'home', '#EC4899', TRUE),
(NULL, 'Gift', 'gift', '#EF4444', TRUE),
(NULL, 'Refund', 'refresh-cw', '#6366F1', TRUE),
(NULL, 'Other Income', 'plus-circle', '#6B7280', TRUE);

-- Show tables
SHOW TABLES;
