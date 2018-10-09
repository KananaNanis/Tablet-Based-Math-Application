import {
	query_event,
	query_prop,
	query_arg,
	query_option_values,
	query_path,
	query_name_of,
} from '../providers/query_store'
import {
	query_top_block,
	query_tower_height,
	query_tower_name,
} from '../providers/query_tower'
import {doAction, global_sound} from '../App'
import {transition_to_next_config} from '../providers/change_config'
import {enter_exit_config} from '../providers/enter_exit'
import {is_correct, show_err_with_delay} from './correctness'
import {
	reduce_num_stars,
	pointIsInRectangle,
	update_keypad_button_visibility,
} from './utils'
import {option_geometry} from '../components/OptionBackground'
import {describe_numerical} from './extract'
import {global_screen_width} from '../components/Workspace'
import {is_standard_tower} from '../components/Block'
import {do_batched_actions} from '../providers/reducers'
import * as Actions from '../providers/actions'

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
		let action_list = []
		action_list.push(Actions.setProp('freeze_display', null))
		action_list.push(Actions.setButtonDisplay('start', null))
		const cp = query_path('config')
		enter_exit_config(
			action_list,
			cp,
			true,
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
	}, 3000)
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
			cp,
			'is_correct',
			i === i0,
			info_about_response,
			info_about_prompt,
		])
	}
	return i === i0
}

export function handle_options(state, x, y) {
	let found_one = false
	const n = query_option_values().size
	//console.log('n', n)
	for (let i = 0; i < n; ++i) {
		if (pointIsInRectangle([x, y], option_geometry(i))) {
			//console.log('i', i)
			found_one = true
			doAction.setButtonHighlight('option_' + i)
			if ('up' === state) {
				if (option_is_correct(i)) {
					global_sound['chirp1'].play()
					const arg_1 = query_arg(1)
					const name_1 = query_name_of(arg_1)
					const is_peg = name_1.startsWith('peg_')
					// console.log(arg_1)
					if (
						arg_1 &&
						(arg_1.startsWith('tower_') ||
							arg_1.startsWith('five_frame_') ||
							is_peg)
					) {
						window.setTimeout(function() {
							doAction.setButtonHighlight(null)
							transition_to_next_config()
						}, 500)
					} else {
						doAction.setAnimInfo('portal_1', null)
						doAction.setAnimInfo('door_2', null)
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
								transition_to_next_config()
							}, delay)
						} else {
							doAction.setButtonHighlight(null)
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
	if ('up' !== state && !found_one) doAction.setButtonHighlight(null)
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
		if (x > 0.5 * global_screen_width) {
			doAction.setProp('top_block_under_construction', 'empty')
		}
	}
	const top = query_prop('top_block_under_construction')
	if (top) {
		if ('up' === state) {
			if (!is_standard_tower(tgt)) doAction.towerRemoveBlock(tgt)
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
				new_is_fiver = false
			if (decim >= 10) {
				decim = 10
				new_size = 0
			} else if (decim >= 5) {
				decim = 5
				new_size = -1
				new_is_fiver = true
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
					const top_is_ok = is_standard_tower(tgt)
					//console.log('top_is_ok', top_is_ok)
					doAction.addObjMisc(tgt, 'top_just_outline', !top_is_ok)
				}
			}
		}
	}
}
