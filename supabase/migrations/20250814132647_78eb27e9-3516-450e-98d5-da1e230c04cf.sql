-- Create content filtering and conversation logging system

-- Create conversation_logs table for chat history
CREATE TABLE public.conversation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id),
  message_content TEXT NOT NULL,
  message_type VARCHAR(20) CHECK (message_type IN ('user', 'assistant')) NOT NULL,
  safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
  filtered_content BOOLEAN DEFAULT FALSE,
  filter_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parent_notifications table for safety alerts
CREATE TABLE public.parent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.parents(id) NOT NULL,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  conversation_log_id UUID REFERENCES public.conversation_logs(id),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_filter_settings table for customizable filtering
CREATE TABLE public.content_filter_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL UNIQUE,
  filter_level VARCHAR(20) CHECK (filter_level IN ('strict', 'moderate', 'basic')) DEFAULT 'moderate',
  custom_blocked_words TEXT[],
  parent_notification_threshold INTEGER CHECK (parent_notification_threshold >= 0 AND parent_notification_threshold <= 100) DEFAULT 70,
  log_all_conversations BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_filter_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_logs
CREATE POLICY "Parents can view their children's conversation logs" 
ON public.conversation_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    JOIN public.parents ON parents.id = children.parent_id
    JOIN public.users ON users.id = parents.user_id
    WHERE children.id = conversation_logs.child_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Children can view their own conversation logs" 
ON public.conversation_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    JOIN public.users ON users.id = children.user_id
    WHERE children.id = conversation_logs.child_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "System can insert conversation logs" 
ON public.conversation_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for parent_notifications
CREATE POLICY "Parents can view their own notifications" 
ON public.parent_notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.parents 
    JOIN public.users ON users.id = parents.user_id
    WHERE parents.id = parent_notifications.parent_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Parents can update their own notifications" 
ON public.parent_notifications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.parents 
    JOIN public.users ON users.id = parents.user_id
    WHERE parents.id = parent_notifications.parent_id 
    AND users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "System can insert parent notifications" 
ON public.parent_notifications 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for content_filter_settings
CREATE POLICY "Parents can manage their children's filter settings" 
ON public.content_filter_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    JOIN public.parents ON parents.id = children.parent_id
    JOIN public.users ON users.id = parents.user_id
    WHERE children.id = content_filter_settings.child_id 
    AND users.auth_user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_conversation_logs_child_id ON public.conversation_logs(child_id);
CREATE INDEX idx_conversation_logs_created_at ON public.conversation_logs(created_at);
CREATE INDEX idx_parent_notifications_parent_id ON public.parent_notifications(parent_id);
CREATE INDEX idx_parent_notifications_read_at ON public.parent_notifications(read_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_filter_settings_updated_at
BEFORE UPDATE ON public.content_filter_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();