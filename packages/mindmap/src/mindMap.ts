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
import * as Y from 'yjs';
import { EditorEvent } from './editor';
import './editor/textEditor';
import { IMindNode, IMindRoot } from './interface';
import { generateUniqueId, hasChildren, scrollIntoView } from './utils';
import { MindMapSelection } from './selection';
import { MindNode } from './MindNode';
import { computeSize, layoutTree } from './layout';
import { renderTree } from './renderer';
import insertNode from './insertNode';
import { mindNodeInstances, initCollaborate } from './collaboration';
import { execOp, History, redo, undo } from './history';
import { keymap } from './input';
import { drag } from './drag';

export class MindMap {
	frame: Frame;
	app: App;
	group: Group;
	root: MindNode;
	selection: MindMapSelection;
	addButton: IUI;
	collaborate?: ReturnType<typeof initCollaborate>;
	docId?: string;
	history: History;
	constructor(
		id: string | HTMLElement,
		{ collabServer, docId }: { collabServer?: string; docId?: string } = {}
	) {
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
		this.frame = new Frame({
			fill: 'transparent',
			draggable: true,
			overflow: 'show'
		});
		this.app.tree.add(this.frame);
		this.group = new Group({});
		this.frame.add(this.group);
		this.selection = new MindMapSelection();
		this.docId = docId || generateUniqueId('doc_mind_');
		this.history = new History();
		const {
			app: { editor }
		} = this;

		editor.on(EditorEvent.SELECT, (e) => {
			const ele: IUI | undefined = e.value;

			let node = ele;
			while (node && node.tag !== 'Box') node = node.parent;
			this.selection = new MindMapSelection(node?.data.node);
			this.insertAddButton();
			if (!ele) this.render();
		});

		drag(this);

		this.app.on(
			KeyEvent.DOWN,
			keymap({
				'Mod-z': () => undo(this.history),
				'Mod-y': () => redo(this.history),
				ArrowUp: () => this.selectUp(),
				ArrowRight: () => this.selectRight(),
				ArrowDown: () => this.selectDown(),
				ArrowLeft: () => this.selectLeft(),
				Tab: (e) => {
					e.stopDefault();
					this.addChild();
				},
				Enter: () => this.addNextSibling(),
				Backspace: () => this.deleteSel(),
				Delete: () => this.deleteSel()
			})
		);
		if (collabServer)
			this.collaborate = initCollaborate(collabServer, this.docId);
		this.init();
	}

	init() {
		this.root = insertNode(
			{ title: '思维导图', id: 'rootTopic' },
			void 0,
			this
		);
		this.render();
		this.selection = new MindMapSelection(this.root);
		this.select(this.root);
		if (this.collaborate) {
			const { mindmap, doc } = this.collaborate;
			doc.on('beforeAllTransactions', (...args) => {
				console.log(...args, 'args');
			});
			mindmap.observeDeep((events, tr) => {
				console.log(events, tr, 'uuu');
			});

			// mindmap.observeDeep(([event], tr) => {
			// 	if (tr.local) return;

			// 	const { target } = event;
			// 	event.changes.keys.forEach((change, id) => {
			// 		console.log(change, 'change', id);

			// 		if (change.action === 'add') {
			// 			const yNode = yNodes.get(id);
			// 			this.yMapToMindNode(yNode);
			// 		} else if (change.action === 'update') {
			// 			const node = mindNodeInstances.get(target.get('id'));

			// 			if (node) node[id] = target.get(id);
			// 		} else if (change.action === 'delete') {
			// 			const node = mindNodeInstances.get(id);
			// 			if (node && node.parent) node.parent.removeChild(node);
			// 		}
			// 	});

			// 	this.render();
			// });
		}
	}

	yMapToMindNode(yNode: Y.Map<any>) {
		const id = yNode.get('id');
		const title = yNode.get('title');
		const parentId = yNode.get('parentId');

		const parent = mindNodeInstances.get(parentId);

		// if (parent) {
		// 	const node = insertNode({ title, id }, parent, this);
		// 	const pos = yNode.get('pos');
		// 	parent.children.attached.splice(pos, 0, node);

		// 	console.log(parent, node, pos);

		// }
	}

	insertAddButton() {
		const { anchorNode } = this.selection;
		this.addButton?.remove();
		if (anchorNode && !hasChildren(anchorNode, true)) {
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
			const { parent } = anchorNode;
			const {
				children: { attached }
			} = parent;
			const index = attached.indexOf(anchorNode);
			const next =
				index < attached.length - 1
					? attached[index + 1]
					: index > 0
						? attached[index - 1]
						: anchorNode.parent;
			parent.removeChild(anchorNode);
			this.history.push({
				type: 'delete',
				key: index,
				id: anchorNode.id,
				value: anchorNode
			});
			let p = parent;
			if (attached.length === 0 && p.switch) {
				p.switch.remove();
				delete p.switch;
			}
			while (p) {
				p.size -= anchorNode.size;
				p = p.parent;
			}
			this.render();
			this.select(next);
		}
	}

	addNextSibling() {
		const { anchorNode } = this.selection;
		if (anchorNode && anchorNode.parent) {
			const { parent } = anchorNode;
			const node = insertNode({ title: '' }, parent, this);
			parent.insertAfter(node, anchorNode);
			this.history.push({
				type: 'add',
				id: node.id,
				value: node,
				key: node.index()
			});
			this.render();
			this.select(node);
		}
	}

	addChild() {
		const { anchorNode } = this.selection;
		if (anchorNode) {
			const node = insertNode({ title: '' }, anchorNode, this);
			anchorNode.appendChild(node);
			this.history.push({
				type: 'add',
				id: node.id,
				value: node,
				key: node.index()
			});
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
		const { width, height } = this.app.__;
		const { width: w, height: h } = root.UIBox.boxBounds;
		computeSize(root);
		const { width: w1, height: h1 } = root;
		this.frame.set({
			width: w1,
			height: h1,
			x: (width - w1) / 2,
			y: (height - h1) / 2
		});
		layoutTree(root, 0, (h1 - h) / 2);

		renderTree(root, this.group);
		this.app.start();
	}

	destroy() {
		this.app.destroy();
	}
}
