-- Fix security warnings by setting search_path for functions
DROP FUNCTION IF EXISTS reset_monthly_message_counters();
DROP FUNCTION IF EXISTS check_subscription_limits(UUID, TEXT);

-- Recreate functions with proper search_path security
CREATE OR REPLACE FUNCTION reset_monthly_message_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscribers 
  SET 
    messages_used_current_month = 0,
    last_message_reset_date = CURRENT_DATE
  WHERE last_message_reset_date < CURRENT_DATE;
END;
$$;

-- Create function to check subscription limits with proper security
CREATE OR REPLACE FUNCTION check_subscription_limits(p_user_id UUID, p_limit_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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