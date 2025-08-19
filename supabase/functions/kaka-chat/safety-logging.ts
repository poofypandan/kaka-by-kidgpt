// Safety incident logging for parental oversight
async function logSafetyIncident(
  childId: string, 
  message: string, 
  safetyResult: any, 
  supabaseClient: any
) {
  try {
    console.log('📝 Logging safety incident for parental review');
    
    // Get family information for the child
    const { data: familyMember } = await supabaseClient
      .from('family_members')
      .select('family_id, name')
      .eq('id', childId)
      .single();

    if (!familyMember) {
      console.log('⚠️ Could not find family member for safety logging');
      return;
    }

    // Log the conversation with safety flags
    const { error: logError } = await supabaseClient
      .from('family_conversations')
      .insert({
        family_id: familyMember.family_id,
        child_id: childId,
        sender: 'child',
        message_content: message.substring(0, 500), // Truncate for privacy
        safety_score: safetyResult.score,
        flagged: true,
        flag_reason: safetyResult.reason || 'Safety concern detected',
        parent_reviewed: false
      });

    if (logError) {
      console.error('Failed to log conversation:', logError);
    }

    // Create notification for parents if severity is medium or high
    if (safetyResult.severity === 'medium' || safetyResult.severity === 'high') {
      const notificationMessage = safetyResult.severity === 'high' 
        ? `Pesan dengan tingkat keamanan tinggi terdeteksi dari ${familyMember.name}. Silakan tinjau percakapan.`
        : `Pesan yang memerlukan perhatian terdeteksi dari ${familyMember.name}. Silakan tinjau jika perlu.`;

      const { error: notifError } = await supabaseClient
        .from('family_notifications')
        .insert({
          family_id: familyMember.family_id,
          child_id: childId,
          notification_type: 'safety_alert',
          title: 'Peringatan Keamanan',
          message: notificationMessage,
          severity: safetyResult.severity,
          read_by_primary: false,
          read_by_secondary: false
        });

      if (notifError) {
        console.error('Failed to create safety notification:', notifError);
      } else {
        console.log('✅ Safety notification created for parents');
      }
    }

  } catch (error) {
    console.error('Error logging safety incident:', error);
  }
}