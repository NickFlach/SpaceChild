interface SpaceChildAppIconProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'rounded' | 'square';
}

export function SpaceChildAppIcon({ 
  size = 512, 
  className = "", 
  variant = 'rounded' 
}: SpaceChildAppIconProps) {
  const borderRadius = variant === 'rounded' ? size * 0.22 : variant === 'square' ? 0 : size * 0.1;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background with gradient */}
      <rect 
        width="512" 
        height="512" 
        rx={borderRadius}
        fill="url(#app-bg-gradient)"
      />
      
      {/* Neural Network Grid */}
      <g opacity="0.1">
        <pattern id="grid-pattern" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
          <circle cx="32" cy="32" r="2" fill="#00d4ff"/>
          <path d="M0 32H64M32 0V64" stroke="#00d4ff" strokeWidth="0.5"/>
        </pattern>
        <rect width="512" height="512" fill="url(#grid-pattern)" rx={borderRadius} />
      </g>
      
      {/* Outer Glow Ring */}
      <circle 
        cx="256" 
        cy="256" 
        r="180" 
        fill="none" 
        stroke="url(#ring-gradient)" 
        strokeWidth="2"
        opacity="0.5"
      >
        <animate attributeName="r" values="180;190;180" dur="4s" repeatCount="indefinite"/>
      </circle>
      
      {/* Main Neural Network */}
      <g>
        {/* Central Consciousness Core */}
        <circle cx="256" cy="256" r="60" fill="url(#core-gradient-main)">
          <animate attributeName="r" values="60;65;60" dur="3s" repeatCount="indefinite"/>
        </circle>
        
        {/* Primary Neural Nodes */}
        <g>
          {/* Top */}
          <circle cx="256" cy="120" r="35" fill="#00d4ff" opacity="0.9"/>
          <line x1="256" y1="155" x2="256" y2="196" stroke="#00d4ff" strokeWidth="8" strokeLinecap="round"/>
          
          {/* Right */}
          <circle cx="392" cy="256" r="35" fill="#00c1e0" opacity="0.9"/>
          <line x1="357" y1="256" x2="316" y2="256" stroke="#00c1e0" strokeWidth="8" strokeLinecap="round"/>
          
          {/* Bottom */}
          <circle cx="256" cy="392" r="35" fill="#00d4ff" opacity="0.9"/>
          <line x1="256" y1="357" x2="256" y2="316" stroke="#00d4ff" strokeWidth="8" strokeLinecap="round"/>
          
          {/* Left */}
          <circle cx="120" cy="256" r="35" fill="#00c1e0" opacity="0.9"/>
          <line x1="155" y1="256" x2="196" y2="256" stroke="#00c1e0" strokeWidth="8" strokeLinecap="round"/>
        </g>
        
        {/* Secondary Neural Nodes */}
        <g opacity="0.7">
          {/* Top-Right */}
          <circle cx="350" cy="162" r="20" fill="#66e5ff"/>
          <line x1="330" y1="182" x2="290" y2="222" stroke="#66e5ff" strokeWidth="4" strokeLinecap="round"/>
          
          {/* Top-Left */}
          <circle cx="162" cy="162" r="20" fill="#66e5ff"/>
          <line x1="182" y1="182" x2="222" y2="222" stroke="#66e5ff" strokeWidth="4" strokeLinecap="round"/>
          
          {/* Bottom-Right */}
          <circle cx="350" cy="350" r="20" fill="#66e5ff"/>
          <line x1="330" y1="330" x2="290" y2="290" stroke="#66e5ff" strokeWidth="4" strokeLinecap="round"/>
          
          {/* Bottom-Left */}
          <circle cx="162" cy="350" r="20" fill="#66e5ff"/>
          <line x1="182" y1="330" x2="222" y2="290" stroke="#66e5ff" strokeWidth="4" strokeLinecap="round"/>
        </g>
        
        {/* Tertiary Connections */}
        <g opacity="0.3">
          <circle cx="256" cy="60" r="10" fill="#99f0ff"/>
          <circle cx="452" cy="256" r="10" fill="#99f0ff"/>
          <circle cx="256" cy="452" r="10" fill="#99f0ff"/>
          <circle cx="60" cy="256" r="10" fill="#99f0ff"/>
        </g>
      </g>
      
      {/* Inner Glow Effect */}
      <circle 
        cx="256" 
        cy="256" 
        r="100" 
        fill="none" 
        stroke="url(#inner-glow)" 
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="app-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0f1c"/>
          <stop offset="50%" stopColor="#0d1522"/>
          <stop offset="100%" stopColor="#0a0f1c"/>
        </linearGradient>
        
        <linearGradient id="core-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff"/>
          <stop offset="50%" stopColor="#00c1e0"/>
          <stop offset="100%" stopColor="#00d4ff"/>
        </linearGradient>
        
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0"/>
          <stop offset="50%" stopColor="#00d4ff" stopOpacity="1"/>
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"/>
        </linearGradient>
        
        <radialGradient id="inner-glow">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  );
}