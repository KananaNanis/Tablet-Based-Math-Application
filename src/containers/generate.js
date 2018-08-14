import { global_constant } from "../App";
import { pick_from_list, pick_from_range, from_uniform_range, pick_animal_name } from "./gen_utile";

function find_gen_values_for_words(words, gen_vars) {
  let res = words.slice()
  for (const j = 0; j < res.length; ++j) {
    if (gen_vars.hasOwnProperty(res[j]))
      res[j] = gen_vars[res[j]]
    if (global_constant.animals.hasOwnProperty(res[j]))
      res[j] = global_constant.animals[res[j]].height
  }
  return res
}

function is_binary_op(s) {
  return '+' === s || '-' === s || '*' === s || '/' === s
}

export function generate_with_restrictions(c) {
  const verbose = false

  let gen_vars = {}
  // move restrictions to the end, and binary ops just before
  let restrict = [], binary = [], all = []
  for (const id in c) {
    let words = ('string' == typeof c[id]) ? c[id].split(' ') : null
    if (id.startsWith('restriction_')) restrict.push(id)
    else if (words && 3 == words.length && is_binary_op(words[1]))
      binary.push(id)
    else all.push(id)
  }
  all = all.concat(binary)
  all = all.concat(restrict)

  // try to create a valid set of values, and then check restrictions
  let i, max_i = 100
  for (i = 0; i < max_i; ++i) {
    let ok = true
    for (const id of all) {
      //console.log('id', id)
      const inst = c[id]
      if (id.startsWith('restriction_')) {
        const words = inst.split(' ')
        if (3 == words.length && '<' === words[1]) {
          //if (verbose) console.log(id, 'words', words)
          let vals = find_gen_values_for_words([words[0], words[2]], gen_vars)
          if (vals[0] >= vals[1]) ok = false
          if (verbose) console.log('vals', vals, 'ok', ok)
        } else if (3 == words.length && '>' === words[1]) {
          //if (verbose) console.log(id, 'words', words)
          let vals = find_gen_values_for_words([words[0], words[2]], gen_vars)
          if (vals[0] <= vals[1]) ok = false
          if (verbose) console.log('vals', vals, 'ok', ok)
        } else {
          console.error('Warning:  unrecognized generate restriction.', id, inst)
        }
      } else if (Array.isArray(inst)) {
        if ('pick_from_list' == inst[0]) {
          gen_vars[id] = pick_from_list(inst, gen_vars[id], true)
        } else if ('pick_from_range' == inst[0]) {
          gen_vars[id] = pick_from_range(inst[1], inst[2],
            inst[3] ? inst[3] : 1, gen_vars[id])
        } else if ('uniform' == inst[0]) {
          gen_vars[id] = from_uniform_range(inst[1], inst[2], gen_vars[id])
        } else if ('pick_animal_name' == inst[0]) {
          gen_vars[id] = pick_animal_name()
        } else if ('fixed' == inst[0]) {
          gen_vars[id] = inst[1]
        } else {
          console.error('Warning:  unrecognized generate array instruction.', id, inst)
        }
      } else if ('string' === typeof inst) {
        const words = inst.split(' ')
        if (3 == words.length && '+' === words[1]) {
          let vals = find_gen_values_for_words([words[0], words[2]], gen_vars)
          gen_vars[id] = vals[0] + vals[1]
        } else if (3 == words.length && '*' === words[1]) {
          let vals = find_gen_values_for_words([words[0], words[2]], gen_vars)
          gen_vars[id] = vals[0] * vals[1]
          //console.log('id', id, 'words', words, 'vals', vals, 'gen_vars[id]', gen_vars[id])
        } else {
          console.error('Warning:  unrecognized generate string instruction.', id, inst)
        }
      } else {
        console.error('Warning:  unrecognized generate instruction.', id, inst)
      }
    }
    if (verbose) console.log(gen_vars)
    if (ok) break
  }
  if (i >= max_i) {
    console.error('could not generate successfully!')
  }
  return gen_vars
}