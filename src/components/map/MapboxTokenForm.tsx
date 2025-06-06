
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface MapboxTokenFormProps {
  onTokenSubmit: (token: string) => void;
  isLoading?: boolean;
}

const MapboxTokenForm = ({ onTokenSubmit, isLoading = false }: MapboxTokenFormProps) => {
  const [tokenInput, setTokenInput] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput && tokenInput.startsWith('pk.')) {
      onTokenSubmit(tokenInput);
    } else {
      toast({
        title: "Invalid Token Format",
        description: "Please enter a valid Mapbox public token starting with 'pk.'",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-background flex items-center justify-center p-4 z-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-6 bg-card rounded-lg shadow-lg">
        <h3 className="text-lg font-medium">Enter Mapbox Token</h3>
        <p className="text-sm text-muted-foreground">
          You need to provide a Mapbox public token to display the map. Get a free token at{' '}
          <a 
            href="https://www.mapbox.com/signin/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary underline"
          >
            mapbox.com
          </a>.
        </p>
        <Input
          id="mapbox-token"
          type="text"
          placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4..."
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          className="w-full"
          required
        />
        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Apply Token"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Your token is stored locally in your browser and is never sent to our servers.
          </p>
        </div>
      </form>
    </div>
  );
};

export default MapboxTokenForm;
