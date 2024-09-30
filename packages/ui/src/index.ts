// import { render as h, createElement } from '@docucraft/srender';
// import { ComponentType } from '@docucraft/srender';
import './styles';
export default () => {};

// import Button from './Button';

// export const render = (component: ComponentType, dom: HTMLElement) => {
// 	h(createElement(component), dom);
// };

export { default as Button, SegmentButton } from './Button';
export {
	default as Icon,
	IconType,
	getIconType,
	setCurrentIconType
} from './Icon';
// export { Button };
