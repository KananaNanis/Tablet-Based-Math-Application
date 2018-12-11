/*global user_id*/
import {Platform} from 'react-native'
import {bindActionCreators} from 'redux'
import yaml from 'js-yaml'
import {
	global_screen_height,
	update_screen_dimensions,
} from '../components/Workspace'
import {enter_exit_config} from '../providers/enter_exit'
import {do_batched_actions} from '../providers/reducers'
import {query_path, query_test, query_prop} from '../providers/query_store'
import {clear_handler_variables} from '../event/handlers'
import {global_store} from '../index.js'
import * as Actions from '../providers/actions'
import {as_position, print_all_paths} from '../providers/change_config'
import {get_keypad_width_height} from '../components/Keypad'
import Sound from '../assets/sound'

export let global_sound = {}

export const load_sounds = () => {
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
		global_sound[snd] = new Sound('../assets/snd/' + snd + '.wav')
	}
	global_sound['chirp1'] = new Sound('../assets/snd/chirp1.wav')
}

export let doAction = {}

// load_config_tree reads both config.yaml and constant.yaml
//   load_config_tree is called repeatedly to check if config.yaml
//   has changed, so that updates can be made on-the-fly
export let config_tree = {}
export let global_constant = false

export function print_global_constant() {
	console.log(global_constant)
}

export function initialize_redux_store(path) {
	const verbose = false
	doAction.addLogEntry(Date.now(), [path, 'initialize_redux_store'])
	// clear the store
	if (verbose) console.log('RESET ALL')
	doAction.resetAll()
	clear_handler_variables()

	doAction.setPath('config', path)
	doAction.setPath('prev_config', query_path('config'))
	doAction.setProp('scale_factor', global_constant.scale_factor_from_yaml)
	//get_config(path)

	let enter = true,
		action_list = []
	enter_exit_config(path, enter, action_list)
	if (verbose) console.log('applying actions to load initial values into store')
	do_batched_actions(action_list)
}

let prev_response_text = ''
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

	function update_constant_animal_heights() {
		const s = global_constant.animal_scale_correction
		for (const anim in global_constant.animals) {
			if (anim.startsWith('peg')) continue
			if (global_constant.animals.hasOwnProperty(anim)) {
				global_constant.animals[anim].height *= s
			}
		}
	}

	function create_bound_action_creators() {
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
	}

	try {
		if (!global_constant) {
			window.print_global_constant = print_global_constant
			// first load the constants
			let const_buffer = await fetch('assets/constant.yaml', {
				credentials: 'same-origin',
				cache: 'no-store',
			})
			let const_text = await const_buffer.text()
			const_text = convert_unicode(const_text)
			global_constant = yaml.safeLoad(const_text)
			if (global_constant.debug_mode) {
				// rescale the screen
				global_constant.laptop_scaling_factor =
					global_screen_height / global_constant.tablet_height
				update_screen_dimensions()
				// turn off actually sending log messages
				global_constant.skip_send_log = true
			}
			// console.log('laptop_scaling_factor', global_constant.laptop_scaling_factor)
			update_constant_position_info()
			update_constant_animal_heights()
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
			//console.log('is_mobile', global_constant.is_mobile)
			//console.log('is_safari', global_constant.is_safari)
			create_bound_action_creators()
			doAction.addLogEntry(global_constant.start_time, [
				[],
				'loading_constants',
			])
		}
		// check whether to reload after half a day
		const half_day = 12 * 60 * 60 * 1000
		// const half_day = 10*1000
		const currentTime = Date.now()
		if (currentTime > global_constant.start_time + half_day) {
			// reload!
			if (Platform.OS === 'web') {
				initialize_redux_store(['reloading_message'])
				console.error('reloading time')
				//alert('reloading!')
				doAction.addLogEntry(Date.now(), [[], 'reloading time'])
				window.location.reload(true)
			} else {
				console.error('reloading time not implemented yet')
			}
			return
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

		//if (!doAction) create_bound_action_creators()  // needed?
		doAction.addLogEntry(Date.now(), [[], 'loading_config_tree'])

		const print_paths = false
		if (print_paths) print_all_paths(config_tree)
		//console.log('config_tree', config_tree);

		if ('undefined' === typeof config_tree) {
			console.error('config_tree not defined!')
			return
		}
		// global_constant.username = 'm31'
		let atPCCS = true
		if (global_constant.username.startsWith('m')) {
			const n0 = global_constant.username.charAt(1)
			const n1 = global_constant.username.charAt(2)
			const n = 10 * Number(n0) + Number(n1)
			if (n >= 30) atPCCS = false
			// console.log(' n', n, 'atPCCS', atPCCS)
		}
		let path = atPCCS
			? global_constant.starting_config_path_PCCS
			: global_constant.starting_config_path_Dom
		if (global_constant.debug_mode) {
			path = global_constant.debug_path
			const add_tablet_border = true
			if (add_tablet_border) {
				appObj.setState(_ => {
					return {add_tablet_border: true}
				})
			}
		} else if (
			global_constant &&
			global_constant.starting_level_for &&
			global_constant.starting_level_for.hasOwnProperty(
				global_constant.username,
			)
		) {
			path = global_constant.starting_level_for[global_constant.username]
		}
		initialize_redux_store(path)
		if (query_prop('scale_factor') !== 520) {
			appObj.setState(_ => {
				return {add_scaling_border: true}
			})
		}

		// here is a place to try code that should run just once,
		//   after the config has been loaded

		// console.log(height2tower_name(473.283))
		//doAction.towerSetBlockOpacity('tower_1', 1, .5)
		//doAction.addObjStyle('door_3', 'opacity', .5)
		/*
		window.setTimeout(function() {
		  //doAction.clearAnimInfo('tile_1')
		  window.setTimeout(function() {
		    doAction.addAnimInfo('tile_1', {duration: 500, bottom: [0, 200]})
		  	window.setTimeout(function() {
		    	doAction.addAnimInfo('tile_1', {duration: 200, bottom: [100, 400]})
				}, 250)
			}, 500)
		}, 500)
		*/
		const show_starting_config = false
		if (show_starting_config) query_test()

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
