-- Enhanced Database Schema for Family Account System

-- Update families table with subscription and cultural preferences
ALTER TABLE public.families 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS cultural_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Update family_members table with enhanced permissions
ALTER TABLE public.family_members 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update children table with enhanced features
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id),
ADD COLUMN IF NOT EXISTS learning_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_by_parent_id UUID;

-- Update conversation_logs table for multilingual support
ALTER TABLE public.conversation_logs 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id',
ADD COLUMN IF NOT EXISTS cultural_context_flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS multilingual_safety_score INTEGER DEFAULT 100;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  payment_method TEXT,
  last_payment_date TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cultural_preferences table
CREATE TABLE IF NOT EXISTS public.cultural_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  values_framework JSONB DEFAULT '{}',
  content_guidelines JSONB DEFAULT '{}',
  language_preference TEXT DEFAULT 'id',
  educational_focus JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment_history table for Indonesian payment tracking
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in IDR cents
  currency TEXT DEFAULT 'IDR',
  payment_method TEXT NOT NULL,
  payment_provider TEXT DEFAULT 'midtrans',
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Family members can view subscription" ON public.subscriptions
FOR SELECT USING (
  family_id IN (
    SELECT fm.family_id FROM family_members fm
    JOIN users u ON u.id = fm.user_id
    WHERE u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Parents can manage subscription" ON public.subscriptions
FOR ALL USING (
  family_id IN (
    SELECT fm.family_id FROM family_members fm
    JOIN users u ON u.id = fm.user_id
    WHERE u.auth_user_id = auth.uid() 
    AND fm.role IN ('primary_parent', 'secondary_parent')
  )
);

-- RLS policies for cultural_preferences
CREATE POLICY "Family members can view cultural preferences" ON public.cultural_preferences
FOR SELECT USING (
  family_id IN (
    SELECT fm.family_id FROM family_members fm
    JOIN users u ON u.id = fm.user_id
    WHERE u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Parents can manage cultural preferences" ON public.cultural_preferences
FOR ALL USING (
  family_id IN (
    SELECT fm.family_id FROM family_members fm
    JOIN users u ON u.id = fm.user_id
    WHERE u.auth_user_id = auth.uid() 
    AND fm.role IN ('primary_parent', 'secondary_parent')
  )
);

-- RLS policies for payment_history
CREATE POLICY "Family members can view payment history" ON public.payment_history
FOR SELECT USING (
  family_id IN (
    SELECT fm.family_id FROM family_members fm
    JOIN users u ON u.id = fm.user_id
    WHERE u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "System can manage payment history" ON public.payment_history
FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_family_id ON public.subscriptions(family_id);
CREATE INDEX IF NOT EXISTS idx_cultural_preferences_family_id ON public.cultural_preferences(family_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_family_id ON public.payment_history(family_id);
CREATE INDEX IF NOT EXISTS idx_children_family_id ON public.children(family_id);

-- Add triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cultural_preferences_updated_at
BEFORE UPDATE ON public.cultural_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
BEFORE UPDATE ON public.payment_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();