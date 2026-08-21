CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,

    campaign_id BIGINT
        REFERENCES campaigns(id)
        ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    category VARCHAR(50) NOT NULL DEFAULT 'general',

    reward_points BIGINT NOT NULL DEFAULT 0
        CHECK (reward_points >= 0),

    target_url TEXT,

    icon VARCHAR(100),

    status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (
            status IN (
                'draft',
                'active',
                'paused',
                'completed',
                'cancelled'
            )
        ),

    max_completions BIGINT NOT NULL DEFAULT 0
        CHECK (max_completions >= 0),

    completion_count BIGINT NOT NULL DEFAULT 0
        CHECK (completion_count >= 0),

    starts_at TIMESTAMPTZ,

    ends_at TIMESTAMPTZ,

    created_by BIGINT
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_campaign
    ON tasks(campaign_id);

CREATE INDEX IF NOT EXISTS idx_tasks_status
    ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_tasks_category
    ON tasks(category);

CREATE INDEX IF NOT EXISTS idx_tasks_dates
    ON tasks(starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_tasks_created_at
    ON tasks(created_at);
