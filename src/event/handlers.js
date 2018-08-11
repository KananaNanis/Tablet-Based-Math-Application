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
  doAction.setProp('freeze_display', true);
  window.setTimeout(function () {
    doAction.setButtonHighlight(null);
    doAction.setProp('freeze_display', false);
  }, 3000);
}

export function handle_submit_button(state) {
  if ('up' == state) {
    let delay = is_correct()
    if ('incorrect' == delay)
      incorrect_button_response()
    else {
      global_sound['chirp1'].play()
      doAction.setButtonHighlight(null)
      if ('do_not_transition' === delay) {  // special case...
      } else if (delay) {
        // do animation!
        console.log('animating now ')
        window.setTimeout(function () {
          transition_to_next_config()
        }, delay)
      } else transition_to_next_config()
    }
  }
}
