import {
	IEditorScaleEvent,
	IEditorRotateEvent,
	IEditTool,
	IEditorSkewEvent,
	IEditorMoveEvent
} from '@leafer-in/interface';

import { registerEditTool, EditToolCreator } from './EditToolCreator';
import { InnerEditor } from './InnerEditor';

@registerEditTool()
export class EditTool extends InnerEditor implements IEditTool {
	static registerEditTool() {
		EditToolCreator.register(this);
	}

	public get tag() {
		return 'EditTool';
	}

	// 操作

	public onMove(e: IEditorMoveEvent): void {
		const { moveX, moveY, editor } = e;
		const { app, list } = editor;
		app.lockLayout();
		list.forEach((target) => {
			target.moveWorld(moveX, moveY);
		});
		app.unlockLayout();
	}

	public onScale(e: IEditorScaleEvent): void {
		const { scaleX, scaleY, transform, worldOrigin, editor } = e;
		const { app, list } = editor;
		app.lockLayout();
		list.forEach((target) => {
			const resize = editor.getEditSize(target) !== 'scale';
			if (transform) {
				target.transformWorld(transform, resize);
			} else {
				target.scaleOfWorld(worldOrigin, scaleX, scaleY, resize);
			}
		});
		app.unlockLayout();
	}

	public onRotate(e: IEditorRotateEvent): void {
		const { rotation, transform, worldOrigin, editor } = e;
		const { app, list } = editor;
		app.lockLayout();
		list.forEach((target) => {
			const resize = editor.getEditSize(target) !== 'scale';
			if (transform) {
				target.transformWorld(transform, resize);
			} else {
				target.rotateOfWorld(worldOrigin, rotation);
			}
		});
		app.unlockLayout();
	}

	public onSkew(e: IEditorSkewEvent): void {
		const { skewX, skewY, transform, worldOrigin, editor } = e;
		const { app, list } = editor;
		app.lockLayout();
		list.forEach((target) => {
			const resize = editor.getEditSize(target) !== 'scale';
			if (transform) {
				target.transformWorld(transform, resize);
			} else {
				target.skewOfWorld(worldOrigin, skewX, skewY, resize);
			}
		});
		app.unlockLayout();
	}

	// 状态

	public load(): void {
		this.editBox.view.visible = true;
		this.onLoad();
	}

	public update(): void {
		const { editor, editBox } = this;
		const { selectorPadding } = editor.mergeConfig;
		const { x, y, scaleX, scaleY, rotation, skewX, skewY, width, height } =
			editor.element.getLayoutBounds('box', editor, true);
		let {
			worldTransform: { scaleX: sX, scaleY: sY },
			cornerRadius
		} = editor.element;
		const padding = Math.min(sX, sY) * selectorPadding;
		if (cornerRadius)
			cornerRadius = (
				typeof cornerRadius === 'number'
					? [cornerRadius]
					: (cornerRadius as number[])
			).map((radius) => radius * Math.min(sX, sY));
		editBox.set({ x, y, scaleX, scaleY, rotation, skewX, skewY });
		editBox.update({
			x: 0 - padding,
			y: 0 - padding,
			width: width + 2 * padding,
			height: height + 2 * padding,
			cornerRadius
		} as any);
		this.onUpdate();
	}

	public unload(): void {
		this.editBox.view.visible = false;
		this.onUnload();
	}
}
