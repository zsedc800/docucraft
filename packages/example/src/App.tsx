import Icon from '@docucraft/icons';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './style.css';
import Example from './Example';
import Editor from './Editor';
import { Button } from '@docucraft/ui';
export default () => (
	<div className="">
		<Router>
			{/* <h1>xdf</h1> */}
			<Routes>
				<Route path="/" Component={Editor}></Route>
				<Route path="/example" Component={Example} />
			</Routes>
		</Router>
	</div>
);
