import {global_constant} from '../lib/global'
import * as Actions from '../providers/actions'
import {query_prop} from '../providers/query_store'
import {
	pick_from_list,
	pick_from_range,
	from_uniform_range,
	pick_animal_name,
} from './gen_utile'
//import {query_obj_misc, query_option_obj} from '../providers/query_store'
import {approx_equal, names_are_identical} from '../event/utils'
import {tower_name2height, height2tower_name} from '../providers/query_tower'
import {global_workspace_height} from '../components/Workspace'
import {deep_clone} from '../providers/change_config'

function find_gen_values_for_words(words, gen_vars) {
	let res = words.slice()
	for (let j = 0; j < res.length; ++j) {
		if (gen_vars.hasOwnProperty(res[j])) res[j] = gen_vars[res[j]]
		if (global_constant.animals.hasOwnProperty(res[j])) {
			res[j] = global_constant.animals[res[j]].height
		}
		if ('string' === typeof res[j]) res[j] = Number(res[j])
	}
	return res
}

function is_binary_op(s) {
	return (
		'+' === s ||
		'-' === s ||
		'*' === s ||
		'/' === s ||
		'++' === s ||
		'+*+' === s
	)
}

function swap_in_array(arr, i, j) {
	let tmp = arr[i]
	arr[i] = arr[j]
	arr[j] = tmp
}

export function permute_array_elements(arr) {
	for (let i = arr.length - 1; i > 0; --i) {
		let j = Math.floor((i + 1) * Math.random())
		// assert(j < arr.length);
		swap_in_array(arr, i, j)
	}
}

function generate_variations_on(s0) {
	const verbose = true
	let starting_table = deep_clone(s0)
	// starting_table = [ [.5], [.5, .5] ]
	//starting_table = [ [1, .5, .2] ]
	//starting_table = [ [.2] ]
	//starting_table = [ [2] ]
	if (verbose) console.log('starting_table', starting_table)
	const n_options = 4
	let res = []
	// choose the number of correct options
	let n_correct
	if (starting_table.length < 2) {
		n_correct = 1
	} else if (starting_table.length === 2) {
		const val = Math.random()
		if (val < 0.75) n_correct = 2
		else n_correct = 1
	} else {
		const val = Math.random()
		if (val < 0.5) n_correct = 3
		else if (val < 0.85) n_correct = 2
		else n_correct = 1
	}
	// select the correct options
	permute_array_elements(starting_table)
	for (let i = 0; i < n_correct; ++i) {
		res.push(starting_table[i])
	}
	if (verbose) console.log(' correct option(s)', res)
	// create variations on these correct options
	let variations = [],
		restarts = 0
	const scale_factor = query_prop('scale_factor')
	for (let i = res.length; i < n_options; ++i) {
		// decide which element of res to use as a starting point
		const base = res[Math.floor(res.length * Math.random())]
		let add = Math.floor(2 * Math.random())
		let digit = Math.floor(3 * Math.random())
		let vari
		if (add > 0) {
			if (0 === digit) {
				vari = base.concat()
				if (vari[vari.length - 1] < 0.4) vari[vari.length - 1] += 0.1
				else vari = vari.concat([0.1])
			} else if (1 === digit) {
				let insertion_index = 0
				while (insertion_index < base.length && base[insertion_index] > 0.4) {
					++insertion_index
				}
				vari = base
					.slice(0, insertion_index)
					.concat([0.5])
					.concat(base.slice(insertion_index, base.length))
			} else if (2 === digit) vari = [1].concat(base)
		} else {
			vari = base.concat()
			if (0 === digit) {
				let last = vari.pop()
				if (last < 0.5) {
					if (last - 0.000001 > 0.1) vari.push(last - 0.1)
					else {
						if (verbose) {
							console.log('base', base, 'is too short to remove a singleton')
						}
						vari = []
					}
				} else if (approx_equal(last, 0.5)) {
					vari.push(last - 0.1)
				} else {
					// should be an integer
					if (last !== Math.round(last)) {
						console.error('Error:  last entry should be an integer!')
					}
					if (last > 1) vari.push(last - 1)
					vari.push(0.5)
					vari.push(0.4)
				}
			} else if (1 === digit) {
				if (tower_name2height(base) < 0.55) {
					vari = [] // cannot do it
					if (verbose) {
						console.log('base', base, 'is too short to remove a fiver')
					}
				} else {
					let removal_index = 0
					while (removal_index < base.length && base[removal_index] > 0.4) {
						++removal_index
					}
					if (0 === removal_index) {
						if (verbose) console.log('only singletons, cannot remove fiver')
						vari = []
					} else {
						if (0.5 === base[removal_index - 1]) {
							vari = base
								.slice(0, removal_index - 1)
								.concat(base.slice(removal_index, base.length))
						} else if (1 === base[removal_index - 1]) {
							vari = base
								.slice(0, removal_index - 1)
								.concat([0.5])
								.concat(base.slice(removal_index, base.length))
						} else {
							vari = base
								.slice(0, removal_index - 1)
								.concat([base[removal_index - 1] - 1])
								.concat([0.5])
								.concat(base.slice(removal_index, base.length))
						}
					}
				}
			} else if (2 === digit) {
				vari = [] // punt for now
				if (verbose) console.log('tried to subtract a box, skipping.')
			}
		}
		let already_seen = false
		for (let j = 0; j < variations.length; ++j) {
			if (names_are_identical(vari, variations[j])) {
				already_seen = true
			}
		}
		const pixel_height = scale_factor * tower_name2height(vari)
		const too_tall = pixel_height > global_workspace_height
		if (too_tall && verbose) {
			console.log('too tall:  vari', vari, 'pixel_height', pixel_height)
		}
		if (!already_seen && vari.length > 0 && !too_tall) {
			variations.push(vari)
		} else {
			++restarts
			if (restarts < 25) {
				--i
			} else {
				console.error(
					'Error:  trouble finding a variation that has not been seen before.',
				)
				variations.push(vari)
			}
		}
	}
	if (verbose) console.log('variations', variations)
	res = res.concat(variations)
	permute_array_elements(res)
	return res
}

function generate_option_values(
	inst,
	option_delta,
	option_values,
	skip_permute,
) {
	const verbose = false
	option_values.length = 0
	if ('number' !== typeof option_delta[0]) {
		// use the delta as the actual values
		for (let i = 0; i < option_delta[0].length; ++i) {
			option_values.push([option_delta[0][i]])
		}
	} else {
		let offset = Math.floor(4 * Math.random())
		for (let i = 0; i < 4; ++i) {
			option_values.push([inst + (i - offset) * option_delta[0]])
		}
		if (!skip_permute) permute_array_elements(option_values)
	}
	if (verbose) {
		console.log(
			'generate_option_values option_delta',
			option_delta[0],
			'res',
			option_values,
		)
	}
	return option_values
}

let gen_vars = {}

export function maybe_gen_var(val) {
	return 'string' === typeof val && gen_vars.hasOwnProperty(val)
		? gen_vars[val]
		: val
}

function apply_gen_instruction(
	id,
	inst,
	option_delta,
	option_values,
	correct_option_value,
	silent = false,
) {
	let ok = true
	let verbose = false
	if (verbose) console.log('apply_gen_instruction id', id, 'inst', inst)
	if (0 === Object.keys(gen_vars).length) {
		// prepopulate with some useful examples
		gen_vars['default_bar_width'] = global_constant.default_bar_width
		gen_vars['scale_factor'] = query_prop('scale_factor')
	}
	if (id.startsWith('option_')) {
		if ('option_value_delta' === id) {
			option_delta[0] = inst
			// console.log('option_delta', option_delta[0])
		} else if ('option_skip_permute' === id) {
			gen_vars['option_skip_permute'] = true
		} else if ('option_value_seed' === id) {
			// actually generate options
			if ('string' === typeof inst) {
				inst = find_gen_values_for_words([inst], gen_vars)[0]
			}
			correct_option_value[0] = inst
			if (!silent) console.log('initial correct value set to', inst)
			const skip_permute = gen_vars['option_skip_permute']
			//console.log('skip_permute', skip_permute)
			generate_option_values(inst, option_delta, option_values, skip_permute)
			// console.log(' here, option_values', option_values, 'correct_option_value', correct_option_value)
			for (let i = 0; i < 4; ++i) {
				gen_vars['option_' + i] = option_values[i][0]
			}
			// console.log(' gen_vars[option_0]', gen_vars.option_0)
		}
	} else if (id.startsWith('restriction_')) {
		if (inst) {
			const words = inst.split(' ')
			//console.log('in restriction, id', id, 'words', words)
			if (3 === words.length && ('<' === words[1] || '>' === words[1])) {
				//if (verbose) console.log(id, 'words', words)
				let vals = find_gen_values_for_words([words[0], words[2]], gen_vars)
				if ('option' === words[0]) {
					// this is actually a 4-fold restriction
					for (let i = 0; i < 4; ++i) {
						let val = gen_vars['option_' + i]
						if ('<' === words[1]) {
							if (val >= vals[1]) ok = false
						} else {
							if (val <= vals[1]) ok = false
						}
						//console.log('comparing', val, 'to', vals[1], 'ok', ok)
					}
				} else {
					if ('<' === words[1]) {
						if (vals[0] >= vals[1]) ok = false
					} else {
						if (vals[0] <= vals[1]) ok = false
					}
				}
				if (verbose) console.log('vals', vals, 'ok', ok)
			} else {
				console.error('Warning:  unrecognized generate restriction.', id, inst)
			}
		}
	} else if (id.startsWith('partition_')) {
		const words = inst.split(' ')
		if (
			words.length === 5 &&
			words[1] === 'into' &&
			words[3] === 'and' &&
			gen_vars[words[0]]
		) {
			const src = words[0]
			const dst1 = words[2]
			const dst2 = words[4]
			// console.log('src', src, 'dst1', dst1, 'dst2', dst2)
			gen_vars[dst1] = []
			gen_vars[dst2] = []
			for (let j = 0; j < gen_vars[src].length; ++j) {
				if (0 === j % 2) gen_vars[dst1].push(gen_vars[src][j])
				else gen_vars[dst2].push(gen_vars[src][j])
			}
			// console.log('src', gen_vars[src], 'dst1', gen_vars[dst1], 'dst2', gen_vars[dst2])
		} else {
			console.error('Warning:  unrecognized generate partition.', inst)
		}
	} else if (Array.isArray(inst)) {
		if ('pick_from_list' === inst[0]) {
			gen_vars[id] = pick_from_list(inst[1], gen_vars[id])
		} else if ('pick_from_range' === inst[0]) {
			gen_vars[id] = pick_from_range(
				inst[1],
				inst[2],
				inst[3] ? inst[3] : 1,
				gen_vars[id],
			)
		} else if ('uniform' === inst[0]) {
			gen_vars[id] = from_uniform_range(inst[1], inst[2], gen_vars[id])
		} else if ('pick_animal_name' === inst[0]) {
			gen_vars[id] = pick_animal_name(gen_vars[id])
		} else if ('fixed' === inst[0]) {
			gen_vars[id] = inst[1]
			//console.log(' fixed id', id, 'to', gen_vars[id])
		} else {
			console.error(
				'Warning:  unrecognized generate array instruction.',
				id,
				inst,
			)
		}
	} else if ('string' === typeof inst) {
		const words = inst.split(' ')
		//console.log('words', words)
		if (1 === words.length && gen_vars.hasOwnProperty(words[0])) {
			gen_vars[id] = gen_vars[words[0]]
			// console.log(' gen', id, 'equal', gen_vars[id])
		} else if (2 === words.length && 'standardize_name' === words[0]) {
			let mean_name = gen_vars[words[1]]
			let h = tower_name2height(mean_name)
			let nice_name = height2tower_name(h)
			// console.log('mean_name', mean_name, 'h', h, 'nice_name', nice_name)
			gen_vars[id] = nice_name
		} else if (2 === words.length && 'height_from_animal' === words[0]) {
			let animal_name = gen_vars[words[1]]
			let h = global_constant.animals[animal_name].height
			// console.log('animal_name', animal_name, 'h', h)
			gen_vars[id] = h
		} else if (2 === words.length && 'as_animal_name' === words[0]) {
			let val = gen_vars[words[1]],
				minD = 'unset',
				animal_name
			for (const n in global_constant.animals) {
				if (global_constant.animals.hasOwnProperty(n)) {
					const d = Math.abs(val - global_constant.animals[n].height)
					if ('unset' === minD || d < minD) {
						minD = d
						animal_name = n
					}
				}
			}
			//let h = global_constant.animals[animal_name].height
			//console.log('val', val, 'animal_name', animal_name, 'h', h)
			gen_vars[id] = animal_name
		} else if (2 === words.length && 'augment_table' === words[0]) {
			let starting_table = gen_vars[words[1]]
			let res = generate_variations_on(starting_table)
			// console.log('augment_table res', res)
			gen_vars[id] = res
			if ('delay_option_value_delta' === id) {
				option_delta[0] = res
			}
		} else if (3 === words.length && 'as_peg_name' === words[0]) {
			let peg_type = gen_vars[words[1]],
				peg_height = gen_vars[words[2]],
				peg_name
			let peg_num = Math.round(10 * peg_height)
			if (peg_num < 1) peg_num = 1
			if (peg_num > 5) peg_num = 5
			peg_name = 'peg_' + peg_type + peg_num
			// console.log('peg type', peg_type, 'peg_height', peg_height, 'peg_num', peg_num, 'peg_name', peg_name)
			gen_vars[id] = peg_name
		} else if (3 === words.length && 'narrow_table' === words[0]) {
			let starting_table = gen_vars[words[1]],
				one_height = gen_vars[words[2]],
				res = []
			for (let i = 0; i < starting_table.length; ++i) {
				if (approx_equal(tower_name2height(starting_table[i]), one_height)) {
					res.push(starting_table[i])
				}
			}
			// console.log('one_height', one_height, 'res', res)
			gen_vars[id] = res
			if (!res || res.length < 1) ok = false
		} else if (3 === words.length && is_binary_op(words[1])) {
			let vals = find_gen_values_for_words([words[0], words[2]], gen_vars)
			if ('+' === words[1]) {
				gen_vars[id] = vals[0] + vals[1]
			} else if ('-' === words[1]) {
				gen_vars[id] = vals[0] - vals[1]
			} else if ('*' === words[1]) {
				gen_vars[id] = vals[0] * vals[1]
			} else if ('/' === words[1]) {
				gen_vars[id] = vals[0] / vals[1]
			} else if ('++' === words[1]) {
				// concatenate two lists, with special handling for zero
				let vals0 = vals[0],
					vals1 = vals[1]
				if (!Array.isArray(vals0)) {
					if (0 === vals0) vals0 = []
					else vals0 = [vals0]
				}
				if (!Array.isArray(vals1)) {
					if (0 === vals1) vals1 = []
					else vals1 = [vals1]
				}
				// console.log(' vals0', vals0, 'vals1', vals1)
				gen_vars[id] = vals0.concat(vals1)
			} else if ('+*+' === words[1]) {
				// a kind of outer product, with special handling for zero
				let vals0 = vals[0],
					vals1 = vals[1],
					res = []
				for (let i = 0; i < vals0.length; ++i) {
					if (!Array.isArray(vals0[i])) {
						if (0 === vals0[i]) vals0[i] = []
						else vals0[i] = [vals0[i]]
					}
					for (let j = 0; j < vals1.length; ++j) {
						if (!Array.isArray(vals1[j])) {
							if (0 === vals1[j]) vals1[i] = []
							else vals1[j] = [vals1[j]]
						}
						res.push(vals0[i].concat(vals1[j]))
					}
				}
				// console.log(' vals0', vals0, 'vals1', vals1)
				gen_vars[id] = res
				//console.log(' gen', id, 'equal', gen_vars[id])
			}
			//console.log('id', id, 'words', words, 'vals', vals, 'gen_vars[id]', gen_vars[id])
		} else {
			console.error(
				'Warning 1:  unrecognized generate string instruction.',
				id,
				inst,
			)
		}
	} else {
		console.error('Warning 2:  unrecognized generate instruction.', id, inst)
	}
	return ok
}

export function generate_with_restrictions(
	action_list,
	c,
	curr_exercise = 0,
	silent = false,
) {
	const verbose = false
	if (verbose) console.log('generate_with_restrictions c', c)

	// move restrictions to the end, and binary ops just before
	let last = [],
		restrict = [],
		binary = [],
		partition = [],
		option = [],
		all = []
	for (const id in c) {
		// console.log('  id', id)
		if (c.hasOwnProperty(id)) {
			let words = 'string' === typeof c[id] ? c[id].split(' ') : null
			if (id.startsWith('10_')) last.push(id)
			else if (id.startsWith('restriction_')) restrict.push(id)
			else if (
				id.startsWith('partition_') ||
				(words && ['narrow_table', 'augment_table'].includes(words[0]))
			) {
				partition.push(id)
			} else if (id.startsWith('option_')) option.push(id)
			else if (
				words &&
				(1 === words.length ||
					(2 === words.length && 'standardize_name' === words[0]) ||
					(3 === words.length && is_binary_op(words[1])))
			) {
				// also allows identify function, special others!
				binary.push(id)
			} else all.push(id)
		}
	}
	all = all.concat(binary)
	all = all.concat(option)
	all = all.concat(partition)
	all = all.concat(restrict)
	all = all.concat(last)
	if (verbose) console.log('reordered all', all)

	// try to create a valid set of values, and then check restrictions
	let i,
		max_i = 100
	// option_delta, option_values, and correct_option_value are effectively pass-by-reference
	let option_delta = [0.1],
		option_values = [],
		correct_option_value = []
	for (i = 0; i < max_i; ++i) {
		let ok = true
		for (let id of all) {
			//console.log('id', id)
			const inst = c[id]
			if (id.startsWith('10_')) id = id.substr(3)
			if (!Array.isArray(inst) && 'object' === typeof inst) {
				// apply restrictions to the use of some instructions
				for (let key in inst) {
					if (key.startsWith('exercise')) {
						// only this exercise!
						const ex = Number(key.substr(8))
						// let curr = query_prop('config_iteration')
						//if (!curr) curr = 0
						if (ex === curr_exercise) {
							ok =
								ok &&
								apply_gen_instruction(
									id,
									inst[key],
									option_delta,
									option_values,
									correct_option_value,
									silent,
								)
							if (verbose) {
								console.log('ex', ex, 'curr', curr_exercise, 'inst', inst[key])
							}
						}
					}
				}
			} else {
				ok =
					ok &&
					apply_gen_instruction(
						id,
						inst,
						option_delta,
						option_values,
						correct_option_value,
						silent,
					)
				if (verbose) {
					console.log(
						'id',
						id,
						'c[id]',
						inst,
						'ok',
						ok,
						'option_values',
						option_values,
					)
				}
			}
		}
		if (verbose) console.log(gen_vars)
		if (ok) break
	}
	// console.log('option_values', option_values)
	if (option_values.length > 0) {
		action_list.push(Actions.setOptionValues(option_values))
		// console.log('correct_option_value', correct_option_value)
		// console.log('option_values', option_values)
		let found_it = false
		for (let i = 0; i < option_values.length; ++i) {
			if (approx_equal(correct_option_value[0], option_values[i][0])) {
				action_list.push(Actions.setProp('correct_option_index', i))
				found_it = true
				// console.log('correct_option_index', i)
			}
		}
		if (!found_it) {
			// try to identify the = and != options
			let answer = []
			for (let i = 0; i < option_values.length; ++i) {
				if (
					approx_equal(
						correct_option_value[0],
						tower_name2height(option_values[i][0]),
					)
				) {
					answer.push(1)
				} else answer.push(2)
			}
			action_list.push(Actions.setProp('correct_option_index', answer))
			//console.log('setting correct_option_index to', answer)
		}
	}
	if (i >= max_i) {
		console.error('could not generate successfully!')
	}
	return gen_vars
}
