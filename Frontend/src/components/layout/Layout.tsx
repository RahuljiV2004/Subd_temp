import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { ThemeProvider } from '../../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Scan line effect */}
        <div className="scan-line" />
        
        {/* Grid overlay */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(0,0,0,0.1)_0%,transparent_50%)] bg-[length:40px_40px] opacity-30" />
          
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
        </div>

        <Navbar />
        
        <main className="relative z-10">
          {/* Hero section */}
          <div className="relative py-20 overflow-hidden">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h1 className="matrix-text text-4xl md:text-6xl font-bold mb-4">
                  IIT-M Subdomain Scanner
                </h1>
                <p className="text-primary/80 text-lg md:text-xl max-w-2xl mx-auto">
                  Advanced cybersecurity tool for comprehensive domain analysis and subdomain enumeration
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-primary/20 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-primary/60">
              <p> &#169; 2025 Subdomain Scanner. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
} 