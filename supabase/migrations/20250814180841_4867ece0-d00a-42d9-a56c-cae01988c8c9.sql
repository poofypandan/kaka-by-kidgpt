-- Create family account system tables

-- Family accounts table
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  primary_parent_id UUID,
  invite_code TEXT UNIQUE,
  invite_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Family members table (replaces current parent/child structure)
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('primary_parent', 'secondary_parent', 'child')),
  name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  daily_time_limit INTEGER DEFAULT 60, -- minutes
  content_filter_level TEXT DEFAULT 'moderate' CHECK (content_filter_level IN ('strict', 'moderate', 'basic')),
  islamic_content_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Family settings table
CREATE TABLE public.family_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  emergency_contacts JSONB,
  notification_preferences JSONB,
  default_child_time_limit INTEGER DEFAULT 60,
  family_pin TEXT,
  whatsapp_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id)
);

-- Child sessions table for monitoring
CREATE TABLE public.child_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  safety_alerts_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced conversation monitoring
CREATE TABLE public.family_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.child_sessions(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('child', 'kaka')),
  safety_score INTEGER DEFAULT 100,
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  parent_reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Family notifications table
CREATE TABLE public.family_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  read_by_primary BOOLEAN DEFAULT false,
  read_by_secondary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families
CREATE POLICY "Family members can view their family" 
ON public.families 
FOR SELECT 
USING (id IN (
  SELECT fm.family_id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Primary parents can update their family" 
ON public.families 
FOR UPDATE 
USING (primary_parent_id IN (
  SELECT fm.user_id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid() AND fm.role = 'primary_parent'
));

-- RLS Policies for family_members
CREATE POLICY "Family members can view family members" 
ON public.family_members 
FOR SELECT 
USING (family_id IN (
  SELECT fm.family_id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Parents can manage family members" 
ON public.family_members 
FOR ALL
USING (family_id IN (
  SELECT fm.family_id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid() AND fm.role IN ('primary_parent', 'secondary_parent')
));

-- RLS Policies for family_settings
CREATE POLICY "Parents can manage family settings" 
ON public.family_settings 
FOR ALL
USING (family_id IN (
  SELECT fm.family_id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid() AND fm.role IN ('primary_parent', 'secondary_parent')
));

-- RLS Policies for child_sessions
CREATE POLICY "Family members can view child sessions" 
ON public.child_sessions 
FOR SELECT 
USING (child_id IN (
  SELECT fm.id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid()
) OR child_id IN (
  SELECT fm.id 
  FROM public.family_members fm 
  WHERE fm.family_id IN (
    SELECT fm2.family_id 
    FROM public.family_members fm2 
    JOIN public.users u ON u.id = fm2.user_id 
    WHERE u.auth_user_id = auth.uid() AND fm2.role IN ('primary_parent', 'secondary_parent')
  )
));

CREATE POLICY "Children can create their own sessions" 
ON public.child_sessions 
FOR INSERT 
WITH CHECK (child_id IN (
  SELECT fm.id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid() AND fm.role = 'child'
));

-- RLS Policies for family_conversations
CREATE POLICY "Family members can view conversations" 
ON public.family_conversations 
FOR SELECT 
USING (family_id IN (
  SELECT fm.family_id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Children can create their own conversations" 
ON public.family_conversations 
FOR INSERT 
WITH CHECK (child_id IN (
  SELECT fm.id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid() AND fm.role = 'child'
));

-- RLS Policies for family_notifications
CREATE POLICY "Parents can view family notifications" 
ON public.family_notifications 
FOR SELECT 
USING (family_id IN (
  SELECT fm.family_id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid() AND fm.role IN ('primary_parent', 'secondary_parent')
));

CREATE POLICY "Parents can update family notifications" 
ON public.family_notifications 
FOR UPDATE 
USING (family_id IN (
  SELECT fm.family_id 
  FROM public.family_members fm 
  JOIN public.users u ON u.id = fm.user_id 
  WHERE u.auth_user_id = auth.uid() AND fm.role IN ('primary_parent', 'secondary_parent')
));

-- Functions for family management
CREATE OR REPLACE FUNCTION public.create_family_account(
  p_family_name TEXT,
  p_parent_name TEXT,
  p_parent_phone TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  family_id UUID;
  user_id UUID;
  invite_code TEXT;
BEGIN
  -- Generate unique invite code
  invite_code := upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Get current user
  SELECT id INTO user_id FROM public.users WHERE auth_user_id = auth.uid();
  
  -- Create family
  INSERT INTO public.families (name, invite_code, invite_expires_at)
  VALUES (p_family_name, invite_code, now() + interval '24 hours')
  RETURNING id INTO family_id;
  
  -- Add primary parent as family member
  INSERT INTO public.family_members (family_id, user_id, role, name, phone)
  VALUES (family_id, user_id, 'primary_parent', p_parent_name, p_parent_phone);
  
  -- Update family with primary parent
  UPDATE public.families 
  SET primary_parent_id = user_id 
  WHERE id = family_id;
  
  -- Create default family settings
  INSERT INTO public.family_settings (family_id)
  VALUES (family_id);
  
  RETURN family_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_family_with_code(
  p_invite_code TEXT,
  p_parent_name TEXT,
  p_parent_phone TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  family_id UUID;
  user_id UUID;
BEGIN
  -- Get current user
  SELECT id INTO user_id FROM public.users WHERE auth_user_id = auth.uid();
  
  -- Find valid family invite
  SELECT id INTO family_id 
  FROM public.families 
  WHERE invite_code = p_invite_code 
    AND invite_expires_at > now();
    
  IF family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;
  
  -- Add secondary parent as family member
  INSERT INTO public.family_members (family_id, user_id, role, name, phone)
  VALUES (family_id, user_id, 'secondary_parent', p_parent_name, p_parent_phone);
  
  -- Invalidate invite code
  UPDATE public.families 
  SET invite_code = NULL, invite_expires_at = NULL 
  WHERE id = family_id;
  
  RETURN family_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_child_to_family(
  p_family_id UUID,
  p_child_name TEXT,
  p_age INTEGER,
  p_daily_time_limit INTEGER DEFAULT 60
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  child_id UUID;
  dummy_user_id UUID;
BEGIN
  -- Create a dummy user entry for the child (children don't have auth accounts)
  INSERT INTO public.users (auth_user_id, email, role)
  VALUES (gen_random_uuid(), p_child_name || '@child.local', 'CHILD')
  RETURNING id INTO dummy_user_id;
  
  -- Add child as family member
  INSERT INTO public.family_members (family_id, user_id, role, name, age, daily_time_limit)
  VALUES (p_family_id, dummy_user_id, 'child', p_child_name, p_age, p_daily_time_limit)
  RETURNING id INTO child_id;
  
  RETURN child_id;
END;
$$;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_settings_updated_at
  BEFORE UPDATE ON public.family_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();