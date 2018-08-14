import { query_top_block, query_event } from '../providers/query_store'
import { doAction, global_sound } from '../App'
import { transition_to_next_config } from '../providers/change_config'
import { is_correct } from './correctness';

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
  reduce_num_stars()
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
        console.log('animating now')
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
