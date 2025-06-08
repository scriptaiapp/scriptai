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

  // referrals table - tracks user referrals
  referrals: `
    CREATE TABLE referrals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      credits_awarded INTEGER DEFAULT 5,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
}
