// lib/image-loader.ts
export default function customImageLoader({ 
  src, 
  width, 
  quality 
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  if (src.startsWith(backendUrl) || src.startsWith('/api/')) {
    let key = src;
    if (src.startsWith(backendUrl)) {
      const url = new URL(src);
      key = url.searchParams.get('key') || '';
    } else if (src.startsWith('/api/files?key=')) {
      key = src.replace('/api/files?key=', '');
    }
    
    return `${backendUrl}/api/image-proxy?key=${encodeURIComponent(key)}&w=${width}&q=${quality || 75}`;
  }
  
  return src;
}