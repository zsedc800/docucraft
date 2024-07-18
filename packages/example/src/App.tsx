import Icon from '@docucraft/icons';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './style.css';
import Example from './Example';
import Editor from './Editor';
import Content from './Content';

export default () => (
	<div className="">
		<Router>
			<Content />
			<Routes>
				<Route path="/" Component={Editor}></Route>
				<Route path="/example" Component={Example} />
			</Routes>
		</Router>
	</div>
);
