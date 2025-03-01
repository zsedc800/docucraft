export function keyboardNavigator(
	container: HTMLElement,
	{ selector = '', selectableRole = 'item', activeClassName = 'selected' } = {}
) {
	let selectedElement: HTMLElement = null;
	function getSelectableElements() {
		return Array.from(
			container.querySelectorAll(selector || `[role="${selectableRole}"]`)
		) as HTMLElement[];
	}

	function highlightElement(element: HTMLElement) {
		const elements = getSelectableElements();
		elements.forEach((el) => el.classList.remove(activeClassName));
		if (element) {
			element.classList.add(activeClassName);
			element.focus();
			selectedElement = element;
		}
	}

	function findClosestElementInColumn(
		current,
		elements,
		direction: 'up' | 'down'
	) {
		if (!current) return null;
		const rect = current.getBoundingClientRect();
		const sameColumnElements = elements
			.map((el) => ({ el, rect: el.getBoundingClientRect() }))
			.filter(({ rect: r }) => Math.abs(r.left - rect.left) < 5); // 允许少量误差

		if (direction === 'up') {
			return sameColumnElements
				.filter(({ rect: r }) => r.top < rect.top)
				.sort((a, b) => b.rect.top - a.rect.top)[0]?.el;
		} else {
			return sameColumnElements
				.filter(({ rect: r }) => r.top > rect.top)
				.sort((a, b) => a.rect.top - b.rect.top)[0]?.el;
		}
	}

	function handleKeyNavigation(event: KeyboardEvent) {
		event.preventDefault();
		const elements = getSelectableElements();
		if (elements.length === 0) return;

		if (!selectedElement) {
			highlightElement(elements[0]);
			return;
		}

		let newElement: HTMLElement = null;
		const currentIndex = elements.indexOf(selectedElement);

		switch (event.key) {
			case 'ArrowLeft':
				if (currentIndex > 0) {
					newElement = elements[currentIndex - 1];
				}
				break;
			case 'ArrowRight':
				if (currentIndex < elements.length - 1) {
					newElement = elements[currentIndex + 1];
				}
				break;
			case 'ArrowUp':
				newElement = findClosestElementInColumn(
					selectedElement,
					elements,
					'up'
				);
				break;
			case 'ArrowDown':
				newElement = findClosestElementInColumn(
					selectedElement,
					elements,
					'down'
				);
				break;
			case 'Enter':
				selectedElement.dispatchEvent(
					new MouseEvent('click', { cancelable: false, bubbles: true })
				);
				break;
		}

		if (newElement) {
			highlightElement(newElement);
		}
	}

	document.addEventListener('keydown', handleKeyNavigation);

	const elements = getSelectableElements();
	if (elements.length === 0) return;

	console.log(elements, 'eles');

	if (!selectedElement) {
		highlightElement(elements[0]);
		return;
	}

	return () => {
		console.log('destroy++=');

		document.removeEventListener('keydown', handleKeyNavigation);
	};
}
