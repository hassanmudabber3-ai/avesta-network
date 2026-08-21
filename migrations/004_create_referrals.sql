CREATE TABLE IF NOT EXISTS referrals (
    id BIGSERIAL PRIMARY KEY,

    referrer_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    referred_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    reward_points BIGINT NOT NULL DEFAULT 0,

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'rejected')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    completed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS
idx_referrals_referred_unique
ON referrals (referred_id);

CREATE INDEX IF NOT EXISTS
idx_referrals_referrer
ON referrals (referrer_id);

CREATE INDEX IF NOT EXISTS
idx_referrals_status
ON referrals (status);
