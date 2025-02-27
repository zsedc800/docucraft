import { useEffect, Children, isValidElement } from '@docucraft/srender';

interface Element {
	tag: string;
	props: Record<string, any>;
}

function setElements(elements: Element[]) {
	document.head.querySelectorAll('[data-helmet]').forEach((el) => el.remove());
	elements.forEach((el) => {
		const element = document.createElement(el.tag);
		if (el.tag === 'title')
			document.head.querySelectorAll(el.tag).forEach((el) => el.remove());
		Object.entries(el.props).forEach(([key, value]) => {
			if (key === 'children' && value) {
				element.textContent = (value as any).props?.nodeValue;
			} else {
				element.setAttribute(key, value);
			}
		});
		element.setAttribute('data-helmet', 'true');
		document.head.appendChild(element);
	});
}

export function Helmet({ children }) {
	const elements = Children.toArray(children)
		.map((child) => {
			if (!isValidElement(child)) return null;
			return { tag: child.type, props: child.props };
		})
		.filter(Boolean);

	useEffect(() => {
		setElements(elements);
	}, [elements]);

	return null;
}
