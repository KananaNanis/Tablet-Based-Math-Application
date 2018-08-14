import {
  query_keypad_kind, query_visible_buttons,
  query_prop, query_name_of_door,
  query_door, query_event, query_arg, query_has_anim_info,
} from '../providers/query_store'
import { query_top_block, query_tower_height } from '../providers/query_tower'
import { get_button_geoms_for } from '../components/Keypad'
import { global_workspace_height, add_offset } from '../components/Workspace'
import { doAction, global_sound, global_constant } from '../App'
import { transition_to_next_config } from '../providers/change_config'
import { pointIsInRectangle, set_primary_height, dist2D } from './utils';
import { handle_submit_button, handle_delete_button, handle_next_button, incorrect_button_response } from './handlers';
import { correct_next_button } from './correctness';
import { extract_handle_position, is_blinking, handle_is_hidden, dist_from_door, dist_from_handle, handle_is_blinking, handle_close_to_goal, get_door_or_tile_height } from './extract';

export function touch_dispatcher(state, x, y, touchID) {
  //console.log('touch_dispatcher state ' + state + ' x ' + x + ' y ' + y + ' touchID ' + touchID)
  if (query_prop('freeze_display')) {  // perhaps allow submit?
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
          const pixel_height = query_prop('scale_factor') * query_tower_height(tgt)
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
  //console.log('target', query_event('target'))
  if (null != typeof query_event('target')) {
    const tgt = query_event('target')
    const scale_factor = query_prop('scale_factor')
    const move = query_event('move')
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
        //console.log('di ', di)
      }
      if ('down' == state) {
        if ('touch_image' == move) {  // store scaling_delta
          const f1 = query_name_of_door(arg_1).get(0)
          scaling_delta = f1 / (di / scale_factor)
          console.log('scaling_delta ', scaling_delta)
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
            if (query_event('touch_reveals_button')) {
              button = query_event('touch_reveals_button')
              doAction.setButtonDisplay(button, true)
            }
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
          //console.log('h', h)
          set_primary_height(tgt, h)
        } else if (y_delta !== null) {  // change position
          set_primary_height(tgt, y1 + y_delta)
        }
        if ('up' == state) {
          if (query_event('slide_portal') == true) {
            const arg_1 = query_arg(1)
            const result = query_arg('result')
            if (handle_close_to_goal()) {
              //console.log('return_to_top', query_event('return_to_top'), 'tgt', tgt)
              if (query_event('return_to_top') == tgt) {
                doAction.setAnimInfo(tgt, { slide_target: 1, slide_duration: 200 })
              } else {
                //const correct = query_name_of_door(tgt).get(1)
                const f1 = query_name_of_door(arg_1).get(0)
                const f2 = get_door_or_tile_height(arg_2)
                const f3 = query_name_of_door(result).get(0)
                const correct = f3 / f2
                if (tgt !== arg_1) correct = f1 * f2
                //console.log('f1', f1, 'correct', correct)
                doAction.setAnimInfo(tgt, { slide_target: correct, slide_duration: 200 })
                doAction.addObjStyle(result, 'opacity', 1)
              }
              if (query_prop('skip_submit')) {
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