import { useLayoutEffect, useRef } from '@docucraft/srender';
import { Button } from '@docucraft/ui';
import Icon from '@docucraft/icons';
import { HeadingView } from '.';
export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export interface Props {
	view: HeadingView;
	level: Level;
	fold: boolean;
	hidden: boolean;
	id: string;
}
const Cmp = () => <Button>dxce</Button>;
export default ({ view, level, fold, hidden, id }: Props) => {
	const $heading = useRef<HTMLElement>();
	const $content = useRef<HTMLDivElement>();
	const outlineTree = view.outlineTree;
	useLayoutEffect(() => {
		if ($heading.current) view.dom = $heading.current;
		view.contentDOM = $content.current;
	}, []);
	const Tag = `h${level}`;

	return (
		<Tag ref={$heading} id={id} className={`heading ${hidden ? 'hidden' : ''}`}>
			<div className="heading-tools" contenteditable="false">
				<Icon
					style={{ cursor: 'pointer' }}
					name={fold ? 'arrow_drop_down' : 'arrow_right'}
					onClick={() => {
						const pos = view.getPos();

						let tr = view.view.state.tr.setMeta('toggleHeading', {
							hidden: !fold,
							pos
						});

						if (typeof pos !== 'undefined')
							tr = tr.setNodeMarkup(pos, null, {
								...view.node.attrs,
								fold: !fold
							});
						view.view.dispatch(tr);
					}}
				/>
			</div>
			{outlineTree && outlineTree.orderType ? (
				<span
					className="list-symbol"
					data-type={outlineTree.orderType}
					data-level={outlineTree.dataLevel(view.id)}
					contenteditable="false"
				>
					{outlineTree.calculateOrderNumber(view.id)}
				</span>
			) : null}
			<div ref={$content} className="heading-content"></div>
		</Tag>
	);
};
