-- Create profiles table for user data (separate from auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create logs table (stores only timestamps and log type, no medical values)
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('glucose', 'bp', 'activity', 'diet', 'medication', 'weight')),
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drift events table
CREATE TABLE public.drift_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  drift_type TEXT NOT NULL CHECK (drift_type IN ('frequency_drop', 'irregular_timing', 'missed_routine', 'sparse_variety')),
  drift_level TEXT NOT NULL CHECK (drift_level IN ('none', 'mild', 'moderate', 'significant')),
  engagement_score INTEGER NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create nudges table
CREATE TABLE public.nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  nudge_type TEXT NOT NULL DEFAULT 'encouragement',
  tone TEXT NOT NULL DEFAULT 'warm',
  language TEXT NOT NULL DEFAULT 'en',
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drift_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own logs" 
ON public.activity_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs" 
ON public.activity_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs" 
ON public.activity_logs FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for drift_events
CREATE POLICY "Users can view their own drift events" 
ON public.drift_events FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drift events" 
ON public.drift_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for nudges
CREATE POLICY "Users can view their own nudges" 
ON public.nudges FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nudges" 
ON public.nudges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nudges" 
ON public.nudges FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_logged_at ON public.activity_logs(logged_at DESC);
CREATE INDEX idx_drift_events_user_id ON public.drift_events(user_id);
CREATE INDEX idx_drift_events_detected_at ON public.drift_events(detected_at DESC);
CREATE INDEX idx_nudges_user_id ON public.nudges(user_id);
CREATE INDEX idx_nudges_sent_at ON public.nudges(sent_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();