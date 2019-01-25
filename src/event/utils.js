import {
	query_prop,
	query_event,
	query_name_of,
	query_position_of,
	query_obj_misc,
	query_block_anim_info,
} from '../providers/query_store'
import {query_tower, query_tower_blocks} from '../providers/query_tower'
import {doAction, global_constant} from '../lib/global'
import {
	get_block_size_from_group,
	get_how_many_from_group,
	get_is_fiver_from_group,
	condense_groups_of,
} from '../components/Block'

export function elapsed_time() {
	return Date.now() - global_constant.start_time
}

export function tlog(...args) {
	const t = (elapsed_time() / 1000).toFixed(2)
	console.log(t, ...args)
}

export function pointIsInRectangle(point, geom, offset = [0, 0]) {
	// console.log('pointIsInRectangle point', point, 'geom', geom, 'offset', offset)
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
	const require_standard_tower = !query_event('allow_non_standard')
	const hide_minis = !query_event('allow_keypad_minis')
	// console.log('allow_keypad_minis', query_event('allow_keypad_minis'))
	for (let i = 0; i < i_end; ++i) {
		const bsize = global_constant.buildTower_button_info[i][0]
		const bfiver = global_constant.buildTower_button_info[i][1]
		let show = null === size || bsize <= size
		if (require_standard_tower) {
			if (size === bsize) {
				if (bfiver) show = false
				else if (!is_fiver && how_many > 3) show = false
				// special case:  prevent more than 3 goats
				if (0 === size && how_many > 2) show = false
			}
		}
		const hide_tinys = true
		if (hide_tinys) {
			if (bsize < -2) show = false
		}
		if (hide_minis) {
			if (bsize === -2) show = false
		}
		const hide_large = true
		if (hide_large) {
			if (bsize > 0) show = false
			if (bsize === 0 && bfiver) show = false
		}
		doAction.setButtonDisplay(i, show)
	}
}

export function create_orderly_sum(arg_1, arg_2, result) {
	// compute the 'correct' value obtained by adding arg1 and arg2
	const name_1 = query_name_of(arg_1).toJS()
	const name_2 = query_name_of(arg_2).toJS()
	let i1 = 0,
		i2 = 0,
		len = name_1.length + name_2.length
	let res = []
	while (i1 + i2 < len) {
		if (
			i1 < name_1.length &&
			(i2 >= name_2.length || name_1[i1] >= name_2[i2])
		) {
			res.push(name_1[i1])
			++i1
		} else {
			res.push(name_2[i2])
			++i2
		}
	}
	res = expand_into_units(res)
	res = condense_groups_of(res)
	doAction.setName(result, res)
	// console.log('create_orderly_sum res', res)
}

export function redraw_mixed_tower() {
	const jj_end = query_name_of('tower_1').size
	// console.log('clearing block anim info, jj_end', jj_end)
	for (let jj = 0; jj < jj_end; ++jj) {
		doAction.clearBlockAnimInfo('tower_1', jj)
	}
	doAction.setName('tower_2_shadow', query_name_of('tower_2').toJS())
	create_orderly_sum('tower_1', 'tower_2', 'tower_mixed')
	show_blocks_moving_to_result('tower_1', 'tower_2', 'tower_mixed', true)
}

export function show_blocks_moving_to_result(arg_1, arg_2, result, instant) {
	// const toggle = query_obj_misc(result).get('toggle').toJS()
	const verbose = false
	const arg12 = [arg_1, arg_2]
	let tower_name = [query_name_of(arg_1).toJS(), query_name_of(arg_2).toJS()]
	tower_name[0] = expand_into_units(tower_name[0])
	tower_name[1] = expand_into_units(tower_name[1])
	let result_tower_name = query_name_of(result).toJS()
	result_tower_name = expand_into_units(result_tower_name)
	const toggle = create_name_match_from_raw(tower_name[0], result_tower_name)
	if (verbose) console.log(' toggle', toggle)

	const tower_info = [query_tower(arg_1).toJS(), query_tower(arg_2).toJS()]
	const block_info = [
		query_tower_blocks(arg_1, tower_info[0]),
		query_tower_blocks(arg_2, tower_info[1]),
	]
	const tower_pos = [
		query_position_of(arg_1).toJS(),
		query_position_of(arg_2).toJS(),
	]
	const result_tower_info = query_tower(result).toJS()
	const result_block_info = query_tower_blocks(result, result_tower_info)
	const result_tower_pos = query_position_of(result).toJS()
	const dx = [
		result_tower_pos[0] - tower_pos[0][0],
		result_tower_pos[0] - tower_pos[1][0],
	]
	let block_index = [0, 0, 0],
		block_offset = [[], []],
		delay = 0
	const already_animated_side_0 = Boolean(query_block_anim_info(arg_1))
	for (let i = 0; i < toggle.length; ++i) {
		let side = toggle[i]
		let w = block_info[side][block_index[side]].width
		if (1 === side && 0 === tower_name[1].length) {
			// skip this one
		} else {
			const scale_factor = query_prop('scale_factor')
			const goat_width = scale_factor * global_constant.tower.size2depth[0]
			let xpos = [0, dx[side] + (goat_width - w)]
			// console.log('size', size)
			let ypos = [
				block_info[side][block_index[side]].bottom,
				result_block_info[block_index[2]].bottom,
			]
			if (instant) {
				block_offset[side].push([xpos[1], ypos[1]])
			} else if (0 === side && already_animated_side_0) {
				// skip this one too
			} else {
				let duration = 0.8 * dist2D([xpos[0], ypos[0]], [xpos[1], ypos[1]])
				doAction.addBlockAnimInfo(arg12[side], block_index[side], {
					left: xpos,
					bottom: ypos,
					duration,
				})
				if (duration > delay) delay = duration
			}
		}
		++block_index[side]
		++block_index[2]
	}
	if (instant) {
		if (verbose) console.log(' block_offset[0]', block_offset[0])
		if (verbose) console.log(' block_offset[1]', block_offset[1])
		for (let side = 0; side < 2; ++side) {
			if (block_offset[side].length > 0) {
				doAction.addObjMisc(arg12[side], 'block_offset', block_offset[side])
			}
		}
	}
	return delay
}

export function create_name_match_from_raw(name_1, name_res) {
	// this function tries to match up the names directly, with no
	//   changes to either name
	let res = [],
		j = 0,
		found_end = false
	for (let i = 0; i < name_res.length; ++i) {
		if (!found_end && approx_equal(name_1[j], name_res[i])) {
			res.push(0)
			++j
			if (j === name_1.length) found_end = true
		} else {
			res.push(1)
		}
	}
	return found_end ? res : false
}

export function create_name_match_from(arg_1, result, as_units = false) {
	let name_1 = query_name_of(arg_1).toJS()
	let name_res = query_name_of(result).toJS()
	if (as_units) {
		name_1 = expand_into_units(name_1)
		name_res = expand_into_units(name_res)
	}
	return create_name_match_from_raw(name_1, name_res)
}

export function design_compatible_name_for_addend(arg_1, arg_2, result) {
	const verbose = false
	let name_1 = query_name_of(arg_1).toJS()
	let name_2 = []
	let name_res = query_name_of(result).toJS()

	// I would like to construct a name for arg_2 that allows a matching
	//   between the blocks of arg1/arg2 and result.  I am assuming that
	//   it is possible to do so:  the blocks of arg_1 should be a subset
	//   of the blocks of result, and arg2 should have the correct height.
	// Convert name_1 and name_res to blocks, since this is all that
	//   we actually need from those towers.  Then find the missing blocks
	//   in the result, and place them as the blocks of arg_2, perhaps
	//   consolidating their name first.  I don't know if this will be
	//   enough to prepare for the animation yet though.

	name_1 = expand_into_units(name_1)
	name_res = expand_into_units(name_res)

	let j = 0,
		found_end = false
	for (let i = 0; i < name_res.length; ++i) {
		if (!found_end && approx_equal(name_1[j], name_res[i])) {
			++j
			if (j === name_1.length) found_end = true
		} else {
			name_2.push(name_res[i])
		}
	}
	if (verbose) console.log(' raw name_2:', name_2)

	name_2 = condense_groups_of(name_2)
	if (verbose) console.log(' after condense:', name_2)

	return name_2
}

export function point_in_animals(point, origin) {
	if (point[0] < origin[0] || point[0] > origin[0] + 210) return false
	if (point[1] < -200 || point[1] > origin[1]) return false
	return true
}
