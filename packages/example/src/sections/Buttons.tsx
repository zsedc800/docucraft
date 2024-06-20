import { Button } from '@docucraft/ui';
export default () => {
	return (
		<section className="section">
			<Button type="elevated">elevated</Button>
			<Button icon="home" type="filled">
				filled
			</Button>
			<Button type="filled-tonal">filled-tonal</Button>
			<Button type="outlined">outlined</Button>
			<Button type="text">text</Button>
			<Button type="fab">fab</Button>
			<Button type="extended-fab">extended-fab</Button>
		</section>
	);
};
