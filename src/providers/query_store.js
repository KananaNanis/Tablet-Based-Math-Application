import { global_store } from '../index.js'
import { get_block_size_from_group, get_how_many_from_group, get_is_fiver_from_group, get_fiver_incomplete_from_group } from '../components/Block'
import { global_size2fontsize, global_size2depth } from '../components/Num'
import { getButtonGeomsFor } from '../components/Keypad'
import { special_button_names } from '../components/Workspace.js';

export const consolidate_info_for_ids = (ids, name, position, style, tower_style = false, block_opacity = false, misc = false) => {
  let res = {}
  for (const id of ids) {
    res[id] = {
      name: name[id],
      position: position[id],
      style: style[id],
      misc: misc[id]
    }
    if (tower_style) res[id].tower_style = tower_style[id]
    if (block_opacity) res[id].block_opacity = block_opacity[id]
  }
  return res
}

export function query_scale_factor() {
  return global_store.getState().scale_factor
}

export function query_all_nums() {
  const state = global_store.getState()
  const all_nums = consolidate_nums(
    state.tower_ids,
    state.name,
    state.position,
    state.style,
    state.tower_style,
    state.block_opacity,
    state.misc
  )
  return all_nums
}

export function query_tower(num_id, all_nums = null) {
  if (!all_nums) all_nums = query_all_nums()
  return all_nums[num_id]
}

export function query_tower_blocks(num_id, tower = null, just_position) {
  if (!tower) tower = query_tower(num_id)
  const scale_factor = query_scale_factor()
  // expand the name into individual blocks
  //console.log(tower.name)
  let blocks = []
  let floor = 0
  let was_fiver = 0
  for (const group of tower.name) {
    const size = get_block_size_from_group(group)
    const how_many = get_how_many_from_group(group)
    const is_fiver = get_is_fiver_from_group(group)
    if (is_fiver && was_fiver) is_fiver = 3 - was_fiver
    was_fiver = is_fiver
    //console.log('size ' + size + ' how_many ' + how_many)
    const height = scale_factor * (10 ** size)
    const is_tiny = height < 4
    const width = scale_factor * global_size2depth[size]
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
  return state.name[num_id]
}

export function tower_name2height(name) {
  if (!name) return null
  let res = 0
  for (const group of name) {
    res += group
  }
  return res
}

export function query_tower_height(num_id) {
  const state = global_store.getState()
  return tower_name2height(state.name[num_id])
}

export function query_top_block(num_id) {
  const name = query_tower_name(num_id);
  let size = null, is_fiver = null, how_many = null
  if (name && name.length >= 1) {
    const group = name[name.length - 1]
    size = get_block_size_from_group(group)
    is_fiver = get_is_fiver_from_group(group)
    //fiver_incomplete = get_fiver_incomplete_from_group(group)
    how_many = get_how_many_from_group(group)
  }
  return [size, is_fiver, how_many]
}

export function query_whole_tower(num_id, tower = null, just_position) {
  if (!tower) {
    if (just_position) {
      const state = global_store.getState()
      tower = {name: name[num_id], position: position[num_id]}
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
    const height = global_size2fontsize[size] + 2
    if (just_position) {
      name_info.push([tower.position[0], tower.position[1] + floor, width, height])
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
  return state.keypad_kind
}

export function query_visible_buttons() {
  const state = global_store.getState()
  let res = []
  for (const i of special_button_names) {
    if (i in state.button_display && state.button_display[i] !== 'false')
      res.push(i)
  }
  if (state.keypad_kind) {
    const i_end = getButtonGeomsFor(state.keypad_kind).length
    for (const i = 0; i < i_end; ++i) {
      const istr = i + ''
      if (!(istr in state.button_display) ||
        state.button_display[istr] !== false)
        res.push(i)
    }
  }
  return res
}

export function query_num_stars() {
  const state = global_store.getState()
  return state.num_stars
}

export function query_name_of_tile(id) {
  const state = global_store.getState()
  return state.name[id]
}