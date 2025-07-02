// components/HeroSection.tsx
// export function HeroSection() {
//   return (
    
//     <div className="relative py-20 overflow-hidden">
//       <div className="container mx-auto px-4">
//         <div className="text-center">
//           <h1 className="matrix-text text-4xl md:text-6xl font-bold mb-4">
//             Cystar Subdomain Scanner
//           </h1>
//           <p className="text-primary/80 text-lg md:text-xl max-w-2xl mx-auto">
//             Advanced cybersecurity tool for comprehensive domain analysis and subdomain enumeration
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useTheme } from '../context/ThemeContext';

export function HeroSection() {
  const { colorPalette } = useTheme();

  return (
    <div className="relative py-20 overflow-hidden bg-[var(--color-background)]">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 animate-gradient bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, var(--gradient-start), var(--gradient-middle), var(--gradient-end))`,
            }}
          >
            Cystar Subdomain Scanner
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--color-text)', opacity: 0.9 }}
          >
            Advanced cybersecurity tool for comprehensive domain analysis and subdomain enumeration
          </p>
        </div>
      </div>
    </div>
  );
}

