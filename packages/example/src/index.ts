import { createElement, render } from '@docucraft/srender';
import '@docucraft/icons/styles/round';
import App from './App';

const container = document.getElementById('container')!;

render(createElement(App as any), container);
