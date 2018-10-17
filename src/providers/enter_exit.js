import {doAction, global_constant} from '../App'
import * as Actions from '../providers/actions'
import {
	query_path,
	query_prop,
	query_option_values,
	query_event,
	query_arg,
	query_name_of,
	//query_test,
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
import {update_keypad_button_visibility} from '../event/utils'
import {landmark_location} from '../components/Tile'
import {List, fromJS} from 'immutable'

function do_timed_action(id, key, val) {
	// handle the following:
	// appear_after: 2000,
	if ('zoom_anim' === key) {
		//console.log('SETTING ZOOM')
		let anim_info = {...val, zoom: true}
		doAction.setAnimInfo(id, anim_info)
	} else {
		let delay = val
		if ('appear_after' === key) doAction.addObjStyle(id, 'opacity', 0)
		window.setTimeout(function() {
			if ('appear_after' === key) doAction.addObjStyle(id, 'opacity', 1.0)
		}, delay)
	}
}

export function remove_on_exit(lis, action_list) {
	// console.log('remove_on_exit lis', lis)
	for (const what of lis) {
		if ('button_submit' === what) {
			action_list.push(Actions.setButtonDisplay('submit', null))
		} else if ('button_delete' === what) {
			action_list.push(Actions.setButtonDisplay('delete', null))
		} else if ('err_box' === what) action_list.push(Actions.setErrBox(null))
	}
}

export function enter_exit_config(
	silent,
	action_list,
	cp,
	enter,
	verbose,
	curr_config_iter,
	use_delay = false,
	use_suffix = false,
) {
	let keep_names = false
	if (!cp) cp = query_path('config')
	else if (!List.isList(cp)) cp = fromJS(cp)
	//console.log('cp', cp)
	const config = enter && use_delay ? get_config(cp)['delay'] : get_config(cp)
	if (!config) return action_list
	if (verbose) console.log('enter_exit_config enter', enter, 'config', config)
	let curr_exercise = 0
	if (enter) {
		if (!use_suffix) {
			action_list.push(Actions.setProp('top_left_text', cp.toJS().join(' ')))
		}
		action_list.push(Actions.setProp('freeze_display', false))
		action_list.push(Actions.setProp('answer_is_correct', false))
		if (
			config.hasOwnProperty('misc') &&
			config.misc.hasOwnProperty('config_iteration')
		) {
			const ci_max = Number(config.misc.config_iteration)
			if (
				'undefined' !== typeof curr_config_iter &&
				'null' !== curr_config_iter
			) {
				curr_exercise = ci_max - curr_config_iter
			}
			//console.log('curr_config_iter', curr_config_iter, 'ci_max', ci_max, 'curr_exercise', curr_exercise)
		}
	} else {
		if (query_option_values()) {
			action_list.push(Actions.setOptionValues(null))
			action_list.push(Actions.setProp('correct_option_index', null))
		}
	}
	if (query_prop('problem_stage')) {
		if (enter) keep_names = true
		else {
			// check for geometry that should be removed
			if (config['misc']) {
				const c = config['misc']
				for (const key in c) {
					if ('remove_on_exit' === key) remove_on_exit(c[key], action_list)
				}
			}
			return action_list
		}
	}
	// let's handle the various parts of the config one at a time
	let sc = global_constant.scale_factor_from_yaml // may not be available
	const gen_vars =
		enter && config['generate']
			? generate_with_restrictions(
					action_list,
					config['generate'],
					curr_exercise,
					silent,
			  )
			: {}
	if (config['create']) {
		const c = config['create']
		for (const id in c) {
			if ('button_submit' === id) {
				action_list.push(
					Actions.setButtonDisplay('submit', enter ? true : null),
				)
			} else if ('button_delete' === id) {
				action_list.push(
					Actions.setButtonDisplay('delete', enter ? true : null),
				)
			} else if ('button_next' === id) {
				action_list.push(Actions.setButtonDisplay('next', enter ? true : null))
			} else if ('button_start' === id) {
				action_list.push(Actions.setButtonDisplay('start', enter ? true : null))
			} else if ('center_text' === id) {
				action_list.push(Actions.setProp('center_text', enter ? c[id] : null))
			} else if ('err_box' === id) {
				action_list.push(Actions.setErrBox(enter ? {show: true} : null))
			} else if ('keypad_kind' === id) {
				action_list.push(Actions.setKeypadKind(enter ? c[id] : null))
				if ('buildTower' === c[id]) {
					update_keypad_button_visibility(null, null, null)
				}
			} else if (
				id.startsWith('tower_') ||
				id.startsWith('tile_') ||
				id.startsWith('door_') ||
				id.startsWith('portal_') ||
				id.startsWith('five_frame_') ||
				id.startsWith('bar_')
			) {
				if (!keep_names) {
					// assert: we have necessary info in the 'modify' area
					let name = null
					if (enter) {
						name = c[id]
						const verbose2 = false
						if (verbose2) console.log(' id', id, 'name0', name)
						if (
							'object' === typeof name &&
							'undefined' !== typeof name['name']
						) {
							name = name['name']
						}
						if (verbose2) console.log(' id', id, 'name1', name)
						if (Array.isArray(name)) {
							for (let i = 0; i < name.length; ++i) {
								if (gen_vars.hasOwnProperty(name[i])) {
									name[i] = gen_vars[name[i]]
								}
							}
						} else {
							if (gen_vars.hasOwnProperty(name)) name = gen_vars[name]
							if (verbose2) console.log(' id', id, 'name2', name)
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
						if (gen_vars.hasOwnProperty(extra_scale)) {
							extra_scale = gen_vars[extra_scale]
						} else extra_scale = Number(extra_scale)
					}
					if (id.startsWith('tower_')) {
						if (enter) {
							if ('number' === typeof name) name = height2tower_name(name)
							const w = width_pixels_from_name(name, sc)
							const h = height_pixels_from_name(name, sc)
							action_list.push(
								Actions.towerCreate(
									id,
									name,
									as_position(
										config['modify'][id]['position'],
										w,
										h,
										extra_scale,
									),
								),
							)
						} else {
							//console.log('deleting', id)
							action_list.push(Actions.towerDelete(id))
						}
					} else if (id.startsWith('tile_')) {
						if (enter) {
							const w = width_pixels_from_name(name, sc)
							const h = height_pixels_from_name(name, sc)
							action_list.push(
								Actions.tileCreate(
									id,
									name,
									as_position(
										config['modify'][id]['position'],
										w,
										h,
										extra_scale,
									),
								),
							)
						} else action_list.push(Actions.tileDelete(id))
					} else if (id.startsWith('door_')) {
						if (enter) {
							action_list.push(
								Actions.doorCreate(
									id,
									name,
									as_position(config['modify'][id]['position']),
								),
							)
						} else action_list.push(Actions.doorDelete(id))
					} else if (id.startsWith('portal_')) {
						if (enter) {
							//console.log('reading a portal')
							action_list.push(
								Actions.portalCreate(
									id,
									name,
									as_position(config['modify'][id]['position']),
								),
							)
						} else action_list.push(Actions.portalDelete(id))
					} else if (id.startsWith('five_frame_')) {
						if (enter) {
							action_list.push(
								Actions.fiveFrameCreate(
									id,
									name,
									as_position(config['modify'][id]['position']),
								),
							)
						} else action_list.push(Actions.fiveFrameDelete(id))
					} else if (id.startsWith('bar_')) {
						if (enter) {
							action_list.push(
								Actions.barCreate(
									id,
									name,
									as_position(config['modify'][id]['position']),
								),
							)
						} else action_list.push(Actions.barDelete(id))
					}
				}
			}
		}
	}
	if (config['modify']) {
		const c = config['modify']
		for (const id in c) {
			if (c.hasOwnProperty(id)) {
				// console.log('  modify id', id)
				for (const key in c[id]) {
					// console.log('   key', key)
					if (['appear_after', 'zoom_anim', 'unzoom_anim'].includes(key)) {
						if (enter) {
							const val = c[id][key]
							let new_val = val
							if (key.endsWith('_anim')) {
								new_val = {}
								for (const key2 in val) {
									if (val.hasOwnProperty(key2)) {
										let val2 = val[key2]
										//console.log('val2', val2)
										if (gen_vars.hasOwnProperty(val2)) val2 = gen_vars[val2]
										new_val[key2] = val2
									}
								}
							}
							do_timed_action(id, key, new_val)
						}
					} else if ('style' === key) {
						let props = c[id][key]
						for (const key2 in props) {
							if (props.hasOwnProperty(key2)) {
								action_list.push(
									Actions.addObjStyle(id, key2, enter ? props[key2] : null),
								)
							}
						}
					} else if ('anim_info' === key) {
						const info = c[id][key]
						action_list.push(Actions.setAnimInfo(id, info))
					} else if ('tower_style' === key) {
						let props = c[id][key]
						for (const key2 in props) {
							if (props.hasOwnProperty(key2)) {
								action_list.push(
									Actions.towerAddStyle(id, key2, enter ? props[key2] : null),
								)
							}
						}
					} else if ('misc' === key) {
						let props = c[id][key]
						for (const key2 in props) {
							if (props.hasOwnProperty(key2)) {
								let val2 = enter ? props[key2] : null
								if (gen_vars.hasOwnProperty(val2)) {
									val2 = gen_vars[val2]
									//console.log('misc id', id, 'key2', key2, 'val2', val2)
								}
								action_list.push(Actions.addObjMisc(id, key2, val2))
							}
						}
					} else if (id.startsWith('tower_') || id.startsWith('tile_')) {
						if ('width' === key) {
							if (enter) {
								let val = c[id][key]
								if ('string' === typeof val && val.endsWith('vw')) {
									val = (global_screen_width * Number(val.slice(0, -2))) / 100
								}
								action_list.push(Actions.towerSetWidth(id, val))
							} else action_list.push(Actions.towerSetWidth(id, null))
						} else if ('overflow' === key) {
							action_list.push(
								Actions.towerSetOverflow(id, enter ? c[id][key] : null),
							)
						}
					}
				}
			}
		}
	}
	if (config['event_handling']) {
		const c = config['event_handling']
		for (const key in c) {
			if (c.hasOwnProperty(key)) {
				// console.log('event_handling key', key, 'val', c[key])
				action_list.push(
					Actions.setEventHandlingParam(key, enter ? c[key] : null),
				)
			}
		}
	}
	let suffix_path,
		skip_suffix_for_this_level = false
	if (config['misc']) {
		const c = config['misc']
		for (const key in c) {
			if ('config_iteration' === key) {
				let iter_val = global_constant.debug_mode
					? global_constant.num_exercises_for_debugging
					: c[key]
				if (0 === iter_val || !enter) iter_val = null
				action_list.push(Actions.setProp(key, iter_val))
			} else if ('goto_config' === key) {
				// this attribute is special:  it is not erased at the end!
				if (enter) {
					const iter = query_prop('goto_iteration')
					if (!iter || !(iter > 0)) {
						console.log(
							'iter was',
							iter,
							'setting goto iteration',
							c[key][0],
							'path',
							c[key][1],
						)
						action_list.push(Actions.setProp('goto_iteration', c[key][0]))
					} else {
						console.log('skipping setting iteration, iter', iter)
					}
				}
				action_list.push(Actions.setPath('goto', enter ? c[key][1] : null))
			} else if ('jmp_no_suffix' === key) {
				if (enter && !use_suffix) {
					const has_suffix = suffix_path || query_path('suffix_path')
					// const has_suffix = true
					if (!has_suffix) {
						console.log('setting jmp')
						action_list.push(Actions.setPath('jmp', c[key]))
					} else {
						console.log('clearing jmp')
						action_list.push(Actions.setPath('jmp', null))
						suffix_path = null
						action_list.push(Actions.setPath('suffix_path', null))
					}
				}
			} else if ('jmp' === key) {
				if (enter && !use_suffix) {
					// don't unset this state here... wait for in-between
					action_list.push(Actions.setPath(key, c[key]))
				}
			} else if ('skip_suffix_for_this_level' === key) {
				if (c[key]) skip_suffix_for_this_level = true
			} else if ('suffix_path' === key) {
				if (enter && !c['jmp_no_suffix'] && !use_suffix) {
					// don't unset this state here... wait for in-between
					action_list.push(Actions.setPath(key, c[key]))
					suffix_path = c[key]
				}
			} else if (
				[
					'num_stars',
					'skip_submit',
					'skip_in_between',
					'skip_slide_down',
					'big_op',
					'problem_stage',
					'freeze_display',
					'answer_is_correct',
					'hide_dot',
				].includes(key)
			) {
				action_list.push(Actions.setProp(key, enter ? c[key] : null))
			} else if ('blank_between_exercises' === key) {
				action_list.push(Actions.setProp(key, !enter ? c[key] : null))
				//console.log('blank', query_prop('blank_between_exercises'))
			} else if ('remove_on_exit' === key && !enter) {
				//console.log('remove_on_exit', c[key])
				remove_on_exit(c[key], action_list)
			}
		}
	}
	if (config['delay']) {
		//console.log('delay section skipped for now')
	}
	if (enter && !use_delay) {
		// other special purpose setup
		if ('move_handle_dot' === query_event('move')) {
			const landmark_index = gen_vars.landmark_index
			const arg_1 = query_arg(1)
			const h = gen_vars.tile_1_height
			const scale_factor = query_prop('scale_factor')
			const loc = landmark_location(query_name_of(arg_1), landmark_index)
			// console.log('landmark_index', landmark_index, 'arg_1', arg_1)
			// console.log('loc', loc, 'scale_factor', scale_factor)
			action_list.push(Actions.setName('door_1', [loc[1] / (h * scale_factor)]))
		}
		if (
			!use_suffix &&
			!skip_suffix_for_this_level &&
			(query_path('suffix_path') || suffix_path)
		) {
			let sp = query_path('suffix_path')
			if (!sp) sp = suffix_path
			// console.log(' suffix_path', sp)
			// read a second config, for the suffix specifically
			const use_suffix = true
			enter_exit_config(
				silent,
				action_list,
				sp,
				enter,
				verbose,
				curr_config_iter,
				use_delay,
				use_suffix,
			)
			action_list.push(
				Actions.setProp(
					'top_left_text',
					cp.toJS().join(' ') + '  ' + sp.join(' '),
				),
			)
		}
	}
	//query_test()
}
