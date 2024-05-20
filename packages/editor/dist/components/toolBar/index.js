"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolBar = void 0;
const menuGroup_1 = require("./menuGroup");
class ToolBar {
    view;
    spec;
    dom;
    groups;
    constructor(view, spec) {
        this.view = view;
        this.spec = spec;
        const dom = document.createElement('div');
        dom.setAttribute('class', this.spec.class || '');
        dom.classList.add('toolbar');
        this.dom = dom;
        this.groups = this.spec.groups.map((menuGroupSpec) => new menuGroup_1.MenuGroup(this.view, menuGroupSpec));
        this.groups.forEach((menuGroup) => dom.appendChild(menuGroup.dom));
        this.render();
    }
    render() {
        if (this.view.dom.parentNode) {
            this.view.dom.parentNode.insertBefore(this.dom, this.view.dom);
        }
    }
    update(view, state) {
        this.view = view;
        this.groups.forEach((group) => group.update(view, state));
    }
    destroy() {
        this.dom.parentNode?.removeChild(this.dom);
    }
}
exports.ToolBar = ToolBar;
