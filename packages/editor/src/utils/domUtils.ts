import { CSSProperties } from '@docucraft/srender';
const hyphenateStyleName = (name: string) => {
	if (name.startsWith('--')) return name;
	return name.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
};

const isUnitlessNumber = [
	'opacity',
	'zIndex',
	'lineHeight',
	'flexGrow',
	'flexShrink',
	'fontWeight'
];

export function setStyles(dom: HTMLElement, style: CSSProperties) {
	for (const key of Object.keys(style) as (keyof CSSProperties)[]) {
		const val = style[key];
		dom.style.setProperty(
			hyphenateStyleName(key),
			typeof val === 'number' && !isUnitlessNumber.includes(key)
				? val + 'px'
				: val + ''
		);
	}
}
