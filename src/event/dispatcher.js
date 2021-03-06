import {
	query_keypad_kind,
	query_visible_buttons,
	query_prop,
	query_name_of,
	query_door,
	query_event,
	query_arg,
	query_has_anim_info,
	query_obj_misc,
	query_option_values,
	query_option_obj,
	query_position_of,
} from '../providers/query_store'
import {query_top_block, query_tower_height} from '../providers/query_tower'
import {get_button_geoms_for} from '../components/Keypad'
import {global_workspace_height} from '../components/Workspace'
import {doAction, global_constant, global_sound} from '../lib/global'
import {transition_to_next_config} from '../providers/change_config'
import {
	pointIsInRectangle,
	set_primary_height,
	dist2D,
	apply_bounds,
	update_keypad_button_visibility,
	redraw_mixed_tower,
	point_in_animals,
} from './utils'
import {
	handle_submit_button,
	handle_delete_button,
	handle_next_button,
	handle_start_button,
	incorrect_button_response,
	handle_options,
	handle_create_tower_by_height,
	handle_swipe_tower,
	handle_stack_arg_2,
	handle_drag_blocks_to_result,
	handle_decimal_keypad,
	handle_decimal_column_keypad,
} from './handlers'
import {correct_next_button} from './correctness'
import {
	extract_handle_position,
	is_blinking,
	handle_is_hidden,
	dist_from_door,
	dist_from_handle,
	handle_is_blinking,
	handle_close_to_goal,
	get_height_of,
} from './extract'
import {
	current_pixel_size_of_animal,
	landmark_location,
	with_diameter_offset,
} from '../components/Tile'
import {store_config_modify} from '../providers/enter_exit'
import {get_special_button_geoms} from '../components/Button'
import {
	get_option_button_geom,
	get_option_button_offset,
} from '../components/OptionBackground'

function perhaps_reveal_button() {
	const trb = query_event('touch_reveals_button')
	if (trb) {
		if ('string' === typeof trb) {
			doAction.setButtonDisplay(trb, true)
		} else if (Array.isArray(trb)) {
			for (const button of trb) doAction.setButtonDisplay(button, true)
		} else console.error('Warning: touch_reveals_button has', trb)
	}
}

let y_delta, scaling_delta

export function touch_dispatcher(state, x, y, touchID) {
	//console.log('touch_dispatcher state ' + state + ' x ' + x + ' y ' + y + ' touchID ' + touchID)
	const visible = query_visible_buttons()
	//console.log('visible', visible)
	//if('down' === state) console.log('visible', visible)
	//if ('down' === state && x > 500) console.log(x.thisdoesntexist[3])
	if (query_prop('freeze_display')) {
		// perhaps allow start or submit?
		if (!visible.includes('button_start')) {
			if ('down' === state || 'up' === state) console.log('frozen')
			return
		}
	} else {
		//console.log('option_values' + query_option_values())
		if (
			query_option_values() &&
			!query_event('stack_arg_2') &&
			!query_event('use_option_buttons')
		) {
			return handle_options(state, x, y, touchID)
		}
	}
	if (query_event('just_yaml_event')) {
		if ('down' === state && query_event('on_down')) {
			store_config_modify(query_event('on_down').modify, true)
		}
		if ('up' === state && query_event('on_up')) {
			store_config_modify(query_event('on_up').modify, true)
		}
		return
	}
	const kind = query_keypad_kind()
	//const pos = getPositionInfoForKeypad(kind)
	const pos = global_constant.keypad_info[kind]

	let x_offset = 0
	let animal = ''
	if ('decimal_column' === kind) {
		let col = query_event('keypad_column')
		const tgt = query_event('target')
		let pos_x = query_position_of(tgt).get(0)
		x_offset = pos_x
		if (col === 'ant') x_offset += 120
		else if (col === 'spider') x_offset += 55
		else if (col === 'goat') x_offset += 0
		else x_offset = 1000 // off the screen
		animal = col
	}

	let button_geoms = kind ? get_button_geoms_for(kind, x_offset) : null
	// console.log('button_geoms', button_geoms)

	let found_one = false
	const tgt = query_event('target')
	//if ('down' === state ) console.log('visible', visible)
	for (const i of visible) {
		// console.log('of visible, i is', i)
		if (global_constant.special_button_defaults.hasOwnProperty(i)) {
			//if ('down' === state ) console.log('checking i', i, 'x', x, 'y', y, 'geom', global_constant.special_button_defaults[i])
			if (pointIsInRectangle([x, y], get_special_button_geoms(i))) {
				found_one = true
				doAction.setButtonHighlight(i)
				if ('button_submit' === i) handle_submit_button(state)
				else if ('button_delete' === i) handle_delete_button(state)
				else if ('button_next' === i) handle_next_button(state)
				else if ('button_start' === i) handle_start_button(state)
				else console.warn('touch_dispatcher did not handle', i)
				return
			}
		} else if (
			'string' === typeof i &&
			(i.startsWith('top_') || i.startsWith('bottom_'))
		) {
			if (
				pointIsInRectangle(
					[x, y],
					get_option_button_geom(i),
					get_option_button_offset(i),
				)
			) {
				doAction.setButtonHighlight(i)
				found_one = true
				if ('up' === state) {
					const option_obj = query_option_obj()
					let option_button_choice = query_obj_misc(option_obj)
						.get('option_button_choice')
						.toJS()
					// console.log('option_button_choice', option_button_choice)
					const n = Number(i.charAt(i.length - 1))
					if (i.startsWith('top_')) option_button_choice[n] = 1
					else if (i.startsWith('bottom_')) option_button_choice[n] = 2
					doAction.addObjMisc(
						option_obj,
						'option_button_choice',
						option_button_choice,
					)
					if (
						option_button_choice[0] !== 0 &&
						option_button_choice[1] !== 0 &&
						option_button_choice[2] !== 0 &&
						option_button_choice[3] !== 0
					) {
						doAction.setButtonDisplay('button_submit', 'on_right')
					}
				}
			}
		} else {
			if (pointIsInRectangle([x, y], button_geoms[i], pos.position)) {
				doAction.setButtonHighlight(i)
				found_one = true
				if ('up' === state) {
					if ('buildTower' === kind) {
						const new_size = global_constant.buildTower_button_info[i][0]
						const new_is_fiver = global_constant.buildTower_button_info[i][1]
						const curr = (new_is_fiver ? 5 : 1) * 10 ** new_size
						const require_incremental_correctness = false
						if (require_incremental_correctness) {
							const correct = correct_next_button()
							if (curr !== correct) {
								incorrect_button_response()
								return
							}
						}
						const pixel_height =
							query_prop('scale_factor') * query_tower_height(tgt)
						// console.log('pixel_height', pixel_height, 'h', global_workspace_height)
						if (pixel_height < global_workspace_height) {
							//console.log('adding block', new_size, 'is_fiver', new_is_fiver, 'to tgt', tgt)
							doAction.towerAddBlock(tgt, new_size, new_is_fiver)
							const [size, is_fiver, how_many] = query_top_block(tgt)
							update_keypad_button_visibility(size, is_fiver, how_many)
							if (query_event('counting_up_sub')) redraw_mixed_tower()
						}
					} else if ('decimal' === kind) {
						// convert from incoming index to number
						if (0 !== i && 2 !== i) {
							let val = i > 2 ? i - 2 : 0
							handle_decimal_keypad(val)
						}
					} else if ('decimal_column' === kind) {
						// convert from incoming index to number
						handle_decimal_column_keypad(animal, i)
					}
				}
			}

			let pos_x = query_position_of(tgt).get(0)
			if ('decimal_column' === kind && point_in_animals([x, y], [pos_x, 0])) {
				if (query_prop('freeze_display')) {
					if (visible.includes('button_start')) {
						return
					}
				}
				if (x - pos_x < 70) {
					doAction.setEventHandlingParam('keypad_column', 'goat')
					button_geoms[i].position[0] = pos_x
				} else if (x - pos_x < 140) {
					doAction.setEventHandlingParam('keypad_column', 'spider')
					button_geoms[i].position[0] = pos_x + 70
				} else {
					doAction.setEventHandlingParam('keypad_column', 'ant')
					button_geoms[i].position[0] = pos_x + 140
				}
			}
		}
	}
	if ('up' === state || !found_one) doAction.setButtonHighlight(null)
	if (query_prop('freeze_display')) return // after button
	//console.log('target', query_event('target'))

	if ('down' === state) {
		perhaps_reveal_button()
	}
	// console.log('move', query_event('move'))
	// console.log('target', query_event('target'))
	if (query_event('create_tower_by_height')) {
		handle_create_tower_by_height(state, x, y, touchID)
	} else if (query_event('swipe_tower')) {
		handle_swipe_tower(state, x, y, touchID)
	} else if (query_event('stack_arg_2')) {
		handle_stack_arg_2(state, x, y, touchID)
	} else if (query_event('drag_blocks_to_result')) {
		handle_drag_blocks_to_result(state, x, y, touchID)
	} else if (query_event('target') && query_event('move')) {
		const tgt = query_event('target')
		const scale_factor = query_prop('scale_factor')
		const move = query_event('move')
		const just_set_height = false
		if (just_set_height) {
			//  old position was just the height above the ground
			set_primary_height(tgt, y / scale_factor)
			/*
      else if (false && 'touch_image' === move) {
        // what is the x position of the portal?
        const arg_1 = query_arg(1)
        let pos_x = extract_handle_position(arg_1, query_door(arg_1))[0]
        let d = dist2D([pos_x, 0], [x, y])
        if (d <= 0) d = .001
        //console.log('[x,y]', [x, y], 'pos_x', pos_x, 'd', d)
        if ('down' === state) {  // store scaling_delta
          const f1 = query_name_of(arg_1).get(0)
          scaling_delta = f1 / (d / scale_factor)
          //console.log('f1', f1, 'd', d, 'scaling_delta', scaling_delta)
        } else {
          set_primary_height(tgt, scaling_delta * d / scale_factor)
        }
     }
      */
		} else if ('move_dot' === move || 'move_handle_dot' === move) {
			// console.log('  move', move)
			const tile_tgt = 'tile_2'
			const pos = query_position_of(tile_tgt)
			let xp = x - pos.get(0)
			let yp = y - pos.get(1)
			// console.log('pos', pos.toJS(), 'xp', xp, 'yp', yp)
			const animal_name = query_name_of(tile_tgt)
			let extra_scale = 1
			if (query_obj_misc(tile_tgt).get('extra_scale')) {
				extra_scale = Number(query_obj_misc(tile_tgt).get('extra_scale'))
			}
			const [width, height] = current_pixel_size_of_animal(
				animal_name,
				extra_scale,
			)
			xp = Math.max(0, xp)
			xp = Math.min(width, xp)
			yp = Math.max(0, yp)
			yp = Math.min(height, yp)
			if ('move_dot' === move) {
				// console.log('  adding extra dot for', tile_tgt, 'at', xp, yp)
				doAction.addObjMisc(tile_tgt, 'extra_dot', [xp, yp])
			} else {
				//doAction.addObjMisc(tgt, 'blink', null)
				doAction.clearAnimInfo(tgt)
				doAction.addObjMisc(tgt, 'handle_opacity', null)
				doAction.addObjStyle(tgt, 'opacity', 1)
				doAction.setName('door_2', [yp / height])
				const misc_1 = query_obj_misc('tile_1')
				const landmark_index = misc_1.get('landmark_index')
				const loc = landmark_location(animal_name, landmark_index)
				//const diameter = global_constant.animal_landmarks.extra_dot_diameter
				const diameter = 0 // will be added later
				// console.log('landmark_index', landmark_index, 'loc', loc, 'diameter', diameter)
				const locB = with_diameter_offset(loc, diameter, extra_scale)
				doAction.addObjMisc('tile_2', 'extra_dot', [locB[0], yp])
			}
			if ('up' === state) {
				//console.log('xp', xp, 'yp', yp)
			}
		} else if (
			'move_handle' === move ||
			'touch_image' === move ||
			'stretch_bar' === move
		) {
			let y1 = y / scale_factor,
				pos_x,
				di
			const arg_1 = query_arg(1)
			const arg_2 = query_arg(2)
			const tgt = query_event('target')
			if ('stretch_bar' === move) {
				pos_x = query_position_of(tgt).get(0)
			} else if ('touch_image' === move) {
				pos_x = extract_handle_position(arg_1, query_door(arg_1))[0]
				di = dist2D([pos_x, 0], [x, y])
				if (di <= 0) di = 0.001
				//console.log('di ', di)
			}
			if ('down' === state) {
				y_delta = null
				scaling_delta = null
				if (query_has_anim_info(arg_1)) doAction.clearAnimInfo(arg_1)
				const src = query_event('comparison_source')
				let blinker = src
				if ('stretch_bar' === move) {
					blinker = tgt
				}
				if (blinker && is_blinking(blinker)) {
					doAction.clearAnimInfo(blinker)
					doAction.addObjStyle(blinker, 'opacity', 1)
				}
				if ('touch_image' === move) {
					// store scaling_delta
					const f1 = query_name_of(arg_1).get(0)
					scaling_delta = f1 / (di / scale_factor)
					//console.log('scaling_delta ', scaling_delta)
					if (is_blinking(arg_2)) {
						//doAction.addObjMisc(arg_2, 'blink', null)
						doAction.clearAnimInfo(arg_2)
						//doAction.addObjMisc(tgt, 'opacity', 1)
					}
				} else if ('stretch_bar' === move) {
					const d = y1 - query_name_of(tgt).get(0)
					// console.log('pos_x', pos_x, 'd', d)
					y_delta = Math.abs(d) < 0.2 ? -d : 0
					set_primary_height(tgt, y1 + y_delta)
				} else if (handle_is_hidden(tgt)) {
					// check-- are we close enough to the door to start?
					const d = dist_from_door(x, y, tgt, scale_factor)
					if (d < global_constant.door.min_dist_from_door) {
						doAction.addObjStyle(tgt, 'opacity', 1)
						//doAction.addObjMisc(tgt, 'blink', null)
						doAction.clearAnimInfo(tgt)
						doAction.addObjMisc(tgt, 'handle_opacity', 1)
						perhaps_reveal_button()
						y_delta = 0
						set_primary_height(tgt, y1 + y_delta)
					}
				} else {
					// check-- are we close enough to the handle to even start?
					let d = dist_from_handle(x, y, tgt, scale_factor)
					if ('half_height' === query_event('correctness')) d = 0
					// console.log(' d', d)
					if (d < global_constant.door.min_dist_from_handle) {
						let f1 = query_name_of(tgt).get(0)
						f1 = apply_bounds(f1, 0, 1)
						let extra_scale = 1
						const m = query_obj_misc(tgt)
						if (m && m.has('extra_scale')) extra_scale = m.get('extra_scale')
						y_delta = f1 * extra_scale - y1
						//console.log('is blinking', handle_is_blinking(tgt))
						if (handle_is_blinking(tgt)) {
							doAction.clearAnimInfo(tgt)
							doAction.addObjMisc(tgt, 'handle_opacity', 1)
						}
						// console.log('f1', f1, 'd', d, 'scaling_delta', scaling_delta)
					}
				}
			} else {
				if (query_has_anim_info(tgt)) doAction.clearAnimInfo(tgt)
				// console.log('tgt', tgt, 'y_delta', y_delta, 'y1', y1)
				if ('touch_image' === move) {
					const h = (scaling_delta * di) / scale_factor
					//console.log('h', h)
					set_primary_height(tgt, h)
				} else if ('undefined' !== typeof y_delta && y_delta !== null) {
					// change position
					set_primary_height(tgt, y1 + y_delta)
				}
				if ('up' === state) {
					if (query_event('slide_portal') === true) {
						const arg_1 = query_arg(1)
						const result = query_arg('result')
						if (handle_close_to_goal()) {
							//console.log('return_to_top', query_event('return_to_top'), 'tgt', tgt)
							if (query_event('return_to_top') === tgt) {
								doAction.addAnimInfo(tgt, {
									slide_target: 1,
									slide_duration: 200,
								})
							} else {
								//const correct = query_name_of(tgt).get(1)
								const f1 = query_name_of(arg_1).get(0)
								const f2 = get_height_of(arg_2)
								const f3 = query_name_of(result).get(0)
								let correct = f3 / f2
								if (tgt !== arg_1) correct = f1 * f2
								//console.log('f1', f1, 'correct', correct)
								doAction.addAnimInfo(tgt, {
									slide_target: correct,
									slide_duration: 200,
								})
								doAction.addObjStyle(result, 'opacity', 1)
							}
							if (query_prop('skip_submit')) {
								global_sound['ding'].play()
								transition_to_next_config()
							} else doAction.setButtonDisplay('button_submit', true)
						} else {
							// encourage a new attempt
							// doAction.addObjMisc(tgt, 'handle_opacity', null)
							if ('touch_image' === move) {
								//doAction.addObjMisc(arg_2, 'blink', 0.5)
								doAction.addAnimInfo(arg_2, {blink: 0.5})
							} else doAction.addAnimInfo(tgt, {handle_blink: 0})
							doAction.setButtonDisplay('button_submit', null)
							if (query_name_of(tgt).size > 1) {
								//console.log('hide result door')
								doAction.addObjStyle(result, 'opacity', 0)
							}
						}
					}
				}
			}
		} else {
			console.error('Error: unrecognized event.move', move)
		}
	}
}
