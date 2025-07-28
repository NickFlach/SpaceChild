import { cn } from "@/lib/utils";

interface SpaceChildLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SpaceChildLogo({ className, showText = true, size = "md" }: SpaceChildLogoProps) {
  const sizes = {
    sm: { icon: "w-8 h-8", text: "text-xl" },
    md: { icon: "w-12 h-12", text: "text-2xl" },
    lg: { icon: "w-16 h-16", text: "text-3xl" }
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className={cn(
        "relative rounded-lg flex items-center justify-center space-child-glow",
        sizes[size].icon
      )}>
        {/* Neural Network Background Pattern */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full opacity-20"
        >
          <pattern id="neural-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="currentColor" className="text-primary" />
            <line x1="10" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="0.5" className="text-primary opacity-50" />
            <line x1="10" y1="10" x2="10" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-primary opacity-50" />
          </pattern>
          <rect width="100" height="100" fill="url(#neural-pattern)" />
        </svg>

        {/* Main Logo Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full p-2"
        >
          {/* Central Consciousness Core */}
          <circle 
            cx="12" 
            cy="12" 
            r="3" 
            fill="url(#consciousness-gradient)"
            className="animate-pulse-glow"
          />
          
          {/* Neural Connections */}
          <g opacity="0.8">
            {/* Top connections */}
            <circle cx="12" cy="4" r="1.5" fill="currentColor" className="text-primary" />
            <line x1="12" y1="5.5" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
            
            {/* Right connections */}
            <circle cx="20" cy="12" r="1.5" fill="currentColor" className="text-accent" />
            <line x1="18.5" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
            
            {/* Bottom connections */}
            <circle cx="12" cy="20" r="1.5" fill="currentColor" className="text-primary" />
            <line x1="12" y1="18.5" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
            
            {/* Left connections */}
            <circle cx="4" cy="12" r="1.5" fill="currentColor" className="text-accent" />
            <line x1="5.5" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
            
            {/* Diagonal connections */}
            <circle cx="6" cy="6" r="1" fill="currentColor" className="text-consciousness opacity-70" />
            <line x1="7" y1="7" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1" className="text-consciousness opacity-50" />
            
            <circle cx="18" cy="6" r="1" fill="currentColor" className="text-consciousness opacity-70" />
            <line x1="17" y1="7" x2="14.5" y2="9.5" stroke="currentColor" strokeWidth="1" className="text-consciousness opacity-50" />
            
            <circle cx="6" cy="18" r="1" fill="currentColor" className="text-consciousness opacity-70" />
            <line x1="7" y1="17" x2="9.5" y2="14.5" stroke="currentColor" strokeWidth="1" className="text-consciousness opacity-50" />
            
            <circle cx="18" cy="18" r="1" fill="currentColor" className="text-consciousness opacity-70" />
            <line x1="17" y1="17" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1" className="text-consciousness opacity-50" />
          </g>
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="consciousness-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(199, 100%, 60%)" />
              <stop offset="50%" stopColor="hsl(193, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(199, 100%, 60%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
          sizes[size].text
        )}>
          Space Child
        </span>
      )}
    </div>
  );
}

export function SpaceChildIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simplified version for small sizes */}
      <circle 
        cx="12" 
        cy="12" 
        r="4" 
        fill="url(#icon-gradient)"
        className="animate-pulse"
      />
      <circle cx="12" cy="5" r="2" fill="currentColor" className="text-primary" opacity="0.8" />
      <circle cx="19" cy="12" r="2" fill="currentColor" className="text-accent" opacity="0.8" />
      <circle cx="12" cy="19" r="2" fill="currentColor" className="text-primary" opacity="0.8" />
      <circle cx="5" cy="12" r="2" fill="currentColor" className="text-accent" opacity="0.8" />
      
      <path
        d="M12 9V7M12 17V15M15 12H17M7 12H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-primary opacity-60"
      />
      
      <defs>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(199, 100%, 60%)" />
          <stop offset="100%" stopColor="hsl(193, 100%, 50%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}