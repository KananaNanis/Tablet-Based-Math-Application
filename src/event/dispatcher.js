import {
  query_keypad_kind, query_visible_buttons, query_tower_name, query_top_block, query_num_stars, query_name_of_tile,
  query_tower_height, query_config_path, query_config_iteration, query_scale_factor, query_freeze_display, height2tower_name
} from '../providers/query_store'
import { get_button_geoms_for } from '../components/Keypad'
import { global_workspace_height } from '../components/Workspace'
import { doAction, global_sound, global_constant } from '../App'
import { transition_to_next_config } from '../providers/change_config'
import { get_block_size_from_group, get_how_many_from_group, get_is_fiver_from_group } from '../components/Block'

export function pointIsInRectangle(point, geom, offset = [0, 0]) {
  return (geom.position[0] + offset[0]) <= point[0] &&
    point[0] <= (geom.position[0] + offset[0] + geom.width) &&
    (geom.position[1] + offset[1]) <= point[1] &&
    point[1] <= (geom.position[1] + offset[1] + geom.height)
}

function approx_equal(x, y, thresh = 1e-08) {
  return Math.abs(x - y) < thresh;
}

function namesAreIdentical(name1, name2) {
  if (name1.length != name2.length) return false;
  for (const i = 0; i < name1.length; ++i)
    if (!approx_equal(name1[i], name2[i])) return false;
  return true;
}

function towersHaveIdenticalNames(num_id1, num_id2) {
  const name1 = query_tower_name(num_id1)
  const name2 = query_tower_name(num_id2)
  return namesAreIdentical(name1, name2)
}

function expand_into_units(name) {
  let res = []
  for (const i = 0; i < name.length; ++i) {
    const size = get_block_size_from_group(name[i])
    const how_many = get_how_many_from_group(name[i])
    if (get_is_fiver_from_group(name[i])) {
      res.push(name[i])
    } else {
      for (const j = 0; j < how_many; ++j)
        res.push(10 ** size)
    }
  }
  return res
}

function correct_next_button() {
  const verbose = false
  let expand = false
  let correct, curr, res = null
  const cp = query_config_path()
  //console.log('correct_next_button cp', cp)
  if (cp[1].startsWith('copy_tower')) {
    correct = query_tower_name('tower_1')
    curr = query_tower_name('tower_2')
    expand = true
  } else if (cp[1].startsWith('animal_height')) {
    const animal_name = query_name_of_tile('tile_1')
    const height = global_constant.animals[animal_name].height
    correct = height2tower_name(height)
    //console.log('animal_name', animal_name, 'correct', correct)
    curr = query_tower_name('tower_2')
    expand = true
  } else {
    console.warn('Warning in correct_next_button: config_path', cp)
  }
  if (expand) {
    correct = expand_into_units(correct)
    curr = expand_into_units(curr)
  }
  if (curr.length > correct.length) {
    console.warn('Warning in correct_next_button:  curr len ' + curr.length
      + ' is > correct len ' + correct.length);
    return false;
  }
  for (var i = 0; i < curr.length; ++i) {
    if (!approx_equal(curr[i], correct[i])) {
      console.log('Warning in correct_next_button:  i ' + i
        + ' curr ' + curr[i] + ' correct ' + correct[i]);
      return false;
    }
  }
  if (curr.length < correct.length) res = correct[curr.length];

  if (verbose) {
    console.log('correct_next_button correct', correct,
      'curr', curr, 'res', res)
  }
  return res;
}

export function update_keypad_button_visibility(size, is_fiver, how_many) {
  //console.log('update_keypad_button_visibility', size, is_fiver, how_many)
  const i_end = global_constant.buildTower_button_info.length
  const require_standard_tower = true;
  for (const i = 0; i < i_end; ++i) {
    const bsize = global_constant.buildTower_button_info[i][0]
    const bfiver = global_constant.buildTower_button_info[i][1]
    let show = (null === size || bsize <= size)
    if (require_standard_tower) {
      if (size == bsize) {
        if (bfiver) show = false
        else if (!is_fiver && how_many > 3) show = false
      }
    }
    if (1) { // hide minis and tinys
      if (bsize < -1) show = false
      if (bsize > 0) show = false
      if (bsize == 0 && bfiver) show = false
    }
    doAction.setButtonDisplay(i, show)
  }
}

let exercise_index = 0;
const tower_exercise_list = [
  [.3],
  [1, .1],
]

function handle_delete_button(state) {
  if ('up' == state) {
    doAction.towerRemoveBlock('tower_2')
    const [size, is_fiver, how_many] = query_top_block('tower_2')
    update_keypad_button_visibility(size, is_fiver, how_many)
  }
}

function handle_next_button(state) {
  if ('up' == state)
    transition_to_next_config()
}

function reduce_num_stars() {
  const curr_num_stars = query_num_stars()
  if (curr_num_stars > 0)
    doAction.setNumStars(curr_num_stars - 1)
}

function answer_is_correct() {
  let res = false
  const cp = query_config_path()
  if (cp[1].startsWith('animal_height')) {
    const name = query_name_of_tile('tile_1')
    if (name) {
      const animal_height = global_constant.animals[name].height
      const tower_2_height = query_tower_height('tower_2')
      //console.log(name, animal_height, tower_2_height)
      res = approx_equal(animal_height, tower_2_height)
    }
  } else if (cp[1].startsWith('copy_tower')) {
    res = towersHaveIdenticalNames('tower_1', 'tower_2')
  } else {
    console.error('unrecognized config path?!')
  }
  return res
}

function incorrect_button_response() {
  reduce_num_stars()
  doAction.setFreezeDisplay(true);
  window.setTimeout(function () {
    doAction.setButtonHighlight(null);
    doAction.setFreezeDisplay(false);
  }, 3000);
}

function handle_submit_button(state) {
  if ('up' == state) {
    if (answer_is_correct()) {
      global_sound['chirp1'].play()
      doAction.setButtonHighlight(null)
      transition_to_next_config()
    } else {
      incorrect_button_response()
    }
  }
}

export function touch_dispatcher(state, x, y, touchID) {
  //console.log('touch_dispatcher state ' + state + ' x ' + x + ' y ' + y + ' touchID ' + touchID)
  if (query_freeze_display()) {  // perhaps allow submit?
    if ('down' == state || 'up' == state) console.log('frozen')
    return;
  }
  const kind = query_keypad_kind()
  //const pos = getPositionInfoForKeypad(kind)
  const pos = global_constant.keypad_info[kind]
  const button_geoms = kind ? get_button_geoms_for(kind) : null
  // console.log('button_geoms', button_geoms)
  let found_one = false
  const visible = query_visible_buttons()
  for (const i of visible) {
    if (global_constant.special_button_geoms.hasOwnProperty(i)) {
      if (pointIsInRectangle([x, y], global_constant.special_button_geoms[i])) {
        found_one = true
        doAction.setButtonHighlight(i)
        if ('submit' === i) handle_submit_button(state)
        else if ('delete' === i) handle_delete_button(state)
        else if ('next' === i) handle_next_button(state)
        else console.warn('touch_dispatcher did not handle', i)
        return
      }
    } else {
      if (pointIsInRectangle([x, y], button_geoms[i], pos.position)) {
        doAction.setButtonHighlight(i)
        found_one = true
        if ('up' == state) {
          const new_size = global_constant.buildTower_button_info[i][0]
          const new_is_fiver = global_constant.buildTower_button_info[i][1]
          const curr = (new_is_fiver ? 5 : 1) * 10 ** new_size;
          const correct = correct_next_button();
          if (curr !== correct) {
            incorrect_button_response()
            return;
          }
          const pixel_height = query_scale_factor() * query_tower_height('tower_2')
          // console.log('pixel_height', pixel_height, 'h', global_workspace_height)
          if (pixel_height < global_workspace_height) {
            doAction.towerAddBlock('tower_2', new_size, new_is_fiver)
            const [size, is_fiver, how_many] = query_top_block('tower_2')
            update_keypad_button_visibility(size, is_fiver, how_many)
          }
        }
      }
    }
  }
  if ('up' == state || !found_one) doAction.setButtonHighlight(null)
}