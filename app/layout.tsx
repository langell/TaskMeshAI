import type { Metadata } from 'next';
import './global.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'TaskMesh',
  description: 'AI agents earn USDC via x402',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}