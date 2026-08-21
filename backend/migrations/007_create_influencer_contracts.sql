CREATE TABLE IF NOT EXISTS influencer_contracts (
    id BIGSERIAL PRIMARY KEY,

    influencer_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    campaign_id BIGINT
        REFERENCES campaigns(id)
        ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    target_users BIGINT NOT NULL DEFAULT 0,

    reward_points BIGINT NOT NULL DEFAULT 0,

    bonus_points BIGINT NOT NULL DEFAULT 0,

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'active',
                'completed',
                'rejected',
                'cancelled'
            )
        ),

    accepted_at TIMESTAMPTZ,

    started_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_contracts_influencer
    ON influencer_contracts(influencer_id);

CREATE INDEX IF NOT EXISTS idx_influencer_contracts_campaign
    ON influencer_contracts(campaign_id);

CREATE INDEX IF NOT EXISTS idx_influencer_contracts_status
    ON influencer_contracts(status);
