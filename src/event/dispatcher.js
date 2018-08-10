import {
  query_keypad_kind, query_visible_buttons, query_tower_name, query_top_block, query_num_stars, query_name_of_tile,
  query_tower_height, query_comparison_source, query_scale_factor, query_freeze_display, height2tower_name, query_name_of_door,
  query_door, query_target, query_correctness, query_arg, query_event_move, query_path, query_star_policy, query_has_anim_info, query_event_top_right_text, query_position_of_tile, query_event_show_camel, query_obj_misc, query_event_slide_portal, query_skip_submit
} from '../providers/query_store'
import { get_button_geoms_for } from '../components/Keypad'
import { global_workspace_height, add_offset } from '../components/Workspace'
import { doAction, global_sound, global_constant } from '../App'
import { transition_to_next_config } from '../providers/change_config'
import { get_block_size_from_group, get_how_many_from_group, get_is_fiver_from_group } from '../components/Block'
import { num_stars } from '../containers/CamelContainer';
import { current_pixel_size_of_animal } from '../components/Tile';

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

/*
function towersHaveIdenticalNames(num_id1, num_id2) {
  const name1 = query_tower_name(num_id1)
  const name2 = query_tower_name(num_id2)
  return namesAreIdentical(name1, name2)
}
*/

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
  const how = query_correctness()
  const tgt = query_target()
  const src = query_comparison_source()
  if ('identical' == how) {
    correct = query_tower_name(src).toJS()
    curr = query_tower_name(tgt).toJS()
    expand = true
  } else if ('same_height' == how) {
    const animal_name = query_name_of_tile(src)
    const height = global_constant.animals[animal_name].height
    correct = height2tower_name(height)
    //console.log('animal_name', animal_name, 'correct', correct)
    curr = query_tower_name(tgt).toJS()
    expand = true
  } else {
    console.warn('Warning in correct_next_button: correctness', how)
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

function extract_handle_position(door_info, secondary_handle) {
  //let { name, position } = door_info
  // console.log('door_info', door_info)
  let name = door_info.get('name')
  const val = name.get(secondary_handle ? 1 : 0)
  let position = door_info.get('position')
  const scale_factor = query_scale_factor()
  let res = [position.get(0)
    + global_constant.door.thickness_fraction * scale_factor
    , position.get(1) + scale_factor * val]
  return res
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

/*
let exercise_index = 0;
const tower_exercise_list = [
  [.3],
  [1, .1],
]
*/

function handle_delete_button(state) {
  if ('up' == state) {
    doAction.towerRemoveBlock(query_target())
    const [size, is_fiver, how_many] = query_top_block(query_target())
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

function vec_sum(a, b) {
  return [a[0] + b[0], a[1] + b[1]]
}
function vec_prod(s, a) {
  return [s * a[0], s * a[1]]
}

function get_err_box_location(arg_1, arg_2, result) {
  const d1 = query_door(arg_1)
  let pos1 = extract_handle_position(d1)
  pos1[1] = 0
  let pos2 = [0, 0]
  if (arg_2.startsWith('door_'))
    pos2 = extract_handle_position(query_door(arg_2))
  else if (arg_2.startsWith('tile_')) {
    // want the top right corner of this tile
    const animal_name = query_name_of_tile(arg_2)
    const [animal_width, animal_height] = current_pixel_size_of_animal(animal_name)
    const anim_pos = add_offset(query_position_of_tile(arg_2))
    pos2 = [anim_pos[0] + animal_width, anim_pos[1] + animal_height]
    console.log('animal_width', animal_width, 'anim_pos', anim_pos, 'pos2', pos2)
  }
  const d1_name = d1.get('name')
  let d1_val = d1_name.get((d1_name.size > 1) ? 1 : 0)
  let implied_pos = // pos1 + val1 * (pos2 - pos1)
    vec_sum(pos1,
      vec_prod(d1_val,
        vec_sum(pos2, vec_prod(-1, pos1))))
  const pos3 = extract_handle_position(query_door(result))
  // let's place the err box
  const position = [Math.min(implied_pos[0], pos3[0])
    , Math.min(implied_pos[1], pos3[1])]
  const width = Math.abs(implied_pos[0] - pos3[0])
  const height = Math.abs(implied_pos[1] - pos3[1])
  return [position, width, height]
}

function handle_close_to_goal() {
  const arg_1 = query_arg(1)
  const arg_2 = query_arg(2)
  const result = query_arg('result')
  const { stars } = describe_numerical(arg_1, arg_2, result, 0)
  return 3 == stars
}

function get_door_or_tile_height(id) {
  let res = 0
  if (id.startsWith('door_'))
    res = query_name_of_door(id).get(0)
  else if (id.startsWith('tile_'))
    res = global_constant.animals[query_name_of_tile(id)].height
  return res
}

function describe_numerical(arg_1, arg_2, result, arg_1_index) {
  const arg_1_name = query_name_of_door(arg_1)
  if ('undefined' == typeof arg_1_index)
    arg_1_index = (arg_1_name.size > 1) ? 1 : 0
  const f1 = arg_1_name.get(arg_1_index)
  const f2 = get_door_or_tile_height(arg_2)
  const f3 = query_name_of_door(result).get(0)
  //console.log('f1', f1.toFixed(2), 'f2', f2.toFixed(2), 'f1 * f2', (f1 * f2).toFixed(2), 'f3', f3.toFixed(2))
  console.log('f1 ', f1, 'f2', f2, 'f1 * f2', f1 * f2, 'f3', f3)
  const err = Math.abs(f3 - f1 * f2)
  if (!query_star_policy()) console.error('need star policy!')
  const stars = num_stars(err)
  return { f1, f2, f3, err, stars }
}

let delay = 0  // ugly style... maybe?

function is_correct() {
  let res = false
  const tgt = query_target()
  const src = query_comparison_source()
  const how = query_correctness()
  const curr_time = Date.now()  // when anwer was given
  const cp = query_path('config').toJS()
  delay = 0
  if ('same_height' == how) {
    const name = query_name_of_tile(src)
    if (name) {
      const animal_height = global_constant.animals[name].height
      const tgt_height = query_tower_height(tgt)
      //console.log(name, animal_height, tgt_height)
      res = approx_equal(animal_height, tgt_height)
      doAction.addLogEntry(curr_time, [cp, 'is_correct', res, tgt_height, animal_height])
    }
  } else if ('identical' == how) {
    const name1 = query_tower_name(src).toJS()
    const name2 = query_tower_name(tgt).toJS()
    res = namesAreIdentical(name1, name2)
    doAction.addLogEntry(curr_time, [cp, 'is_correct', res, name2, name1])
  } else if ('near_height' == how) {
    const arg_1 = query_arg(1)
    const arg_2 = query_arg(2)
    const result = query_arg('result')
    const { f1, f2, f3, err, stars } = describe_numerical(arg_1, arg_2, result)
    res = true

    if (!query_event_show_camel()) {  // just show the err_box
      if (3 == stars) {   // close enough... don't show the box
        doAction.setAnimInfo(arg_1, { slide_target: f1, slide_duration: 200 })
        delay = 300
      } else {
        const [position, width, height] = get_err_box_location(arg_1, arg_2, result)
        console.log('setting err_box with position', position)
        doAction.setErrBox({ position, width, height })
        window.setTimeout(function () {
          doAction.setErrBox({})
        }, 1000)
        if (-1 == stars || 0 == stars) {
          reduce_num_stars()
          delay = 'do_not_transition'
        } else delay = 1000
      }
      return res
    }

    if (-1 == stars || 3 == stars) {
      if (-1 == stars) {   // error is huge, don't animate at all
        delay = 'do_not_transition'
      } else if (3 == stars) {  // error is small, round to zero
        doAction.setName(result, [f3, f3])
        const correct = f1 * f2
        doAction.setAnimInfo(result, { slide_target: correct, slide_duration: 200 })
        delay = 200
      }
      doAction.addLogEntry(curr_time, [cp, 'is_correct', res, f3, f1, f2])
      doAction.setErrBox({})
      return res
    }

    doAction.setAnimInfo(arg_1, { slide_target: f1, slide_duration: 500 })
    window.setTimeout(function () {
      doAction.addLogEntry(curr_time, [cp, 'is_correct', res, f3, f1, f2])
      const [position, width, height] = get_err_box_location(arg_1, arg_2, result)
      //console.log('setting err_box with position', position)
      doAction.setErrBox({ position, width, height, duration: 500, delay: 500 })
    }, 1500)
    delay = 3000
    //delay = 'do_not_transition'
  } else {
    console.error('unrecognized correctness attribute?!', how)
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
    if (is_correct()) {
      global_sound['chirp1'].play()
      doAction.setButtonHighlight(null)
      if ('do_not_transition' === delay) {  // special case...
        delay = 0
      } else if (delay) {
        // do animation!
        console.log('animating now ')
        window.setTimeout(function () {
          delay = 0
          transition_to_next_config()
        }, delay)
      } else transition_to_next_config()
    } else {
      incorrect_button_response()
    }
  }
}

function dist2D(a, b) {
  dx = a[0] - b[0]
  dy = a[1] - b[1]
  return Math.sqrt(dx * dx + dy * dy)
}

let scaling_delta, x_delta, y_delta

function dist_from_handle(x, y, tgt, scale_factor) {
  let pos = extract_handle_position(query_door(tgt))
  // let d = dist2D(pos, [x, y])
  let d = x - pos[0]
  // account for the width of the handle
  const handle_width = global_constant.door.handle_fraction * scale_factor
  if (d > handle_width) d -= handle_width
  else if (d > 0) d = 0
  d = Math.abs(d) + Math.abs(y - pos[1])
  //console.log('d', d)
  return d
}

function dist_from_door(x, y, tgt, scale_factor) {
  let pos = extract_handle_position(query_door(tgt))
  // let d = dist2D(pos, [x, y])
  // account for the height of the door
  let d = (y < 0) ? -y : (y > 1 * scale_factor) ? y - scale_factor : 0
  d += Math.abs(x - pos[0])
  return d
}

function set_primary_height(id, val) {
  let name = query_name_of_door(id).toJS()
  name[0] = val
  doAction.setName(id, name)
}

function is_blinking(id) {
  var misc = query_obj_misc(id)
  return misc && misc.has('blink')
}

function handle_is_blinking(id) {
  var misc = query_obj_misc(id)
  return misc && misc.has('handle_blink')
}

function handle_is_hidden(id) {
  var misc = query_obj_misc(id)
  return misc && misc.has('handle_opacity') && 0 == misc.get('handle_opacity')
}

export function touch_dispatcher(state, x, y, touchID) {
  //console.log('touch_dispatcher state ' + state + ' x ' + x + ' y ' + y + ' touchID ' + touchID)
  if (query_freeze_display()) {  // perhaps allow submit?
    if ('down' == state || 'up' == state) console.log('frozen')
    return
  }
  const kind = query_keypad_kind()
  //const pos = getPositionInfoForKeypad(kind)
  const pos = global_constant.keypad_info[kind]
  const button_geoms = kind ? get_button_geoms_for(kind) : null
  // console.log('button_geoms', button_geoms)
  let found_one = false
  const visible = query_visible_buttons()
  //console.log('visible', visible)
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
          const pixel_height = query_scale_factor() * query_tower_height(tgt)
          // console.log('pixel_height', pixel_height, 'h', global_workspace_height)
          if (pixel_height < global_workspace_height) {
            doAction.towerAddBlock(tgt, new_size, new_is_fiver)
            const [size, is_fiver, how_many] = query_top_block(tgt)
            update_keypad_button_visibility(size, is_fiver, how_many)
          }
        }
      }
    }
  }
  if ('up' == state || !found_one) doAction.setButtonHighlight(null)
  //console.log('target', query_target())
  if (null != typeof query_target()) {
    const tgt = query_target()
    const scale_factor = query_scale_factor()
    const move = query_event_move()
    if (0) {
      //  old position was just the height above the ground
      set_primary_height(tgt, y / scale_factor)
    } else if (false && 'touch_image' == move) {
      // what is the x position of the portal?
      const arg_1 = query_arg(1)
      let pos_x = extract_handle_position(query_door(arg_1))[0]
      let d = dist2D([pos_x, 0], [x, y])
      if (d <= 0) d = .001
      //console.log('[x,y]', [x, y], 'pos_x', pos_x, 'd', d)
      if ('down' == state) {  // store scaling_delta
        const f1 = query_name_of_door(arg_1).get(0)
        scaling_delta = f1 / (d / scale_factor)
        //console.log('f1', f1, 'd', d, 'scaling_delta', scaling_delta)
      } else {
        set_primary_height(tgt, scaling_delta * d / scale_factor)
      }
    } else if ('move_handle' == move || 'touch_image' == move) {
      let y1 = y / scale_factor, pos_x, di
      const arg_1 = query_arg(1)
      const arg_2 = query_arg(2)
      if ('touch_image' == move) {
        pos_x = extract_handle_position(query_door(arg_1))[0]
        di = dist2D([pos_x, 0], [x, y])
        if (di <= 0) di = .001
        console.log('di', di)
      }
      if ('down' == state) {  // store scaling_delta
        if ('touch_image' == move) {
          const f1 = query_name_of_door(arg_1).get(0)
          scaling_delta = f1 / (di / scale_factor)
          console.log('scaling_delta', scaling_delta)
          if (is_blinking(arg_2)) {
            doAction.addObjMisc(arg_2, 'blink', null)
            //doAction.addObjMisc(tgt, 'opacity', 1)
          }
        } else if (handle_is_hidden(tgt)) {
          // check-- are we close enough to the door to start?
          const d = dist_from_door(x, y, tgt, scale_factor)
          if (d < global_constant.door.min_dist_from_handle) {
            doAction.addObjStyle(tgt, 'opacity', 1)
            doAction.addObjMisc(tgt, 'blink', null)
            doAction.addObjMisc(tgt, 'handle_opacity', 1)
            y_delta = 0
            set_primary_height(tgt, y1 + y_delta)
          }
        } else {
          // check-- are we close enough to the handle to even start?
          const d = dist_from_handle(x, y, tgt, scale_factor)
          if (d < global_constant.door.min_dist_from_handle) {
            const f1 = query_name_of_door(tgt).get(0)
            y_delta = f1 - y1
            //console.log('is blinking', handle_is_blinking(tgt))
            if (handle_is_blinking(tgt)) {
              doAction.addObjMisc(tgt, 'handle_blink', null)
              doAction.addObjMisc(tgt, 'handle_opacity', 1)
            }
          } else y_delta = null
        }
        //console.log('f1', f1, 'd', d, 'scaling_delta', scaling_delta)
      } else {
        if (query_has_anim_info(tgt))
          doAction.setAnimInfo(tgt, null)
        if ('touch_image' == move) {
          const h = scaling_delta * di / scale_factor
          console.log('h', h)
          set_primary_height(tgt, h)
        } else if (y_delta !== null) {  // change position
          set_primary_height(tgt, y1 + y_delta)
        }
        if ('up' == state) {
          if (query_event_slide_portal() == true) {
            const arg_1 = query_arg(1)
            const result = query_arg('result')
            if (handle_close_to_goal()) {
              //const correct = query_name_of_door(tgt).get(1)
              const f1 = query_name_of_door(arg_1).get(0)
              const f2 = get_door_or_tile_height(arg_2)
              const f3 = query_name_of_door(result).get(0)
              const correct = f3 / f2
              if (tgt !== arg_1) correct = f1 * f2
              //console.log('f1', f1, 'correct', correct)
              doAction.setAnimInfo(tgt, { slide_target: correct, slide_duration: 200 })
              doAction.addObjStyle(result, 'opacity', 1)
              if (query_skip_submit()) {
                global_sound['chirp1'].play()
                transition_to_next_config()
              } else doAction.setButtonDisplay('submit', true)
            } else {  // encourage a new attempt
              // doAction.addObjMisc(tgt, 'handle_opacity', null)
              if ('touch_image' == move)
                doAction.addObjMisc(arg_2, 'blink', .5)
              else
                doAction.addObjMisc(tgt, 'handle_blink', 0)
              doAction.setButtonDisplay('submit', null)
              if (query_name_of_door(tgt).size > 1) {
                //console.log('hide result door')
                doAction.addObjStyle(result, 'opacity', 0)
              }
            }
          }
        }
      }
    } else {
      console.error('Error: unrecognized event.move', move)
    }
  }
}