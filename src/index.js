/* eslint-env browser */
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import suujiApp from './providers/reducers'
import {Provider} from 'react-redux'
import {createStore} from 'redux'
import {enableBatching} from 'redux-batched-actions'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

//import './providers/testThis.js';

export const global_store = createStore(enableBatching(suujiApp))

ReactDOM.render(
	<Provider store={global_store}>
		<App />
	</Provider>,
	document.getElementById('root'),
)
registerServiceWorker()
