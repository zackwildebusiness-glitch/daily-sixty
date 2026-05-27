import React from 'react';
import Svg, {
  Path, Circle, Rect, Line, G, Defs, LinearGradient, Stop,
} from 'react-native-svg';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return <Svg {...props}><Path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" /></Svg>;
    case 'target':
      return <Svg {...props}><Circle cx="12" cy="12" r="9" /><Circle cx="12" cy="12" r="5" /><Circle cx="12" cy="12" r="1.5" fill={color} stroke="none" /></Svg>;
    case 'chart':
      return <Svg {...props}><Path d="M4 19V5M4 19h16M8 15v-4M12 15V9M16 15v-7" /></Svg>;
    case 'user':
      return <Svg {...props}><Circle cx="12" cy="8" r="4" /><Path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></Svg>;
    case 'plus':
      return <Svg {...props}><Path d="M12 5v14M5 12h14" /></Svg>;
    case 'arrow-left':
      return <Svg {...props}><Path d="M19 12H5M12 19l-7-7 7-7" /></Svg>;
    case 'arrow-right':
      return <Svg {...props}><Path d="M5 12h14M12 5l7 7-7 7" /></Svg>;
    case 'chevron-right':
      return <Svg {...props}><Path d="M9 6l6 6-6 6" /></Svg>;
    case 'chevron-down':
      return <Svg {...props}><Path d="M6 9l6 6 6-6" /></Svg>;
    case 'chevron-up':
      return <Svg {...props}><Path d="M18 15l-6-6-6 6" /></Svg>;
    case 'check':
      return <Svg {...props}><Path d="M5 13l4 4L19 7" /></Svg>;
    case 'check-circle':
      return <Svg {...props}><Circle cx="12" cy="12" r="9" /><Path d="M8 12l3 3 5-6" /></Svg>;
    case 'lock':
      return <Svg {...props}><Rect x="5" y="11" width="14" height="10" rx="2" /><Path d="M8 11V7a4 4 0 018 0v4" /></Svg>;
    case 'play':
      return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Path d="M8 5v14l11-7L8 5z" /></Svg>;
    case 'pause':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Rect x="7" y="5" width="3.5" height="14" rx="1" fill={color} /><Rect x="13.5" y="5" width="3.5" height="14" rx="1" fill={color} /></Svg>;
    case 'clock':
      return <Svg {...props}><Circle cx="12" cy="12" r="9" /><Path d="M12 7v5l3 2" /></Svg>;
    case 'flame':
      return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Path d="M12 2c0 4-3 5-3 9a3 3 0 003 3 3 3 0 003-3c0-1-1-2-1-3 2 1 4 3 4 7a6 6 0 11-12 0c0-5 6-8 6-13z" /></Svg>;
    case 'sparkles':
      return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><Path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" /></Svg>;
    case 'bell':
      return <Svg {...props}><Path d="M6 9a6 6 0 0112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><Path d="M10 21a2 2 0 004 0" /></Svg>;
    case 'settings':
      return <Svg {...props}><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v.1a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></Svg>;
    case 'x':
      return <Svg {...props}><Path d="M6 6l12 12M18 6L6 18" /></Svg>;
    case 'edit':
      return <Svg {...props}><Path d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 113 3L12 15l-4 1 1-4 9.5-9.5z" /></Svg>;
    case 'refresh':
      return <Svg {...props}><Path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5" /></Svg>;
    case 'sliders':
      return <Svg {...props}><Path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" /><Circle cx="16" cy="6" r="2" /><Circle cx="8" cy="12" r="2" /><Circle cx="18" cy="18" r="2" /></Svg>;
    case 'trophy':
      return <Svg {...props}><Path d="M7 4h10v4a5 5 0 01-10 0V4zM5 6H2a4 4 0 004 4M19 6h3a4 4 0 01-4 4M8 21h8M12 17v4" /></Svg>;
    case 'leaf':
      return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><Path d="M20 4c0 10-6 16-14 16 0-8 4-14 14-16zM6 20c4-6 8-8 12-10" /></Svg>;
    case 'snowflake':
      return <Svg {...props}><Path d="M12 2v20M2 12h20M4 4l16 16M20 4L4 20" /></Svg>;
    // Category icons
    case 'cat-health':
      return <Svg {...props} stroke="#fff" strokeWidth={2.4}><Path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z" /></Svg>;
    case 'cat-career':
      return <Svg {...props} stroke="#fff" strokeWidth={2.4}><Rect x="3" y="7" width="18" height="13" rx="2" /><Path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" /></Svg>;
    case 'cat-finance':
      return <Svg {...props} stroke="#fff" strokeWidth={2.4}><Path d="M12 2v20M16 6h-5a3 3 0 000 6h2a3 3 0 010 6H7" /></Svg>;
    case 'cat-learning':
      return <Svg {...props} stroke="#fff" strokeWidth={2.4}><Path d="M2 9l10-5 10 5-10 5-10-5z" /><Path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></Svg>;
    case 'cat-relationships':
      return <Svg {...props} stroke="#fff" strokeWidth={2.4}><Circle cx="8" cy="8" r="3" /><Circle cx="17" cy="9" r="2.5" /><Path d="M2 21c0-3 3-5 6-5s6 2 6 5M14 21c0-2 2-4 5-4s4 2 4 4" /></Svg>;
    case 'cat-creativity':
      return <Svg {...props} stroke="#fff" strokeWidth={2.4}><Path d="M14 2l8 8-12 12-8-8L14 2zM5 13l6 6" /></Svg>;
    case 'cat-mindset':
      return <Svg {...props} stroke="#fff" strokeWidth={2.4}><Path d="M9 21h6M10 17a7 7 0 114 0M12 4v2" /></Svg>;
    case 'cat-custom':
      return <Svg {...props} stroke="#fff" strokeWidth={2.4}><Path d="M12 3l1.8 5.6h5.9l-4.8 3.5 1.8 5.6L12 14.2 7.3 17.7l1.8-5.6L4.3 8.6h5.9L12 3z" /></Svg>;
    case 'palette':
      return <Svg {...props}><Path d="M12 2a10 10 0 100 20c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01a1.5 1.5 0 011.1-2.49H16a6 6 0 000-12H12z" /><Circle cx="6.5" cy="11.5" r="1.5" fill={color} stroke="none" /><Circle cx="9.5" cy="7.5" r="1.5" fill={color} stroke="none" /><Circle cx="14.5" cy="7.5" r="1.5" fill={color} stroke="none" /><Circle cx="17.5" cy="11.5" r="1.5" fill={color} stroke="none" /></Svg>;
    // Logo
    case 'logo':
      return (
        <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <Circle cx="32" cy="32" r="28" stroke={color} strokeWidth="3" />
          <Circle cx="32" cy="32" r="3" fill={color} />
          <Path d="M32 32V12" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <Path d="M32 32l13 7" stroke={color} strokeWidth="3" strokeLinecap="round" opacity={0.7} />
          <Circle cx="32" cy="9" r="3.5" fill="#FFB547" />
        </Svg>
      );
    case 'google':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M22.5 12.3c0-.8-.1-1.4-.2-2H12v3.9h6c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.1-4.7 3.1-8.1z" fill="#4285F4" stroke="none" />
          <Path d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.8c-1 .7-2.2 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.4v2.9C4.2 20.7 7.9 23 12 23z" fill="#34A853" stroke="none" />
          <Path d="M6 14.3a6.6 6.6 0 010-4.6V6.8H2.4a11 11 0 000 10.4L6 14.3z" fill="#FBBC04" stroke="none" />
          <Path d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0012 1C7.9 1 4.2 3.3 2.4 6.8L6 9.7c.9-2.5 3.2-4.3 6-4.3z" fill="#EA4335" stroke="none" />
        </Svg>
      );
    default:
      return <Svg {...props}><Circle cx="12" cy="12" r="9" /></Svg>;
  }
}
