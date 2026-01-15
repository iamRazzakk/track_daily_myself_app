import { MaterialIcons } from '@expo/vector-icons';

// Category Icon Mapping for Finance App
export const categoryIcons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  // Income
  'Salary': 'attach-money',
  'Freelance': 'work',
  'Business': 'business',
  'Investment': 'trending-up',
  'Gift': 'card-giftcard',
  'Other Income': 'add-circle',
  
  // Food & Dining
  'Breakfast': 'free-breakfast',
  'Lunch': 'lunch-dining',
  'Dinner': 'dinner-dining',
  'Evening Snacks': 'local-cafe',
  'Tea/Coffee': 'local-cafe',
  'Bara/Samosa': 'fastfood',
  'Street Food': 'restaurant',
  'Sweets': 'cake',
  'Groceries': 'shopping-cart',
  
  // Transportation
  'Bus': 'directions-bus',
  'Auto/Rickshaw': 'local-taxi',
  'Taxi/Cab': 'local-taxi',
  'Fuel': 'local-gas-station',
  'Parking': 'local-parking',
  'Travel': 'flight',
  
  // Bills & Utilities
  'Electricity': 'bolt',
  'Water': 'water-drop',
  'Internet': 'wifi',
  'Phone Bill': 'phone',
  'Rent': 'home',
  
  // Personal
  'Clothes': 'checkroom',
  'Personal Care': 'spa',
  'Shopping': 'shopping-bag',
  'Medicine': 'medical-services',
  'Healthcare': 'local-hospital',
  
  // Entertainment
  'Movies': 'movie',
  'Entertainment': 'theaters',
  'Gaming': 'sports-esports',
  'Smoking': 'smoking-rooms',
  'Alcohol': 'local-bar',
  
  // Education & Books
  'Education': 'school',
  'Books': 'menu-book',
  
  // Default
  'Other Expense': 'more-horiz',
};

export function getCategoryIcon(category: string): keyof typeof MaterialIcons.glyphMap {
  return categoryIcons[category] || 'category';
}

export function getCategoryColor(type: 'income' | 'expense', category: string): string {
  // Import would cause circular dependency, so we define inline
  if (type === 'income') return '#10B981'; // success
  return '#EF4444'; // danger
}
