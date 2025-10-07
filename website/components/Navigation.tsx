'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Github } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Technical', path: '/technical' },
  { name: 'Testing', path: '/testing' },
  { name: 'Documentation', path: '/documentation' },
  { name: 'Admin', path: '/admin' },
  { name: 'Submission', path: '/submission' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-slate-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group focus:outline-none rounded-lg">
            <Logo size={36} />
            <div className="hidden lg:block">
              <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-success via-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                Meteora Fee Routing
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase -mt-0.5">
                CP-AMM · Permissionless
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="https://github.com/rz1989s/meteora-cp-amm-fee-routing"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              title="View on GitHub"
            >
              <Github size={20} />
            </a>
            <div className="flex space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg transition-all focus:outline-none ${
                    pathname === item.path
                      ? 'bg-primary text-white shadow-lg shadow-primary/50'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <a
              href="https://github.com/rz1989s/meteora-cp-amm-fee-routing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Github size={20} />
              <span>View on GitHub</span>
            </a>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-4 py-2 rounded-lg transition-all focus:outline-none ${
                  pathname === item.path
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
