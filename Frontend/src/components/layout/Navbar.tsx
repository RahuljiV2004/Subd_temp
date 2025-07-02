// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Search, Palette, X } from 'lucide-react';


// const navLinks = [
//   { name: 'Home', href: '/' },
//   { name: 'Scan', href: '/scan' },
//   { name: 'Docs', href: '/docs' },
//   { name: 'About', href: '/about' },
// ];

// const colorOptions = [
//   { name: 'Cyber Blue', value: 'blue', color: '#3B82F6' },
//   { name: 'Hacker Purple', value: 'purple', color: '#8B5CF6' },
//   { name: 'Neutral Gray', value: 'gray', color: '#64748B' },
//   { name: 'Dark Black', value: 'black', color: '#1F2937' },
// ];

// export function Navbar() {
  // const { colorPalette, setColorPalette } = useTheme();
//   const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

//   return (
//     <motion.nav
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-md border-b border-white/20 text-white"
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Brand */}
//           <div className="flex items-center">
//             <Search className="h-8 w-8 text-primary" />
//             <span className="ml-2 text-xl font-bold text-white">IIT-M</span>
//           </div>

//           {/* Navigation Links */}
//           <div className="hidden md:flex items-center space-x-8">
//             {navLinks.map((link) => (
//               <a
//                 key={link.name}
//                 href={link.href}
//                 className="text-gray-300 hover:text-white transition-colors"
//               >
//                 {link.name}
//               </a>
//             ))}
//           </div>

//           {/* Color Palette Menu */}
//           <div className="relative">
//             <button
//               onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
//               className="p-2 text-gray-300 hover:text-white transition-colors"
//             >
//               <Palette className="h-5 w-5" />
//             </button>

//             <AnimatePresence>
//               {isColorMenuOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 10 }}
//                   className="absolute right-0 mt-2 w-48 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 shadow-lg"
//                 >
//                   <div className="p-2">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm font-medium text-white">Color Theme</span>
//                       <button
//                         onClick={() => setIsColorMenuOpen(false)}
//                         className="p-1 text-gray-400 hover:text-white"
//                       >
//                         <X className="h-4 w-4" />
//                       </button>
//                     </div>
//                     <div className="grid grid-cols-2 gap-2">
//                       {colorOptions.map((option) => (
//                         <button
//                           key={option.value}
//                           onClick={() => {
//                             setColorPalette(option.value as any);
//                             setIsColorMenuOpen(false);
//                           }}
//                           className={`p-2 rounded-lg text-sm text-white transition-colors ${
//                             colorPalette === option.value
//                               ? 'bg-white/20'
//                               : 'hover:bg-white/10'
//                           }`}
//                         >
//                           <div className="flex items-center gap-2">
//                             <div
//                               className="w-4 h-4 rounded-full border border-white/20"
//                               style={{ backgroundColor: option.color }}
//                             />
//                             {option.name}
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>
//     </motion.nav>
//   );
// }
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Palette, X, User, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom'; // ✅ Import Link for client-side routing
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Scan Stats', href: '/dashboard' },
  { name: 'Asset Manager', href: '/assets' },
  { name: 'About', href: '/about' },
];

const colorOptions = [
  { name: 'Cyber Blue', value: 'blue', color: '#3B82F6' },
  { name: 'Hacker Purple', value: 'purple', color: '#8B5CF6' },
  // { name: 'Neutral Gray', value: 'gray', color: '#64748B' },
  // { name: 'Dark Black', value: 'black', color: '#1F2937' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { colorPalette, setColorPalette } = useTheme();

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-md border-b border-white/20 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Search className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold text-white">Cystar</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Color Palette & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Color Palette Menu */}
            <div className="relative">
              <button
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
                title="Change Theme"
              >
                <Palette className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {isColorMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 shadow-lg"
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Color Theme</span>
                        <button
                          onClick={() => setIsColorMenuOpen(false)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {colorOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setColorPalette(option.value as any);
                              setIsColorMenuOpen(false);
                            }}
                            className="w-full p-2 rounded-lg text-sm text-white transition-colors hover:bg-white/10 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: option.color }}
                              />
                              <span>{option.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 shadow-lg"
                  >
                    <div className="p-3">
                      {/* User Info */}
                      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.organization}</p>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="pt-3 space-y-1">
                        <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
