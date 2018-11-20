import {global_store} from '../index'
import {global_constant} from '../lib/global'
import {
	get_block_size_from_group,
	get_how_many_from_group,
	get_is_fiver_from_group,
} from '../components/Block'
import {Map} from 'immutable'
import {consolidate_info_for_ids, query_prop} from './query_store'

export function query_all_nums() {
	const state = global_store.getState()
	const all_nums = consolidate_info_for_ids(
		state.get('tower_ids'),
		state.get('name'),
		state.get('position'),
		state.get('style'),
		state.get('tower_style'),
		state.get('block_opacity'),
		state.get('misc'),
	)
	return all_nums
}

export function query_tower(num_id, all_nums = null) {
	if (!all_nums) all_nums = query_all_nums()
	return all_nums.get(num_id)
}

export function query_tower_blocks(num_id, tower = null, just_position) {
	if (!tower) tower = query_tower(num_id).toJS()
	const scale_factor = query_prop('scale_factor')
	// expand the name into individual blocks
	//console.log(tower.name)
	let blocks = []
	let floor = 0
	let was_fiver = 0
	//const tower_name = tower.get('name')
	const tower_name = tower.name
	const block_opacity = tower.block_opacity ? tower.block_opacity : []
	for (const group of tower_name) {
		const size = get_block_size_from_group(group)
		const how_many = get_how_many_from_group(group)
		let is_fiver = get_is_fiver_from_group(group)
		if (is_fiver && was_fiver) is_fiver = 3 - was_fiver
		was_fiver = is_fiver
		//console.log('size ' + size + ' how_many ' + how_many)
		let height = scale_factor * 10 ** size
		//const is_tiny = height < 4
		const width = scale_factor * global_constant.tower.size2depth[size]
		if (is_fiver) {
			//width *= is_tiny ? 1.5 : 1.1
			height *= 5
		}
		for (let i = 0; i < how_many; ++i) {
			if (just_position) {
				blocks.push([
					tower.position[0],
					tower.position[1] + floor,
					width,
					height,
				])
			} else {
				blocks.push({
					size,
					height,
					width,
					is_fiver,
					block_opacity: block_opacity[blocks.length],
					bottom: floor,
				})
			}
			floor += height
			if (is_fiver) break
		}
	}
	return blocks
}

export function query_tower_name(num_id) {
	const state = global_store.getState()
	return state.getIn(['name', num_id])
}

export function tower_name2height(name) {
	// possible tests:  same as height2tower_name, in reverse
	if (!name) return null
	let res = 0
	for (const group of name) {
		res += Math.round(10000 * group)
	}
	return res / 10000
}

export function height2tower_name(height) {
	// possible tests:
	//    473.291 -> [400, 50, 20, 3, .2, .05, .04, .001]
	//    1.000001 -> [1]
	//    1 -> [1]
	//    .999999 -> [1]
	let res = []
	if (height > 10000) {
		console.error('Error in height2tower_name:  height', height, '(too large)')
	}
	if (height < 0.0001) {
		console.error('Error in height2tower_name:  height', height, '(too small)')
	}
	/*
		// original approach -- suspected of being buggy
		for (let size = 3; size >= -3; --size) {
			if (10 ** size < height + 0.000000001) {
				let how_many = Math.floor((height + 0.000000001) / 10 ** size)
				height -= how_many * 10 ** size
				if (how_many > 4) {
					res.push(5 * 10 ** size)
					how_many -= 5
				}
				if (how_many > 0) res.push(how_many * 10 ** size)
			}
		}
  */
	let h = Math.round(10000 * height)
	for (let size = 1; size <= 8; ++size) {
		let n = h % 10 ** size
		h -= n
		let how_many = n / 10 ** (size - 1)
		let has_fiver = false
		if (how_many > 4) {
			has_fiver = true
			how_many -= 5
		}
		if (how_many > 0) res.push(how_many * 10 ** (size - 5))
		if (has_fiver) res.push(5 * 10 ** (size - 5))
	}
	res.reverse()
	return res
}

export function query_tower_height(num_id) {
	const state = global_store.getState()
	return tower_name2height(state.getIn(['name', num_id]))
}

/*
export function query_tower_width(num_id) {
  const name = query_tower_name(num_id);
  return width_from_name(name)
}
*/

export function query_top_block(num_id) {
	const name = query_tower_name(num_id)
	let size = null,
		is_fiver = null,
		how_many = null
	if (name && name.size >= 1) {
		const group = name.get(name.size - 1)
		size = get_block_size_from_group(group)
		is_fiver = get_is_fiver_from_group(group)
		how_many = get_how_many_from_group(group)
	}
	//console.log('query_top_block name', name.toJS(), 'size', size)
	return [size, is_fiver, how_many]
}

export function query_whole_tower(num_id, tower = null, just_position) {
	if (!tower) {
		if (just_position) {
			const state = global_store.getState()
			const {name, position} = state
			tower = Map({name: name.get(num_id), position: position.get(num_id)})
		} else tower = query_tower(num_id)
	}
	// expand the name into individual blocks
	let name_info = []
	let floor = 0,
		was_fiver = 0
	const width = 60 // NOTE: make this a global?  Where to keep style params?
	for (const group of tower.name) {
		const size = get_block_size_from_group(group)
		const how_many = get_how_many_from_group(group)
		let is_fiver = get_is_fiver_from_group(group)
		if (is_fiver && was_fiver) is_fiver = 3 - was_fiver
		was_fiver = is_fiver
		//console.log('size ' + size + ' how_many ' + how_many)
		const height = global_constant.tower.size2fontsize[size] + 2
		if (just_position) {
			let pos = tower.position
			name_info.push([pos.get(0), pos.get(1) + floor, width, height])
		} else {
			name_info.push({
				size,
				quantity: how_many,
				is_fiver,
				height,
				bottom: floor,
			})
		}
		floor += height
	}
	return name_info
}
