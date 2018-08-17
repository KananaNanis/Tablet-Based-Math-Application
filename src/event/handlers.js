import { query_top_block, query_event, query_prop, query_arg } from '../providers/query_store'
import { doAction, global_sound } from '../App'
import { transition_to_next_config } from '../providers/change_config'
import { is_correct, show_err_with_delay } from './correctness';
import { reduce_num_stars, pointIsInRectangle } from './utils';
import { option_geometry } from '../components/OptionBackground';
import { describe_numerical } from './extract';

export function handle_delete_button(state) {
  if ('up' == state) {
    doAction.towerRemoveBlock(query_event('target'))
    const [size, is_fiver, how_many] = query_top_block(query_event('target'))
    update_keypad_button_visibility(size, is_fiver, how_many)
  }
}

export function handle_next_button(state) {
  if ('up' == state)
    transition_to_next_config()
}

export function incorrect_button_response() {
  doAction.setProp('freeze_display', true);
  reduce_num_stars()
  const num_stars = query_prop('num_stars')
  if (0 === num_stars)
    doAction.setProp('repeat_level', 1)
  window.setTimeout(function () {
    doAction.setButtonHighlight(null);
    doAction.setProp('freeze_display', false);
  }, 3000);
}

export function handle_submit_button(state) {
  if ('up' == state) {
    doAction.setProp('freeze_display', true);
    let delay = is_correct()
    if ('incorrect' == delay)
      incorrect_button_response()
    else {
      doAction.setButtonHighlight(null)
      if ('do_not_transition' === delay) {  // special case...
        doAction.setProp('freeze_display', false);
      } else if (delay) {
        // do animation!
        global_sound['chirp1'].play()
        doAction.setButtonDisplay('submit', null)
        //console.log('animating now')
        window.setTimeout(function () {
          transition_to_next_config()
        }, delay)
      } else {
        global_sound['chirp1'].play()
        transition_to_next_config()
      }
    }
  }
}

function option_is_correct(i) {
  return i === query_prop('correct_option_index')
}

export function handle_options(state, x, y, touchID) {
  let found_one = false
  for (const i of [0, 1, 2, 3]) {
    if (pointIsInRectangle([x, y], option_geometry(i))) {
      //console.log('i', i)
      found_one = true
      doAction.setButtonHighlight('option_' + i)
      if ('up' == state) {
        if (option_is_correct(i)) {
          global_sound['chirp1'].play()
          doAction.setAnimInfo('portal_1', null)
          doAction.setAnimInfo('door_2', null)
          //doAction.addObjStyle('portal_1', 'opacity', null)
          //doAction.addObjStyle('door_2', 'opacity', null)
          if (1) {
            const arg_1 = query_arg(1)
            const arg_2 = query_arg(2)
            const result = 'option'
            const { f1, f2, f3, err, stars } = describe_numerical(arg_1, arg_2, result)
            const curr_time = Date.now()
            const delay = show_err_with_delay(arg_1, arg_2, result, stars, curr_time, f1, f2, f3)
            window.setTimeout(function(){
              doAction.setButtonHighlight(null)
              transition_to_next_config()
            }, delay)
          } else {
            doAction.setButtonHighlight(null)
            transition_to_next_config()
          }
        } else {
          console.log('incorrect ')
          incorrect_button_response()
        }
      }
    }
  }
  if ('up' != state && !found_one) doAction.setButtonHighlight(null)
}