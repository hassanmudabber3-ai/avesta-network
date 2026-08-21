CREATE TABLE IF NOT EXISTS task_completions (
    id BIGSERIAL PRIMARY KEY,

    task_id BIGINT NOT NULL
        REFERENCES tasks(id)
        ON DELETE CASCADE,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    reward_points BIGINT NOT NULL DEFAULT 0,

    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_completions_task
    ON task_completions(task_id);

CREATE INDEX IF NOT EXISTS idx_task_completions_user
    ON task_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_task_completions_date
    ON task_completions(completed_at);
