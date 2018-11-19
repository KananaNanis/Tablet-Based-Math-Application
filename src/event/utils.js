import {
	query_prop,
	query_event,
	query_name_of,
	query_position_of,
	query_obj_misc,
} from '../providers/query_store'
import {doAction, global_constant} from '../lib/global'
import {
	get_block_size_from_group,
	get_how_many_from_group,
	get_is_fiver_from_group,
} from '../components/Block'

export function elapsed_time() {
	return Date.now() - global_constant.start_time
}

export function tlog(...args) {
	const t = (elapsed_time() / 1000).toFixed(2)
	console.log(t, ...args)
}

export function pointIsInRectangle(point, geom, offset = [0, 0]) {
	//console.log('pointIsInRectangle point', point, 'geom', geom, 'offset', offset)
	return (
		geom.position[0] + offset[0] <= point[0] &&
		point[0] <= geom.position[0] + offset[0] + geom.width &&
		geom.position[1] + offset[1] <= point[1] &&
		point[1] <= geom.position[1] + offset[1] + geom.height
	)
}

export function point_distance_to_rectangle(point, geom, offset = [0, 0]) {
	let xdelta = 0,
		ydelta = 0
	if (point[0] < geom.position[0] + offset[0]) {
		xdelta = geom.position[0] + offset[0] - point[0]
	} else if (point[0] > geom.position[0] + offset[0] + geom.width) {
		xdelta = point[0] - (geom.position[0] + offset[0] + geom.width)
	}

	if (point[1] < geom.position[1] + offset[1]) {
		ydelta = geom.position[1] + offset[1] - point[1]
	} else if (point[1] > geom.position[1] + offset[1] + geom.height) {
		ydelta = point[1] - (geom.position[1] + offset[1] + geom.height)
	}

	let d = 0
	if (xdelta === 0) d = ydelta
	else {
		if (ydelta === 0) d = xdelta
		else {
			d = Math.sqrt(xdelta * xdelta + ydelta * ydelta)
		}
	}
	console.log(
		'point_distance_to_rectangle point',
		point,
		'geom',
		geom,
		'xdelta',
		xdelta,
		'ydelta',
		ydelta,
		'd',
		d,
	)
	return d
}

export function get_bbox(id) {
	let width,
		height,
		position = query_position_of(id).toJS()
	let name = query_name_of(id).toJS()
	const scale_factor = query_prop('scale_factor')
	if (id.startsWith('bar_')) {
		height = name * scale_factor
		width = global_constant.default_bar_width
	} else {
		console.error('Error in distance_to_prim:  unrecognized prim', id)
		return 1e10
	}
	const bbox = {position, width, height}
	return bbox
}

export function distance_to_prim(x, y, id) {
	return point_distance_to_rectangle([x, y], get_bbox(id))
}

export function approx_equal(x, y, thresh = 1e-8) {
	return Math.abs(x - y) < thresh
}

export function names_are_identical(name1, name2) {
	if (name1.length !== name2.length) return false
	for (let i = 0; i < name1.length; ++i) {
		if (!approx_equal(name1[i], name2[i])) return false
	}
	return true
}

/*
export function towersHaveIdenticalNames(num_id1, num_id2) {
  const name1 = query_tower_name(num_id1)
  const name2 = query_tower_name(num_id2)
  return names_are_identical(name1, name2)
}
*/

export function expand_into_units(name) {
	let res = []
	for (let i = 0; i < name.length; ++i) {
		const size = get_block_size_from_group(name[i])
		const how_many = get_how_many_from_group(name[i])
		if (get_is_fiver_from_group(name[i])) {
			res.push(name[i])
		} else {
			for (let j = 0; j < how_many; ++j) res.push(10 ** size)
		}
	}
	return res
}

export function vec_sum(a, b) {
	return [a[0] + b[0], a[1] + b[1]]
}

export function vec_prod(s, a) {
	return [s * a[0], s * a[1]]
}

export function dist2D(a, b) {
	const dx = a[0] - b[0]
	const dy = a[1] - b[1]
	return Math.sqrt(dx * dx + dy * dy)
}

export function reduce_num_stars() {
	const curr_num_stars = query_prop('num_stars')
	if (curr_num_stars > 0) doAction.setProp('num_stars', curr_num_stars - 1)
	if (query_prop('num_stars') < 1) doAction.setProp('repeat_level', 1)
}

export function apply_bounds(val, lo, hi) {
	return val > hi ? hi : val < lo ? lo : val
}

export function set_primary_height(id, val) {
	let name = query_name_of(id).toJS()
	const m = query_obj_misc(id)
	if (m && m.has('extra_scale')) {
		name[0] = val / m.get('extra_scale')
	} else name[0] = val
	doAction.setName(id, name)
}

export function update_keypad_button_visibility(size, is_fiver, how_many) {
	//console.log('update_keypad_button_visibility', size, is_fiver, how_many)
	const i_end = global_constant.buildTower_button_info.length
	let require_standard_tower = true
	if (query_event('allow_non_standard')) require_standard_tower = false
	for (let i = 0; i < i_end; ++i) {
		const bsize = global_constant.buildTower_button_info[i][0]
		const bfiver = global_constant.buildTower_button_info[i][1]
		let show = null === size || bsize <= size
		if (require_standard_tower) {
			if (size === bsize) {
				if (bfiver) show = false
				else if (!is_fiver && how_many > 3) show = false
			}
		}
		const hide_minis_and_tinys = true
		if (hide_minis_and_tinys) {
			if (bsize < -1) show = false
			if (bsize > 0) show = false
			if (bsize === 0 && bfiver) show = false
		}
		doAction.setButtonDisplay(i, show)
	}
}
