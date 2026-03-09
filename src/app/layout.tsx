import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
// 1. Import the UserProvider
import { UserProvider } from '@/context/UserContext';
import ChatbotWidget from '@/components/ui/ChatbotWidget';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Synthea IDE',
  description: 'AI Powered Coding',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased bg-[#1e1e1e] text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* 2. Wrap children with UserProvider */}
          <UserProvider>
            {children}
            <ChatbotWidget />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}