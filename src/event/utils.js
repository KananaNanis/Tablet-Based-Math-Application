import { query_prop, query_name_of_door } from '../providers/query_store'
import { doAction, global_constant } from '../App'
import { get_block_size_from_group, get_how_many_from_group, get_is_fiver_from_group } from '../components/Block'

export function pointIsInRectangle(point, geom, offset = [0, 0]) {
  return (geom.position[0] + offset[0]) <= point[0] &&
    point[0] <= (geom.position[0] + offset[0] + geom.width) &&
    (geom.position[1] + offset[1]) <= point[1] &&
    point[1] <= (geom.position[1] + offset[1] + geom.height)
}

export function approx_equal(x, y, thresh = 1e-08) {
  return Math.abs(x - y) < thresh;
}

export function namesAreIdentical(name1, name2) {
  if (name1.length != name2.length) return false;
  for (const i = 0; i < name1.length; ++i)
    if (!approx_equal(name1[i], name2[i])) return false;
  return true;
}

/*
export function towersHaveIdenticalNames(num_id1, num_id2) {
  const name1 = query_tower_name(num_id1)
  const name2 = query_tower_name(num_id2)
  return namesAreIdentical(name1, name2)
}
*/

export function expand_into_units(name) {
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

export function vec_sum(a, b) {
  return [a[0] + b[0], a[1] + b[1]]
}

export function vec_prod(s, a) {
  return [s * a[0], s * a[1]]
}

export function dist2D(a, b) {
  dx = a[0] - b[0]
  dy = a[1] - b[1]
  return Math.sqrt(dx * dx + dy * dy)
}

export function reduce_num_stars() {
  const curr_num_stars = query_prop('num_stars')
  if (curr_num_stars > 0)
    doAction.setProp('num_stars', curr_num_stars - 1)
}

export function set_primary_height(id, val) {
  let name = query_name_of_door(id).toJS()
  name[0] = val
  doAction.setName(id, name)
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