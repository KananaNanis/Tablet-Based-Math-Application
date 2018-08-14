import { List } from 'immutable'
import { doAction, config_tree, global_constant } from '../App'
import { query_path, query_prop,
  tower_name2height, query_test } from './query_store'
import { global_screen_width, global_workspace_height } from '../components/Workspace'
import { get_block_size_from_group } from '../components/Block'
import { enter_exit_config } from './enter_exit';

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
    enter_exit_config(false)
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