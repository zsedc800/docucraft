export type Locale =
	| 'en'
	| 'ar'
	| 'be'
	| 'cs'
	| 'de'
	| 'es'
	| 'fa'
	| 'fi'
	| 'fr'
	| 'hi'
	| 'it'
	| 'ja'
	| 'ko'
	| 'nl'
	| 'pl'
	| 'pt'
	| 'ru'
	| 'sa'
	| 'tr'
	| 'uk'
	| 'vi'
	| 'zh'; // Locale for the picker

export interface EmojiItem {
	id: string;
	name: string;
	native: string;
	unified: string;
	keywords: string[];
	shortcodes: string;
	emoticons: string[];
}

export interface EmojiPickerConfig {
	data?: Record<string, any> | (() => Record<string, any>); // Data to use for the picker
	i18n?: Record<Locale, any>; // Localization data to use for the picker
	categories?: string[]; // Categories to show in the picker. Order is respected.
	custom?: any[]; // Custom emojis
	onEmojiSelect?: (emoji: EmojiItem) => void; // Callback when an emoji is selected
	onClickOutside?: () => void; // Callback when a click outside of the picker happens
	onAddCustomEmoji?: () => void; // Callback when the Add custom emoji button is clicked
	autoFocus?: boolean; // Whether the picker should automatically focus on the search input
	categoryIcons?: Record<string, any>; // Custom category icons
	dynamicWidth?: boolean; // Whether to calculate perLine dynamically based on picker width
	emojiButtonColors?: string[]; // Array of hover background colors
	emojiButtonRadius?: string; // The radius of the emoji buttons
	emojiButtonSize?: number; // The size of the emoji buttons
	emojiSize?: number; // The size of the emojis inside the buttons
	emojiVersion?: number; // The version of the emoji data to use
	exceptEmojis?: string[]; // List of emoji IDs excluded from the picker
	icons?: 'auto' | 'outline' | 'solid'; // Type of icons to use for the picker
	locale?: Locale;

	maxFrequentRows?: number; // Max number of frequent rows to show
	navPosition?: 'top' | 'bottom' | 'none'; // Position of the navigation bar
	noCountryFlags?: boolean; // Whether to show country flags
	noResultsEmoji?: string; // ID of the emoji for no results
	perLine?: number; // Number of emojis per line
	previewEmoji?: string; // ID of the emoji for the preview
	previewPosition?: 'top' | 'bottom' | 'none'; // Position of the preview
	searchPosition?: 'sticky' | 'static' | 'none'; // Position of the search input
	set?: 'native' | 'apple' | 'facebook' | 'google' | 'twitter'; // Set of emojis to use
	skin?: 1 | 2 | 3 | 4 | 5 | 6; // Skin tone of emojis
	skinTonePosition?: 'preview' | 'search' | 'none'; // Position of the skin tone selector
	theme?: 'auto' | 'light' | 'dark'; // Color theme of the picker
	getSpritesheetURL?: (set: string, emojiVersion: number) => string | null; // Function to return spritesheet URL
}
