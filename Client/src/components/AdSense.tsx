import { useEffect, useRef } from 'react';

interface AdSenseProps {
  client?: string;  // Your AdSense client ID (default will use the one from meta tag)
  slot: string;     // The ad unit ID / slot ID from AdSense
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AdSense: React.FC<AdSenseProps> = ({
  client = 'ca-pub-7908772595391460', // Default to the client ID from meta tag
  slot,
  format = 'auto',
  responsive = true,
  style = {},
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only execute this code in the browser, not during SSR
    if (typeof window === 'undefined' || !adRef.current) return;

    try {
      // Wait for AdSense code to be available
      const adsbygoogle = (window as any).adsbygoogle || [];
      
      // Push the ad configuration
      adsbygoogle.push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }

    // Clean up function not needed as AdSense doesn't provide a cleanup method
  }, []);

  return (
    <div ref={adRef} className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...(responsive && format === 'auto' ? { width: '100%' } : {}),
        }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSense; 