CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (
            status IN (
                'draft',
                'active',
                'paused',
                'completed',
                'cancelled'
            )
        ),

    reward_points BIGINT NOT NULL DEFAULT 0,

    budget_points BIGINT NOT NULL DEFAULT 0,

    target_users BIGINT NOT NULL DEFAULT 0,

    current_users BIGINT NOT NULL DEFAULT 0,

    starts_at TIMESTAMPTZ,

    ends_at TIMESTAMPTZ,

    created_by BIGINT
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status
    ON campaigns(status);

CREATE INDEX IF NOT EXISTS idx_campaigns_created_at
    ON campaigns(created_at);

CREATE INDEX IF NOT EXISTS idx_campaigns_dates
    ON campaigns(starts_at, ends_at);
