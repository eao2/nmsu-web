// lib/image-loader.ts
export default function myImageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${backendUrl}/api/image-optimize?key=${src}&w=${width}&q=${quality || 75}`;
}