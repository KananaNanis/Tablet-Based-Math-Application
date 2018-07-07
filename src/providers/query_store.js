import { global_store } from '../index.js'
import { get_block_size_from_group, get_how_many_from_group, get_is_fiver_from_group } from '../components/Block'
import { global_size2fontsize, global_size2depth } from '../components/Num'

export const consolidate_nums = (ids, name, position, style, tower_style, block_opacity, misc) => {
  let res = {}
  for (const id of ids) {
    res[id] = {
      name: name[id],
      position: position[id],
      style: style[id],
      tower_style: tower_style[id],
      block_opacity: block_opacity[id],
      misc: misc[id]
    }
  }
  return res
}

export function query_scale_factor() {
  return global_store.getState().scale_factor
}

export function query_all_nums() {
  const state = global_store.getState()
  const all_nums = consolidate_nums(
    state.num_ids,
    state.num_name,
    state.num_position,
    state.num_style,
    state.num_tower_style,
    state.num_block_opacity,
    state.num_misc
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
    if (is_fiver) width *= is_tiny ? 1.5 : 1.1
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
    }
  }
  return blocks
}

export function query_tower_name(num_id, tower = null, just_position) {
  if (!tower) tower = query_tower(num_id)
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