/*global user_id*/
import React from 'react'
import {StyleSheet, View, Platform} from 'react-native'
import {bindActionCreators} from 'redux'
import yaml from 'js-yaml'

import WorkspaceContainer from './containers/WorkspaceContainer'
import {
	global_screen_width,
	global_screen_height,
	global_grass_height,
} from './components/Workspace'
import {touchHandler} from './event/event'
import {global_store} from './index.js'
import Sound from './assets/sound'
import * as Actions from './providers/actions'
import PrintFigure from './components/PrintFigure'
import {as_position} from './providers/change_config'
import {query_path} from './providers/query_store'
import {get_keypad_width_height} from './components/Keypad'
import {enter_exit_config} from './providers/enter_exit'

export let doAction = {}
export let global_sound = {}

export const image_location = (name, just_grey = false) =>
	require('./assets/img/' + name + (just_grey ? '.bw' : '') + '.png')

// sum is for starting to use jest (not working yet)
export function sum(x, y) {
	return x + y
}

// load_config_tree reads both config.yaml and constant.yaml
//   load_config_tree is called repeatedly to check if config.yaml
//   has changed, so that updates can be made on-the-fly
let prev_response_text = ''
export let config_tree = {}
export let global_constant = false
export async function load_config_tree(appObj) {
	function convert_unicode(input) {
		return input.replace(/\\u(\w\w\w\w)/g, function(a, b) {
			const charcode = parseInt(b, 16)
			return String.fromCharCode(charcode)
		})
	}

	function update_constant_position_info() {
		const p = global_constant.placard
		p.position = as_position(p.position, p.width, p.height)
		for (const item of ['special_button_geoms', 'keypad_info']) {
			for (const key in global_constant[item]) {
				if (global_constant[item].hasOwnProperty(key)) {
					let geom = global_constant[item][key],
						width,
						height
					if ('keypad_info' === item) {
						const g = get_keypad_width_height(key)
						width = g.width
						height = g.height
					} else {
						width = geom.width
						height = geom.height
					}
					const pos = as_position(geom.position, width, height)
					//console.log(key, geom.position, pos)
					global_constant[item][key].position = pos
				}
			}
		}
	}
	try {
		if (!global_constant) {
			// first load the constants
			let const_buffer = await fetch('assets/constant.yaml', {
				credentials: 'same-origin',
				cache: 'no-store',
			})
			let const_text = await const_buffer.text()
			const_text = convert_unicode(const_text)
			global_constant = yaml.safeLoad(const_text)
			update_constant_position_info()
			global_constant.start_time = Date.now()
			if (Platform.OS === 'web') {
				// user_id is a value passed in from a PHP file, cannot declare it!
				if ('undefined' === typeof user_id) {
					global_constant.username = 'Olaf'
				} else if (!global_constant.first_name_for[user_id]) {
					global_constant.username = user_id
				} else {
					global_constant.username = global_constant.first_name_for[user_id]
				}
				global_constant.ua = window.navigator.userAgent
				global_constant.is_mobile = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(
					global_constant.ua.toLowerCase(),
				)
				global_constant.is_safari =
					navigator.vendor &&
					navigator.vendor.indexOf('Apple') > -1 &&
					navigator.userAgent &&
					!navigator.userAgent.match('CriOS')
			}
		}
		let response = await fetch('assets/config.yaml', {
			credentials: 'same-origin',
			cache: 'no-store',
		})
		let response_text = await response.text()
		if (response_text === prev_response_text) return
		prev_response_text = response_text
		//console.log(response_text);
		config_tree = yaml.safeLoad(response_text)
		//console.log('config_tree', config_tree);

		// create the bound action creators!
		const verboseActions = false
		if (verboseActions) {
			let doActionInner = bindActionCreators(Actions, global_store.dispatch)
			for (const a in doActionInner) {
				if (doActionInner.hasOwnProperty(a)) {
					doAction[a] = function(...args) {
						console.log(a, ...args)
						return doActionInner[a](...args)
					}
				}
			}
		} else doAction = bindActionCreators(Actions, global_store.dispatch)

		if ('undefined' === typeof config_tree) {
			console.error('config_tree not defined!')
			return
		}
		let path = config_tree.params.starting_config_path
		if (
			global_constant &&
			global_constant.starting_level_for &&
			global_constant.starting_level_for.hasOwnProperty(
				global_constant.username,
			)
		) {
			path = global_constant.starting_level_for[global_constant.username]
		}
		// clear the store
		//console.log('RESET ALL')
		doAction.resetAll()

		doAction.setPath('config', path)
		doAction.setPath('prev_config', query_path('config'))
		doAction.setProp('scale_factor', global_constant.scale_factor_from_yaml)
		//get_config(path)

		const verbose = false
		enter_exit_config(true, verbose)
		// here is a place to try code that should run just once,
		//   after the config has been loaded

		//doAction.addObjStyle('door_3', 'opacity', .5)

		const printPDF = false // for creating worksheets
		if (printPDF) {
			appObj.setState(_ => {
				return {do_print: true}
			})
		}
	} catch (error) {
		console.error(error)
	}
}

// top level component
export default class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {do_print: false}
		const poll_to_see_if_config_tree_changed = true
		if (poll_to_see_if_config_tree_changed) {
			window.setInterval(load_config_tree, 3000, this)
		} else load_config_tree(this)
	}
	componentDidMount() {
		// preload some sounds?
		const available_sounds = [
			'chirp1',
			'chirp2',
			'bells',
			'level0',
			'level1',
			'level2',
			'level3',
		]
		for (const snd of available_sounds) {
			global_sound[snd] = new Sound('assets/snd/' + snd + '.wav')
		}
		global_sound['chirp1'] = new Sound('assets/snd/chirp1.wav')
	}
	render() {
		if (this.state.do_print) return <PrintFigure />
		// top level view, sets up event listeners
		return (
			<View
				onMoveShouldSetResponder={_ => true}
				onResponderGrant={evt => touchHandler(evt, true)}
				onResponderMove={evt => touchHandler(evt)}
				onResponderRelease={evt => touchHandler(evt)}
				onResponderTerminationRequest={_ => false}
				onStartShouldSetResponder={_ => true}
				style={styles.root}
			>
				<View style={styles.grass} />
				<WorkspaceContainer />
			</View>
		)
	}
}

const grassColor = 'lightgreen'
const styles = StyleSheet.create({
	root: {
		width: global_screen_width,
		height: global_screen_height,
	},
	grass: {
		backgroundColor: grassColor,
		height: global_grass_height,
		width: global_screen_width,
		position: 'absolute',
		left: 0,
		bottom: 0,
	},
})
