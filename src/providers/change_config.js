import { doAction, config_tree } from '../App'
import { query_config_path, query_config_iteration, height2tower_name, query_prev_config_path } from './query_store'
import { update_keypad_button_visibility } from '../event/dispatcher';
import { pick_from_range, pick_from_list, pick_animal_name } from '../containers/generate';

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

export function enter_exit_config(enter) {
  const cp = query_config_path();
  const config = get_config(cp)
  //console.log('config', config)
  if (1) {
    // let's handle the various parts of the config one at a time
    let gen_vars = {}
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
              doAction.towerCreate(id, name, config['modify'][id]['position'])
            } else {
              //console.log('deleting', id)
              doAction.towerDelete(id)
            }
          } else {
            if (enter) {
              doAction.tileCreate(id, name, config['modify'][id]['position'])
            } else doAction.tileDelete(id)
          }
        }
      }
    }
    if (config['modify']) {
      const c = config['modify']
      for (const id in c) {
        if (id.startsWith('tower_')) {
          for (const key in c[id]) {
            if ('width' == key) doAction.towerSetWidth(id, enter ? c[id][key] : null)
            else if ('overflow' == key) doAction.towerSetOverflow(id, enter ? c[id][key] : null)
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
  }
  if (0) {
    if ('in_between' == cp[0]) {
      doAction.setButtonDisplay('next', enter ? true : null)
    } else if ('measure_height' == cp[0]) {
      // levels that are a variation on copy_tower
      doAction.setConfigIteration(2)  // 2 exercises
      doAction.setKeypadKind(enter ? 'buildTower' : null)
      doAction.setNumStars(enter ? 3 : 0)
      doAction.setButtonDisplay('submit', enter ? true : null)
      if (enter) doAction.towerCreate('tower_2', [], [180, 0])
      else doAction.towerDelete('tower_2')
      //doAction.setButtonDisplay('delete', enter ? true : null)
      if ('copy_tower' == cp[1]) {
        if (enter) {
          doAction.towerCreate('tower_1', [.2], [5, 0])
          doAction.towerSetWidth('tower_1', 150)
          doAction.towerSetOverflow('tower_1', 'hidden')
        } else {
          doAction.towerDelete('tower_1')
        }
      } else if ('animal_height' == cp[1]) {
        if (enter) {
          doAction.tileCreate('tile_1', 'kitty', [-300, 0])
        } else {
          doAction.tileDelete('tile_1')
        }
      }
      update_keypad_button_visibility(null, null, null)
    }
    //query_test()
  }
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
      res.push(k[k.indexOf(path[i])+1])
      // now find the longest continuation of this path
      res = first_config_path(res)
    }
    tree_loc = tree_loc[path[i]]
  }
  //console.log('next_config_path res', res)
  return res
}