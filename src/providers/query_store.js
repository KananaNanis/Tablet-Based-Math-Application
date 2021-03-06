import {global_store} from '../index'
import {global_constant} from '../lib/global'
import {get_button_geoms_for} from '../components/Keypad'
import {Map} from 'immutable'

export const consolidate_info_for_ids = (
	ids,
	name,
	position,
	style,
	anim_info = Map({}),
	misc = Map({}),
	tower_style = false,
	block_opacity = false,
) => {
	//console.log('consolidate_info_for_ids', ids)
	//console.log('consolidate_info_for_ids', ids, 'anim_info', anim_info)
	//console.log('consolidate_info_for_ids', ids.toJS(), 'misc', misc.toJS())
	//let res = {}
	let res = Map({})
	for (const id of ids) {
		/*
    res[id] = {
      name: name[id],
      position: position[id],
      style: style[id],
      anim_info: anim_info[id],
      misc: misc[id]
    }
    */
		res = res.set(
			id,
			Map({
				name: name.get(id),
				position: position.get(id),
				style: style.get(id),
				anim_info: anim_info.get(id),
				misc: misc.get(id),
			}),
		)
		if (tower_style && tower_style.get(id)) {
			//console.log('tower_style', tower_style)
			//res[id].tower_style = tower_style[id]
			res = res.setIn([id, 'tower_style'], tower_style.get(id))
		}
		if (block_opacity && block_opacity.get(id)) {
			//res[id].block_opacity = block_opacity[id]
			res = res.setIn([id, 'block_opacity'], block_opacity.get(id))
		}
	}
	//console.log('consolidate_info_for_ids res', res.toJS())
	return res
}

export function query_keypad_kind() {
	const state = global_store.getState()
	return state.get('keypad_kind')
}

export function query_visible_buttons() {
	const state = global_store.getState()
	let res = []
	for (const i in global_constant.special_button_defaults) {
		if (
			state.get('button_display').has(i) &&
			state.getIn(['button_display', i]) !== 'false'
		) {
			res.push(i)
		}
	}
	if (state.get('keypad_kind')) {
		const keypad_kind = state.get('keypad_kind')
		const i_end = get_button_geoms_for(keypad_kind).length
		if ('decimal' === keypad_kind) {
			for (let i = 0; i < i_end; ++i) {
				if (0 !== i && 2 !== i) res.push(i)
			}
		} else if ('decimal_column' === keypad_kind) {
			for (let i = 0; i < i_end; ++i) {
				res.push(i)
			}
		} else {
			for (let i = 0; i < i_end; ++i) {
				//const istr = String(i)
				//console.log('i', i, 'istr', istr, '  has', state.get('button_display').has(i), 'val', state.getIn(['button_display', i]))
				if (
					state.get('button_display').has(i) &&
					state.getIn(['button_display', i]) !== false
				) {
					res.push(i)
				}
			}
		}
	}
	if (state.getIn(['event_handling', 'use_option_buttons'])) {
		for (let i = 0; i < 4; ++i) {
			res.push('top_' + i)
			res.push('bottom_' + i)
		}
	}
	// console.log('query_visible_buttons res', res, 'button_display', state.get('button_display').toJS())
	return res
}

export function query_button_detail(id) {
	const state = global_store.getState()
	return state.getIn(['button_display', id])
}

export function query_name_of(id) {
	const state = global_store.getState()
	return state.getIn(['name', id])
}

export function query_position_of(id) {
	const state = global_store.getState()
	return state.getIn(['position', id])
}

export function query_all_doors() {
	// include portals!
	const state = global_store.getState()
	const ids = [...state.get('door_ids'), ...state.get('portal_ids')]
	const all_doors = consolidate_info_for_ids(
		ids,
		state.get('name'),
		state.get('position'),
		state.get('style'),
		state.get('misc'),
	)
	return all_doors
}

export function query_door(door_id, all_doors = null) {
	if (!all_doors) all_doors = query_all_doors()
	return all_doors.get(door_id)
}

export function query_obj_style(id) {
	const state = global_store.getState()
	return state.getIn(['style', id])
}

export function query_obj_anim_info(id) {
	const state = global_store.getState()
	return state.getIn(['anim_info', id])
}

export function query_block_anim_info(id) {
	const state = global_store.getState()
	return state.getIn(['block_anim_info', id])
}

export function query_obj_misc(id) {
	const state = global_store.getState()
	return state.getIn(['misc', id])
}

export function query_arg(n) {
	const state = global_store.getState()
	//console.log('state.event_handling', state.get('event_handling'))
	if (1 === n) return state.getIn(['event_handling', 'arg_1'])
	else if (2 === n) return state.getIn(['event_handling', 'arg_2'])
	else if ('result' === n) return state.getIn(['event_handling', 'result'])
}

export function query_event(key) {
	if (!global_constant.event_handling_types.includes(key)) {
		console.error('Warning:  unrecognized event_handling key', key)
	}
	const state = global_store.getState()
	return state.getIn(['event_handling', key])
}

export function query_has_anim_info(id) {
	const state = global_store.getState()
	return state.get('anim_info').has(id)
}

export function query_timer_started(id) {
	const state = global_store.getState()
	return state.get('timer_started').has(id)
}

export function query_option_values() {
	const state = global_store.getState()
	return state.get('option_values')
}

export function query_prop(key) {
	if (!global_constant.prop_types) {
		console.error('Warning: no prop types?!')
	}
	if (!global_constant.prop_types.includes(key)) {
		console.error('Warning: unrecognized prop key', key)
	}
	const state = global_store.getState()
	return state.getIn(['prop', key])
}

export function query_path(key) {
	if (!global_constant.path_types.includes(key)) {
		console.error('Warning:  unrecognized path key', key)
	}
	const state = global_store.getState()
	return state.getIn(['path', key])
}

export function query_log() {
	const state = global_store.getState()
	return state.get('log')
}

export function query_option_obj() {
	const state = global_store.getState()
	const m_all = state.get('misc')
	let res = null
	for (const id of m_all.keySeq()) {
		// console.log('id', id)
		const m = m_all.get(id)
		if (m.get('is_option')) {
			//console.log('got it:', id)
			if (res) {
				console.warn('Warning in query_option_obj:  duplicate option?', res, id)
			}
			res = id
		}
	}
	return res
}

export function with_suffix(path) {
	if (query_path('suffix_path')) {
		const suffix = query_path('suffix_path')
		//console.log('path', path, 'suffix', suffix)
		const plain_suffix = suffix ? suffix.toJS() : suffix
		return [...path, ...plain_suffix]
	} else return path
}

export function query_test() {
	let state = global_store.getState()
	console.log('state', state.toJS())
}
