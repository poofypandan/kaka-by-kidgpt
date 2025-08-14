-- Create parents table (1:1 with auth.users)
CREATE TABLE public.parents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create children table with birthdate-based grade detection
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  detected_grade INTEGER,
  grade_override INTEGER CHECK (grade_override >= 1 AND grade_override <= 6),
  final_grade INTEGER GENERATED ALWAYS AS (COALESCE(grade_override, detected_grade)) STORED,
  daily_minutes_limit INTEGER NOT NULL DEFAULT 60,
  minutes_used_today INTEGER NOT NULL DEFAULT 0,
  last_usage_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  title TEXT DEFAULT 'Chat dengan Kaka',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('child', 'kaka')),
  content TEXT NOT NULL,
  flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parent_consents table for PDPL/COPPA compliance
CREATE TABLE public.parent_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_text TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.children ADD CONSTRAINT fk_children_parent FOREIGN KEY (parent_id) REFERENCES public.parents(id) ON DELETE CASCADE;
ALTER TABLE public.conversations ADD CONSTRAINT fk_conversations_child FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE public.parent_consents ADD CONSTRAINT fk_parent_consents_parent FOREIGN KEY (parent_id) REFERENCES public.parents(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parents table
CREATE POLICY "Parents can view their own data" ON public.parents
  FOR ALL USING (user_id IN (SELECT auth.uid()));

-- RLS Policies for children table  
CREATE POLICY "Parents can manage their children" ON public.children
  FOR ALL USING (parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid()));

-- RLS Policies for conversations table
CREATE POLICY "Parents can manage their children's conversations" ON public.conversations
  FOR ALL USING (child_id IN (
    SELECT c.id FROM public.children c 
    JOIN public.parents p ON p.id = c.parent_id 
    WHERE p.user_id = auth.uid()
  ));

-- RLS Policies for messages table
CREATE POLICY "Parents can manage their children's messages" ON public.messages
  FOR ALL USING (conversation_id IN (
    SELECT conv.id FROM public.conversations conv
    JOIN public.children c ON c.id = conv.child_id
    JOIN public.parents p ON p.id = c.parent_id
    WHERE p.user_id = auth.uid()
  ));

-- RLS Policies for parent_consents table
CREATE POLICY "Parents can manage their own consents" ON public.parent_consents
  FOR ALL USING (parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid()));

-- Create trigger for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON public.parents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();