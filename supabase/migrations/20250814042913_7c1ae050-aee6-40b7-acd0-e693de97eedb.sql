-- Create conversations table if not exists
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  title TEXT DEFAULT 'Chat dengan Kaka',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parent_consents table for PDPL/COPPA compliance
CREATE TABLE IF NOT EXISTS public.parent_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_text TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update children table with new fields for birthdate-based grade detection
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS birthdate DATE,
ADD COLUMN IF NOT EXISTS detected_grade INTEGER,
ADD COLUMN IF NOT EXISTS grade_override INTEGER CHECK (grade_override >= 1 AND grade_override <= 6),
ADD COLUMN IF NOT EXISTS daily_minutes_limit INTEGER NOT NULL DEFAULT 60,
ADD COLUMN IF NOT EXISTS minutes_used_today INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_usage_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Add computed column for final_grade (drop and recreate if exists)
ALTER TABLE public.children DROP COLUMN IF EXISTS final_grade;
ALTER TABLE public.children ADD COLUMN final_grade INTEGER GENERATED ALWAYS AS (COALESCE(grade_override, detected_grade)) STORED;

-- Update messages table structure
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS sender TEXT CHECK (sender IN ('child', 'kaka')),
ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- Add missing foreign key constraints (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_conversations_child') THEN
    ALTER TABLE public.conversations ADD CONSTRAINT fk_conversations_child FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_messages_conversation') THEN
    ALTER TABLE public.messages ADD CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_parent_consents_parent') THEN
    ALTER TABLE public.parent_consents ADD CONSTRAINT fk_parent_consents_parent FOREIGN KEY (parent_id) REFERENCES public.parents(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations table
DROP POLICY IF EXISTS "Parents can manage their children's conversations" ON public.conversations;
CREATE POLICY "Parents can manage their children's conversations" ON public.conversations
  FOR ALL USING (child_id IN (
    SELECT c.id FROM public.children c 
    JOIN public.parents p ON p.id = c.parent_id 
    WHERE p.user_id IN (SELECT u.id FROM public.users u WHERE u.auth_user_id = auth.uid())
  ));

-- Update RLS Policies for messages table to use conversation_id
DROP POLICY IF EXISTS "Parents can manage their children's messages" ON public.messages;
CREATE POLICY "Parents can manage their children's messages" ON public.messages
  FOR ALL USING (conversation_id IN (
    SELECT conv.id FROM public.conversations conv
    JOIN public.children c ON c.id = conv.child_id
    JOIN public.parents p ON p.id = c.parent_id
    JOIN public.users u ON u.id = p.user_id
    WHERE u.auth_user_id = auth.uid()
  ));

-- RLS Policies for parent_consents table
CREATE POLICY "Parents can manage their own consents" ON public.parent_consents
  FOR ALL USING (parent_id IN (
    SELECT p.id FROM public.parents p 
    JOIN public.users u ON u.id = p.user_id 
    WHERE u.auth_user_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();