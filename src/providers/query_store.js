import { global_store } from '../index'
import { global_constant } from '../App'
import { get_block_size_from_group, get_how_many_from_group, get_is_fiver_from_group } from '../components/Block'
import { get_button_geoms_for } from '../components/Keypad'
import { Map } from 'immutable';

export const consolidate_info_for_ids = (ids, name, position,
  style, anim_info = Map({}), misc = Map({}), tower_style = false, block_opacity = false) => {
  //console.log('consolidate_info_for_ids', ids)
  //console.log('consolidate_info_for_ids', ids, 'anim_info', anim_info)
  //console.log('consolidate_info_for_ids', ids.toJS(), 'misc', misc.toJS())
  //let res = {}
  let res = Map({})
  for (const id of ids) {
    /*
    res[id] = {
      name: name[id],
      position: position[id],
      style: style[id],
      anim_info: anim_info[id],
      misc: misc[id]
    }
    */
    res = res.set(id, Map({
      name: name.get(id),
      position: position.get(id),
      style: style.get(id),
      anim_info: anim_info.get(id),
      misc: misc.get(id)
    }))
    if (tower_style && tower_style.get(id)) {
      //console.log('tower_style', tower_style)
      //res[id].tower_style = tower_style[id]
      res = res.setIn([id, 'tower_style'], tower_style.get(id))
    }
    if (block_opacity && block_opacity.get(id)) {
      //res[id].block_opacity = block_opacity[id]
      res = res.setIn([id, 'block_opacity'], block_opacity.get(id))
    }
  }
  //console.log('consolidate_info_for_ids res', res.toJS())
  return res
}

export function query_all_nums() {
  const state = global_store.getState()
  const all_nums = consolidate_info_for_ids(
    state.get('tower_ids'),
    state.get('name'),
    state.get('position'),
    state.get('style'),
    state.get('tower_style'),
    state.get('block_opacity'),
    state.get('misc')
  )
  return all_nums
}

export function query_tower(num_id, all_nums = null) {
  if (!all_nums) all_nums = query_all_nums()
  return all_nums[num_id]
}

export function query_tower_blocks(num_id, tower = null, just_position) {
  if (!tower) tower = query_tower(num_id)
  const scale_factor = query_prop('scale_factor')
  // expand the name into individual blocks
  //console.log(tower.name)
  let blocks = []
  let floor = 0
  let was_fiver = 0
  //const tower_name = tower.get('name')
  const tower_name = tower.name
  for (const group of tower_name) {
    const size = get_block_size_from_group(group)
    const how_many = get_how_many_from_group(group)
    const is_fiver = get_is_fiver_from_group(group)
    if (is_fiver && was_fiver) is_fiver = 3 - was_fiver
    was_fiver = is_fiver
    //console.log('size ' + size + ' how_many ' + how_many)
    const height = scale_factor * (10 ** size)
    const is_tiny = height < 4
    const width = scale_factor * global_constant.tower.size2depth[size]
    if (is_fiver) {
      //width *= is_tiny ? 1.5 : 1.1
      height *= 5
    }
    for (const i = 0; i < how_many; ++i) {
      if (just_position) {
        blocks.push([tower.position[0], tower.position[1] + floor, width, height])
      } else {
        blocks.push({
          size,
          height,
          width,
          is_fiver,
          block_opacity: tower.block_opacity[blocks.length],
          bottom: floor
        })
      }
      floor += height
      if (is_fiver) break
    }
  }
  return blocks
}

export function query_tower_name(num_id) {
  const state = global_store.getState()
  return state.getIn(['name', num_id])
}

export function tower_name2height(name) {
  // possible tests:  same as height2tower_name, in reverse
  if (!name) return null
  let res = 0
  for (const group of name) {
    res += group
  }
  return res
}

export function height2tower_name(height) {
  // possible tests:
  //    473.291 -> [400, 50, 20, 3, .2, .05, .04, .001]
  //    1.000001 -> [1]
  //    1 -> [1]
  //    .999999 -> [1]
  let res = []
  if (height > 10000) console.error('Error in height2tower_name:  height', height, '(too large)')
  if (height < .0001) console.error('Error in height2tower_name:  height', height, '(too small)')
  for (const size = 3; size >= -3; --size) {
    if (10 ** size < (height + .000000001)) {
      let how_many = Math.floor((height + .000000001) / (10 ** size))
      height -= how_many * 10 ** size
      if (how_many > 4) {
        res.push(5 * 10 ** size)
        how_many -= 5
      }
      if (how_many > 0)
        res.push(how_many * 10 ** size)
    }
  }
  return res
}

export function query_tower_height(num_id) {
  const state = global_store.getState()
  return tower_name2height(state.getIn(['name', num_id]))
}

/*
export function query_tower_width(num_id) {
  const name = query_tower_name(num_id);
  return width_from_name(name)
}
*/

export function query_top_block(num_id) {
  const name = query_tower_name(num_id);
  let size = null, is_fiver = null, how_many = null
  if (name && name.size >= 1) {
    const group = name.get(name.size - 1)
    size = get_block_size_from_group(group)
    is_fiver = get_is_fiver_from_group(group)
    how_many = get_how_many_from_group(group)
  }
  return [size, is_fiver, how_many]
}

export function query_whole_tower(num_id, tower = null, just_position) {
  if (!tower) {
    if (just_position) {
      const state = global_store.getState()
      const { name, position } = state
      tower = Map({ name: name.get(num_id), position: position.get(num_id) })
    } else tower = query_tower(num_id)
  }
  // expand the name into individual blocks
  let name_info = []
  let floor = 0, was_fiver = 0
  const width = 60;  // NOTE: make this a global?  Where to keep style params?
  for (const group of tower.name) {
    const size = get_block_size_from_group(group)
    const how_many = get_how_many_from_group(group)
    const is_fiver = get_is_fiver_from_group(group)
    if (is_fiver && was_fiver) is_fiver = 3 - was_fiver
    was_fiver = is_fiver
    //console.log('size ' + size + ' how_many ' + how_many)
    const height = global_constant.tower.size2fontsize[size] + 2
    if (just_position) {
      let pos = tower.position
      name_info.push([pos.get(0), pos.get(1) + floor, width, height])
    } else {
      name_info.push({
        size,
        quantity: how_many,
        is_fiver,
        height,
        bottom: floor
      })
    }
    floor += height
  }
  return name_info
}

export function query_keypad_kind() {
  const state = global_store.getState()
  return state.get('keypad_kind')
}

export function query_visible_buttons() {
  const state = global_store.getState()
  let res = []
  for (const i in global_constant.special_button_geoms) {
    if (state.get('button_display').has(i)
      && state.getIn(['button_display', i]) !== 'false')
      res.push(i)
  }
  if (state.get('keypad_kind')) {
    const i_end = get_button_geoms_for(state.get('keypad_kind')).length
    for (const i = 0; i < i_end; ++i) {
      const istr = i + ''
      if (!(istr in state.get('button_display')) ||
        state.getIn(['button_display', istr]) !== false)
        res.push(i)
    }
  }
  return res
}

export function query_name_of_tile(id) {
  const state = global_store.getState()
  return state.getIn(['name', id])
}

export function query_position_of_tile(id) {
  const state = global_store.getState()
  return state.getIn(['position', id])
}

export function query_all_doors() {  // include portals!
  const state = global_store.getState()
  const ids = [...state.get('door_ids'), ...state.get('portal_ids')]
  const all_doors = consolidate_info_for_ids(
    ids,
    state.get('name'),
    state.get('position'),
    state.get('style'),
    state.get('misc')
  )
  return all_doors
}

export function query_door(door_id, all_doors = null) {
  if (!all_doors) all_doors = query_all_doors()
  return all_doors.get(door_id)
}

export function query_name_of_door(id) {
  const state = global_store.getState()
  const res = state.getIn(['name', id])
  //console.log('query_name_of_door id', id, 'res', res)
  return res
}

export function query_obj_style(id) {
  const state = global_store.getState()
  return state.getIn(['style', id])
}

export function query_obj_misc(id) {
  const state = global_store.getState()
  return state.getIn(['misc', id])
}

export function query_arg(n) {
  const state = global_store.getState()
  //console.log('state.event_handling', state.get('event_handling'))
  if (1 == n)
    return state.getIn(['event_handling', 'arg_1'])
  else if (2 == n)
    return state.getIn(['event_handling', 'arg_2'])
  else if ('result' == n)
    return state.getIn(['event_handling', 'result'])
}

/*
export function query_target() {
  const state = global_store.getState()
  return state.getIn(['event_handling', 'target'])
}

export function query_comparison_source() {
  const state = global_store.getState()
  return state.getIn(['event_handling', 'comparison_source'])
}

export function query_correctness() {
  const state = global_store.getState()
  return state.getIn(['event_handling', 'correctness'])
}

export function query_event_move() {
  const state = global_store.getState()
  return state.getIn(['event_handling', 'move'])
}

export function query_event_top_right_text() {
  const state = global_store.getState()
  return state.getIn(['event_handling', 'top_right_text'])
}

export function query_event_show_camel() {
  const state = global_store.getState()
  return state.getIn(['event_handling', 'show_camel'])
}

export function query_event_slide_portal() {
  const state = global_store.getState()
  return state.getIn(['event_handling', 'slide_portal'])
}

export function query_star_policy() {
  const state = global_store.getState()
  return state.getIn(['event_handling', 'star_policy'])
}
*/

export function query_event(key) {
  if (!global_constant.event_handling_types.includes(key))
    console.error("Warning:  unrecognized event_handling key", key)
  const state = global_store.getState()
  return state.getIn(['event_handling', key])
}

export function query_has_anim_info(id) {
  const state = global_store.getState()
  return state.get('anim_info').has(id)
}

/*
export function query_scale_factor() {
  return global_store.getState().get('scale_factor')
}

export function query_freeze_display() {
  const state = global_store.getState()
  return state.get('freeze_display')
}

export function query_num_stars() {
  const state = global_store.getState()
  return state.get('num_stars')
}

export function query_config_iteration() {
  const state = global_store.getState()
  return state.get('config_iteration')
}

export function query_goto_iteration() {
  const state = global_store.getState()
  return state.get('goto_iteration')
}

export function query_skip_submit() {
  const state = global_store.getState()
  return state.get('skip_submit')
}

export function query_skip_in_between() {
  const state = global_store.getState()
  return state.get('skip_in_between')
}
*/

export function query_prop(key) {
  if (!global_constant.prop_types.includes(key))
    console.error("Warning:  unrecognized prop key", key)
  const state = global_store.getState()
  return state.getIn(['prop', key])
}

/*
export function query_config_path() {
  const state = global_store.getState()
  return state.get('config_path')
}

export function query_prev_config_path() {
  const state = global_store.getState()
  return state.get('prev_config_path')
}

export function query_goto_path() {
  const state = global_store.getState()
  return state.get('goto_path')
}
*/

export function query_path(key) {
  if (!global_constant.path_types.includes(key))
    console.error("Warning:  unrecognized path key", key)
  const state = global_store.getState()
  return state.getIn(['path', key])
}

export function query_log() {
  const state = global_store.getState()
  return state.get('log')
}

export function query_test() {
  let state = global_store.getState()
  console.log('state', state.toJS())
}