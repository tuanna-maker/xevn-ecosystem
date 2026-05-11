import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Save, Image as ImageIcon, Palette, RotateCcw, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface BrandingConfig {
  logoUrl: string | null;
  systemName: string;
  systemNameShort: string;
  primaryColor: string;
  customHex: string;
}

const STORAGE_KEY = 'branding_config';

const PRESET_COLORS = [
  { name: 'Blue', hsl: '221 83% 53%', hex: '#3B82F6' },
  { name: 'Indigo', hsl: '239 84% 67%', hex: '#6366F1' },
  { name: 'Purple', hsl: '271 81% 56%', hex: '#A855F7' },
  { name: 'Pink', hsl: '330 81% 60%', hex: '#EC4899' },
  { name: 'Rose', hsl: '350 89% 60%', hex: '#F43F5E' },
  { name: 'Orange', hsl: '25 95% 53%', hex: '#F97316' },
  { name: 'Amber', hsl: '38 92% 50%', hex: '#F59E0B' },
  { name: 'Emerald', hsl: '160 84% 39%', hex: '#10B981' },
  { name: 'Teal', hsl: '173 80% 40%', hex: '#14B8A6' },
  { name: 'Cyan', hsl: '189 94% 43%', hex: '#06B6D4' },
];

const DEFAULT_CONFIG: BrandingConfig = {
  logoUrl: null,
  systemName: 'UNICOM HRM',
  systemNameShort: 'UC',
  primaryColor: '221 83% 53%',
  customHex: '',
};

// Convert HEX to HSL
const hexToHsl = (hex: string): string | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Convert HSL to HEX
const hslToHex = (hsl: string): string => {
  const parts = hsl.match(/(\d+)\s+(\d+)%?\s+(\d+)%?/);
  if (!parts) return '#3B82F6';
  
  const h = parseInt(parts[1]) / 360;
  const s = parseInt(parts[2]) / 100;
  const l = parseInt(parts[3]) / 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// Function to apply primary color to CSS variables
const applyPrimaryColor = (hslColor: string) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', hslColor);
  root.style.setProperty('--ring', hslColor);
  root.style.setProperty('--sidebar-primary', hslColor);
  root.style.setProperty('--sidebar-ring', hslColor);
  
  // Update gradient
  const [h, s, l] = hslColor.split(' ');
  const darkerL = Math.max(parseInt(l) - 13, 20) + '%';
  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${hslColor}), hsl(${h} ${s} ${darkerL}))`);
};

export function BrandingSettings() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [config, setConfig] = useState<BrandingConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(config.logoUrl);
  const [hexInput, setHexInput] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.customHex) return parsed.customHex;
      if (parsed.primaryColor) return hslToHex(parsed.primaryColor);
    }
    return hslToHex(DEFAULT_CONFIG.primaryColor);
  });
  const [isCustomColor, setIsCustomColor] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return !!parsed.customHex && !PRESET_COLORS.some(c => c.hsl === parsed.primaryColor);
    }
    return false;
  });

  // Apply color on mount
  useEffect(() => {
    if (config.primaryColor) {
      applyPrimaryColor(config.primaryColor);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setConfig(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    setConfig(prev => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleColorChange = (hslColor: string, hex?: string) => {
    setConfig(prev => ({ ...prev, primaryColor: hslColor, customHex: '' }));
    setHexInput(hex || hslToHex(hslColor));
    setIsCustomColor(false);
    applyPrimaryColor(hslColor);
  };

  const handleHexInputChange = (value: string) => {
    // Clean up the input - ensure it starts with # and remove invalid chars
    let cleanValue = value.toUpperCase();
    if (!cleanValue.startsWith('#')) {
      cleanValue = '#' + cleanValue;
    }
    cleanValue = '#' + cleanValue.slice(1).replace(/[^0-9A-F]/g, '').slice(0, 6);
    setHexInput(cleanValue);
    
    // Only apply if it's a valid 6-digit hex
    if (/^#[0-9A-F]{6}$/i.test(cleanValue)) {
      const hsl = hexToHsl(cleanValue);
      if (hsl) {
        setConfig(prev => ({ ...prev, primaryColor: hsl, customHex: cleanValue }));
        setIsCustomColor(true);
        applyPrimaryColor(hsl);
      }
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setPreviewUrl(null);
    setHexInput(hslToHex(DEFAULT_CONFIG.primaryColor));
    setIsCustomColor(false);
    applyPrimaryColor(DEFAULT_CONFIG.primaryColor);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('branding-updated', { detail: DEFAULT_CONFIG }));
    toast.success(t('common.reset') || 'Reset to default');
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('branding-updated', { detail: config }));
    toast.success(t('common.saved') || 'Saved successfully');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo
          </CardTitle>
          <CardDescription>
            {t('settings.brandingLogoDesc') || 'Upload your company logo to display in the sidebar'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="relative">
              {previewUrl ? (
                <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Logo preview" 
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('common.upload') || 'Upload Logo'}
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG max 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {t('settings.primaryColor') || 'Primary Color'}
          </CardTitle>
          <CardDescription>
            {t('settings.primaryColorDesc') || 'Choose the main color for your brand'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset Colors */}
          <div className="grid grid-cols-5 gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.hsl, color.hex)}
                className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                  config.primaryColor === color.hsl && !isCustomColor
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full shadow-md transition-transform group-hover:scale-110"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-xs font-medium text-muted-foreground">{color.name}</span>
                {config.primaryColor === color.hsl && !isCustomColor && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-[10px]">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <Separator />
          
          {/* Custom HEX Input */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              {t('settings.customColor') || 'Custom Color (HEX)'}
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  placeholder="#3B82F6"
                  className={`font-mono uppercase pl-12 ${isCustomColor ? 'border-primary ring-2 ring-primary/20' : ''}`}
                />
                <div 
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md border border-border shadow-sm"
                  style={{ backgroundColor: hexInput }}
                />
              </div>
              <input
                type="color"
                value={hexInput}
                onChange={(e) => handleHexInputChange(e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                title={t('settings.pickColor') || 'Pick a color'}
              />
              {isCustomColor && (
                <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
                  {t('settings.customActive') || 'Custom'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.hexHint') || 'Enter a HEX color code (e.g., #FF5733) or use the color picker'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.systemName') || 'System Name'}</CardTitle>
          <CardDescription>
            {t('settings.systemNameDesc') || 'Customize the name displayed in the sidebar'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('settings.fullName') || 'Full Name'}</Label>
              <Input 
                value={config.systemName}
                onChange={(e) => setConfig(prev => ({ ...prev, systemName: e.target.value }))}
                placeholder="UNICOM HRM"
              />
              <p className="text-xs text-muted-foreground">
                {t('settings.fullNameHint') || 'Displayed when sidebar is expanded'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t('settings.shortName') || 'Short Name'}</Label>
              <Input 
                value={config.systemNameShort}
                onChange={(e) => setConfig(prev => ({ ...prev, systemNameShort: e.target.value }))}
                placeholder="UC"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                {t('settings.shortNameHint') || 'Displayed when sidebar is collapsed (max 5 chars)'}
              </p>
            </div>
          </div>
          
          <Separator />
          
          {/* Preview */}
          <div className="space-y-2">
            <Label>{t('common.preview') || 'Preview'}</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 p-3 bg-sidebar rounded-lg border border-sidebar-border">
                {previewUrl ? (
                  <img src={previewUrl} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-primary/20 rounded-lg" />
                )}
                <span className="font-bold text-sidebar-foreground">{config.systemName}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-sidebar rounded-lg border border-sidebar-border">
                {previewUrl ? (
                  <img src={previewUrl} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="font-bold text-sidebar-foreground text-sm">{config.systemNameShort}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('common.reset') || 'Reset to Default'}
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}
