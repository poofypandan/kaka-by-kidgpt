import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, MessageSquare, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ConversationLog {
  id: string;
  child_id: string;
  message_content: string;
  message_type: string;
  safety_score: number;
  filtered_content: boolean;
  filter_reason?: string;
  created_at: string;
}

interface ParentNotification {
  id: string;
  child_id: string;
  notification_type: string;
  message: string;
  severity: string;
  read_at?: string;
  created_at: string;
}

interface Child {
  id: string;
  first_name: string;
}

export default function SafetyDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [conversations, setConversations] = useState<ConversationLog[]>([]);
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadConversations(selectedChild);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, first_name');
      
      if (error) throw error;
      
      setChildren(data || []);
      if (data && data.length > 0) {
        setSelectedChild(data[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const loadConversations = async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_logs')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setNotifications(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('parent_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSafetyIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading safety dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Safety Dashboard</h1>
          <p className="text-muted-foreground">Monitor your children's conversations and safety alerts</p>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Safety Alerts</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="settings">Safety Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Recent Safety Notifications</span>
              </CardTitle>
              <CardDescription>
                Automatic alerts based on conversation content analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No safety alerts. All conversations are appropriate!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Alert key={notification.id} className={`border-l-4 ${
                    notification.severity === 'critical' ? 'border-l-red-500' :
                    notification.severity === 'high' ? 'border-l-orange-500' :
                    notification.severity === 'medium' ? 'border-l-yellow-500' :
                    'border-l-blue-500'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>Safety Alert</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(notification.severity)}>
                          {notification.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(notification.created_at), 'PPp', { locale: id })}
                        </span>
                      </div>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <p>{notification.message}</p>
                      {!notification.read_at && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Conversation History</span>
              </CardTitle>
              <CardDescription>
                Review your children's conversations with safety scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {children.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {children.map((child) => (
                    <Button
                      key={child.id}
                      variant={selectedChild === child.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedChild(child.id)}
                    >
                      {child.first_name}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversations.map((conv) => (
                  <div key={conv.id} className={`p-3 rounded-lg border ${
                    conv.message_type === 'user' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={conv.message_type === 'user' ? 'default' : 'secondary'}>
                          {conv.message_type === 'user' ? 'Child' : 'Kaka'}
                        </Badge>
                        {getSafetyIcon(conv.safety_score)}
                        <span className={`text-sm font-medium ${getSafetyScoreColor(conv.safety_score)}`}>
                          Safety: {conv.safety_score}%
                        </span>
                        {conv.filtered_content && (
                          <Badge variant="destructive">Filtered</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conv.created_at), 'PPp', { locale: id })}
                      </span>
                    </div>
                    <p className="text-sm">{conv.message_content}</p>
                    {conv.filter_reason && (
                      <p className="text-xs text-red-600 mt-1">
                        Filtered: {conv.filter_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Safety Settings</CardTitle>
              <CardDescription>
                Configure content filtering and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Content Filtering Active</AlertTitle>
                  <AlertDescription>
                    All conversations are automatically filtered for inappropriate content including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Profanity and inappropriate language</li>
                      <li>Violence and harmful content</li>
                      <li>Adult topics and relationships</li>
                      <li>Personal information requests</li>
                      <li>Emotional distress indicators</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Automatic Escalation</AlertTitle>
                  <AlertDescription>
                    The system automatically escalates concerning conversations:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Urgent:</strong> Violence, self-harm, or dangerous content</li>
                      <li><strong>Block:</strong> Adult content or harmful advice</li>
                      <li><strong>Notify:</strong> Profanity or personal information sharing</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}