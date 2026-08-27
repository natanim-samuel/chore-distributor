-- =========================================================
-- CHORE DISTRIBUTOR DATABASE
-- PostgreSQL Schema
-- =========================================================


-- =========================================================
-- EXTENSIONS
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    profile_image TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- HOUSEHOLDS
-- =========================================================

CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    owner_id UUID NOT NULL,

    invite_code VARCHAR(20) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_household_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- HOUSEHOLD MEMBERS
-- =========================================================

CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    household_id UUID NOT NULL,

    user_id UUID NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_member_household
        FOREIGN KEY (household_id)
        REFERENCES households(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_member_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_household_user
        UNIQUE (household_id, user_id),

    CONSTRAINT valid_member_role
        CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER'))
);


-- =========================================================
-- CHORE CATEGORIES
-- =========================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(50) NOT NULL,

    icon VARCHAR(20),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_category_name
        UNIQUE (name)
);


-- =========================================================
-- CHORES
-- =========================================================

CREATE TABLE chores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    household_id UUID NOT NULL,

    category_id UUID,

    created_by UUID NOT NULL,

    title VARCHAR(150) NOT NULL,

    description TEXT,

    difficulty INTEGER NOT NULL DEFAULT 2,

    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',

    frequency VARCHAR(20) NOT NULL DEFAULT 'ONCE',

    estimated_minutes INTEGER,

    due_time TIME,

    start_date DATE,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_chore_household
        FOREIGN KEY (household_id)
        REFERENCES households(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_chore_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_chore_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_difficulty
        CHECK (difficulty BETWEEN 1 AND 5),

    CONSTRAINT valid_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),

    CONSTRAINT valid_frequency
        CHECK (
            frequency IN (
                'ONCE',
                'DAILY',
                'WEEKLY',
                'MONTHLY'
            )
        ),

    CONSTRAINT valid_estimated_minutes
        CHECK (
            estimated_minutes IS NULL
            OR estimated_minutes > 0
        )
);


-- =========================================================
-- CHORE ASSIGNMENTS
-- =========================================================

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    chore_id UUID NOT NULL,

    household_id UUID NOT NULL,

    assigned_to UUID NOT NULL,

    assigned_by UUID,

    assigned_date DATE NOT NULL,

    due_date DATE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    completed_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_assignment_chore
        FOREIGN KEY (chore_id)
        REFERENCES chores(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_household
        FOREIGN KEY (household_id)
        REFERENCES households(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_user
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_assigner
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT valid_assignment_status
        CHECK (
            status IN (
                'PENDING',
                'IN_PROGRESS',
                'COMPLETED',
                'OVERDUE',
                'SKIPPED'
            )
        ),

    CONSTRAINT valid_assignment_dates
        CHECK (due_date >= assigned_date)
);


-- =========================================================
-- CHORE HISTORY
-- =========================================================

CREATE TABLE chore_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assignment_id UUID,

    chore_id UUID NOT NULL,

    user_id UUID NOT NULL,

    household_id UUID NOT NULL,

    action VARCHAR(30) NOT NULL,

    old_status VARCHAR(20),

    new_status VARCHAR(20),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_history_assignment
        FOREIGN KEY (assignment_id)
        REFERENCES assignments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_history_chore
        FOREIGN KEY (chore_id)
        REFERENCES chores(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_household
        FOREIGN KEY (household_id)
        REFERENCES households(id)
        ON DELETE CASCADE
);


-- =========================================================
-- MEMBER AVAILABILITY
-- =========================================================

CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    household_id UUID NOT NULL,

    user_id UUID NOT NULL,

    day_of_week INTEGER NOT NULL,

    available BOOLEAN NOT NULL DEFAULT TRUE,

    start_time TIME,

    end_time TIME,

    CONSTRAINT fk_availability_household
        FOREIGN KEY (household_id)
        REFERENCES households(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_availability_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_day_of_week
        CHECK (day_of_week BETWEEN 0 AND 6),

    CONSTRAINT valid_availability_time
        CHECK (
            start_time IS NULL
            OR end_time IS NULL
            OR end_time > start_time
        ),

    CONSTRAINT unique_member_day
        UNIQUE (household_id, user_id, day_of_week)
);


-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    household_id UUID,

    type VARCHAR(40) NOT NULL,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    read BOOLEAN NOT NULL DEFAULT FALSE,

    related_assignment_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_household
        FOREIGN KEY (household_id)
        REFERENCES households(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_assignment
        FOREIGN KEY (related_assignment_id)
        REFERENCES assignments(id)
        ON DELETE SET NULL
);


-- =========================================================
-- REFRESH TOKENS
-- =========================================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token_hash TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_household_members_household
    ON household_members(household_id);

CREATE INDEX idx_household_members_user
    ON household_members(user_id);

CREATE INDEX idx_chores_household
    ON chores(household_id);

CREATE INDEX idx_chores_category
    ON chores(category_id);

CREATE INDEX idx_assignments_household
    ON assignments(household_id);

CREATE INDEX idx_assignments_user
    ON assignments(assigned_to);

CREATE INDEX idx_assignments_chore
    ON assignments(chore_id);

CREATE INDEX idx_assignments_due_date
    ON assignments(due_date);

CREATE INDEX idx_assignments_status
    ON assignments(status);

CREATE INDEX idx_history_household
    ON chore_history(household_id);

CREATE INDEX idx_history_user
    ON chore_history(user_id);

CREATE INDEX idx_notifications_user
    ON notifications(user_id);

CREATE INDEX idx_notifications_unread
    ON notifications(user_id, read);

CREATE INDEX idx_refresh_tokens_user
    ON refresh_tokens(user_id);


-- =========================================================
-- DEFAULT CATEGORIES
-- =========================================================

INSERT INTO categories (name, icon)
VALUES
    ('Kitchen', '🍳'),
    ('Bathroom', '🚿'),
    ('Cleaning', '🧹'),
    ('Laundry', '👕'),
    ('Trash', '🗑️'),
    ('Shopping', '🛒'),
    ('Outdoor', '🌱'),
    ('Bedroom', '🛏️'),
    ('Pets', '🐕'),
    ('Other', '📋')
ON CONFLICT (name) DO NOTHING;