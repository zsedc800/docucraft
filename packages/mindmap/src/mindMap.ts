import {
	App,
	Frame,
	Group,
	Path,
	IUI,
	KeyEvent,
	PointerEvent
} from 'leafer-ui';
import '@leafer-in/viewport';
import { EditorEvent } from './editor';
import './editor/textEditor';
import { IMindNode, IMindRoot } from './interface';
import { hasChildren, scrollIntoView } from './utils';
import { MindMapSelection } from './selection';
import { MindNode } from './MindNode';
import { computeSize, layoutTree } from './layout';
import { renderTree } from './renderer';
import insertNode from './insertNode';

export class MindMap {
	frame: Frame;
	app: App;
	group: Group;
	root: MindNode;
	selection: MindMapSelection;
	addButton: IUI;
	constructor(id: string | HTMLElement) {
		this.app = new App({
			view: id,
			editor: {
				moveable: false,
				buttonsDirection: 'right',
				// selector: false
				pointSize: 0,
				boxSelect: false,
				rotateable: false,
				selectorPadding: 1.5,
				rect: { opacity: 0 },
				hoverStyle: { stroke: '#D4C5FF' }
			},
			tree: { type: 'design' }
		});
		this.frame = new Frame({ fill: 'transparent', draggable: true });
		this.app.tree.add(this.frame);
		this.group = new Group({});
		this.frame.add(this.group);
		this.selection = new MindMapSelection();
		const {
			app: { editor }
		} = this;

		editor.on(EditorEvent.SELECT, (e) => {
			const ele: IUI | undefined = e.value;
			let node = ele;
			while (node && node.tag !== 'Box') node = node.parent;
			this.selection = new MindMapSelection(node?.data.node);
			this.insertAddButton();
		});

		this.app.on(KeyEvent.DOWN, (e) => {
			switch (e.key) {
				case 'ArrowUp':
					return this.selectUp();
				case 'ArrowRight':
					return this.selectRight();
				case 'ArrowDown':
					return this.selectDown();
				case 'ArrowLeft':
					return this.selectLeft();
				case 'Tab':
					return this.addChild();
				case 'Enter':
					return this.addNextSibling();
				case 'Backspace':
				case 'Delete':
					return this.deleteSel();
			}
		});
	}

	insertAddButton() {
		const { anchorNode } = this.selection;
		this.addButton?.remove();
		if (anchorNode && !hasChildren(anchorNode)) {
			const { x, y, width, height } = anchorNode.UIBox.getLayoutBounds(
				'box',
				this.group
			);
			this.addButton = Path.one({
				cursor: 'pointer',
				x: x + width + 12,
				y: y + height / 2 - 7.5,
				width: 30,
				height: 30,
				path: 'M 15 0 A 15 15 0 1 1 14.99 0 M 15 5 V 25 M 5 15 H 25',
				stroke: '#999',
				fill: 'transparent',
				scale: 0.5,
				zIndex: -1
			});
			this.addButton.on(PointerEvent.BEFORE_DOWN, (e) => {
				e.stopNow();
				this.addChild();
			});
			this.group.add(this.addButton);
		}
	}

	deleteSel() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const {
				children: { attached }
			} = anchorNode.parent;
			const index = attached.indexOf(anchorNode);
			const next =
				index < attached.length - 1
					? attached[index + 1]
					: index > 0
						? attached[index - 1]
						: anchorNode.parent;
			attached.splice(index, 1);
			this.render();
			this.select(next);
		}
	}

	addNextSibling() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const { parent } = anchorNode;
			const {
				children: { attached }
			} = parent;
			const index = attached.indexOf(anchorNode);
			const node = insertNode({ title: '子主题' }, parent, this);
			attached.splice(index + 1, 0, node);
			this.render();
			this.select(node);
		}
	}

	addChild() {
		const { anchorNode } = this.selection;
		if (anchorNode) {
			const { children } = anchorNode;
			const node = insertNode({ title: '子主题' }, anchorNode, this);
			children.attached.push(node);
			this.render();
			this.select(node);
		}
	}

	selectUp() {
		const { anchorNode } = this.selection;

		if (anchorNode && anchorNode.parent) {
			const {
				parent: { children: { attached = [] } = {} }
			} = anchorNode;
			const index = attached.indexOf(anchorNode);
			if (index > 0) this.select(attached[index - 1]);
		}
	}
	selectDown() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const {
				parent: { children: { attached = [] } = {} }
			} = anchorNode;
			const index = attached.indexOf(anchorNode);
			if (index < attached.length - 1) this.select(attached[index + 1]);
		}
	}
	selectLeft() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const { parent } = anchorNode;
			this.select(parent);
		}
	}

	selectRight() {
		const { anchorNode } = this.selection;

		if (anchorNode && anchorNode.children) {
			const { children: { visible = true, attached = [] } = {} } = anchorNode;
			if (visible && attached.length) this.select(attached[0]);
		}
	}

	select(node: MindNode) {
		this.app.editor.select(node.UIBox);
		scrollIntoView(node.UIBox, this.app.tree);
	}

	buildMindNode(node: IMindNode, parent?: MindNode) {
		const { children } = node;
		const mindNode = insertNode(node, parent, this);
		if (hasChildren(node)) {
			mindNode.children.attached = children.attached.map((child, i) => {
				const node = this.buildMindNode(child, mindNode);
				node.parent = mindNode;
				return node;
			});
		}
		return mindNode;
	}

	parseJSON(root: IMindRoot) {
		this.root = this.buildMindNode(root.rootTopic);
		this.render();
		this.selection = new MindMapSelection(this.root);
		this.select(this.root);
	}

	render() {
		this.app.stop();
		const { root } = this;
		this.group.removeAll();
		computeSize(root);
		layoutTree(root, 200, 200);

		renderTree(root, this.group);
		this.app.start();
	}

	destroy() {
		this.app.destroy();
	}
}
