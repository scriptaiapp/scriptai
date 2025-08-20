// This file contains the schema definitions for Supabase tables
// You can use this as a reference when setting up your Supabase database

export const schema = {
  // Users table (handled by Supabase Auth)
  // profiles table - extended user information
  profiles: `
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT,
      email TEXT,
      credits INTEGER DEFAULT 3,
      ai_trained BOOLEAN DEFAULT FALSE,
      youtube_connected BOOLEAN DEFAULT FALSE,
      language TEXT DEFAULT 'english',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // user_style table - stores AI training data
  user_style: `
    CREATE TABLE user_style (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      tone TEXT,
      vocabulary_level TEXT,
      pacing TEXT,
      themes TEXT,
      humor_style TEXT,
      structure TEXT,
      video_urls TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // scripts table - stores generated scripts
  scripts: `
    CREATE TABLE scripts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      prompt TEXT,
      context TEXT,
      tone TEXT,
      include_storytelling BOOLEAN DEFAULT FALSE,
      references TEXT,
      language TEXT DEFAULT 'english',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // referrals table - tracks user referrals with enhanced fields
  referrals: `
    CREATE TABLE referrals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      referred_email TEXT NOT NULL,
      referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
      credits_awarded INTEGER DEFAULT 0,
      referral_code TEXT NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
    CREATE INDEX idx_referrals_referred_email ON referrals(referred_email);
    CREATE INDEX idx_referrals_status ON referrals(status);
    CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
    
    -- Enable Row Level Security
    ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies
    CREATE POLICY "Users can view their own referrals" ON referrals
      FOR SELECT USING (auth.uid() = referrer_id);
    
    CREATE POLICY "Users can create referrals" ON referrals
      FOR INSERT WITH CHECK (auth.uid() = referrer_id);
    
    CREATE POLICY "Users can update their own referrals" ON referrals
      FOR UPDATE USING (auth.uid() = referrer_id);
  `,
}
