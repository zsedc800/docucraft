import { Plugin } from 'prosemirror-state';
import { BaseNodeView, getNodeView } from '../utils/view';
import { CSSProperties } from '@docucraft/srender';
import { setStyles } from '../utils/domUtils';
import { getNodeTypes, schema } from '../model';
import { Fragment, ResolvedPos } from 'prosemirror-model';

export function initDrag(dom: HTMLElement, nodeView: BaseNodeView) {
	let isDraging = false;
	function onMouseDown(startEvent: MouseEvent) {
		const { dom, view } = nodeView;
		const copy = dom.cloneNode(true) as HTMLElement;

		const { clientX: startX, clientY: startY } = startEvent;
		const { left, top } = dom.getBoundingClientRect();
		const offsetX = left - startX;
		const offsetY = top - startY;
		const style: CSSProperties = {
			position: 'fixed',
			left,
			top,
			opacity: 0.5,
			pointerEvents: 'none',
			width: dom.offsetWidth,
			height: dom.offsetHeight,
			backgroundColor: 'transparent'
		};
		setStyles(copy, style);
		document.body.appendChild(copy);
		let lastNodeView = nodeView;
		function onMouseMove(e: MouseEvent) {
			isDraging = true;
			const { clientX: x, clientY: y } = e;
			style.left = x + offsetX;
			style.top = y + offsetY;
			const pos = view.posAtCoords({ left: Math.max(left, x), top: y });
			if (pos) {
				const $pos = view.state.doc.resolve(pos.pos);
				let node = $pos.node(1);

				if (
					getNodeTypes(view.state.schema, [
						'taskList',
						'ordered_list',
						'bullet_list'
					]).includes(node.type) &&
					$pos.index(1) > 0
				)
					node = $pos.node(2);

				const nodeView = getNodeView(node.attrs.blockId);

				if (nodeView !== lastNodeView) {
					lastNodeView.dom.classList.remove('drag-line');
					nodeView.dom.classList.add('drag-line');
					lastNodeView = nodeView;
				}
			}
			setStyles(copy, style);
		}

		function stop(e: MouseEvent) {
			e.preventDefault();
			copy.parentNode.removeChild(copy);
			lastNodeView.dom.classList.remove('drag-line');

			if (lastNodeView !== nodeView) {
				const { state, dispatch } = view;
				const { node } = nodeView;
				const content = node.copy(node.content);
				console.log(content, 'content');
				const pos = nodeView.getPos();
				const lastPos = lastNodeView.getPos();

				let tr = state.tr.delete(pos, pos + node.nodeSize);

				tr = tr.insert(tr.mapping.map(lastPos), Fragment.from(content));
				dispatch(tr);
			}

			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', stop);
			document.removeEventListener('selectstart', onSelectStart);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', stop);
		document.addEventListener('selectstart', onSelectStart);
	}

	function onSelectStart(e: Event) {
		e.preventDefault();
	}

	dom.addEventListener('mousedown', onMouseDown);
}

export default () => {
	return new Plugin({
		props: {
			handleDOMEvents: {
				dragstart(view, event) {
					console.log(event, 'ev');
				}
			}
		}
	});
};
