import { useEffect, useRef } from '@docucraft/srender';
import { Picker } from 'emoji-mart';
import { EmojiPickerConfig } from './inteface';
import { basePop } from '../../components/popover';
import { EditorView } from 'prosemirror-view';
import { getNodeTypesByKeys } from '../../utils';
import { createNode } from '../../commands';

interface Props {
	pickerOptions?: EmojiPickerConfig;
}

export function EmojiPicker({ pickerOptions }: Props) {
	const box = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const picker = new Picker({
			data: async () => {
				const res = await fetch(
					'https://cdn.jsdelivr.net/npm/@emoji-mart/data'
				);
				return res.json();
			},
			...pickerOptions
		});
		if (box.current) {
			box.current.appendChild(picker as any);
		}
	}, []);
	return <div ref={box}></div>;
}

const getNodeTypes = getNodeTypesByKeys(['emoji']);
export function EmojiPickerPop(view: EditorView) {
	basePop({
		view,
		render: ({ open }) => {
			return (
				<EmojiPicker
					pickerOptions={{
						onEmojiSelect({ native }) {
							const { state, dispatch } = view;
							const {
								selection: { to },
								schema
							} = state;

							dispatch(
								state.tr.insert(
									to,
									createNode(getNodeTypes(schema.nodes).emoji, {
										code: native
									})
								)
							);
							view.focus();
						},
						locale: 'zh'
					}}
				/>
			);
		}
	});
}

export default EmojiPicker;
