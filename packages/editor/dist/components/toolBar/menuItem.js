"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItem = void 0;
class MenuItem {
    view;
    spec;
    dom;
    constructor(view, spec) {
        this.view = view;
        this.spec = spec;
        const btn = document.createElement('button');
        btn.setAttribute('class', spec.class || '');
        btn.addEventListener('click', (event) => {
            spec.handler({
                view: this.view,
                state: this.view.state,
                dispatch: view.dispatch,
                tr: view.state.tr,
            }, event);
        });
        btn.classList.add('menu-item');
        btn.innerText = spec.label;
        this.dom = btn;
    }
    update(view, state) {
        this.view = view;
        this.spec.update?.(view, state, this.dom);
    }
}
exports.MenuItem = MenuItem;
