-- ============================================
-- Migration: Add Budget, Income, Recurring Features
-- Run this on existing database to add new tables
-- ============================================

USE expense_tracker;

-- ============================================
-- Add new columns to users table (ignore if already exist)
-- ============================================
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'expense_tracker' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'language');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT "en" AFTER currency', 'SELECT "Column language already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Skip expenses modifications for now (optional columns)
-- ============================================

-- ============================================
-- Table: income_categories
-- ============================================
CREATE TABLE IF NOT EXISTS income_categories (
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
-- Table: incomes
-- ============================================
CREATE TABLE IF NOT EXISTS incomes (
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
CREATE TABLE IF NOT EXISTS budgets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED DEFAULT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    period ENUM('weekly', 'monthly', 'yearly') DEFAULT 'monthly',
    alert_at_80 BOOLEAN DEFAULT TRUE,
    alert_at_100 BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT NULL,
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
CREATE TABLE IF NOT EXISTS recurring_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    type ENUM('expense', 'income') NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT DEFAULT NULL,
    frequency ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    interval_value INT UNSIGNED DEFAULT 1,
    day_of_week TINYINT UNSIGNED DEFAULT NULL,
    day_of_month TINYINT UNSIGNED DEFAULT NULL,
    month_of_year TINYINT UNSIGNED DEFAULT NULL,
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
-- Table: expense_tags
-- ============================================
CREATE TABLE IF NOT EXISTS expense_tags (
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
-- Default Income Categories (only insert if table is empty)
-- ============================================
INSERT IGNORE INTO income_categories (user_id, name, icon, color, is_default) VALUES
(NULL, 'Salary', 'briefcase', '#10B981', TRUE),
(NULL, 'Freelance', 'laptop', '#3B82F6', TRUE),
(NULL, 'Investment', 'trending-up', '#8B5CF6', TRUE),
(NULL, 'Business', 'building', '#F59E0B', TRUE),
(NULL, 'Rental', 'home', '#EC4899', TRUE),
(NULL, 'Gift', 'gift', '#EF4444', TRUE),
(NULL, 'Refund', 'refresh-cw', '#6366F1', TRUE),
(NULL, 'Other Income', 'plus-circle', '#6B7280', TRUE);

-- Show all tables
SHOW TABLES;
