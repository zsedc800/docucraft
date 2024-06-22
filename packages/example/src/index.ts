import { createElement, render } from '@docucraft/srender';
import '@docucraft/icons/styles';
import '@docucraft/ui/dist/style.css';
import App from './App';

const container = document.getElementById('container')!;

render(createElement(App as any), container);
