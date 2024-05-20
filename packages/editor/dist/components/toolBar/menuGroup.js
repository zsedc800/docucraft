"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuGroup = void 0;
const menuItem_1 = require("./menuItem");
class MenuGroup {
    view;
    spec;
    dom;
    menus;
    constructor(view, spec) {
        this.view = view;
        this.spec = spec;
        const dom = document.createElement('div');
        dom.setAttribute('class', spec.class || '');
        dom.classList.add('menu-group');
        this.dom = dom;
        this.menus = spec.menus.map((menuSpec) => new menuItem_1.MenuItem(this.view, menuSpec));
        this.menus.forEach((menu) => dom.appendChild(menu.dom));
    }
    update(view, state) {
        this.view = view;
        this.menus.forEach((menu) => menu.update(view, state));
    }
}
exports.MenuGroup = MenuGroup;
