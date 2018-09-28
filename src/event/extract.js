import {
	query_name_of_tile,
	query_prop,
	query_name_of_door,
	query_door,
	query_event,
	query_arg,
	query_position_of_tile,
	query_obj_misc,
	query_option_values,
} from '../providers/query_store'
import {global_constant, doAction} from '../App'
import {fromJS} from 'immutable'
import {num_stars} from '../containers/CamelContainer'
import {current_pixel_size_of_animal} from '../components/Tile'
import {vec_sum, vec_prod, apply_bounds} from './utils'
import {add_offset} from '../components/render_geoms'
import {option_geometry} from '../components/OptionBackground'

export function extract_handle_position(id, door_info, secondary_handle) {
	//let { name, position } = door_info
	// console.log('door_info', door_info)
	let val, position
	if ('option' == id) {
		val = value_of_correct_option()
		position = fromJS(position_of_correct_option())
	} else {
		let name = door_info.get('name')
		val = name.get(secondary_handle ? 1 : 0)
		val = apply_bounds(val, 0, 1)
		position = door_info.get('position')
	}
	const scale_factor = query_prop('scale_factor')
	let extra_scale = 1
	let id2 = 'option' == id ? 'door_3' : id
	const m = query_obj_misc(id2)
	if (m && m.has('extra_scale')) extra_scale = m.get('extra_scale')
	let res = [
		position.get(0) +
			global_constant.door.thickness_fraction * scale_factor * extra_scale,
		position.get(1) + scale_factor * val * extra_scale,
	]
	return res
}

export function get_err_box_location(arg_1, arg_2, result, just_thin) {
	//console.log('get_err_box_location', arg_1, arg_2, result)
	const d1 = query_door(arg_1)
	let pos1 = extract_handle_position(arg_1, d1)
	pos1[1] = 0
	let pos2 = [0, 0],
		animal_width
	if (arg_2.startsWith('door_'))
		pos2 = extract_handle_position(arg_2, query_door(arg_2))
	else if (arg_2.startsWith('tile_')) {
		// want the top right corner of this tile
		const animal_name = query_name_of_tile(arg_2)
		const [aw, animal_height] = current_pixel_size_of_animal(animal_name)
		animal_width = aw
		const anim_pos = add_offset(query_position_of_tile(arg_2))
		pos2 = [anim_pos[0] + animal_width, anim_pos[1] + animal_height]
		console.log(
			'animal_width',
			animal_width,
			'anim_pos',
			anim_pos,
			'pos2',
			pos2,
		)
	}
	const d1_name = d1.get('name')
	let d1_val = d1_name.get(d1_name.size > 1 ? 1 : 0)
	let implied_pos = vec_sum( // pos1 + val1 * (pos2 - pos1)
		pos1,
		vec_prod(d1_val, vec_sum(pos2, vec_prod(-1, pos1))),
	)
	const pos3 = extract_handle_position(result, query_door(result))
	// let's place the err box
	let position = [
		Math.min(implied_pos[0], pos3[0]),
		Math.min(implied_pos[1], pos3[1]),
	]
	const width = Math.abs(implied_pos[0] - pos3[0])
	let height = Math.abs(implied_pos[1] - pos3[1])
	if (just_thin) {
		const scale_factor = query_prop('scale_factor')
		let result2 = result
		if ('option' == result) result2 = 'door_3'
		const misc = query_obj_misc(result2).toJS()
		const extra_scale =
			misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
		let thickness =
			extra_scale * scale_factor * global_constant.door.thickness_fraction
		if (thickness < 1) thickness = 1
		//console.log('misc', misc, 'extra_scale', extra_scale)
		height = thickness
		const tgt = query_event('target')
		if (tgt == result) position[1] = implied_pos[1] - thickness / 2
		else position[1] = pos3[1] - thickness / 2
	}
	//console.log('get_err_box_location', position, width, height)
	return [position, width, height]
}

export const show_thin_height = (arg_1, arg_2, result) => {
	//console.error('HERE')
	const [position, width, height] = get_err_box_location(
		arg_1,
		arg_2,
		result,
		true,
	)
	//const position = [200,200]
	//const width = 100
	//const height = 100
	//const style = { backgroundColor: 'orange' }
	const misc = {is_thin_height: true}
	doAction.setErrBox({position, width, height, misc})
}

export function handle_close_to_goal() {
	const arg_1 = query_arg(1)
	const arg_2 = query_arg(2)
	const result = query_arg('result')
	const {stars} = describe_numerical(arg_1, arg_2, result, 0)
	return 3 == stars
}

export function get_door_or_tile_height(id) {
	let res = 0
	if (id.startsWith('door_')) res = query_name_of_door(id).get(0)
	else if (id.startsWith('tile_'))
		res = global_constant.animals[query_name_of_tile(id)].height
	return res
}

function value_of_correct_option() {
	const i = query_prop('correct_option_index')
	const option_values = query_option_values()
	//console.log('i', i, 'option_values', option_values.toJS())
	return option_values.getIn([i, 0])
}

function position_of_correct_option() {
	const i = query_prop('correct_option_index')
	let {position} = option_geometry(i)
	return position
}

export function describe_numerical(arg_1, arg_2, result, arg_1_index) {
	const arg_1_name = query_name_of_door(arg_1)
	if ('undefined' == typeof arg_1_index)
		arg_1_index = arg_1_name.size > 1 ? 1 : 0
	let f1 = arg_1_name.get(arg_1_index),
		f3
	f1 = apply_bounds(f1, 0, 1)
	const f2 = get_door_or_tile_height(arg_2)
	if ('option' == result) f3 = value_of_correct_option()
	else {
		f3 = query_name_of_door(result).get(0)
		f3 = apply_bounds(f3, 0, 1)
	}
	let err
	if (query_event('just_proportion')) err = Math.abs(f3 - f2)
	else err = Math.abs(f3 - f1 * f2)
	//console.log('f1', f1.toFixed(2), 'f2', f2.toFixed(2), 'f1 * f2', (f1 * f2).toFixed(2), 'f3', f3.toFixed(2))
	console.log('f1', f1, 'f2', f2, 'f1 * f2', f1 * f2, 'f3', f3, 'err', err)
	if (!query_event('star_policy')) console.error('Warning: need star policy!')
	const stars = num_stars(err)
	return {f1, f2, f3, err, stars}
}

export function dist_from_handle(x, y, tgt, scale_factor) {
	let pos = extract_handle_position(tgt, query_door(tgt))
	// let d = dist2D(pos, [x, y])
	let d = x - pos[0]
	// account for the width of the handle
	const handle_width = global_constant.door.handle_fraction * scale_factor
	if (d > handle_width) d -= handle_width
	else if (d > 0) d = 0
	d = Math.abs(d) + Math.abs(y - pos[1])
	//console.log('dist_from_handle  y', y, 'pos[1]', pos[1], 'd', d)
	return d
}

export function dist_from_door(x, y, tgt, scale_factor) {
	let pos = extract_handle_position(tgt, query_door(tgt))
	// let d = dist2D(pos, [x, y])
	// account for the height of the door
	let d = y < 0 ? -y : y > 1 * scale_factor ? y - scale_factor : 0
	d += Math.abs(x - pos[0])
	return d
}

export function is_blinking(id) {
	var misc = query_obj_misc(id)
	return misc && misc.has('blink')
}

export function handle_is_blinking(id) {
	var misc = query_obj_misc(id)
	return misc && misc.has('handle_blink')
}

export function handle_is_hidden(id) {
	var misc = query_obj_misc(id)
	return misc && misc.has('handle_opacity') && 0 == misc.get('handle_opacity')
}
