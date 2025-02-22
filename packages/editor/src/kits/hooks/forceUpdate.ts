import { useState } from '@docucraft/srender';

export default () => {
	const [val, setVal] = useState(false);
	return {
		update: () => setVal(!val)
	};
};
