// import { combineReducers } from 'redux'
import { combineReducers } from 'redux-immutable'
import { List, Map, fromJS } from 'immutable'
import { batchActions } from 'redux-batched-actions'

import * as AT from './actionTypes'
import { global_store } from '../index'
import { add_block_to_name, remove_block_from_name } from '../components/Block'
import { global_constant } from '../App'
import { maybe_gen_var } from '../containers/generate';

// the following reducers control the various overall chunks of the store

function array_add_remove_element(state, elt, add, skip_duplicate) {
	if (add) {
		if (skip_duplicate && state.indexOf(elt) > -1) return state
		else return state.push(elt)
	} else {
		const index = state.indexOf(elt)
		if (index > -1) {
			return state.delete(index)
		}
		return state
	}
}

function obj_add_remove_property(state, key, val) {
	if (null === val) {
		if (state.has(key)) {
			return state.delete(key)
		} else return state
	} else {
		return state.set(key, val)
	}
}

function tower_ids(state = List([]), action) {
	switch (action.type) {
		case AT.TOWER_CREATE:
			return array_add_remove_element(state, action.id, true, true)
		case AT.TOWER_DELETE:
			return array_add_remove_element(state, action.id, false, true)
		default:
			return state
	}
}

function tile_ids(state = List([]), action) {
	switch (action.type) {
		case AT.TILE_CREATE:
			return array_add_remove_element(state, action.id, true, true)
		case AT.TILE_DELETE:
			return array_add_remove_element(state, action.id, false, true)
		default:
			return state
	}
}

function door_ids(state = List([]), action) {
	switch (action.type) {
		case AT.DOOR_CREATE:
			return array_add_remove_element(state, action.id, true, true)
		case AT.DOOR_DELETE:
			return array_add_remove_element(state, action.id, false, true)
		default:
			return state
	}
}

function portal_ids(state = List([]), action) {
	switch (action.type) {
		case AT.PORTAL_CREATE:
			return array_add_remove_element(state, action.id, true, true)
		case AT.PORTAL_DELETE:
			return array_add_remove_element(state, action.id, false, true)
		default:
			return state
	}
}

function five_frame_ids(state = List([]), action) {
	switch (action.type) {
		case AT.FIVE_FRAME_CREATE:
			return array_add_remove_element(state, action.id, true, true)
		case AT.FIVE_FRAME_DELETE:
			return array_add_remove_element(state, action.id, false, true)
		default:
			return state
	}
}

function bar_ids(state = List([]), action) {
	switch (action.type) {
		case AT.BAR_CREATE:
			return array_add_remove_element(state, action.id, true, true)
		case AT.BAR_DELETE:
			return array_add_remove_element(state, action.id, false, true)
		default:
			return state
	}
}

function name(state = Map({}), action) {
	switch (action.type) {
		case AT.TOWER_CREATE:
		case AT.TILE_CREATE:
		case AT.DOOR_CREATE:
		case AT.PORTAL_CREATE:
		case AT.FIVE_FRAME_CREATE:
		case AT.BAR_CREATE:
		case AT.SET_NAME:
			return obj_add_remove_property(state, action.id, action.name)
		case AT.TOWER_DELETE:
		case AT.TILE_DELETE:
		case AT.DOOR_DELETE:
		case AT.PORTAL_DELETE:
		case AT.FIVE_FRAME_DELETE:
		case AT.BAR_DELETE:
			return obj_add_remove_property(state, action.id, null)
		case AT.TOWER_ADD_BLOCK:
			return state.set(
				action.id,
				add_block_to_name(action.size, action.is_fiver, state.get(action.id)),
			)
		case AT.TOWER_REMOVE_BLOCK:
			return state.set(action.id, remove_block_from_name(state.get(action.id)))
		default:
			return state
	}
}

function position(state = Map({}), action) {
	switch (action.type) {
		case AT.TOWER_CREATE:
		case AT.TILE_CREATE:
		case AT.DOOR_CREATE:
		case AT.PORTAL_CREATE:
		case AT.FIVE_FRAME_CREATE:
		case AT.BAR_CREATE:
		case AT.SET_POSITION:
			return obj_add_remove_property(state, action.id, action.position)
		case AT.TOWER_DELETE:
		case AT.TILE_DELETE:
		case AT.DOOR_DELETE:
		case AT.PORTAL_DELETE:
		case AT.FIVE_FRAME_DELETE:
		case AT.BAR_DELETE:
			return obj_add_remove_property(state, action.id, null)
		default:
			return state
	}
}

function style(state = Map({}), action) {
	let new_style = state.get(action.id) ? state.get(action.id) : Map({})
	switch (action.type) {
		case AT.ADD_OBJ_STYLE:
			new_style = obj_add_remove_property(new_style, action.key, action.value)
			return state.set(action.id, new_style)
		case AT.TOWER_CREATE:
		case AT.TILE_CREATE:
		case AT.DOOR_CREATE:
		case AT.PORTAL_CREATE:
		case AT.FIVE_FRAME_CREATE:
		case AT.BAR_CREATE:
		case AT.TOWER_DELETE:
		case AT.TILE_DELETE:
		case AT.DOOR_DELETE:
		case AT.PORTAL_DELETE:
		case AT.FIVE_FRAME_DELETE:
		case AT.BAR_DELETE:
			return obj_add_remove_property(state, action.id, null)
		default:
			return state
	}
}

function anim_info(state = Map({}), action) {
	if (AT.ADD_ANIM_INFO === action.type) {
		// parse this one carefully
		let new_anim_info = state.get(action.id) ? state.get(action.id) : Map({})
		if (action.anim_info) {
			const delay = action.anim_info.hasOwnProperty('delay')
				? action.anim_info['delay']
				: null
			const duration = action.anim_info.hasOwnProperty('duration')
				? action.anim_info['duration']
				: null
			let on_end = action.anim_info.hasOwnProperty('on_end')
				? action.anim_info['on_end']
				: null
			const isLoop = action.anim_info.hasOwnProperty('loop')
			const id = action.anim_info.anim_info_counter
			for (const key in action.anim_info) {
				if (
					!['delay', 'duration', 'on_end', 'loop', 'anim_info_counter'].includes(
						key,
					) &&
					action.anim_info.hasOwnProperty(key)
				) {
					const val = action.anim_info[key]
					if (null === val) {
						// special case
						new_anim_info = obj_add_remove_property(new_anim_info, key, null)
					} else if (global_constant.anim_all_attributes.includes(key)) {
						let val0 = maybe_gen_var(val[0]), val1 = maybe_gen_var(val[1])
						if (['blink', 'handle_blink'].includes(key)) {
							let full_val = { id, from: val0, to: val1, loop: true }
							full_val.duration = duration ? duration : 500
							if (delay) full_val.delay = delay
							if (on_end) {
								full_val.on_end = on_end
								on_end = null
							}
							new_anim_info = obj_add_remove_property(
								new_anim_info,
								key,
								fromJS(full_val),
							)
						} else if (duration) {
							let full_val = { id, from: val0, to: val1 }
							full_val.duration = duration
							if (delay) full_val.delay = delay
							if (isLoop) full_val.loop = true
							if (on_end) {
								full_val.on_end = on_end
								on_end = null
							}
							new_anim_info = obj_add_remove_property(
								new_anim_info,
								key,
								fromJS(full_val),
							)
						} else {
							console.error(
								'Warning in reducer:  anim_info attr',
								key,
								'not changed without duration.',
							)
						}
					} else {
						new_anim_info = obj_add_remove_property(
							new_anim_info,
							key,
							fromJS(val),
						)
					}
				}
			}
		} else {
			console.error('Warning in reducer:  anim_info is false?', action.anim_info)
		}
		return state.set(action.id, new_anim_info)
	}
	switch (action.type) {
		case AT.CLEAR_ANIM_INFO:
		case AT.TOWER_CREATE:
		case AT.TILE_CREATE:
		case AT.DOOR_CREATE:
		case AT.PORTAL_CREATE:
		case AT.FIVE_FRAME_CREATE:
		case AT.BAR_CREATE:
		case AT.TOWER_DELETE:
		case AT.TILE_DELETE:
		case AT.DOOR_DELETE:
		case AT.PORTAL_DELETE:
		case AT.FIVE_FRAME_DELETE:
		case AT.BAR_DELETE:
			//console.log('removing anim_info for id', action.id)
			return obj_add_remove_property(state, action.id, null)
		default:
			return state
	}
}

function tower_style(state = Map({}), action) {
	let new_style = state.get(action.id) ? state.get(action.id) : Map({})
	switch (action.type) {
		case AT.TOWER_SET_WIDTH:
			new_style = obj_add_remove_property(new_style, 'width', action.width)
			//return Object.assign({}, state, { [action.id]: new_style })
			return state.set(action.id, new_style)
		case AT.TOWER_SET_OVERFLOW:
			new_style = obj_add_remove_property(
				new_style,
				'overflow',
				action.overflow,
			)
			//return Object.assign({}, state, { [action.id]: new_style })
			return state.set(action.id, new_style)
		case AT.TOWER_ADD_STYLE:
			new_style = obj_add_remove_property(new_style, action.key, action.value)
			return state.set(action.id, new_style)
		case AT.TOWER_CREATE:
		case AT.TOWER_DELETE:
			return obj_add_remove_property(state, action.id, null)
		default:
			return state
	}
}

function block_opacity(state = Map({}), action) {
	switch (action.type) {
		case AT.TOWER_SET_BLOCK_OPACITY:
			/*
      let new_opacity = state[action.id] ? state[action.id].slice() : []
      new_opacity[action.index] = action.opacity
      return {
        ...state,
        [action.id]: new_opacity
      }
      */
			/*
      let new_opacity = state.has(action.id) ? state.get(action.id).toJS() : []
      new_opacity[action.index] = action.opacity
			return state.set(
				action.id,
				// state.has(action.id)
				// 	? state.get(action.id).set(action.index, action.opacity)
				// 	: List([]),
				fromJS(new_opacity)
			)
			*/
			return state.set(
				action.id,
				state.has(action.id)
					? state.get(action.id).set(action.index, action.opacity)
					: List().set(action.index, action.opacity),
			)
		case AT.TOWER_CREATE:
		case AT.TOWER_DELETE:
			return obj_add_remove_property(state, action.id, null)
		default:
			return state
	}
}

function misc(state = Map({}), action) {
	let new_misc = state.get(action.id) ? state.get(action.id) : Map({})
	switch (action.type) {
		case AT.ADD_OBJ_MISC:
			new_misc = obj_add_remove_property(new_misc, action.key, action.value)
			return state.set(action.id, new_misc)
		case AT.TOWER_CREATE:
		case AT.TILE_CREATE:
		case AT.DOOR_CREATE:
		case AT.PORTAL_CREATE:
		case AT.FIVE_FRAME_CREATE:
		case AT.BAR_CREATE:
		case AT.TOWER_DELETE:
		case AT.TILE_DELETE:
		case AT.DOOR_DELETE:
		case AT.PORTAL_DELETE:
		case AT.FIVE_FRAME_DELETE:
		case AT.BAR_DELETE:
			return obj_add_remove_property(state, action.id, null)
		default:
			return state
	}
}

function keypad_kind(state = null, action) {
	switch (action.type) {
		case AT.SET_KEYPAD_KIND:
			return action.kind
		default:
			return state
	}
}

function button_display(state = Map({}), action) {
	switch (action.type) {
		case AT.SET_BUTTON_DISPLAY:
			return obj_add_remove_property(state, action.index, action.val)
		default:
			return state
	}
}

function button_highlight(state = null, action) {
	switch (action.type) {
		case AT.SET_BUTTON_HIGHLIGHT:
			return action.index
		default:
			return state
	}
}

function event_handling(state = Map({}), action) {
	switch (action.type) {
		case AT.CLEAR_EVENT_HANDLING:
			return Map({})
		case AT.SET_EVENT_HANDLING_PARAM:
			return obj_add_remove_property(state, action.key, action.val)
		default:
			return state
	}
}

function err_box(state = '', action) {
	switch (action.type) {
		case AT.SET_ERR_BOX:
			return action.info
		default:
			return state
	}
}

function option_values(state = '', action) {
	switch (action.type) {
		case AT.SET_OPTION_VALUES:
			return action.values
		default:
			return state
	}
}

function prop(state = Map({}), action) {
	switch (action.type) {
		case AT.SET_PROP:
			return state.set(action.key, action.value)
		default:
			return state
	}
}

function path(state = Map({}), action) {
	switch (action.type) {
		case AT.SET_PATH:
			//console.log('reducer SET_PATH key', action.key, 'value', action.value, 'res', res.toJS())
			return state.set(action.key, action.value)
		default:
			return state
	}
}

function log(state = List([]), action) {
	switch (action.type) {
		case AT.ADD_LOG_ENTRY:
			return array_add_remove_element(
				state,
				List([action.time, action.info]),
				true,
			)
		default:
			return state
	}
}

const suujiAppInner = combineReducers({
	// basic geometry
	tower_ids,
	tile_ids,
	door_ids,
	portal_ids,
	five_frame_ids,
	bar_ids,
	name,
	position,
	style,
	anim_info,
	tower_style,
	block_opacity,
	misc,
	keypad_kind,
	button_display,
	button_highlight,

	// other
	event_handling,
	err_box,
	option_values,
	prop,
	path,
	log,
})

const initialState = fromJS({
	// general info on towers, tiles, and doors
	tower_ids: [],
	tile_ids: [],
	door_ids: [],
	portal_ids: [],
	five_frame_ids: [],
	bar_ids: [],
	button_display: {},
	/*
  log: [
    [1533395800000, [['proportion'], 'is_correct', true, .26, .5, .8]],
    [1533395801000, [['proportion'], 'next_config', 'start']],
    [1533395802000, [['proportion'], 'is_correct', true, .36, .5, .8]],
    [1533395803000, [['proportion'], 'is_correct', true, .45, .5, .8]],
  ]
  */
})

export function do_batched_actions(action_list) {
	//console.log('do_batched_actions action_list', action_list)
	global_store.dispatch(batchActions(action_list))
}

function suujiApp(state, action) {
	if (AT.RESET_ALL === action.type) return initialState
	return state ? suujiAppInner(state, action) : initialState
	//return suujiAppInner(state, action)
}

export default suujiApp
