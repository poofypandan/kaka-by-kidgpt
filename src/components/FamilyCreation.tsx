import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFamilyAuth } from '@/hooks/useFamilyAuth';
import { toast } from 'sonner';
import { Users, Plus, ArrowRight, ArrowLeft } from 'lucide-react';

interface FamilyCreationProps {
  onComplete: () => void;
}

export function FamilyCreation({ onComplete }: FamilyCreationProps) {
  const { t } = useTranslation();
  const { createFamily, joinFamily } = useFamilyAuth();
  
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [familyData, setFamilyData] = useState({
    familyName: '',
    parentName: '',
    parentPhone: '',
    inviteCode: ''
  });

  const totalSteps = mode === 'create' ? 3 : 2;
  const progress = (step / totalSteps) * 100;

  const validateStep = () => {
    switch (step) {
      case 1:
        return mode !== null;
      case 2:
        if (mode === 'create') {
          return familyData.familyName.trim().length >= 2;
        } else {
          return familyData.inviteCode.trim().length >= 6;
        }
      case 3:
        return familyData.parentName.trim().length >= 2 && 
               familyData.parentPhone.trim().length >= 10;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      if (mode === 'create') {
        await createFamily(
          familyData.familyName,
          familyData.parentName,
          familyData.parentPhone
        );
        toast.success(t('family.familyCreated'));
      } else {
        await joinFamily(
          familyData.inviteCode,
          familyData.parentName,
          familyData.parentPhone
        );
        toast.success(t('family.familyJoined'));
      }
      onComplete();
    } catch (error) {
      console.error('Family creation/join error:', error);
      toast.error(
        mode === 'create' 
          ? t('family.createError')
          : t('family.joinError')
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFamilyData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>{t('family.setupFamily')}</CardTitle>
          </div>
          <CardDescription>
            {mode === 'create' 
              ? t('family.createFamilyDescription')
              : mode === 'join'
              ? t('family.joinFamilyDescription')
              : t('family.chooseOption')
            }
          </CardDescription>
          
          {mode && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t('common.step')} {step} {t('common.of')} {totalSteps}
                </span>
                <Badge variant="secondary">{Math.round(progress)}%</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Choose Mode */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium">{t('family.howToStart')}</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card 
                  className={`cursor-pointer transition-all ${
                    mode === 'create' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setMode('create')}
                >
                  <CardContent className="p-6 text-center">
                    <Plus className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h4 className="font-medium mb-2">{t('family.createNewFamily')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('family.createNewFamilyDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    mode === 'join' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setMode('join')}
                >
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h4 className="font-medium mb-2">{t('family.joinExistingFamily')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('family.joinExistingFamilyDesc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Family Name or Invite Code */}
          {step === 2 && mode === 'create' && (
            <div className="space-y-4">
              <h3 className="font-medium">{t('family.familyDetails')}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="familyName">{t('family.familyName')}</Label>
                <Input
                  id="familyName"
                  placeholder={t('family.familyNamePlaceholder')}
                  value={familyData.familyName}
                  onChange={(e) => updateFormData('familyName', e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  {t('family.familyNameHint')}
                </p>
              </div>
            </div>
          )}

          {step === 2 && mode === 'join' && (
            <div className="space-y-4">
              <h3 className="font-medium">{t('family.enterInviteCode')}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="inviteCode">{t('family.inviteCode')}</Label>
                <Input
                  id="inviteCode"
                  placeholder={t('family.inviteCodePlaceholder')}
                  value={familyData.inviteCode}
                  onChange={(e) => updateFormData('inviteCode', e.target.value.toUpperCase())}
                  className="text-lg font-mono text-center"
                  maxLength={8}
                />
                <p className="text-sm text-muted-foreground">
                  {t('family.inviteCodeHint')}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Parent Details */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">{t('family.parentDetails')}</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parentName">{t('family.parentName')}</Label>
                  <Input
                    id="parentName"
                    placeholder={t('family.parentNamePlaceholder')}
                    value={familyData.parentName}
                    onChange={(e) => updateFormData('parentName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">{t('family.parentPhone')}</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    placeholder="+62 812 3456 7890"
                    value={familyData.parentPhone}
                    onChange={(e) => updateFormData('parentPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep() || loading}
              >
                {t('common.next')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep() || loading}
              >
                {loading ? t('common.processing') : (
                  mode === 'create' 
                    ? t('family.createFamily')
                    : t('family.joinFamily')
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}