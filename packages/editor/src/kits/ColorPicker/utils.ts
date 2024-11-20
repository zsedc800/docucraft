// 将 HSL 转换为 RGB 格式的辅助函数
export const hslToRgb = (
	h: number,
	s: number,
	l: number
): [number, number, number] => {
	s /= 100;
	l /= 100;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	let r = 0,
		g = 0,
		b = 0;

	if (h >= 0 && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (h >= 60 && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (h >= 120 && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (h >= 180 && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (h >= 240 && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (h >= 300 && h < 360) {
		r = c;
		g = 0;
		b = x;
	}

	return [
		Math.round((r + m) * 255),
		Math.round((g + m) * 255),
		Math.round((b + m) * 255)
	];
};

export function rgbToHsl(
	r: number,
	g: number,
	b: number
): [number, number, number] {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (delta !== 0) {
		s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

		if (max === r) {
			h = (g - b) / delta + (g < b ? 6 : 0);
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else if (max === b) {
			h = (r - g) / delta + 4;
		}

		h *= 60;
	}

	return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export function parseColorToRgba(
	color: string
): [number, number, number, number] {
	color = color.trim().toLowerCase();

	// Hex format (#RRGGBB or #RGB)
	if (color.startsWith('#')) {
		let r = 0,
			g = 0,
			b = 0;

		if (color.length === 4) {
			// #RGB format
			r = parseInt(color[1] + color[1], 16);
			g = parseInt(color[2] + color[2], 16);
			b = parseInt(color[3] + color[3], 16);
		} else if (color.length === 7) {
			// #RRGGBB format
			r = parseInt(color.slice(1, 3), 16);
			g = parseInt(color.slice(3, 5), 16);
			b = parseInt(color.slice(5, 7), 16);
		}

		return [r, g, b, 1];
	}

	// RGB/RGBA format
	const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;
	const rgbMatch = color.match(rgbRegex);

	if (rgbMatch) {
		const r = parseInt(rgbMatch[1], 10);
		const g = parseInt(rgbMatch[2], 10);
		const b = parseInt(rgbMatch[3], 10);
		const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
		return [r, g, b, a];
	}

	// HSL/HSLA format
	const hslRegex =
		/^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)$/;
	const hslMatch = color.match(hslRegex);

	if (hslMatch) {
		const h = parseInt(hslMatch[1], 10);
		const s = parseFloat(hslMatch[2]);
		const l = parseFloat(hslMatch[3]);
		const a = hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1;
		const [r, g, b] = hslToRgb(h, s, l);
		return [r, g, b, a];
	}

	throw new Error('Invalid color format');
}

// 将 RGB 转换为 HEX 格式的辅助函数
export const rgbToHex = (r: number, g: number, b: number): string => {
	const toHex = (value: number) =>
		value.toString(16).padStart(2, '0').toUpperCase();
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export function formatHex(value: string) {
	if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
		console.error('Invalid HEX value:', value);
		return '#FF0000'; // 提供一个默认值
	}
	return value.toUpperCase(); // 格式化为大写
}
