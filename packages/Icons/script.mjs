import * as fontkit from 'fontkit';
import fs from 'fs/promises';

async function run(fontPath) {
	const font = await fontkit.open(fontPath);

	const ligatures = [];

	const lookupList = font.GSUB.lookupList.toArray();
	const [
		{
			feature: { lookupListIndexes }
		}
	] = font.GSUB.featureList;

	let count = 0;

	lookupListIndexes.forEach((index) => {
		const [subTable] = lookupList[index].subTables;

		const leadingCharacters = [];

		const leadingFn = (coverage) => {
			for (let i = coverage.start; i <= coverage.end; i++) {
				let character = font.stringsForGlyph(i)[0];
				leadingCharacters.push(character);
			}
		};

		if (subTable.extension) {
			subTable.extension.coverage.rangeRecords.forEach(leadingFn);
		} else {
			subTable.coverage.rangeRecords.forEach(leadingFn);
		}

		const ligatureSets = subTable.extension
			? subTable.extension.ligatureSets.toArray()
			: subTable.ligatureSets.toArray();

		ligatureSets.forEach((ligatureSet, ligatureSetIndex) => {
			const leadingCharacter = leadingCharacters[ligatureSetIndex];

			ligatureSet.forEach((ligature) => {
				const character = font.stringsForGlyph(ligature.glyph)[0];
				if (!character) return;

				const characterCode = character.charCodeAt(0);

				let ligatureText = ligature.components
					.map((x) => font.stringsForGlyph(x)[0])
					.join('');
				ligatureText = leadingCharacter + ligatureText;
				count++;
				ligatures.push([ligatureText.toLowerCase(), characterCode]);
				// console.log(`${ligatureText.toLowerCase()} -> ${characterCode}`);
			});
		});
	});

	const IconNameMapping = `
	export const iconNameMap = ${JSON.stringify(
		ligatures.reduce((pre, [key, val]) => {
			pre[key] = val;
			return pre;
		}, {})
	)};
	export type IconNames = keyof typeof iconNameMap;
	`;

	await fs.writeFile('./iconConf.ts', IconNameMapping);
}

// run('./fonts/MaterialSymbolsRounded-Regular.ttf');
// run('./fonts/material-icons-round.woff2');
// run('./fonts/material-symbols-rounded-latin-standard-normal.woff2');
run('./styles/material-icons.woff2');
