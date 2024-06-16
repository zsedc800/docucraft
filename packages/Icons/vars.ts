let iconType: IconType = 'filled';
export type IconType = 'filled' | 'outlined' | 'round' | 'sharp' | 'two-tone';
export const setCurrentIconType = (type: IconType) => (iconType = type);
export const getIconType = () => iconType;
