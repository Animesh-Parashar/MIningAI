import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, TrendingUp, Radio, FileText, MessageSquare, Upload, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Database },
    { path: '/trends', label: 'Trends', icon: TrendingUp },
    { path: '/realtime', label: 'Monitor', icon: Radio },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/chat', label: 'AI Officer', icon: MessageSquare },
    { path: '/admin', label: 'Admin', icon: Upload },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E0E0E0]">
      <nav className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-[#00BFA5]" />
              <span className="text-xl font-bold text-white">MineSafe AI</span>
            </Link>
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#00BFA5] text-white'
                        : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-[#0D0D0D] border-t border-[#2A2A2A] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-[#888888] text-sm">
              © 2025 MineSafe AI — Autonomous Mining Safety Platform using NLP and Agentic AI.
            </p>
            <div className="flex space-x-6">
              <a href="/docs" className="text-[#888888] hover:text-[#00BFA5] text-sm">
                Documentation
              </a>
              <a href="/about" className="text-[#888888] hover:text-[#00BFA5] text-sm">
                About
              </a>
              <a
                href="https://github.com/yourproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#888888] hover:text-[#00BFA5] text-sm"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
