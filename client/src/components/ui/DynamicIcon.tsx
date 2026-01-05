import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: string;
}

// Map common icon names to Lucide icon components
const iconMap: Record<string, keyof typeof LucideIcons> = {
  // Category icons
  'utensils': 'Utensils',
  'food': 'Utensils',
  'dining': 'Utensils',
  'car': 'Car',
  'transport': 'Car',
  'transportation': 'Car',
  'home': 'Home',
  'house': 'Home',
  'housing': 'Home',
  'shopping': 'ShoppingBag',
  'shop': 'ShoppingBag',
  'shopping-bag': 'ShoppingBag',
  'shopping-cart': 'ShoppingCart',
  'cart': 'ShoppingCart',
  'heart': 'Heart',
  'health': 'Heart',
  'medical': 'Heart',
  'healthcare': 'Stethoscope',
  'gamepad': 'Gamepad2',
  'entertainment': 'Gamepad2',
  'game': 'Gamepad2',
  'film': 'Film',
  'movie': 'Film',
  'music': 'Music',
  'book': 'Book',
  'education': 'GraduationCap',
  'graduation': 'GraduationCap',
  'plane': 'Plane',
  'travel': 'Plane',
  'vacation': 'Plane',
  'gift': 'Gift',
  'phone': 'Smartphone',
  'smartphone': 'Smartphone',
  'mobile': 'Smartphone',
  'wifi': 'Wifi',
  'internet': 'Wifi',
  'utilities': 'Zap',
  'electricity': 'Zap',
  'zap': 'Zap',
  'power': 'Zap',
  'water': 'Droplet',
  'droplet': 'Droplet',
  'gas': 'Flame',
  'flame': 'Flame',
  'coffee': 'Coffee',
  'beer': 'Beer',
  'wine': 'Wine',
  'dollar': 'DollarSign',
  'dollar-sign': 'DollarSign',
  'money': 'DollarSign',
  'wallet': 'Wallet',
  'credit-card': 'CreditCard',
  'creditcard': 'CreditCard',
  'card': 'CreditCard',
  'bank': 'Building2',
  'building': 'Building2',
  'briefcase': 'Briefcase',
  'work': 'Briefcase',
  'job': 'Briefcase',
  'salary': 'Banknote',
  'banknote': 'Banknote',
  'cash': 'Banknote',
  'coins': 'Coins',
  'savings': 'PiggyBank',
  'piggy-bank': 'PiggyBank',
  'piggybank': 'PiggyBank',
  'investment': 'TrendingUp',
  'stocks': 'TrendingUp',
  'chart': 'BarChart3',
  'analytics': 'BarChart3',

  // Trend/insight icons
  'trending-up': 'TrendingUp',
  'trendingup': 'TrendingUp',
  'arrow-up': 'ArrowUp',
  'arrowup': 'ArrowUp',
  'trending-down': 'TrendingDown',
  'trendingdown': 'TrendingDown',
  'arrow-down': 'ArrowDown',
  'arrowdown': 'ArrowDown',
  'alert': 'AlertTriangle',
  'warning': 'AlertTriangle',
  'alert-triangle': 'AlertTriangle',
  'check': 'Check',
  'checkmark': 'Check',
  'check-circle': 'CheckCircle',
  'success': 'CheckCircle',
  'info': 'Info',
  'lightbulb': 'Lightbulb',
  'bulb': 'Lightbulb',
  'idea': 'Lightbulb',
  'star': 'Star',
  'target': 'Target',
  'goal': 'Target',
  'calendar': 'Calendar',
  'clock': 'Clock',
  'time': 'Clock',
  'repeat': 'Repeat',
  'recurring': 'Repeat',
  'refresh': 'RefreshCw',
  'plus': 'Plus',
  'minus': 'Minus',
  'percent': 'Percent',
  'percentage': 'Percent',

  // Default
  'default': 'Circle',
};

export default function DynamicIcon({ name, fallback = '$', size = 20, ...props }: DynamicIconProps) {
  // Normalize the icon name
  const normalizedName = name?.toLowerCase().replace(/\s+/g, '-') || '';

  // Try to find the icon in our map
  const iconKey = iconMap[normalizedName];

  if (iconKey && LucideIcons[iconKey]) {
    const IconComponent = LucideIcons[iconKey] as React.ComponentType<LucideProps>;
    return <IconComponent size={size} {...props} />;
  }

  // Try to find a direct match in Lucide icons (PascalCase)
  const pascalCase = normalizedName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  if (LucideIcons[pascalCase as keyof typeof LucideIcons]) {
    const IconComponent = LucideIcons[pascalCase as keyof typeof LucideIcons] as React.ComponentType<LucideProps>;
    return <IconComponent size={size} {...props} />;
  }

  // Fallback to text
  return <span style={{ fontSize: size }}>{fallback}</span>;
}
