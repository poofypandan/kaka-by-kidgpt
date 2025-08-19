-- Create subscribers table to track subscription information with Indonesian market tiers
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT CHECK (subscription_tier IN ('growing_minds', 'bright_futures', 'limitless_potential')),
  subscription_end TIMESTAMPTZ,
  children_limit INTEGER DEFAULT 2,
  monthly_messages_limit INTEGER DEFAULT 500,
  parent_accounts_limit INTEGER DEFAULT 1,
  messages_used_current_month INTEGER DEFAULT 0,
  last_message_reset_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create subscription usage tracking table
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('message', 'voice_input', 'activity')),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for usage tracking
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for usage tracking
CREATE POLICY "select_own_usage" ON public.subscription_usage
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "insert_usage" ON public.subscription_usage
FOR INSERT
WITH CHECK (true);

-- Create function to reset monthly message counters
CREATE OR REPLACE FUNCTION reset_monthly_message_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.subscribers 
  SET 
    messages_used_current_month = 0,
    last_message_reset_date = CURRENT_DATE
  WHERE last_message_reset_date < CURRENT_DATE;
END;
$$;

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits(p_user_id UUID, p_limit_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record RECORD;
  current_usage INTEGER := 0;
  result JSONB;
BEGIN
  -- Get subscription details
  SELECT * INTO sub_record 
  FROM public.subscribers 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'No subscription found');
  END IF;
  
  -- Reset monthly counters if needed
  IF sub_record.last_message_reset_date < CURRENT_DATE THEN
    UPDATE public.subscribers 
    SET 
      messages_used_current_month = 0,
      last_message_reset_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    sub_record.messages_used_current_month := 0;
  END IF;
  
  -- Check specific limits
  CASE p_limit_type
    WHEN 'messages' THEN
      IF sub_record.monthly_messages_limit = -1 THEN
        RETURN jsonb_build_object('allowed', true, 'unlimited', true);
      END IF;
      
      IF sub_record.messages_used_current_month >= sub_record.monthly_messages_limit THEN
        RETURN jsonb_build_object(
          'allowed', false, 
          'reason', 'Monthly message limit reached',
          'current_usage', sub_record.messages_used_current_month,
          'limit', sub_record.monthly_messages_limit
        );
      END IF;
      
      RETURN jsonb_build_object(
        'allowed', true,
        'current_usage', sub_record.messages_used_current_month,
        'limit', sub_record.monthly_messages_limit
      );
      
    WHEN 'children' THEN
      SELECT COUNT(*) INTO current_usage
      FROM public.family_members fm
      JOIN public.family_members fm_parent ON fm.family_id = fm_parent.family_id
      WHERE fm_parent.user_id = p_user_id 
        AND fm_parent.role IN ('primary_parent', 'secondary_parent')
        AND fm.role = 'child';
      
      IF sub_record.children_limit = -1 THEN
        RETURN jsonb_build_object('allowed', true, 'unlimited', true);
      END IF;
      
      IF current_usage >= sub_record.children_limit THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', 'Children limit reached',
          'current_usage', current_usage,
          'limit', sub_record.children_limit
        );
      END IF;
      
      RETURN jsonb_build_object(
        'allowed', true,
        'current_usage', current_usage,
        'limit', sub_record.children_limit
      );
      
    ELSE
      RETURN jsonb_build_object('allowed', false, 'reason', 'Unknown limit type');
  END CASE;
END;
$$;