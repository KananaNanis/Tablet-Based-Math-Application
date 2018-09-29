import {doAction, global_constant} from '../App'
import {
	query_path,
	query_prop,
	query_option_values,
	query_event,
	query_arg,
	query_obj_misc,
	query_name_of_tile,
	query_test,
} from './query_store'
import {height2tower_name} from './query_tower'
// import { update_keypad_button_visibility } from '../event/dispatcher'
import {generate_with_restrictions} from '../containers/generate'
import {global_screen_width} from '../components/Workspace'
import {
	get_config,
	as_position,
	width_pixels_from_name,
	height_pixels_from_name,
} from './change_config'
import {
	set_primary_height,
	update_keypad_button_visibility,
} from '../event/utils'
import {landmark_location} from '../components/Tile'

function do_timed_action(id, key, val) {
	// handle the following:
	// appear_after: 2000,
	// start_fade: 2500, end_fade: 3000
	if ('zoom_anim' == key) {
		//console.log('SETTING ZOOM')
		let anim_info = {...val, zoom: true}
		doAction.setAnimInfo(id, anim_info)
	} else {
		let delay = val
		if ('appear_after' == key) doAction.addObjStyle(id, 'opacity', 0)
		if ('fade_anim' == key) delay = val.start
		window.setTimeout(function() {
			if ('appear_after' == key) doAction.addObjStyle(id, 'opacity', 1.0)
			else if ('fade_anim' == key) {
				//console.log('starting fade animation for id', id)
				doAction.setAnimInfo(id, {fade_duration: val.duration})
			}
		}, delay)
	}
}

export function remove_on_exit(lis) {
	for (const what of lis) {
		if ('button_submit' == what) doAction.setButtonDisplay('submit', null)
		else if ('button_delete' == what) doAction.setButtonDisplay('delete', null)
		else if ('err_box' == what) doAction.setErrBox(null)
	}
}

export function enter_exit_config(
	enter,
	verbose,
	curr_config_iter,
	use_delay = false,
) {
	let keep_names = false
	const cp = query_path('config')
	//console.log('cp', cp)
	const config = enter && use_delay ? get_config(cp)['delay'] : get_config(cp)
	if (!config) return
	if (verbose) console.log('enter_exit_config enter', enter, 'config', config)
	let curr_exercise = 0
	if (enter) {
		doAction.setProp('top_left_text', cp.toJS().join(' '))
		doAction.setProp('freeze_display', false)
		if (
			config.hasOwnProperty('misc') &&
			config.misc.hasOwnProperty('config_iteration')
		) {
			const ci_max = +config.misc.config_iteration
			if (null != curr_config_iter) curr_exercise = ci_max - curr_config_iter
			//console.log('curr_config_iter', curr_config_iter, 'ci_max', ci_max, 'curr_exercise', curr_exercise)
		}
	} else {
		if (query_option_values()) {
			doAction.setOptionValues(null)
			doAction.setProp('correct_option_index', null)
		}
	}
	if (query_prop('problem_stage')) {
		if (enter) keep_names = true
		else {
			// check for geometry that should be removed
			if (config['misc']) {
				const c = config['misc']
				for (const key in c) {
					if ('remove_on_exit' == key) remove_on_exit(c[key])
				}
			}
			return
		}
	}
	// let's handle the various parts of the config one at a time
	let sc = global_constant.scale_factor_from_yaml // may not be available
	const gen_vars =
		enter && config['generate']
			? generate_with_restrictions(config['generate'], curr_exercise)
			: {}
	if (config['create']) {
		const c = config['create']
		for (const id in c) {
			if ('button_submit' == id)
				doAction.setButtonDisplay('submit', enter ? true : null)
			else if ('button_delete' == id)
				doAction.setButtonDisplay('delete', enter ? true : null)
			else if ('button_next' == id)
				doAction.setButtonDisplay('next', enter ? true : null)
			else if ('button_start' == id)
				doAction.setButtonDisplay('start', enter ? true : null)
			else if ('center_text' == id)
				doAction.setProp('center_text', enter ? c[id] : null)
			else if ('err_box' == id) doAction.setErrBox(enter ? {show: true} : null)
			else if ('keypad_kind' == id) {
				doAction.setKeypadKind(enter ? c[id] : null)
				if ('buildTower' == c[id]) {
					update_keypad_button_visibility(null, null, null)
				}
			} else if (
				id.startsWith('tower_') ||
				id.startsWith('tile_') ||
				id.startsWith('door_') ||
				id.startsWith('portal_')
			) {
				if (keep_names) {
				} // skip!
				else {
					// assert: we have necessary info in the 'modify' area
					let name = null
					if (enter) {
						name = c[id]
						if ('object' == typeof name && name['name']) name = name['name']
						if (Array.isArray(name)) {
							for (const i = 0; i < name.length; ++i) {
								if (gen_vars.hasOwnProperty(name[i]))
									name[i] = gen_vars[name[i]]
							}
						} else {
							if (gen_vars.hasOwnProperty(name)) name = gen_vars[name]
						}
					}
					let extra_scale = 1
					if (
						config['modify'] &&
						config['modify'][id] &&
						config['modify'][id]['misc'] &&
						config['modify'][id]['misc']['extra_scale']
					) {
						extra_scale = config['modify'][id]['misc']['extra_scale']
						if (gen_vars.hasOwnProperty(extra_scale))
							extra_scale = gen_vars[extra_scale]
						else extra_scale = +extra_scale
					}
					if (id.startsWith('tower_')) {
						if (enter) {
							if ('number' == typeof name) name = height2tower_name(name)
							const w = width_pixels_from_name(name, sc)
							const h = height_pixels_from_name(name, sc)
							doAction.towerCreate(
								id,
								name,
								as_position(
									config['modify'][id]['position'],
									w,
									h,
									extra_scale,
								),
							)
						} else {
							//console.log('deleting', id)
							doAction.towerDelete(id)
						}
					} else if (id.startsWith('tile_')) {
						if (enter) {
							const w = width_pixels_from_name(name, sc)
							const h = height_pixels_from_name(name, sc)
							doAction.tileCreate(
								id,
								name,
								as_position(
									config['modify'][id]['position'],
									w,
									h,
									extra_scale,
								),
							)
						} else doAction.tileDelete(id)
					} else if (id.startsWith('door_')) {
						if (enter) {
							doAction.doorCreate(
								id,
								name,
								as_position(config['modify'][id]['position']),
							)
						} else doAction.doorDelete(id)
					} else if (id.startsWith('portal_')) {
						if (enter) {
							//console.log('reading a portal')
							doAction.portalCreate(
								id,
								name,
								as_position(config['modify'][id]['position']),
							)
						} else doAction.portalDelete(id)
					}
				}
			}
		}
	}
	if (config['modify']) {
		const c = config['modify']
		for (const id in c) {
			// console.log('  modify id', id)
			for (const key in c[id]) {
				// console.log('   key', key)
				if (
					['appear_after', 'fade_anim', 'zoom_anim', 'unzoom_anim'].includes(
						key,
					)
				) {
					if (enter) {
						const val = c[id][key]
						let new_val = val
						if (key.endsWith('_anim')) {
							new_val = {}
							for (const key2 in val) {
								let val2 = val[key2]
								//console.log('val2', val2)
								if (gen_vars.hasOwnProperty(val2)) val2 = gen_vars[val2]
								new_val[key2] = val2
							}
						}
						do_timed_action(id, key, new_val)
					}
				} else if ('style' == key) {
					let props = c[id][key]
					for (const key2 in props)
						doAction.addObjStyle(id, key2, enter ? props[key2] : null)
				} else if ('tower_style' == key) {
					let props = c[id][key]
					for (const key2 in props)
						doAction.towerAddStyle(id, key2, enter ? props[key2] : null)
				} else if ('misc' == key) {
					let props = c[id][key]
					for (const key2 in props) {
						let val2 = enter ? props[key2] : null
						if (gen_vars.hasOwnProperty(val2)) {
							val2 = gen_vars[val2]
							//console.log('misc id', id, 'key2', key2, 'val2', val2)
						}
						doAction.addObjMisc(id, key2, val2)
					}
				} else if (id.startsWith('tower_') || id.startsWith('tile_')) {
					if ('width' == key) {
						if (enter) {
							let val = c[id][key]
							if ('string' === typeof val && val.endsWith('vw'))
								val = (global_screen_width * +val.slice(0, -2)) / 100
							doAction.towerSetWidth(id, val)
						} else doAction.towerSetWidth(id, null)
					} else if ('overflow' == key)
						doAction.towerSetOverflow(id, enter ? c[id][key] : null)
				}
			}
		}
	}
	if (config['event_handling']) {
		const c = config['event_handling']
		for (const key in c) {
			// console.log('event_handling key', key, 'val', c[key])
			doAction.setEventHandlingParam(key, enter ? c[key] : null)
		}
	}
	if (config['misc']) {
		const c = config['misc']
		for (const key in c) {
			if ('config_iteration' == key) {
				let iter_val = c[key]
				if (0 == iter_val || !enter) iter_val = null
				doAction.setProp(key, iter_val)
			} else if ('goto_config' == key) {
				// this attribute is special:  it is not erased at the end!
				if (enter) {
					const iter = query_prop('goto_iteration')
					if (iter == null || !(iter > 0)) {
						console.log(
							'iter was',
							iter,
							'setting goto iteration',
							c[key][0],
							'path',
							c[key][1],
						)
						doAction.setProp('goto_iteration', c[key][0])
					} else {
						console.log('skipping setting iteration, iter', iter)
					}
				}
				doAction.setPath('goto', enter ? c[key][1] : null)
			} else if (
				[
					'num_stars',
					'skip_submit',
					'skip_in_between',
					'skip_slide_down',
					'big_op',
					'problem_stage',
					'freeze_display',
					'hide_dot',
				].includes(key)
			) {
				doAction.setProp(key, enter ? c[key] : null)
			} else if ('blank_between_exercises' == key) {
				doAction.setProp(key, !enter ? c[key] : null)
				//console.log('blank', query_prop('blank_between_exercises'))
			} else if ('remove_on_exit' == key && !enter) {
				//console.log('remove_on_exit', c[key])
				remove_on_exit(c[key])
			}
		}
	}
	if (config['delay']) {
		//console.log('delay section skipped for now')
	}
	if (enter && !use_delay) {
		// other special purpose setup
		if ('move_handle_dot' == query_event('move')) {
			const landmark_index = gen_vars.landmark_index
			const arg_1 = query_arg(1)
			const h = gen_vars.tile_1_height
			const scale_factor = query_prop('scale_factor')
			const loc = landmark_location(query_name_of_tile(arg_1), landmark_index)
			// console.log('landmark_index', landmark_index, 'arg_1', arg_1)
			// console.log('loc', loc, 'scale_factor', scale_factor)
			doAction.setName('door_1', [loc[1] / (h * scale_factor)])
		}
	}
	//query_test()
}
