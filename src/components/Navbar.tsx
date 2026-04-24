'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, LayoutDashboard, ShieldQuestion, HelpCircle } from 'lucide-react';

const navItems = [
  { name: 'Tutoriais', href: '/tutoriais', icon: BookOpen },
  { name: 'Quizzes', href: '/quizzes', icon: HelpCircle },
  { name: 'Progresso', href: '/progresso', icon: LayoutDashboard },
  { name: 'Apoio Imigrante', href: '/apoio-imigrante', icon: ShieldQuestion },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">N</div>
              <span className="text-xl font-extrabold tracking-tight text-primary">Navega<span className="text-secondary">Gov</span></span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="nav-link flex items-center gap-2">
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 glass border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-4 rounded-md text-base font-medium hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
