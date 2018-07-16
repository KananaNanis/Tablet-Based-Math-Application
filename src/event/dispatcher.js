import { query_keypad_kind, query_visible_buttons, query_tower_name, query_top_block, query_num_stars, query_name_of_tile, query_tower_height, query_current_config, query_current_config_iteration, query_scale_factor, query_freeze_display, height2tower_name } from '../providers/query_store'
import { getPositionInfoForKeypad, getButtonGeomsFor, buildTower_button_info } from '../components/Keypad'
import { special_button_names, special_button_geoms, global_screen_height, global_workspace_height } from '../components/Workspace'
import { doAction, global_sound } from '../App'
import { animals } from '../components/Tile';
import { enter_exit_config } from '../providers/change_config'
import { get_block_size_from_group, get_how_many_from_group, get_is_fiver_from_group } from '../components/Block';

export function pointIsInRectangle(point, geom, offset = [0, 0]) {
  return (geom[0] + offset[0]) <= point[0] &&
    point[0] <= (geom[0] + offset[0] + geom[2]) &&
    (geom[1] + offset[1]) <= point[1] &&
    point[1] <= (geom[1] + offset[1] + geom[3])
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
  const verbose = true
  let expand = false
  let correct, curr, res = null
  if ('copy_tower' == query_current_config()) {
    correct = query_tower_name('tower_1')
    curr = query_tower_name('tower_2')
    expand = true
  } else if ('animal_height' == query_current_config()) {
    const animal_name = query_name_of_tile('animal_1')
    const height = animals[animal_name][0]
    correct = height2tower_name(height)
    console.log('animal_name', animal_name, 'correct', correct)
    curr = query_tower_name('tower_2')
    expand = true
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
  const i_end = buildTower_button_info.length
  const require_standard_tower = true;
  for (const i = 0; i < i_end; ++i) {
    const bsize = buildTower_button_info[i][0]
    const bfiver = buildTower_button_info[i][1]
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

export function animal_too_tall(animal_name) {
  const height = animals[animal_name][0]
  const pixels = query_scale_factor() * height
  return pixels > global_workspace_height
}

let animal_chosen = 'kitty'
function choose_random_animal() {
  //console.log('choose_random_animal', Object.keys(animals))
  const animal_names = Object.keys(animals)
  for (const i of Array(10).keys()) {
    const animal_name = animal_names[
      Math.floor(animal_names.length * Math.random())]
    if (animal_name !== animal_chosen &&
      animal_name != 'chimpanzee' &&
      !animal_too_tall(animal_name)) {
      //console.log('choose_random_animal result ', animal_name)
      animal_chosen = animal_name
      return animal_name
    }
  }
  console.warn('choose_random_animal')
  return 'kitty'
}

function handle_delete_button(state) {
  if ('up' == state) {
    doAction.towerRemoveBlock('tower_2')
    const [size, is_fiver, how_many] = query_top_block('tower_2')
    update_keypad_button_visibility(size, is_fiver, how_many)
  }
}

function handle_next_button(state) {
  if ('up' == state) {
    enter_exit_config(false)
    doAction.setCurrentConfig('animal_height')
    enter_exit_config(true)
  }
}

function reduce_num_stars() {
  const curr_num_stars = query_num_stars()
  if (curr_num_stars > 0)
    doAction.setNumStars(curr_num_stars - 1)
}

function handle_submit_button(state) {
  if ('up' == state) {
    if (query_current_config() === 'animal_height') {
      const name = query_name_of_tile('animal_1')
      if (name) {
        const animal_height = animals[name][0]
        const tower_2_height = query_tower_height('tower_2')
        //console.log(name, animal_height, tower_2_height)
        if (approx_equal(animal_height, tower_2_height)) {
          global_sound['chirp1'].play()
          if (query_current_config_iteration() > 1) {
            const iter = query_current_config_iteration()
            doAction.setCurrentConfigIteration(iter - 1)
            doAction.setName('animal_1', choose_random_animal())
            doAction.setName('tower_2', []);
            update_keypad_button_visibility(null, null, null)
          } else {
            enter_exit_config(false)
            doAction.setCurrentConfig('in_between')
            enter_exit_config(true)
          }
        } else {
          reduce_num_stars()
        }
      }
    } else if (query_current_config() === 'copy_tower') {
      if (towersHaveIdenticalNames('tower_1', 'tower_2')) {
        console.log('same')
        global_sound['chirp1'].play()
        if (query_current_config_iteration() > 1) {
          const iter = query_current_config_iteration()
          doAction.setCurrentConfigIteration(iter - 1)
          doAction.setName('tower_1',
            tower_exercise_list[exercise_index])
          exercise_index = (exercise_index + 1) % tower_exercise_list.length;
          doAction.setName('tower_2', []);
          update_keypad_button_visibility(null, null, null)
        } else {
          enter_exit_config(false)
          doAction.setCurrentConfig('in_between')
          enter_exit_config(true)
        }
      } else {
        console.log('different')
        reduce_num_stars()
      }
    } else {
      console.error('unrecognized config?!')
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
  const pos = getPositionInfoForKeypad(kind)
  const button_geoms = getButtonGeomsFor(kind)
  let found_one = false
  const visible = query_visible_buttons()
  for (const i of visible) {
    if (special_button_names.includes(i)) {
      if (pointIsInRectangle([x, y], special_button_geoms[i])) {
        found_one = true
        doAction.setButtonHighlight(i)
        if ('submit' === i) handle_submit_button(state)
        else if ('delete' === i) handle_delete_button(state)
        else if ('next' === i) handle_next_button(state)
        else console.warn('touch_dispatcher did not handle', i)
      }
    } else {
      if (pointIsInRectangle([x, y], button_geoms[i], pos.position)) {
        doAction.setButtonHighlight(i)
        found_one = true
        if ('up' == state) {
          const new_size = buildTower_button_info[i][0]
          const new_is_fiver = buildTower_button_info[i][1]
          const curr = (new_is_fiver ? 5 : 1) * 10 ** new_size;
          const correct = correct_next_button();
          if (curr !== correct) {
            reduce_num_stars()
            doAction.setFreezeDisplay(true);
            window.setTimeout(function () {
              doAction.setButtonHighlight(null);
              doAction.setFreezeDisplay(false);
            }, 3000);
            return;
          }
          const pixel_height = query_scale_factor() * query_tower_height('tower_2')
          //console.log('pixel_height', pixel_height, 'h', global_workspace_height)
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