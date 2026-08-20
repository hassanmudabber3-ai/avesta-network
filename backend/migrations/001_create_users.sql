CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    telegram_id BIGINT UNIQUE NOT NULL,

    telegram_username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),

    role VARCHAR(30) NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),

    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'banned', 'deleted')),

    language VARCHAR(10) NOT NULL DEFAULT 'en',

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_username
    ON users (telegram_username);

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);

CREATE INDEX IF NOT EXISTS idx_users_status
    ON users (status);

CREATE INDEX IF NOT EXISTS idx_users_created_at
    ON users (created_at);
