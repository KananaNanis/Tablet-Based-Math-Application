import {global_workspace_height} from '../components/Workspace'
import {global_constant} from '../lib/global'
import {query_prop} from '../providers/query_store'

export function height_too_tall(height) {
	const pixels = query_prop('scale_factor') * height
	return pixels > global_workspace_height
}

export function animal_too_tall(animal_name) {
	const height = global_constant.animals[animal_name].height
	return height_too_tall(height)
}

export function pick_animal_name(prev_value) {
	//console.log('choose_random_animal', Object.keys(animals))
	const animal_names = Object.keys(global_constant.animals)
	for (const i of Array(10).keys()) {
		i
		const animal_name =
			animal_names[Math.floor(animal_names.length * Math.random())]
		if (
			animal_name !== prev_value &&
			animal_name !== 'chimpanzee' &&
			!animal_name.startsWith('peg') &&
			!animal_too_tall(animal_name)
		) {
			//console.log('choose_random_animal result ', animal_name)
			return animal_name
		}
	}
	console.warn('choose_random_animal')
	return 'kitty'
}

export function pick_from_list(list, prev_value, skip_first) {
	//console.log('pick_from_list list', list, 'prev_value', prev_value)
	//tower_1_name: [pickOne, [.1, .5], [.2]]
	for (let i = 0; i < 10; ++i) {
		const r = Math.floor(list.length * Math.random())
		if (0 === r && skip_first) continue
		const elt = list[r]
		//if (height_too_tall(elt)) continue  // should be an explicit restriction
		if (prev_value === elt) continue
		return elt
	}
	console.warn(
		'Warning in choose_from_list:  tried ten times to choose from',
		list,
		'prev_value',
		prev_value,
		'skip_first',
		skip_first,
	)
	return list.length > 1 ? list[1] : list[0]
}

export function pick_from_range(begin, end, incr, prev_value) {
	let list = []
	if (incr > 0) {
		for (let i = begin; i < end; i += incr) list.push(i)
	} else if (incr < 0) {
		for (let i = begin; i > end; i -= incr) list.push(i)
	} else {
		// incr === 0
		list.push(begin)
	}
	return pick_from_list(list, prev_value)
}

export function from_uniform_range(begin, end, prev_value) {
	for (let i = 0; i < 10; ++i) {
		const val = begin + (end - begin) * Math.random()
		if (
			'undefined' === typeof prev_value ||
			10 * Math.abs(val - prev_value) > Math.abs(end - begin)
		) {
			return val
		}
	}
	console.error(
		'Warning:  did not generate inside uniform range after 10 tries.',
		begin,
		end,
		prev_value,
	)
	return (begin + end) / 2
}
