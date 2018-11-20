import {List, fromJS} from 'immutable'
import {config_tree, global_constant} from '../lib/global'
import {with_suffix, query_path, query_prop} from './query_store'
import {tower_name2height} from './query_tower'
import {
	global_screen_width,
	global_workspace_height,
} from '../components/Workspace'
import {get_block_size_from_group} from '../components/Block'
import {enter_exit_config} from './enter_exit'
import * as Actions from './actions'
import {do_batched_actions} from './reducers'

export const deep_clone = obj => JSON.parse(JSON.stringify(obj))

const attach_properties = (to, from) => {
	for (const key in from) {
		if ('misc' === key && to.hasOwnProperty(key)) {
			attach_properties(to.misc, from.misc)
		} else to[key] = deep_clone(from[key])
	}
}

function attach_params_to_add(res, params_to_add) {
	for (const category in params_to_add) {
		if (!res.hasOwnProperty(category)) {
			res[category] = deep_clone(params_to_add[category])
		} else {
			if (
				'create' === category ||
				'modify' === category ||
				'delay' === category
			) {
				// consider the ids one by one
				for (const id in params_to_add[category]) {
					if (params_to_add[category].hasOwnProperty(id)) {
						const subtree = params_to_add[category][id]
						if (subtree && 'remove' === subtree) {
							delete res['create'][id]
							delete res['modify'][id]
						} else if (
							!res[category].hasOwnProperty(id) ||
							'create' === category
						) {
							res[category][id] = deep_clone(subtree)
						} else {
							//console.log('for id', id, 'attaching', res[category][id], 'to', subtree)
							attach_properties(res[category][id], subtree)
						}
					}
				}
			} else {
				attach_properties(res[category], params_to_add[category])
			}
		}
	}
}

export function get_config(path, depth = 0) {
	if (!List.isList(path)) {
		console.error('Error:  expecting a List!', path)
		return {}
	}
	if (depth > 100) {
		console.error('Error:  recursing 100 times in get_config?')
		return {}
	}
	//const path = path0.toJS()
	let tree_loc = config_tree
	// let res = deep_clone(tree_loc.params)
	let res = {}
	// console.log('tree_loc', tree_loc)
	// console.log('init res ', res)
	//console.log('get_config path.size', path.size)
	for (let i = 0; i < path.size; ++i) {
		tree_loc = tree_loc[path.get(i)]
		if (tree_loc) {
			if (tree_loc.params_from) {
				let params_to_add = get_config(fromJS(tree_loc.params_from), depth + 1)
				attach_params_to_add(res, params_to_add)
			}
			if (tree_loc.params) {
				attach_params_to_add(res, tree_loc.params)
			}
		}
	}
	//console.log('get_config  path', path.toJS(), 'res', res)
	return res
}

export function as_position(pos_info, width = 0, height = 0, extra_scale = 1) {
	let res = [0, 0]
	for (let i = 0; i < 2; ++i) {
		if ('number' === typeof pos_info[i]) res[i] = pos_info[i]
		else if ('string' === typeof pos_info[i]) {
			let val = pos_info[i]
			let position_modifier = false
			let words = val.split(' ')
			if (global_constant.position_modifiers.includes(words[0])) {
				position_modifier = words[0]
				val = val.slice(words[0].length + 1)
			}
			if (val.endsWith('vw')) {
				val = (global_screen_width * Number(val.slice(0, -2))) / 100
			} else if (val.endsWith('vh')) {
				val = (global_workspace_height * Number(val.slice(0, -2))) / 100
			}

			if (['left', 'bottom'].includes(position_modifier)) {
				// ignore
			} else if ('right' === position_modifier) {
				val = global_screen_width - extra_scale * width - val
			} else if ('top' === position_modifier) {
				val = global_workspace_height - extra_scale * height - val
			} else if ('left_from_right' === position_modifier) {
				val = global_screen_width - val
			} else if ('right_from_left' === position_modifier) {
				val = val - extra_scale * width
			} else if ('bottom_from_top' === position_modifier) {
				val = global_workspace_height - val
			} else if ('top_from_bottom' === position_modifier) {
				val = val - extra_scale * height
			}

			if ('center' === val) {
				if (0 === i) val = (global_screen_width - width) / 2
				else val = (global_workspace_height - height) / 2
			}
			res[i] = Number(val)
		}
	}
	//console.log('as_position pos_info', pos_info, 'res', res)
	return res
}

export function width_pixels_from_name(name, scale_factor) {
	if (!name) return 0
	if (global_constant.animals.hasOwnProperty(name)) {
		const a = global_constant.animals[name]
		//console.log('width_pixels_from_name name', name, 'scale_factor', scale_factor)
		return (scale_factor * a.height * a.pixel_width) / a.pixel_height
	} else if (name.length >= 1) {
		const group = name[0]
		const size = get_block_size_from_group(group)
		scale_factor = scale_factor || query_prop('scale_factor')
		return scale_factor * global_constant.tower.size2depth[size]
	}
	return 0
}

export function height_pixels_from_name(name, scale_factor) {
	if (!name) return 0.0
	if (global_constant.animals.hasOwnProperty(name)) {
		const a = global_constant.animals[name]
		return scale_factor * a.height
	} else {
		scale_factor = scale_factor || query_prop('scale_factor')
		return scale_factor * tower_name2height(name, scale_factor)
	}
}

export function transition_to_next_config(action_list, silent) {
	const verbose = false
	if (verbose) console.log('transition_to_next_config ')
	let do_actions_immediately = false
	if (!action_list) {
		action_list = []
		do_actions_immediately = true
	}
	const curr_num_stars = query_prop('num_stars')
	action_list.push(Actions.clearEventHandling())
	let cp = query_path('config')
	if (query_path('goto') && query_prop('goto_iteration') === 1) {
		// we are not going to jump, but we need to reset goto_iteration
		action_list.push(Actions.setProp('goto_iteration', null))
	}
	if ('in_between' === query_path('config').get(0)) {
		if (verbose) console.log('  in_between')
		// special case
		enter_exit_config(cp, false, action_list, silent)
		const prev_path = query_path('prev_config')
		const repeat_level = query_prop('repeat_level')
		let new_path
		if (repeat_level && repeat_level > 0) {
			action_list.push(Actions.setProp('repeat_level', repeat_level - 1))
			console.log('new repeat_level', query_prop('repeat_level'))
			new_path = prev_path
		} else if (query_path('jmp')) {
			const jmp = query_path('jmp')
			// console.log('jmp', jmp)
			if ('string' === typeof jmp) {
				const jmp2 = global_constant[jmp][global_constant.username]
				// console.log('jmp2')
				new_path = fromJS(jmp2)
			} else new_path = jmp
			action_list.push(Actions.setPath('jmp', null))
		} else new_path = next_config_path(prev_path)
		if (verbose) console.log('transition_to_next_config', new_path.toJS())
		if (!silent) {
			action_list.push(
				Actions.addLogEntry(
					Date.now(),
					with_suffix([new_path, 'next_config', 'start']),
				),
			)
		}
		action_list.push(Actions.setPath('config', new_path))
		enter_exit_config(new_path, true, action_list, silent)
	} else if (query_path('goto') && query_prop('goto_iteration') > 1) {
		if (verbose) console.log('  goto')
		// possibly jump directly to some other path
		const iter = query_prop('goto_iteration')
		const new_path = query_path('goto')
		action_list.push(
			Actions.addLogEntry(Date.now(), [
				with_suffix(query_path('config').toJS()),
				'next_config',
				iter,
			]),
		)
		enter_exit_config(cp, false, action_list, silent)
		//console.log('HACK  remove this next line')
		//action_list.push(Actions.setErrBox(null))
		action_list.push(Actions.setPath('prev_config', query_path('config')))
		action_list.push(Actions.setPath('config', new_path))
		enter_exit_config(new_path, true, action_list, silent)
		action_list.push(Actions.setProp('goto_iteration', iter - 1))
		action_list.push(Actions.setProp('num_stars', curr_num_stars))
		console.log('goto new_path ', new_path.toJS(), 'goto_iteration', iter - 1)
	} else if (query_prop('config_iteration') > 1) {
		if (verbose) console.log('  next exercise')
		const iter = query_prop('config_iteration')
		//console.log('iter', iter)
		action_list.push(
			Actions.addLogEntry(Date.now(), [
				with_suffix(query_path('config').toJS()),
				'next_config',
				iter,
			]),
		)
		enter_exit_config(cp, false, action_list, silent)
		if (query_prop('blank_between_exercises')) {
			if (verbose) {
				console.log('applying blank of ', query_prop('blank_between_exercises'))
			}
			window.setTimeout(function() {
				let action_list2 = []
				enter_exit_config(
					cp,
					true,
					action_list2,
					silent,
					false, // verbose
					iter - 1,
				)
				action_list2.push(Actions.setProp('config_iteration', iter - 1))
				action_list2.push(Actions.setProp('num_stars', curr_num_stars))
				do_batched_actions(action_list2)
			}, query_prop('blank_between_exercises'))
		} else {
			enter_exit_config(cp, true, action_list, silent, false, iter - 1)
			action_list.push(Actions.setProp('config_iteration', iter - 1))
			action_list.push(Actions.setProp('num_stars', curr_num_stars))
		}
		/*
    action_list.push(Actions.setName('tile_1', pick_animal_name()))
    action_list.push(Actions.setName('tower_2', []))
    update_keypad_button_visibility(null, null, null)

    action_list.push(Actions.setName('tower_1',
      tower_exercise_list[exercise_index]))
    exercise_index = (exercise_index + 1) % tower_exercise_list.length;
    action_list.push(Actions.setName('tower_2', []))
    update_keypad_button_visibility(null, null, null)
    */
	} else if (query_prop('skip_in_between')) {
		if (verbose) console.log('  skip_in_between')
		enter_exit_config(cp, false, action_list, silent)
		const curr_path = query_path('config')
		const new_path = next_config_path(curr_path)
		action_list.push(Actions.setPath('prev_config', curr_path))
		action_list.push(Actions.setPath('config', new_path))
		enter_exit_config(new_path, true, action_list, silent)
	} else {
		if (verbose) console.log('  switching to in_between')
		enter_exit_config(cp, false, action_list, silent)
		action_list.push(Actions.setPath('prev_config', query_path('config')))
		action_list.push(Actions.setPath('config', ['in_between']))
		enter_exit_config(['in_between'], true, action_list, silent)
	}
	if (verbose) console.log(' action_list', action_list)
	if (do_actions_immediately) {
		//console.log('do_actions_immediately action_list', action_list)
		do_batched_actions(action_list)
	} else return action_list
}

export function print_all_paths() {
	let path = fromJS(first_config_path())
	let s = ''
	console.log('print_all_paths:')
	let path_index = 0
	for (let i = 0; path && i < 1000; ++i) {
		if (path && 'in_between' !== path.get(0)) {
			++path_index
			s += path_index + '\t' + path.toJS().join(' ') + '\n'
		}
		path = next_config_path(path)
	}
	console.log(s)
}

function first_subpath(tree_loc) {
	// is there a node that looks like the name of a level among tree_loc children
	if ('object' !== typeof tree_loc || null === tree_loc) return null
	const keys = Object.keys(tree_loc)
	if ('skip_node_above' === keys[0]) return null
	for (let i = 0; i < keys.length; ++i) {
		if (!['params', 'params_from'].includes(keys[i])) {
			return keys[i]
		}
	}
	return null
}

export function first_config_path(starter) {
	let res = starter ? starter.slice() : []
	let tree_loc = config_tree
	if (starter) {
		// move down to the implied node, first!
		for (let i = 0; i < starter.length; ++i) tree_loc = tree_loc[starter[i]]
	}
	while (first_subpath(tree_loc)) {
		/*
		if (!['params', 'params_from'].includes(Object.keys(tree_loc)[0])) {
			console.error(
				"Error in first_config_path: first key not 'params' or 'params_from' instead",
				Object.keys(tree_loc)[0],
			)
			break
		}
		const k2 = Object.keys(tree_loc)[1]
		*/
		const k2 = first_subpath(tree_loc)
		res.push(k2)
		tree_loc = tree_loc[k2]
	}
	// console.log('first_config_path starter', starter, 'res', res)
	return res
}

function path_marked_as_skip(path) {
	if (!path) return false
	let tree_loc = config_tree
	for (let i = 0; i < path.size; ++i) {
		tree_loc = tree_loc[path.get(i)]
		if ('object' === typeof tree_loc && null !== tree_loc) {
			const k0 = Object.keys(tree_loc)[0]
			if ('skip_node_above' === k0) {
				//console.log('path_marked_as_skip path', path.toJS(), 'res', true)
				return true
			}
		}
	}
	//console.log('path_marked_as_skip path', path.toJS(), 'res', false)
	return false
}

export function next_config_path(path) {
	let res = null
	let tree_loc = config_tree
	// find the lowest node at which the path does not take the last option
	for (let i = 0; i < path.size; ++i) {
		const k = Object.keys(tree_loc)
		if (k.indexOf(path.get(i)) + 1 < k.length) {
			res = []
			for (let j = 0; j < i; ++j) res.push(path.get(j))
			const level_name = k[k.indexOf(path.get(i)) + 1]
			// console.log('res', res, 'level_name', level_name)
			res.push(level_name)
			// now find the longest continuation of this path
			res = first_config_path(res)
			// console.log('  after first_config_path, res', res)
		}
		tree_loc = tree_loc[path.get(i)]
	}
	// console.log('next_config_path path', path.toJS(), 'res0', res)
	res = fromJS(res)
	if (path_marked_as_skip(res)) {
		// try again
		return next_config_path(res)
	} else {
		//console.log('next_config_path res', res)
		//console.log('next_config_path path', path.toJS(), 'final res', res.toJS())
		return res
	}
}
