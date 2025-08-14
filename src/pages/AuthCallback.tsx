import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth');
          return;
        }

        if (data.session?.user) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, child_name')
            .eq('id', data.session.user.id)
            .single();

          if (!profile) {
            // New user - go to onboarding
            navigate('/onboarding');
          } else {
            // Existing user - redirect based on role
            switch (profile.role) {
              case 'PARENT':
                navigate('/parent');
                break;
              case 'CHILD':
                navigate('/app');
                break;
              case 'ADMIN':
                navigate('/admin');
                break;
              default:
                navigate('/');
            }
          }
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Memproses login...</p>
      </div>
    </div>
  );
}
