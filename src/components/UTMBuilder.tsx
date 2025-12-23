import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UTMBuilderProps {
  onUTMChange: (utmParams: string) => void;
  initialData?: {
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
  };
}

export function UTMBuilder({ onUTMChange, initialData }: UTMBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [utmSource, setUtmSource] = useState(initialData?.source || '');
  const [utmMedium, setUtmMedium] = useState(initialData?.medium || '');
  const [utmCampaign, setUtmCampaign] = useState(initialData?.campaign || '');
  const [utmTerm, setUtmTerm] = useState(initialData?.term || '');
  const [utmContent, setUtmContent] = useState(initialData?.content || '');

  // Update state when initialData changes (e.g. when opening edit modal)
  useEffect(() => {
    if (initialData) {
      setUtmSource(initialData.source || '');
      setUtmMedium(initialData.medium || '');
      setUtmCampaign(initialData.campaign || '');
      setUtmTerm(initialData.term || '');
      setUtmContent(initialData.content || '');
      if (initialData.source || initialData.medium || initialData.campaign) {
        setIsExpanded(true);
      }
    }
  }, [initialData]);

  const buildUTMString = () => {
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmTerm) params.set('utm_term', utmTerm);
    if (utmContent) params.set('utm_content', utmContent);

    const utmString = params.toString();
    onUTMChange(utmString);
    return utmString;
  };

  const handleChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    // Use timeout to allow state to update before building string
    // Or better: use useEffect on the state variables, but simple timeout works for now
    setTimeout(() => {
      // We need to use the LATEST values. 
      // Since state updates are async, direct access inside timeout might be stale if closure captures old state?
      // Actually, this simple approach is flaky. Better to rely on useEffect for onUTMChange.
    }, 0);
  };

  // Use useEffect to trigger onUTMChange when any field changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmTerm) params.set('utm_term', utmTerm);
    if (utmContent) params.set('utm_content', utmContent);
    onUTMChange(params.toString());
  }, [utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  return (
    <div className="rounded-xl border-2 border-dashed border-border/60 bg-secondary/30 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          UTM Campaign Builder
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">FREE</span>
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="utm_source" className="text-xs">Source</Label>
                <Input
                  id="utm_source"
                  placeholder="e.g., facebook"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm_medium" className="text-xs">Medium</Label>
                <Input
                  id="utm_medium"
                  placeholder="e.g., social"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm_campaign" className="text-xs">Campaign</Label>
                <Input
                  id="utm_campaign"
                  placeholder="e.g., summer_sale"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm_term" className="text-xs">Term</Label>
                <Input
                  id="utm_term"
                  placeholder="e.g., running shoes"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm_content" className="text-xs">Content</Label>
                <Input
                  id="utm_content"
                  placeholder="e.g., logolink"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
