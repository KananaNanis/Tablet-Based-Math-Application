import {global_constant} from '../App'
import * as Actions from '../providers/actions'
import {query_prop} from '../providers/query_store'
import {
	pick_from_list,
	pick_from_range,
	from_uniform_range,
	pick_animal_name,
} from './gen_utile'
//import {query_obj_misc, query_option_obj} from '../providers/query_store'
import {approx_equal} from '../event/utils'
import {tower_name2height, height2tower_name} from '../providers/query_tower'

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
	return '+' === s || '-' === s || '*' === s || '/' === s || '++' === s
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
			option_values.push(option_delta[0][i])
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

export function maybe_gen_var(val)
{
  return ('string' === typeof val && gen_vars.hasOwnProperty(val))
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
	// console.log('apply_gen_instruction id', id, 'inst', inst)
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
			//console.log(' here, option_values', option_values, 'correct_option_value', correct_option_value)
			for (let i = 0; i < 4; ++i) {
				gen_vars['option_' + i] = option_values[i][0]
			}
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
				let vals0 = vals[0], vals1 = vals[1]
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
				// console.log(' gen', id, 'equal', gen_vars[id])
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

	// move restrictions to the end, and binary ops just before
	let restrict = [],
		binary = [],
		option = [],
		all = []
	for (const id in c) {
		// console.log('  id', id)
		if (c.hasOwnProperty(id)) {
			let words = 'string' === typeof c[id] ? c[id].split(' ') : null
			if (id.startsWith('restriction_')) restrict.push(id)
			else if (id.startsWith('option_')) option.push(id)
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
	all = all.concat(restrict)
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
		for (const id of all) {
			//console.log('id', id)
			const inst = c[id]
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
						c[id],
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
						c[id],
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
		for (let i = 0; i < option_values.length; ++i) {
			if (approx_equal(correct_option_value[0], option_values[i][0])) {
				action_list.push(Actions.setProp('correct_option_index', i))
				// console.log('correct_option_index', i)
			}
		}
	}
	if (i >= max_i) {
		console.error('could not generate successfully!')
	}
	return gen_vars
}
