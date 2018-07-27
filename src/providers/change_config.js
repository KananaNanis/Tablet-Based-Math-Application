import { doAction, config_tree, global_constant } from '../App'
import { query_config_path, query_config_iteration, height2tower_name, query_prev_config_path, query_scale_factor, tower_name2height } from './query_store'
import { update_keypad_button_visibility } from '../event/dispatcher'
import { pick_from_range, pick_from_list, pick_animal_name } from '../containers/generate'
import { global_screen_width, global_workspace_height } from '../components/Workspace'
import { get_block_size_from_group } from '../components/Block'

const deep_clone = (obj) => JSON.parse(JSON.stringify(obj))

const attach_properties = (to, from) => {
  for (const key in from)
    to[key] = deep_clone(from[key])
}

export function get_config(path) {
  let tree_loc = config_tree;
  let res = deep_clone(tree_loc.params)
  // console.log('tree_loc', tree_loc)
  // console.log('init res ', res)
  for (var i = 0; i < path.length; ++i) {
    tree_loc = tree_loc[path[i]]
    if (tree_loc) {
      for (const category in tree_loc.params) {
        if (!res.hasOwnProperty(category)) {
          res[category] = deep_clone(tree_loc.params[category])
        } else {
          if ('create' == category || 'modify' == category) {
            // consider the ids one by one
            for (const id in tree_loc.params[category]) {
              if (!res[category].hasOwnProperty(id))
                res[category][id] = deep_clone(tree_loc.params[category][id])
              else
                attach_properties(res[category][id], tree_loc.params[category][id])
            }
          } else {
            attach_properties(res[category], tree_loc.params[category])
          }
        }
      }
    }
  }
  //console.log('get_config path', path, 'res', res)
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
    console.log('width_pixels_from_name name', name,
      'scale_factor', scale_factor)
    return scale_factor * a.height * a.pixel_width / a.pixel_height
  } else if (name.length >= 1) {
    const group = name[0]
    const size = get_block_size_from_group(group)
    scale_factor = scale_factor || query_scale_factor()
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
    scale_factor = scale_factor || query_scale_factor()
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
      doAction.setAnimInfo(id, {'fade_duration': val.duration} )
    }
  }, delay)
}

export function enter_exit_config(enter, verbose) {
  const cp = query_config_path();
  const config = get_config(cp)
  if (verbose) console.log('enter_exit_config config ', config)
  // let's handle the various parts of the config one at a time
  let gen_vars = {}
  let sc = global_constant.scale_factor_from_yaml  // may not be available
  if (config['generate'] && enter) {
    const c = config['generate']
    for (const id in c) {
      const inst = c[id]
      if ('pick_from_list' == inst[0]) {
        gen_vars[id] = pick_from_list(inst, gen_vars[id], true)
      } else if ('pick_from_range' == inst[0]) {
        gen_vars[id] = pick_from_range(inst[1], inst[2],
          inst[3] ? inst[3] : 1, gen_vars[id])
      } else if ('pick_animal_name' == inst[0]) {
        //tile_1_name: [pick_animal_name]
        gen_vars[id] = pick_animal_name()
      }
    }
  }
  if (config['create']) {
    const c = config['create']
    for (const id in c) {
      if ('button_submit' == id) doAction.setButtonDisplay('submit', enter ? true : null)
      else if ('button_delete' == id) doAction.setButtonDisplay('delete', enter ? true : null)
      else if ('button_next' == id) doAction.setButtonDisplay('next', enter ? true : null)
      else if ('center_text' == id) doAction.setCenterText(enter ? c[id] : null)
      else if ('keypad_kind' == id) {
        doAction.setKeypadKind(enter ? c[id] : null)
        if ('buildTower' == c[id]) {
          update_keypad_button_visibility(null, null, null)
        }
      } else if (id.startsWith('tower_') || id.startsWith('tile_')) {
        // assert: we have necessary info in the 'modify' area
        let name = null
        if (enter) {
          name = c[id]
          if ('object' == typeof name && name['name'])
            name = name['name']
          if (gen_vars.hasOwnProperty(name))
            name = gen_vars[name]
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
        } else {
          if (enter) {
            const w = width_pixels_from_name(name, sc)
            const h = height_pixels_from_name(name, sc)
            doAction.tileCreate(id, name,
              as_position(config['modify'][id]['position'], w, h))
          } else doAction.tileDelete(id)
        }
      }
    }
  }
  if (config['modify']) {
    const c = config['modify']
    for (const id in c) {
      if (id.startsWith('tower_') || id.startsWith('tile_')) {
        for (const key in c[id]) {
          if ('width' == key) {
            if (enter) {
              let val = c[id][key]
              if ('string' === typeof val && val.endsWith('vw'))
                val = global_screen_width * (+val.slice(0, -2)) / 100.
              doAction.towerSetWidth(id, val)
            } else doAction.towerSetWidth(id, null)
          } else if ('overflow' == key)
            doAction.towerSetOverflow(id, enter ? c[id][key] : null)
          else if (['appear_after', 'fade_anim'].includes(key))
            do_timed_action(id, key, c[id][key])
        }
      }
    }
  }
  if (config['events']) {
    const c = config['events']
  }
  if (config['misc']) {
    const c = config['misc']
    for (const key in config['misc']) {
      if ('config_iteration' == key) doAction.setConfigIteration(enter ? c[key] : null)
      else if ('num_stars' == key) doAction.setNumStars(enter ? c[key] : null)
    }
  }
  //query_test()
}

export function transition_to_next_config() {
  if ('in_between' === query_config_path()[0]) {  // special case
    enter_exit_config(false)
    const prev_path = query_prev_config_path()
    const new_path = next_config_path(prev_path)
    console.log('transition_to_next_config', new_path)
    doAction.setConfigPath(new_path)
    enter_exit_config(true)
  } else if (query_config_iteration() > 1) {
    const iter = query_config_iteration()
    enter_exit_config(true)
    doAction.setConfigIteration(iter - 1)
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
  } else {
    enter_exit_config(false)
    doAction.setPrevConfigPath(query_config_path())
    doAction.setConfigPath(['in_between'])
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
  for (const i = 0; i < path.length; ++i) {
    const k = Object.keys(tree_loc)
    if (k.indexOf(path[i]) + 1 < k.length) {
      res = []
      for (const j = 0; j < i; ++j)
        res.push(path[j])
      res.push(k[k.indexOf(path[i]) + 1])
      // now find the longest continuation of this path
      res = first_config_path(res)
    }
    tree_loc = tree_loc[path[i]]
  }
  //console.log('next_config_path res', res)
  return res
}