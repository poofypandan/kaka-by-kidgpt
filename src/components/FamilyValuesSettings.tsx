import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, X, Globe, BookOpen } from 'lucide-react';

interface CustomValue {
  id: string;
  name: string;
  description: string;
}

interface FamilyValuesSettingsProps {
  familyId: string;
}

export default function FamilyValuesSettings({ familyId }: FamilyValuesSettingsProps) {
  const { t } = useTranslation();
  const [customValuesEnabled, setCustomValuesEnabled] = useState(false);
  const [religiousContext, setReligiousContext] = useState<string>('secular');
  const [customValues, setCustomValues] = useState<CustomValue[]>([]);
  const [newValueName, setNewValueName] = useState('');
  const [newValueDescription, setNewValueDescription] = useState('');

  const universalValues = [
    { key: 'honesty', icon: '🤝' },
    { key: 'kindness', icon: '💝' },
    { key: 'respect', icon: '🙏' },
    { key: 'responsibility', icon: '⚡' },
    { key: 'empathy', icon: '💙' },
    { key: 'tolerance', icon: '🌈' }
  ];

  const religiousContexts = [
    'islam',
    'christianity', 
    'hinduism',
    'buddhism',
    'confucianism',
    'secular'
  ];

  const addCustomValue = () => {
    if (newValueName.trim() && newValueDescription.trim()) {
      const newValue: CustomValue = {
        id: Date.now().toString(),
        name: newValueName.trim(),
        description: newValueDescription.trim()
      };
      setCustomValues([...customValues, newValue]);
      setNewValueName('');
      setNewValueDescription('');
    }
  };

  const removeCustomValue = (id: string) => {
    setCustomValues(customValues.filter(value => value.id !== id));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          {t('values.familyValuesSettings')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('values.customizeFamilyValues')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Universal Values Display */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('values.universal')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {universalValues.map((value) => (
              <Badge 
                key={value.key}
                variant="secondary" 
                className="p-2 justify-start text-sm"
              >
                <span className="mr-2">{value.icon}</span>
                {t(`values.${value.key}`)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Values Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="custom-values-toggle" className="text-sm font-medium">
              {t('values.enableCustomValues')}
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              {t('values.familyCustomValues')}
            </p>
          </div>
          <Switch
            id="custom-values-toggle"
            checked={customValuesEnabled}
            onCheckedChange={setCustomValuesEnabled}
          />
        </div>

        {/* Religious/Cultural Context Selection */}
        {customValuesEnabled && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t('values.selectReligiousContext')}
              </Label>
              <Select value={religiousContext} onValueChange={setReligiousContext}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {religiousContexts.map((context) => (
                    <SelectItem key={context} value={context}>
                      {t(`values.${context}`)}
                    </SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Custom Values Management */}
            <div>
              <h4 className="text-base font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t('values.customValues')}
              </h4>
              
              {/* Existing Custom Values */}
              {customValues.length > 0 && (
                <div className="space-y-2 mb-4">
                  {customValues.map((value) => (
                    <div key={value.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{value.name}</h5>
                        <p className="text-xs text-muted-foreground">{value.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomValue(value.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Custom Value */}
              <div className="space-y-3 p-4 border rounded-lg bg-background">
                <h5 className="text-sm font-medium">{t('values.addCustomValue')}</h5>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="value-name" className="text-xs">
                      {t('values.valueName')}
                    </Label>
                    <Input
                      id="value-name"
                      placeholder="Contoh: Gotong Royong"
                      value={newValueName}
                      onChange={(e) => setNewValueName(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="value-description" className="text-xs">
                      {t('values.valueDescription')}
                    </Label>
                    <Textarea
                      id="value-description"
                      placeholder="Jelaskan pentingnya nilai ini untuk keluarga Anda..."
                      value={newValueDescription}
                      onChange={(e) => setNewValueDescription(e.target.value)}
                      className="h-16 text-xs"
                    />
                  </div>
                  <Button
                    onClick={addCustomValue}
                    disabled={!newValueName.trim() || !newValueDescription.trim()}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('values.addCustomValue')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button className="w-full md:w-auto">
            {t('common.save')} {t('values.familyValuesSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
