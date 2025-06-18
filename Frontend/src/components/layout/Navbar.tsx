import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Palette, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Scan', href: '/scan' },
  { name: 'Docs', href: '/docs' },
  { name: 'About', href: '/about' },
];

const colorOptions = [
  { name: 'Cyber Blue', value: 'blue', color: '#3B82F6' },
  { name: 'Hacker Purple', value: 'purple', color: '#8B5CF6' },
  { name: 'Neutral Gray', value: 'gray', color: '#64748B' },
  { name: 'Dark Black', value: 'black', color: '#1F2937' },
];

export function Navbar() {
  const { colorPalette, setColorPalette } = useTheme();
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-md border-b border-white/20 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Search className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-white">IIT-M</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Color Palette Menu */}
          <div className="relative">
            <button
              onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              <Palette className="h-5 w-5" />
            </button>

            <AnimatePresence>
              {isColorMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 shadow-lg"
                >
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Color Theme</span>
                      <button
                        onClick={() => setIsColorMenuOpen(false)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setColorPalette(option.value as any);
                            setIsColorMenuOpen(false);
                          }}
                          className={`p-2 rounded-lg text-sm text-white transition-colors ${
                            colorPalette === option.value
                              ? 'bg-white/20'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: option.color }}
                            />
                            {option.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}