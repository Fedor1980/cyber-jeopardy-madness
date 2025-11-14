-- Cyber Jeopardy Madness Database Schema
-- Version: 2.0.0
-- Description: Complete schema for enterprise cybersecurity training platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'player', 'facilitator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Industry packs table
CREATE TABLE industry_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    industry_type VARCHAR(50) NOT NULL,
    compliance_frameworks TEXT[],
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_industry_packs_type ON industry_packs(industry_type);
CREATE INDEX idx_industry_packs_active ON industry_packs(is_active);

-- Game sessions table
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    industry_pack VARCHAR(50) NOT NULL,
    current_round INTEGER NOT NULL DEFAULT 1,
    current_team_id UUID,
    status VARCHAR(20) NOT NULL CHECK (status IN ('setup', 'round_1', 'round_2', 'final_jeopardy', 'completed')),
    settings JSONB NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_status ON game_sessions(status);
CREATE INDEX idx_sessions_created_by ON game_sessions(created_by);
CREATE INDEX idx_sessions_industry_pack ON game_sessions(industry_pack);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    order_position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_session ON teams(session_id);
CREATE INDEX idx_teams_score ON teams(score DESC);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    industry_pack VARCHAR(50) NOT NULL,
    round INTEGER NOT NULL CHECK (round IN (1, 2)),
    description TEXT,
    order_position INTEGER NOT NULL
);

CREATE INDEX idx_categories_pack_round ON categories(industry_pack, round);
CREATE INDEX idx_categories_order ON categories(order_position);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    industry_pack VARCHAR(50) NOT NULL,
    round INTEGER NOT NULL CHECK (round IN (1, 2, 3)),
    point_value INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    distractors JSONB NOT NULL,
    explanation TEXT,
    compliance_reference VARCHAR(255),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    learning_outcome TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_pack_round ON questions(industry_pack, round);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- Question attempts table
CREATE TABLE question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_awarded INTEGER NOT NULL,
    time_taken INTEGER NOT NULL,
    hint_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempts_session ON question_attempts(session_id);
CREATE INDEX idx_attempts_team ON question_attempts(team_id);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);
CREATE UNIQUE INDEX idx_attempts_session_question ON question_attempts(session_id, question_id);

-- Final Jeopardy wagers table
CREATE TABLE final_jeopardy_wagers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    wager_amount INTEGER NOT NULL,
    answer TEXT,
    is_correct BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, team_id)
);

CREATE INDEX idx_wagers_session ON final_jeopardy_wagers(session_id);
CREATE INDEX idx_wagers_team ON final_jeopardy_wagers(team_id);

-- AI hints cache table
CREATE TABLE ai_hints_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    hint_type VARCHAR(20) NOT NULL CHECK (hint_type IN ('basic', 'detailed', 'explanation')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, hint_type)
);

CREATE INDEX idx_hints_question ON ai_hints_cache(question_id);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Update trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for current_team_id after teams table is created
ALTER TABLE game_sessions
    ADD CONSTRAINT fk_current_team
    FOREIGN KEY (current_team_id)
    REFERENCES teams(id)
    ON DELETE SET NULL;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for authentication and authorization';
COMMENT ON TABLE industry_packs IS 'Industry-specific question packs (Federal Credit Union, Finance, Healthcare, etc.)';
COMMENT ON TABLE game_sessions IS 'Game sessions with teams and settings';
COMMENT ON TABLE teams IS 'Teams participating in game sessions';
COMMENT ON TABLE categories IS 'Question categories for each round';
COMMENT ON TABLE questions IS 'Cybersecurity training questions';
COMMENT ON TABLE question_attempts IS 'Team answers to questions';
COMMENT ON TABLE final_jeopardy_wagers IS 'Final Jeopardy wagers and answers';
COMMENT ON TABLE ai_hints_cache IS 'Cached AI-generated hints to reduce API calls';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';
