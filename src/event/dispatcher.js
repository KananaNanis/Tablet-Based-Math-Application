import { query_keypad_kind, query_visible_buttons, query_tower_name, query_top_block, query_num_stars, query_name_of_tile, query_tower_height, query_current_config, query_current_config_iteration } from '../providers/query_store'
import { getPositionInfoForKeypad, getButtonGeomsFor, buildTower_button_info } from '../components/Keypad'
import { special_button_names, special_button_geoms } from '../components/Workspace'
import { doAction, global_sound, initStoreForCurrentConfig } from '../App'
import { animals } from '../components/Tile';
import { AssertionError } from 'assert';

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

function update_keypad_button_visibility(size, is_fiver, how_many) {
  console.log('update_keypad_button_visibility', size, is_fiver, how_many)
  const i_end = buildTower_button_info.length
  const require_standard_tower = true;
  for (const i = 0; i < i_end; ++i) {
    const bsize = buildTower_button_info[i][0]
    const bfiver = buildTower_button_info[i][1]
    let show = (null === size || bsize <= size)
    /*
    if (fiver_incomplete) {  // special case
      show = (size == bsize && is_fiver == bfiver)
    }
    */
    if (require_standard_tower) {
      if (size == bsize) {
        if (bfiver) show = false
        else if (!is_fiver && how_many > 3) show = false
      }
    }
    if (1) { // hide minis and tinys
      if (bsize < -1) show = false
    }
    doAction.setButtonDisplay(i, show)
  }
}

let exercise_index = 0;
const tower_exercise_list = [
  [.3],
  [.1, .02],
]

let animal_chosen = 'kitty'
function choose_random_animal() {
  //console.log('choose_random_animal', Object.keys(animals))
  const animal_names = Object.keys(animals)
  for (const i of Array(10).keys()) {
    const name = animal_names[
      Math.floor(animal_names.length * Math.random())]
    if (name !== animal_chosen) {
      console.log('choose_random_animal result ', name)
      animal_chosen = name
      return name
    }
  }
  console.warn('choose_random_animal')
  return 'kitty'
}

function handle_delete_button(state) {
  if ('up' == state) {
    doAction.towerRemoveBlock('t2')
    const [size, is_fiver, how_many] = query_top_block('t2')
    update_keypad_button_visibility(size, is_fiver, how_many)
  }
}

function handle_next_button(state) {
  if ('up' == state) {
    doAction.setButtonDisplay('next', null)
    doAction.setCurrentConfig('animal_height')
    initStoreForCurrentConfig()
  }
}

function handle_submit_button(state) {
  if ('up' == state) {
    if (query_current_config() === 'animal_height') {
      const name = query_name_of_tile('a1')
      if (name) {
        const animal_height = animals[name][0]
        const t2_height = query_tower_height('t2')
        //console.log(name, animal_height, t2_height)
        if (approx_equal(animal_height, t2_height)) {
          global_sound['chirp1'].play()
          doAction.setName('a1', choose_random_animal())
          doAction.setName('t2', []);
          update_keypad_button_visibility(null, null, null)
        } else {
          const curr_num_stars = query_num_stars()
          if (curr_num_stars > 0)
            doAction.setNumStars(curr_num_stars - 1)
        }
      }
    } else if (query_current_config() === 'copy_tower') {
      if (towersHaveIdenticalNames('t1', 't2')) {
        console.log('same')
        global_sound['chirp1'].play()
        // new Sound('src/assets/snd/chip1.wav').play()
        // new Sound('http://localhost:8001/snd/chirp1.wav').play()
        doAction.setName('t1',
          tower_exercise_list[exercise_index])
        exercise_index = (exercise_index + 1) % tower_exercise_list.length;
        doAction.setName('t2', []);
        update_keypad_button_visibility(null, null, null)
      } else {
        console.log('different')
        const curr_num_stars = query_num_stars()
        if (curr_num_stars > 0)
          doAction.setNumStars(curr_num_stars - 1)
      }
    } else {
      console.error('unrecognized config?!')
    }
  }
}

export function touch_dispatcher(state, x, y, touchID) {
  //console.log('touch_dispatcher state ' + state + ' x ' + x + ' y ' + y + ' touchID ' + touchID)
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
          doAction.towerAddBlock('t2', new_size, new_is_fiver)
          const [size, is_fiver, how_many] = query_top_block('t2')
          update_keypad_button_visibility(size, is_fiver, how_many)
        }
      }
    }
  }
  if ('up' == state || !found_one) doAction.setButtonHighlight(null)
}
