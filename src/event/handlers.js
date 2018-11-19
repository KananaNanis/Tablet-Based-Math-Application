import {
	query_event,
	query_prop,
	query_arg,
	query_option_values,
	query_path,
	query_name_of,
	with_suffix,
	query_option_obj,
	query_position_of,
} from '../providers/query_store'
import {
	query_top_block,
	query_tower_height,
	query_tower_name,
	query_tower_blocks,
	query_tower,
} from '../providers/query_tower'
import {doAction, global_constant, global_sound} from '../lib/global'
import {transition_to_next_config} from '../providers/change_config'
import {enter_exit_config} from '../providers/enter_exit'
import {is_correct, show_err_with_delay} from './correctness'
import {
	reduce_num_stars,
	pointIsInRectangle,
	update_keypad_button_visibility,
	names_are_identical,
	distance_to_prim,
	get_bbox,
	dist2D,
} from './utils'
import {option_geometry} from '../components/OptionBackground'
import {
	describe_numerical,
	position_of_correct_option,
	show_thin_height_2,
} from './extract'
//import { global_screen_width } from '../components/Workspace'
import {
	is_standard_tower,
	make_group_from,
	condense_groups_of,
} from '../components/Block'
import {do_batched_actions} from '../providers/reducers'
import * as Actions from '../providers/actions'
// import { fromJS } from 'immutable';

export function handle_delete_button(state) {
	if ('up' === state) {
		const tgt = query_event('target')
		if (query_tower_name(tgt).size > 0) doAction.towerRemoveBlock(tgt)
		doAction.setButtonHighlight(null)
		const [size, is_fiver, how_many] = query_top_block(tgt)
		update_keypad_button_visibility(size, is_fiver, how_many)
	}
}

export function handle_next_button(state) {
	if ('up' === state) transition_to_next_config()
}

export function handle_start_button(state) {
	if ('up' === state) {
		//console.log('start!')
		let action_list = [],
			silent = false
		action_list.push(Actions.setProp('freeze_display', null))
		action_list.push(Actions.setButtonDisplay('start', null))
		const cp = query_path('config')
		enter_exit_config(
			cp,
			true,
			action_list,
			silent,
			false,
			query_prop('config_iteration'),
			true,
		)
		do_batched_actions(action_list)
	}
}

export function incorrect_button_response() {
	doAction.setProp('freeze_display', true)
	reduce_num_stars()
	window.setTimeout(function() {
		doAction.setButtonHighlight(null)
		doAction.setProp('freeze_display', false)
	}, global_constant.incorrect_freeze_time)
}

export function handle_submit_button(state) {
	if ('up' === state) {
		doAction.setProp('freeze_display', true)
		let delay = is_correct()
		if ('incorrect' === delay) incorrect_button_response()
		else {
			doAction.setButtonHighlight(null)
			if ('do_not_transition' === delay) {
				// special case...
				doAction.setProp('freeze_display', false)
			} else if (delay) {
				// do animation!
				global_sound['chirp1'].play()
				doAction.setButtonDisplay('submit', null)
				//console.log('animating now')
				window.setTimeout(function() {
					transition_to_next_config()
				}, delay)
			} else {
				global_sound['chirp1'].play()
				transition_to_next_config()
			}
		}
	}
}

function option_is_correct(i) {
	const i0 = query_prop('correct_option_index')
	const log_this_attempt = true
	if (log_this_attempt) {
		const cp = query_path('config').toJS()
		//console.log('cp', cp)
		const curr_time = Date.now()
		const arg_1 = query_arg(1)
		let info_about_prompt, info_about_response
		if (arg_1 && arg_1.startsWith('tower_')) {
			info_about_prompt = query_tower_name(arg_1)
			if (info_about_prompt) info_about_prompt = info_about_prompt.toJS()
			info_about_response = query_option_values().get(i)
			if (info_about_response) info_about_response = info_about_response.toJS()
		} else {
			// assume it was one of the proportional exercises
		}
		doAction.addLogEntry(curr_time, [
			with_suffix(cp),
			'is_correct',
			i === i0,
			info_about_response,
			info_about_prompt,
		])
	}
	return i === i0
}

export function handle_options(state, x, y) {
	let action_list = []
	let found_one = false
	const option_obj = query_option_obj()
	const n = query_option_values().size
	//console.log('n', n)
	for (let i = 0; i < n; ++i) {
		//if ('down' === state) console.log(' checking i', i, 'x', x, 'y', y, 'geom', option_geometry(i))
		if (pointIsInRectangle([x, y], option_geometry(i, option_obj))) {
			//console.log('i', i)
			found_one = true
			action_list.push(Actions.setButtonHighlight('option_' + i))
			if ('up' === state) {
				if (option_is_correct(i)) {
					global_sound['chirp1'].play()
					action_list.push(Actions.setProp('answer_is_correct', true))
					action_list.push(Actions.setProp('freeze_display', true))
					const arg_1 = query_arg(1)
					const name_1 = query_name_of(arg_1)
					const is_peg =
						arg_1 && arg_1.startsWith('tile_') && name_1.startsWith('peg_')
					// console.log(arg_1)
					const op = query_prop('curr_op')
					// console.log('op', op)
					if ('identity' === op) {
						// show dotted line
						const arg_1 = query_arg(1)
						const pos_3 = position_of_correct_option()
						show_thin_height_2(arg_1, pos_3)

						window.setTimeout(function() {
							doAction.setButtonHighlight(null)
							doAction.setErrBox({})
							doAction.setProp('freeze_display', false)
							transition_to_next_config()
						}, 500)
					} else if (
						arg_1 &&
						(arg_1.startsWith('tower_') ||
							arg_1.startsWith('door_') ||
							arg_1.startsWith('bar_') ||
							arg_1.startsWith('five_frame_') ||
							is_peg)
					) {
						window.setTimeout(function() {
							doAction.setButtonHighlight(null)
							doAction.setProp('freeze_display', false)
							transition_to_next_config()
						}, 500)
					} else {
						action_list.push(Actions.clearAnimInfo('portal_1'))
						action_list.push(Actions.clearAnimInfo('door_2'))
						//doAction.addObjStyle('portal_1', 'opacity', null)
						//doAction.addObjStyle('door_2', 'opacity', null)
						const add_anim = true
						if (add_anim) {
							const arg_1 = query_arg(1)
							const arg_2 = query_arg(2)
							const result = 'option'
							const {f1, f2, f3, err, stars} = describe_numerical(
								arg_1,
								arg_2,
								result,
							)
							err
							const curr_time = Date.now()
							const delay = show_err_with_delay(
								arg_1,
								arg_2,
								result,
								stars,
								curr_time,
								f1,
								f2,
								f3,
							)
							window.setTimeout(function() {
								doAction.setButtonHighlight(null)
								doAction.setProp('freeze_display', false)
								transition_to_next_config()
							}, delay)
						} else {
							action_list.push(Actions.setButtonHighlight(null))
							transition_to_next_config()
						}
					}
				} else {
					console.log('incorrect ')
					incorrect_button_response()
				}
			}
		}
	}
	if ('up' !== state && !found_one) {
		action_list.push(Actions.setButtonHighlight(null))
	}
	do_batched_actions(action_list)
}

/*
function check_top_is_ok(size, is_fiver, how_many, new_size, new_is_fiver) {
  let res = true
  if (size < new_size) res = false
  else if (size === new_size) {
    if (new_is_fiver) res = false
    else if (!is_fiver && how_many > 3) res = false
  }
  console.log('check_top_is_ok size', size, 'is_fiver', is_fiver, 'new_size', new_size, 'new_is_fiver', new_is_fiver, 'res', res)
  return res
}
*/

export function handle_create_tower_by_height(state, x, y) {
	const tgt = query_event('target')
	if ('down' === state) {
		//if (x > 0.5 * global_screen_width) {
		doAction.setProp('top_block_under_construction', 'empty')
		//}
	}
	const top = query_prop('top_block_under_construction')
	if (top) {
		if ('up' === state) {
			if (!is_standard_tower(tgt, query_event('allow_non_standard'))) {
				doAction.towerRemoveBlock(tgt)
			}
			doAction.addObjMisc(tgt, 'top_just_outline', null)
			doAction.setProp('top_block_under_construction', null)
		} else {
			// what should the top block be?
			const scale_factor = query_prop('scale_factor')
			let h10 = Math.round(10 * query_tower_height(tgt))
			let [size, is_fiver] = query_top_block(tgt)
			if ('empty' !== top) {
				h10 -= Math.round(10 * (is_fiver ? 5 : 1) * 10 ** size)
			}
			let decim = Math.round((10 * y) / scale_factor) - h10
			let new_size,
				new_is_fiver = 0
			if (decim >= 10) {
				decim = 10
				new_size = 0
			} else if (decim >= 5) {
				decim = 5
				new_size = -1
				new_is_fiver = 1
			} else if (decim >= 1) {
				decim = 1
				new_size = -1
			} else {
				decim = 0
			}
			// is this situation the same as before?
			let changed = false
			if ('empty' === top) {
				if (0 !== decim) changed = true
			} else {
				if (0 === decim) changed = true
				else {
					if (size !== new_size || is_fiver !== new_is_fiver) changed = true
				}
			}
			if (changed) {
				//console.log('changed', changed, 'h10', h10, 'size', size, 'is_fiver', is_fiver)
				if (0 === decim) {
					doAction.towerRemoveBlock(tgt)
					doAction.setProp('top_block_under_construction', 'empty')
					doAction.addObjMisc(tgt, 'top_just_outline', null)
				} else {
					if ('empty' !== top) doAction.towerRemoveBlock(tgt)
					doAction.towerAddBlock(tgt, new_size, new_is_fiver)
					doAction.setProp('top_block_under_construction', 'present')
					const top_is_ok = is_standard_tower(
						tgt,
						query_event('allow_non_standard'),
					)
					//console.log('top_is_ok', top_is_ok)
					//doAction.addObjMisc(tgt, 'top_just_outline', !top_is_ok)
					doAction.addObjMisc(tgt, 'top_just_outline', top_is_ok ? null : 1)
				}
			}
		}
	}
}

function get_num_same(block_info, i0, below) {
	const size = block_info[i0].size
	const is_fiver = block_info[i0].is_fiver

	let res = 0
	const i_start = below ? i0 - 1 : i0 + 1
	const i_end = below ? -1 : block_info.length
	const incr = below ? -1 : 1
	for (let i = i_start; i !== i_end; i += incr) {
		const size_prev = block_info[i].size
		const is_fiver_prev = block_info[i].is_fiver
		if (size === size_prev && Boolean(is_fiver) === Boolean(is_fiver_prev)) {
			++res
		} else break
	}
	//console.log('get_num_same below', below, 'res', res)
	return res
}

function assemble_tower_name(block_info, i0, merge) {
	let res = []
	for (let i = 0; i < block_info.length; ++i) {
		const size = block_info[i].size
		const is_fiver = block_info[i].is_fiver
		if (i === i0) {
			if (merge) {
				const new_size = is_fiver ? size + 1 : size
				res.push(make_group_from(new_size, !is_fiver))
				if (is_fiver) i += 1
				else i += 4
			} else {
				const new_size = is_fiver ? size : size - 1
				const how_many = is_fiver ? 5 : 2
				for (let j = 0; j < how_many; ++j) {
					res.push(make_group_from(new_size, !is_fiver))
				}
			}
		} else {
			res.push(make_group_from(size, is_fiver))
		}
	}
	res = condense_groups_of(res)
	return res
}

function find_block_index_at_height(block_pos, y) {
	//console.log('y', y, 'block_pos', block_pos)
	let res = null
	for (let i = 1; i < block_pos.length; ++i) {
		if (block_pos[i - 1][1] <= y && y < block_pos[i][1]) {
			res = i - 1
		}
	}
	// also check the last one
	const last_pos = block_pos[block_pos.length - 1]
	if (last_pos[1] <= y && y < last_pos[1] + last_pos[3]) {
		res = block_pos.length - 1
	}
	return res
}

let starting_x, found_index, merge_pos, split_pos
let orig_name, split_name, moving_merge_name, moving_split_name
let moving_was_merge

export function handle_swipe_tower(state, x, y) {
	const tgt = query_event('target')
	if ('undefined' === typeof query_name_of(tgt)) {
		console.error('cannot handle swipe event when tgt name is undefined.')
		return
	}
	const moving = query_event('moving')

	const tower_info = query_tower(tgt).toJS()
	const block_info = query_tower_blocks(tgt, tower_info)
	const block_pos = query_tower_blocks(tgt, tower_info, true)

	if ('down' === state) {
		if (y > 0) {
			found_index = find_block_index_at_height(block_pos, y)
			if (null !== found_index) {
				starting_x = x
				orig_name = query_tower_name(tgt).toJS()
				doAction.addObjMisc(tgt, 'selected_block_index', found_index)

				// count how many blocks below or above the current block are the same
				const num_same_below = get_num_same(block_info, found_index, true)
				const num_same_above = get_num_same(block_info, found_index, false)

				// place the moving block appropriately
				const old_pos = block_pos[found_index]
				// various configurations to consider for merge:
				//   for a fiver:
				//     same above and below >= 1
				//     zero or one same below
				//   for a singleton:
				//     same above and below >= 4
				//     up to four same below
				merge_pos = null
				const size = block_info[found_index].size
				const is_fiver = block_info[found_index].is_fiver
				if (is_fiver) {
					if (num_same_above + num_same_below >= 1) {
						if (num_same_below <= 1) {
							merge_pos = block_pos[found_index - num_same_below]
						}
					}
				} else {
					if (num_same_above + num_same_below >= 5) {
						if (num_same_below <= 4) {
							merge_pos = block_pos[found_index - num_same_below]
						}
					}
				}
				moving_merge_name = [
					make_group_from(is_fiver ? size + 1 : size, !is_fiver),
				]

				// can this block be split?
				split_pos = null
				let min_split = query_event('minimum_split_size')
				let size_ok = !(size <= min_split)
				if (size === min_split && is_fiver) size_ok = true
				if (query_event('no_split_fiver') && is_fiver) size_ok = false
				if (0 === num_same_above && size_ok) {
					split_pos = old_pos
					split_name = assemble_tower_name(block_info, found_index, false)
				}
				moving_split_name = [make_group_from(size, is_fiver)]
			}
		} else {
			found_index = null
		}
	} else {
		if (null !== found_index) {
			let merge = false,
				split = false
			if (x > starting_x + global_constant.margin_for_merge) {
				split = true
			} else if (x < starting_x - global_constant.margin_for_merge) {
				merge = true
			}

			// build the moving tower geometry
			let old_moving_name = query_name_of(moving).toJS()
			if ((merge && merge_pos) || (split && split_pos)) {
				let new_moving_name = merge ? moving_merge_name : moving_split_name
				if (!names_are_identical(old_moving_name, new_moving_name)) {
					let new_pos = merge ? merge_pos : split_pos
					doAction.setPosition(moving, [new_pos[0] + 0, new_pos[1]])
					if (merge) {
						doAction.addAnimInfo(moving, {left: [150, 50], duration: 500})
					} else {
						doAction.addAnimInfo(moving, {left: [0, 50], duration: 500})
					}
					doAction.setName(moving, new_moving_name)
					moving_was_merge = merge
				}
			} else {
				let new_moving_name = []
				if (!names_are_identical(old_moving_name, new_moving_name)) {
					const try_anim = false
					if (try_anim) {
						console.log('setting back to empty')
						if (moving_was_merge) {
							doAction.addAnimInfo(moving, {
								left: [50, 150],
								duration: 500,
								empty_at_end: true,
							})
						} else {
							doAction.addAnimInfo(moving, {
								left: [50, 0],
								duration: 500,
								empty_at_end: true,
							})
						}
					} else {
						doAction.setName(moving, [])
						doAction.clearAnimInfo(moving)
					}
				}
			}

			// also change the current tower
			let tgt_name
			if (split && split_pos) {
				tgt_name = split_name
				doAction.addObjMisc(tgt, 'num_selected_blocks', 5)
			} else {
				tgt_name = orig_name
				doAction.addObjMisc(tgt, 'num_selected_blocks', null)
			}
			//console.log('setting tgt', tgt, 'to name', tgt_name)
			doAction.setName(tgt, tgt_name)

			if ('up' === state) {
				doAction.addObjMisc(tgt, 'selected_block_index', null)
				doAction.addObjMisc(tgt, 'num_selected_blocks', null)
				if (query_tower_height(moving) > 0) {
					const try_anim = false
					if (try_anim) {
						doAction.clearAnimInfo(moving)
						console.log('waiting')
						//doAction.addAnimInfo(moving, { left: [50, 0], duration: 500, empty_at_end: true })
						doAction.addAnimInfo(moving, {left: [50, 0], duration: 2000})
					} else doAction.setName(moving, [])
					// possibly change the tower itself
					if (merge) {
						const num_same_below = get_num_same(block_info, found_index, true)
						const i0 = found_index - num_same_below
						tgt_name = assemble_tower_name(block_info, i0, merge)
						//console.log('merge new_tower_name', new_tower_name)
						doAction.setName(tgt, tgt_name)
					}
				}
			}
		}
	}
}

let orig_pos, delta_x, delta_y, is_moving

export function clear_handler_variables() {
	starting_x = null
	found_index = null
	merge_pos = null
	split_pos = null
	orig_name = null
	split_name = null
	moving_merge_name = null
	moving_split_name = null
	moving_was_merge = null
	orig_pos
	delta_x
	delta_y
	is_moving
}

export function handle_stack_arg_2(state, x, y) {
	let arg_2 = query_arg(2)
	if ('down' === state) {
		const d = distance_to_prim(x, y, arg_2)
		console.log('d', d)
		if (d < 50) {
			orig_pos = query_position_of(arg_2).toJS()
			delta_x = orig_pos[0] - x
			delta_y = orig_pos[1] - y
			is_moving = true
		} else {
			is_moving = false
		}
	} else {
		if (is_moving) {
			let new_pos = [x + delta_x, y + delta_y]
			doAction.setPosition(arg_2, new_pos)
			if ('up' === state) {
				is_moving = false
				// stack arg_2 precisely on arg_1
				const arg_1 = query_arg(1)
				const bbox1 = get_bbox(arg_1)
				const final_pos = [
					bbox1.position[0] + 0.25 * bbox1.width,
					bbox1.position[1] + bbox1.height,
				]
				let d = dist2D(new_pos, final_pos)
				if (d < 100) {
					// doAction.setPosition(arg_2, final_pos)
					doAction.addAnimInfo(arg_2, {
						left: [new_pos[0], final_pos[0]],
						bottom: [new_pos[1], final_pos[1]],
						duration: 0.8 * d,
					})
					const result = query_arg('result')
					doAction.addObjStyle(result, 'opacity', null)
					doAction.setEventHandlingParam('stack_arg_2', null)
				} else {
					d = dist2D(new_pos, orig_pos)
					doAction.addAnimInfo(arg_2, {
						left: [new_pos[0], orig_pos[0]],
						bottom: [new_pos[1], orig_pos[1]],
						duration: 0.8 * d,
					})
				}
			}
		}
	}
}
