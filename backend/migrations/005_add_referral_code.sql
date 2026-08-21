ALTER TABLE users
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS
idx_users_referral_code
ON users (referral_code)
WHERE referral_code IS NOT NULL;
