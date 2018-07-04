import { global_store } from '../index.js';

export const consolidate_nums = (ids, name, position, style, block_opacity, misc) => {
  let res = {};
  for (const id of ids) {
    res[id] = {
      name: name[id],
      position: position[id],
      style: style[id],
      block_opacity: block_opacity[id],
      misc: misc[id]
    };
  }
  return res;
}

export function get_block_size_from_group(group) {
  return Math.ceil(-1 + .00001 + (Math.log(group) / Math.log(10)))
}

export function get_how_many_from_group(group) {
  return Math.round(group / (10 ** get_block_size_from_group(group)));
}

export function query_scale_factor() {
  return global_store.getState().scale_factor;
}

export function query_all_nums() {
  const state = global_store.getState();
  const all_nums = consolidate_nums(
    state.num_ids,
    state.num_name,
    state.num_position,
    state.num_style,
    state.num_block_opacity,
    state.num_misc
  );
  return all_nums;
}

export function query_tower(num_id, all_nums = null) {
  if (!all_nums) all_nums = query_all_nums();
  return all_nums[num_id];
}

export function query_tower_blocks(num_id, tower = null, just_position) {
  if (!tower) tower = query_tower(num_id);
  const scale_factor = query_scale_factor();
  // expand the name into individual blocks
  //console.log(tower.name);
  let blocks = [];
  let floor = 0;
  for (const group of tower.name) {
    const size = get_block_size_from_group(group);
    const how_many = get_how_many_from_group(group);
    console.assert(how_many <= 5, 'how_many is ' + how_many)
    const isFiver = (5 === how_many);
    //console.log('size ' + size + ' how_many ' + how_many);
    const height = scale_factor * (10 ** size);
    const width = isFiver ? 1.1*height : height;
    for (const i = 0; i < how_many; ++i) {
      if (just_position) {
        blocks.push([tower.position[0], tower.position[1] + floor, width, height]);
      } else {
        blocks.push({
          size,
          height,
          width,
          isFiver,
          block_opacity: tower.block_opacity[blocks.length],
          bottom: floor
        })
      }
      floor += height;
    }
  }
  return blocks;
}