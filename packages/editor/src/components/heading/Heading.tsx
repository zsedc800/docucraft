import { useLayoutEffect, useRef } from '@docucraft/srender';
import { Button } from '@docucraft/ui';
import { HeadingView } from '.';
export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export interface Props {
	view: HeadingView;
	level: Level;
	fold: boolean;
	hidden: boolean;
	id: string;
}
const Cmp = () => <span>dxce</span>;
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
				<Button
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
				>
					{fold ? '展开' : '折叠'}
				</Button>
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
