import * as AT from './actionTypes'
import {fromJS} from 'immutable'
import {global_constant} from '../App'

export function towerCreate(id, name, position) {
	return {
		type: AT.TOWER_CREATE,
		id,
		name: fromJS(name),
		position: fromJS(position),
	}
}

export function tileCreate(id, name, position) {
	return {type: AT.TILE_CREATE, id, name, position: fromJS(position)}
}

export function doorCreate(id, name, position) {
	return {
		type: AT.DOOR_CREATE,
		id,
		name: fromJS(name),
		position: fromJS(position),
	}
}

export function portalCreate(id, name, position) {
	return {
		type: AT.PORTAL_CREATE,
		id,
		name: fromJS(name),
		position: fromJS(position),
	}
}

export function towerDelete(id) {
	return {type: AT.TOWER_DELETE, id}
}

export function tileDelete(id) {
	return {type: AT.TILE_DELETE, id}
}

export function doorDelete(id) {
	return {type: AT.DOOR_DELETE, id}
}

export function portalDelete(id) {
	return {type: AT.PORTAL_DELETE, id}
}

export function setName(id, name) {
	return {type: AT.SET_NAME, id, name: fromJS(name)}
}

export function towerAddBlock(id, size, is_fiver) {
	return {type: AT.TOWER_ADD_BLOCK, id, size, is_fiver}
}

export function towerRemoveBlock(id) {
	return {type: AT.TOWER_REMOVE_BLOCK, id}
}

export function setPosition(id, position) {
	return {type: AT.SET_POSITION, id, position: fromJS(position)}
}

export function addObjStyle(id, key, value) {
	return {type: AT.ADD_OBJ_STYLE, id, key, value: fromJS(value)}
}

export function addObjMisc(id, key, value) {
	return {type: AT.ADD_OBJ_MISC, id, key, value: fromJS(value)}
}

export function setAnimInfo(id, anim_info) {
	return {type: AT.SET_ANIM_INFO, id, anim_info: fromJS(anim_info)}
}

export function towerSetWidth(id, width) {
	return {type: AT.TOWER_SET_WIDTH, id, width}
}

export function towerSetOverflow(id, overflow) {
	return {type: AT.TOWER_SET_OVERFLOW, id, overflow}
}

export function towerAddStyle(id, key, value) {
	return {type: AT.TOWER_ADD_STYLE, id, key, value: fromJS(value)}
}

export function towerSetBlockOpacity(id, index, opacity) {
	return {type: AT.TOWER_SET_BLOCK_OPACITY, id, index, opacity}
}

export function setKeypadKind(kind) {
	return {type: AT.SET_KEYPAD_KIND, kind}
}

export function setButtonDisplay(index, val) {
	//console.log('setButtonDisplay', index, val)
	return {type: AT.SET_BUTTON_DISPLAY, index, val}
}

export function setButtonHighlight(index) {
	return {type: AT.SET_BUTTON_HIGHLIGHT, index}
}

export function clearEventHandling() {
	return {type: AT.CLEAR_EVENT_HANDLING}
}

export function setEventHandlingParam(key, val) {
	if (!global_constant.event_handling_types.includes(key)) {
		console.error('Warning:  unrecognized event_handling key', key)
	}
	return {type: AT.SET_EVENT_HANDLING_PARAM, key, val}
}

export function setErrBox(info) {
	//console.log('setErrBox ', info)
	return {type: AT.SET_ERR_BOX, info: fromJS(info)}
}

export function setOptionValues(values) {
	return {type: AT.SET_OPTION_VALUES, values: fromJS(values)}
}

export function setProp(key, value) {
	if (!global_constant.prop_types.includes(key)) {
		console.error('Warning:  unrecognized prop key', key)
	}
	if (
		null !== value &&
		!global_constant.prop_value_types.includes(typeof value)
	) {
		console.error('Warning:  prop value has unrecognized type', value)
	}
	return {type: AT.SET_PROP, key, value}
}

export function setPath(key, value) {
	if (!global_constant.path_types.includes(key)) {
		console.error('Warning:  unrecognized path key', key)
	}
	return {type: AT.SET_PATH, key, value: fromJS(value)}
}

export function addLogEntry(time, info) {
	console.log('addLogEntry', time, info)
	const send_to_server = true
	if (send_to_server) {
		fetch(
			// 'https://www.cs.stolaf.edu/suuji/ajax2.php',
			'ajax2.php',
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: 'write_log\n' + time + ' ' + JSON.stringify(info) + '\n',
				credentials: 'same-origin',
			},
		)
	}
	return {type: AT.ADD_LOG_ENTRY, time, info: fromJS(info)}
}

export function resetAll() {
	return {type: AT.RESET_ALL}
}
