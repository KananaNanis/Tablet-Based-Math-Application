import { List } from 'immutable'
import { doAction, config_tree, global_constant } from '../App'
import {
  query_path, query_prop, height2tower_name,
  tower_name2height, query_test } from './query_store'
import { update_keypad_button_visibility } from '../event/dispatcher'
import { pick_from_range, pick_from_list, pick_animal_name, from_uniform_range } from '../containers/generate'
import { global_screen_width, global_workspace_height } from '../components/Workspace'
import { get_block_size_from_group } from '../components/Block'

const deep_clone = (obj) => JSON.parse(JSON.stringify(obj))

const attach_properties = (to, from) => {
  for (const key in from)
    to[key] = deep_clone(from[key])
}

export function get_config(path) {
  if (!List.isList(path))
    console.error('Error:  expecting a List!', path)
  //const path = path0.toJS()
  let tree_loc = config_tree;
  let res = deep_clone(tree_loc.params)
  // console.log('tree_loc', tree_loc)
  // console.log('init res ', res)
  //console.log('get_config path.size', path.size)
  for (var i = 0; i < path.size; ++i) {
    tree_loc = tree_loc[path.get(i)]
    if (tree_loc) {
      for (const category in tree_loc.params) {
        if (!res.hasOwnProperty(category)) {
          res[category] = deep_clone(tree_loc.params[category])
        } else {
          if ('create' == category || 'modify' == category) {
            // consider the ids one by one
            for (const id in tree_loc.params[category]) {
              const subtree = tree_loc.params[category][id]
              if (subtree && 'remove' === subtree) {
                delete res['create'][id]
                delete res['modify'][id]
              } else if (!res[category].hasOwnProperty(id))
                res[category][id] = deep_clone(subtree)
              else
                attach_properties(res[category][id], subtree)
            }
          } else {
            attach_properties(res[category], tree_loc.params[category])
          }
        }
      }
    }
  }
  //console.log('get_config path', path.toJS(), 'res', res)
  return res
}

export function as_position(pos_info, width = 0, height = 0) {
  let res = [0, 0]
  for (const i = 0; i < 2; ++i) {
    if ('number' === typeof pos_info[i]) res[i] = pos_info[i]
    else if ('string' === typeof pos_info[i]) {
      let val = pos_info[i]
      let swap_sides = false
      if (val.startsWith('left ')) val = val.slice(5)  // ignore
      else if (val.startsWith('bottom ')) val = val.slice(7)  // ignore
      else if (val.startsWith('right ')) {
        val = val.slice(6)
        swap_sides = 'right'
      } else if (val.startsWith('top ')) {
        val = val.slice(4)
        swap_sides = 'top'
      }
      if (val.endsWith('vw'))
        val = global_screen_width * (+val.slice(0, -2)) / 100.
      else if (val.endsWith('vh'))
        val = global_workspace_height * (+val.slice(0, -2)) / 100.
      if ('right' == swap_sides) {
        val = global_screen_width - width - val
      } else if ('top' == swap_sides) {
        val = global_workspace_height - height - val
      }
      if ('center' == val) {
        if (0 == i) val = (global_screen_width - width) / 2.
        else val = (global_workspace_height - height) / 2
      }
      res[i] = +val
    }
  }
  //console.log('as_position pos_info', pos_info, 'res', res)
  return res
}

export function width_pixels_from_name(name, scale_factor) {
  if (!name) return 0
  if (global_constant.animals.hasOwnProperty(name)) {
    const a = global_constant.animals[name]
    //console.log('width_pixels_from_name name', name, 'scale_factor', scale_factor)
    return scale_factor * a.height * a.pixel_width / a.pixel_height
  } else if (name.length >= 1) {
    const group = name[0]
    const size = get_block_size_from_group(group)
    scale_factor = scale_factor || query_prop('scale_factor')
    return scale_factor * global_constant.tower.size2depth[size]
  }
  return 0
}

export function height_pixels_from_name(name, scale_factor) {
  if (!name) return 0.0
  if (global_constant.animals.hasOwnProperty(name)) {
    const a = global_constant.animals[name]
    return scale_factor * a.height
  } else {
    scale_factor = scale_factor || query_prop('scale_factor')
    return scale_factor * tower_name2height(name, scale_factor)
  }
}

function do_timed_action(id, key, val) {
  // handle the following:
  // appear_after: 2000,
  // start_fade: 2500, end_fade: 3000
  let delay = val
  if ('appear_after' == key) doAction.setOpacity(id, 0);
  if ('fade_anim' == key) delay = val.start
  window.setTimeout(function () {
    if ('appear_after' == key) doAction.setOpacity(id, 1.0)
    else if ('fade_anim' == key) {
      doAction.setAnimInfo(id, { 'fade_duration': val.duration })
    }
  }, delay)
}

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

function generate_with_restrictions(c) {
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
          gen_vars[id] = from_uniform_range(inst[1], inst[2])
        } else if ('pick_animal_name' == inst[0]) {
          gen_vars[id] = pick_animal_name()
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

export function enter_exit_config(enter, verbose) {
  const cp = query_path('config')
  //console.log('cp', cp)
  const config = get_config(cp)
  if (verbose) console.log('enter_exit_config config ', config)
  // let's handle the various parts of the config one at a time
  let sc = global_constant.scale_factor_from_yaml  // may not be available
  const gen_vars = enter ? generate_with_restrictions(config['generate']) : {}
  if (config['create']) {
    const c = config['create']
    for (const id in c) {
      if ('button_submit' == id) doAction.setButtonDisplay('submit', enter ? true : null)
      else if ('button_delete' == id) doAction.setButtonDisplay('delete', enter ? true : null)
      else if ('button_next' == id) doAction.setButtonDisplay('next', enter ? true : null)
      else if ('center_text' == id) doAction.setProp('center_text', enter ? c[id] : null)
      else if ('err_box' == id) doAction.setErrBox(enter ? { 'show': true } : null)
      else if ('keypad_kind' == id) {
        doAction.setKeypadKind(enter ? c[id] : null)
        if ('buildTower' == c[id]) {
          update_keypad_button_visibility(null, null, null)
        }
      } else if (id.startsWith('tower_') || id.startsWith('tile_') || id.startsWith('door_') || id.startsWith('portal_')) {
        // assert: we have necessary info in the 'modify' area
        let name = null
        if (enter) {
          name = c[id]
          if ('object' == typeof name && name['name'])
            name = name['name']
          if (Array.isArray(name)) {
            for (const i = 0; i < name.length; ++i) {
              if (gen_vars.hasOwnProperty(name[i]))
                name[i] = gen_vars[name[i]]
            }
          } else {
            if (gen_vars.hasOwnProperty(name))
              name = gen_vars[name]
          }
        }
        if (id.startsWith('tower_')) {
          if (enter) {
            if ('number' == typeof name)
              name = height2tower_name(name)
            const w = width_pixels_from_name(name, sc)
            const h = height_pixels_from_name(name, sc)
            doAction.towerCreate(id, name,
              as_position(config['modify'][id]['position'], w, h))
          } else {
            //console.log('deleting', id)
            doAction.towerDelete(id)
          }
        } else if (id.startsWith('tile_')) {
          if (enter) {
            const w = width_pixels_from_name(name, sc)
            const h = height_pixels_from_name(name, sc)
            doAction.tileCreate(id, name,
              as_position(config['modify'][id]['position'], w, h))
          } else doAction.tileDelete(id)
        } else if (id.startsWith('door_')) {
          if (enter) {
            doAction.doorCreate(id, name,
              as_position(config['modify'][id]['position']))
          } else doAction.doorDelete(id)
        } else if (id.startsWith('portal_')) {
          if (enter) {
            //console.log('reading a portal')
            doAction.portalCreate(id, name,
              as_position(config['modify'][id]['position']))
          } else doAction.portalDelete(id)
        }
      }
    }
  }
  if (config['modify']) {
    const c = config['modify']
    for (const id in c) {
      for (const key in c[id]) {
        if (['appear_after', 'fade_anim'].includes(key)) {
          do_timed_action(id, key, c[id][key])
        } else if ('style' == key) {
          let props = c[id][key]
          for (const key2 in props)
            doAction.addObjStyle(id, key2, enter ? props[key2] : null)
        } else if ('misc' == key) {
          let props = c[id][key]
          for (const key2 in props) {
            const val2 = enter ? props[key2] : null
            // console.log('misc id', id, 'key2', key2, 'val2', val2)
            doAction.addObjMisc(id, key2, val2)
          }
        } else if (id.startsWith('tower_') || id.startsWith('tile_')) {
          if ('width' == key) {
            if (enter) {
              let val = c[id][key]
              if ('string' === typeof val && val.endsWith('vw'))
                val = global_screen_width * (+val.slice(0, -2)) / 100.
              doAction.towerSetWidth(id, val)
            } else doAction.towerSetWidth(id, null)
          } else if ('overflow' == key)
            doAction.towerSetOverflow(id, enter ? c[id][key] : null)
        }
      }
    }
  }
  if (config['event_handling']) {
    const c = config['event_handling']
    for (const key in c) {
      doAction.setEventHandlingParam(key, enter ? c[key] : null)
    }
  }
  if (config['misc']) {
    const c = config['misc']
    for (const key in c) {
      if ('config_iteration' == key) {
        let iter_val = c[key]
        if (0 == iter_val || !enter) iter_val = null
        doAction.setProp('config_iteration', iter_val)
      } else if ('goto_config' == key) {
        // this attribute is special:  it is not erased at the end!
        if (enter) {
          const iter = query_prop('goto_iteration')
          if (iter == null || !(iter > 0)) {
            console.log('iter was', iter, 'setting goto iteration', c[key][0], 'path', c[key][1])
            doAction.setProp('goto_iteration', c[key][0])
          } else {
            console.log('skipping setting iteration, iter', iter)
          }
        }
        doAction.setPath('goto', enter ? c[key][1] : null)
      } else if ('num_stars' == key)
        doAction.setProp('num_stars', enter ? c[key] : null)
      else if ('skip_submit' == key)
        doAction.setProp('skip_submit', enter ? c[key] : null)
      else if ('skip_in_between' == key)
        doAction.setProp('skip_in_between', enter ? c[key] : null)
    }
  }
  // query_test()
}

export function transition_to_next_config() {
  doAction.clearEventHandling()
  if ('in_between' === query_path('config').get(0)) {  // special case
    enter_exit_config(false)
    const prev_path = query_path('prev_config')
    const new_path = next_config_path(prev_path)
    console.log('transition_to_next_config', new_path)
    doAction.addLogEntry(Date.now(), [new_path, 'next_config', 'start'])
    doAction.setPath('config', new_path)
    enter_exit_config(true)
  } else if (query_path('goto') != null && query_prop('goto_iteration') > 1) {
    // possibly jump directly to some other path
    const iter = query_prop('goto_iteration')
    const new_path = query_path('goto')
    doAction.addLogEntry(Date.now(), [query_path('config').toJS(), 'next_config', iter])
    enter_exit_config(false)
    doAction.setPath('prev_config', query_path('config'))
    console.log('new_path', new_path)
    doAction.setPath('config', new_path)
    enter_exit_config(true)
    doAction.setProp('goto_iteration', iter - 1)
  } else if (query_prop('config_iteration') > 1) {
    const iter = query_prop('config_iteration')
    doAction.addLogEntry(Date.now(), [query_path('config').toJS(), 'next_config', iter])
    enter_exit_config(true)
    doAction.setProp('config_iteration', iter - 1)
    /*
    doAction.setName('tile_1', pick_animal_name())
    doAction.setName('tower_2', []);
    update_keypad_button_visibility(null, null, null)

    doAction.setName('tower_1',
      tower_exercise_list[exercise_index])
    exercise_index = (exercise_index + 1) % tower_exercise_list.length;
    doAction.setName('tower_2', []);
    update_keypad_button_visibility(null, null, null)
    */
  } else if (query_prop('skip_in_between')) {
    enter_exit_config(false)
    const curr_path = query_path('config')
    const new_path = next_config_path(curr_path)
    doAction.setPath('prev_config', curr_path)
    doAction.setPath('config', new_path)
    enter_exit_config(true)
  } else {
    enter_exit_config(false)
    doAction.setPath('prev_config', query_path('config'))
    doAction.setPath('config', ['in_between'])
    enter_exit_config(true)
  }
}

export function first_config_path(starter) {
  let res = starter ? starter : []
  let tree_loc = config_tree;
  if (starter) {  // move down to the implied node, first!
    for (const i = 0; i < starter.length; ++i)
      tree_loc = tree_loc[starter[i]]
  }
  while (('object' === typeof tree_loc) &&
    (null !== tree_loc) &&
    (Object.keys(tree_loc).length > 1)) {
    if ("params" !== Object.keys(tree_loc)[0]) {
      console.error("Error in first_config_path: first key not 'params'")
      break
    }
    var k2 = Object.keys(tree_loc)[1]
    res.push(k2)
    tree_loc = tree_loc[k2]
  }
  //console.log('first_config_path res', res)
  return res
}

export function next_config_path(path) {
  let res = null
  let tree_loc = config_tree;
  // find the lowest node at which the path does not take the last option
  for (const i = 0; i < path.size; ++i) {
    const k = Object.keys(tree_loc)
    if (k.indexOf(path.get(i)) + 1 < k.length) {
      res = []
      for (const j = 0; j < i; ++j)
        res.push(path.get(j))
      res.push(k[k.indexOf(path.get(i)) + 1])
      // now find the longest continuation of this path
      res = first_config_path(res)
    }
    tree_loc = tree_loc[path.get(i)]
  }
  //console.log('next_config_path res', res)
  return res
}