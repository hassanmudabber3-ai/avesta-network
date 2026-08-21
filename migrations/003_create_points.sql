CREATE TABLE IF NOT EXISTS point_transactions (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    amount BIGINT NOT NULL
        CHECK (amount <> 0),

    type VARCHAR(50) NOT NULL
        CHECK (
            type IN (
                'task_reward',
                'referral_reward',
                'campaign_reward',
                'influencer_reward',
                'admin_adjustment',
                'penalty'
            )
        ),

    reference_type VARCHAR(50),

    reference_id BIGINT,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user
    ON point_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_type
    ON point_transactions(type);

CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at
    ON point_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_point_transactions_reference
    ON point_transactions(reference_type, reference_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_point_reward
ON point_transactions (
    user_id,
    type,
    reference_type,
    reference_id
)
WHERE reference_type IS NOT NULL
  AND reference_id IS NOT NULL;
