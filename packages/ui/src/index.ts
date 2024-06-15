import { render as h, createElement } from '@docucraft/srender';
import { ComponentType } from '@docucraft/srender/dist/interface';
import 'material-icons/iconfont/material-icons.css';
export default () => {};

export { default as Button } from './Button';

export const render = (component: ComponentType, dom: HTMLElement) => {
	h(createElement(component), dom);
};
