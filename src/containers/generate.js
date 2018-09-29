import {global_constant, doAction} from '../App'
import {
	pick_from_list,
	pick_from_range,
	from_uniform_range,
	pick_animal_name,
} from './gen_utile'
import {query_prop} from '../providers/query_store'

function find_gen_values_for_words(words, gen_vars) {
	let res = words.slice()
	for (const j = 0; j < res.length; ++j) {
		if (gen_vars.hasOwnProperty(res[j])) res[j] = gen_vars[res[j]]
		if (global_constant.animals.hasOwnProperty(res[j]))
			res[j] = global_constant.animals[res[j]].height
		if ('string' === typeof res[j]) res[j] = +res[j]
	}
	return res
}

function is_binary_op(s) {
	return '+' === s || '-' === s || '*' === s || '/' === s
}

function swap_in_array(arr, i, j) {
	var tmp = arr[i]
	arr[i] = arr[j]
	arr[j] = tmp
}

export function permute_array_elements(arr) {
	for (var i = arr.length - 1; i > 0; --i) {
		var j = Math.floor((i + 1) * Math.random())
		// assert(j < arr.length);
		swap_in_array(arr, i, j)
	}
}

function generate_option_values(inst, option_delta, option_values) {
	option_values.length = 0
	let offset = Math.floor(4 * Math.random())
	for (const i = 0; i < 4; ++i)
		option_values.push([inst + (i - offset) * option_delta])
	permute_array_elements(option_values)
	return option_values
}

let gen_vars = {}

function apply_gen_instruction(
	id,
	inst,
	option_delta,
	option_values,
	correct_option_value,
) {
	let ok = true
	let verbose = false
	//console.log('apply_gen_instruction id', id, 'inst', inst)
	if (id.startsWith('option_')) {
		if ('option_value_delta' == id) {
			option_delta = +inst
			//console.log('option_delta', option_delta)
		} else if ('option_value_seed' == id) {
			// actually generate options
			if ('string' === typeof inst)
				inst = find_gen_values_for_words([inst], gen_vars)[0]
			correct_option_value[0] = inst
			generate_option_values(inst, option_delta, option_values)
			// console.log(' here, option_values', option_values, 'correct_option_value', correct_option_value)
			for (const i = 0; i < 4; ++i)
				gen_vars['option_' + i] = option_values[i][0]
		}
	} else if (id.startsWith('restriction_')) {
		if (inst) {
			const words = inst.split(' ')
			//console.log('in restriction, id', id, 'words', words)
			if (3 == words.length && ('<' === words[1] || '>' === words[1])) {
				//if (verbose) console.log(id, 'words', words)
				let vals = find_gen_values_for_words([words[0], words[2]], gen_vars)
				if ('option' == words[0]) {
					// this is actually a 4-fold restriction
					for (const i = 0; i < 4; ++i) {
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
		if ('pick_from_list' == inst[0]) {
			gen_vars[id] = pick_from_list(inst[1], gen_vars[id])
		} else if ('pick_from_range' == inst[0]) {
			gen_vars[id] = pick_from_range(
				inst[1],
				inst[2],
				inst[3] ? inst[3] : 1,
				gen_vars[id],
			)
		} else if ('uniform' == inst[0]) {
			gen_vars[id] = from_uniform_range(inst[1], inst[2], gen_vars[id])
		} else if ('pick_animal_name' == inst[0]) {
			gen_vars[id] = pick_animal_name(gen_vars[id])
		} else if ('fixed' == inst[0]) {
			gen_vars[id] = inst[1]
		} else {
			console.error(
				'Warning:  unrecognized generate array instruction.',
				id,
				inst,
			)
		}
	} else if ('string' === typeof inst) {
		const words = inst.split(' ')
		if (2 == words.length && 'height_from_animal' == words[0]) {
			let animal_name = gen_vars[words[1]]
			let h = global_constant.animals[animal_name].height
			// console.log('animal_name', animal_name, 'h', h)
			gen_vars[id] = h
		} else if (3 == words.length && is_binary_op(words[1])) {
			let vals = find_gen_values_for_words([words[0], words[2]], gen_vars)
			if ('+' === words[1]) {
				gen_vars[id] = vals[0] + vals[1]
			} else if ('-' === words[1]) {
				gen_vars[id] = vals[0] - vals[1]
			} else if ('*' === words[1]) {
				gen_vars[id] = vals[0] * vals[1]
			} else if ('/' === words[1]) {
				gen_vars[id] = vals[0] / vals[1]
			}
			//console.log('id', id, 'words', words, 'vals', vals, 'gen_vars[id]', gen_vars[id])
		} else {
			console.error(
				'Warning:  unrecognized generate string instruction.',
				id,
				inst,
			)
		}
	} else {
		console.error('Warning:  unrecognized generate instruction.', id, inst)
	}
	return ok
}

export function generate_with_restrictions(c, curr_exercise = 0) {
	const verbose = false

	// move restrictions to the end, and binary ops just before
	let restrict = [],
		binary = [],
		option = [],
		all = []
	for (const id in c) {
		let words = 'string' == typeof c[id] ? c[id].split(' ') : null
		if (id.startsWith('restriction_')) restrict.push(id)
		else if (id.startsWith('option_')) option.push(id)
		else if (words && 3 == words.length && is_binary_op(words[1]))
			binary.push(id)
		else all.push(id)
	}
	all = all.concat(binary)
	all = all.concat(option)
	all = all.concat(restrict)
	if (verbose) console.log('reordered all', all)

	// try to create a valid set of values, and then check restrictions
	let i,
		max_i = 100
	// option_values and correct_option_value are effectively pass-by-reference
	let option_delta = 0.1,
		option_values = [],
		correct_option_value = []
	for (i = 0; i < max_i; ++i) {
		let ok = true
		for (const id of all) {
			//console.log('id', id)
			const inst = c[id]
			if (!Array.isArray(inst) && 'object' === typeof inst) {
				// apply restrictions to the use of some instructions
				for (var key in inst) {
					if (key.startsWith('exercise')) {
						// only this exercise!
						const ex = +key.substr(8)
						// let curr = query_prop('config_iteration')
						//if (!curr) curr = 0
						if (ex == curr_exercise) {
							ok =
								ok &&
								apply_gen_instruction(
									id,
									inst[key],
									option_delta,
									option_values,
									correct_option_value,
								)
							if (verbose)
								console.log('ex', ex, 'curr', curr_exercise, 'inst', inst[key])
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
					)
				if (verbose)
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
		if (verbose) console.log(gen_vars)
		if (ok) break
	}
	// console.log('option_values', option_values)
	if (option_values.length > 0) {
		doAction.setOptionValues(option_values)
		// console.log('correct_option_value', correct_option_value)
		// console.log('option_values', option_values)
		for (const i = 0; i < 4; ++i) {
			if (correct_option_value[0] == option_values[i][0]) {
				doAction.setProp('correct_option_index', i)
				// console.log('correct_option_index', i)
			}
		}
	}
	if (i >= max_i) {
		console.error('could not generate successfully!')
	}
	return gen_vars
}
