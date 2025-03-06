let uniqueIdCounter = 1000;
export function generateUniqueId(prefix = '') {
	uniqueIdCounter++;
	const base36 = uniqueIdCounter.toString(36);
	const randomPart = Math.random().toString(36).substring(2, 4);
	return prefix + randomPart + base36;
}
