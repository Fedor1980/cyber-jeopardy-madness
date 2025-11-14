export const teamColors = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export const getTeamColor = (index: number): string => {
  return teamColors[index % teamColors.length];
};

export const pointValueColors: Record<number, string> = {
  200: 'bg-blue-500',
  400: 'bg-blue-600',
  600: 'bg-blue-700',
  800: 'bg-blue-800',
  1000: 'bg-blue-900',
};
