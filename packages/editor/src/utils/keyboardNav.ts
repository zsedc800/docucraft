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

	function highlightElement(element?: HTMLElement) {
		const elements = getSelectableElements();
		elements.forEach((el) => el.classList.remove(activeClassName));
		if (element) {
			element.classList.add(activeClassName);
			element.focus();
			selectedElement = element;
			element.scrollIntoView({ block: 'center' });
		}
	}

	function findClosestElementInColumn(
		current: HTMLElement,
		elements: HTMLElement[],
		direction: 'up' | 'down'
	) {
		if (!current) return null;
		const rect = current.getBoundingClientRect();
		const index = elements.indexOf(current);

		if (direction === 'up') {
			for (let i = index - 1; i >= 0; i--) {
				const element = elements[i];
				const { top } = element.getBoundingClientRect();
				if (top < rect.top) return element;
			}

			return elements[0];
		} else {
			for (let i = index + 1; i < elements.length; i++) {
				const element = elements[i];
				const { top } = element.getBoundingClientRect();
				if (top > rect.top) return element;
			}
			return elements[elements.length - 1];
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

	document.addEventListener('keydown', handleKeyNavigation, true);

	const elements = getSelectableElements();

	if (!selectedElement) highlightElement(elements[0]);

	return () => {
		document.removeEventListener('keydown', handleKeyNavigation, true);
	};
}
