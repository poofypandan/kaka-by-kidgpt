import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyAuth } from '@/hooks/useFamilyAuth';
import { AlertTriangle, Shield, Clock, MessageSquare, Eye } from 'lucide-react';

interface ActivityData {
  child_id: string;
  child_name: string;
  last_activity: string;
  session_duration: number;
  safety_alerts: number;
  message_count: number;
  safety_score: number;
}

interface SafetyAlert {
  id: string;
  child_name: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

export function RealTimeMonitoring() {
  const { t } = useTranslation();
  const { family } = useFamilyAuth();
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!family?.id) return;

    fetchActivities();
    fetchAlerts();

    // Set up real-time subscriptions
    const activitiesChannel = supabase
      .channel('family-activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'child_sessions',
          filter: `family_id=eq.${family.id}`
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('family-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_notifications'
        },
        (payload) => {
          if (payload.new.family_id === family.id) {
            fetchAlerts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [family?.id]);

  const fetchActivities = async () => {
    if (!family?.id) return;

    try {
      // Fetch active child sessions and data
      const { data: childrenData, error: childrenError } = await supabase
        .from('family_members')
        .select(`
          id,
          name,
          user_id,
          child_sessions (
            duration_minutes,
            last_activity,
            safety_alerts_count
          ),
          family_conversations!inner (
            created_at,
            safety_score
          )
        `)
        .eq('family_id', family.id)
        .eq('role', 'child');

      if (childrenError) throw childrenError;

      // Transform data for display
      const activityData: ActivityData[] = childrenData?.map(child => {
        const latestSession = child.child_sessions?.[0];
        const todayMessages = child.family_conversations?.filter(
          conv => new Date(conv.created_at).toDateString() === new Date().toDateString()
        ).length || 0;

        const avgSafetyScore = child.family_conversations?.length > 0
          ? Math.round(
              child.family_conversations.reduce((sum, conv) => sum + (conv.safety_score || 100), 0) /
              child.family_conversations.length
            )
          : 100;

        return {
          child_id: child.id,
          child_name: child.name,
          last_activity: latestSession?.last_activity || new Date().toISOString(),
          session_duration: latestSession?.duration_minutes || 0,
          safety_alerts: latestSession?.safety_alerts_count || 0,
          message_count: todayMessages,
          safety_score: avgSafetyScore
        };
      }) || [];

      setActivities(activityData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    if (!family?.id) return;

    try {
      const { data: alertsData, error } = await supabase
        .from('family_notifications')
        .select(`
          id,
          title,
          message,
          severity,
          created_at,
          child_id,
          family_members!inner (name)
        `)
        .eq('family_id', family.id)
        .eq('notification_type', 'safety_alert')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedAlerts: SafetyAlert[] = alertsData?.map(alert => ({
        id: alert.id,
        child_name: alert.family_members?.name || 'Unknown',
        message: alert.message,
        severity: alert.severity as 'low' | 'medium' | 'high',
        created_at: alert.created_at
      })) || [];

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLastActivity = (timestamp: string) => {
    const now = new Date();
    const activity = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return t('dashboard.justNow');
    if (diffMinutes < 60) return t('dashboard.minutesAgo', { minutes: diffMinutes });
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return t('dashboard.hoursAgo', { hours: diffHours });
    
    return activity.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Safety Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>{t('dashboard.safetyAlerts')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map(alert => (
              <Alert key={alert.id}>
                <Shield className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <strong>{alert.child_name}</strong>: {alert.message}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatLastActivity(alert.created_at)}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Children Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activities.map(activity => (
          <Card key={activity.child_id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{activity.child_name}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{formatLastActivity(activity.last_activity)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Safety Score */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('dashboard.safetyScore')}</span>
                <span className={`font-bold ${getSafetyColor(activity.safety_score)}`}>
                  {activity.safety_score}%
                </span>
              </div>

              {/* Session Duration */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('dashboard.sessionTime')}</span>
                <span className="text-sm">{activity.session_duration} min</span>
              </div>

              {/* Message Count */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{t('dashboard.todayMessages')}</span>
                </span>
                <span className="text-sm">{activity.message_count}</span>
              </div>

              {/* Safety Alerts */}
              {activity.safety_alerts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-600">
                    {t('dashboard.alertsToday')}
                  </span>
                  <Badge variant="outline">{activity.safety_alerts}</Badge>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => {
                  // Navigate to detailed child monitoring
                  window.location.href = `/parent/children/${activity.child_id}/monitoring`;
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('dashboard.viewDetails')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {activities.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('dashboard.noActiveChildren')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}