import { doAction } from '../App'
import { query_current_config } from './query_store'
import { update_keypad_button_visibility } from '../event/dispatcher';

export function enter_exit_config(enter) {
  const cc = query_current_config();
  if ('in_between' == cc) {
    doAction.setButtonDisplay('next', enter ? true : null)
  } else {  // levels that are a variation on copy_tower
    doAction.setCurrentConfigIteration(2)  // 2 exercises
    doAction.setKeypadKind(enter ? 'buildTower' : null)
    doAction.setNumStars(enter ? 3 : 0)
    doAction.setButtonDisplay('submit', enter ? true : null)
    //doAction.setButtonDisplay('delete', enter ? true : null)
    if ('copy_tower' == cc) {
      if (enter) {
        doAction.towerCreate('tower_1', [.2], [5, 0])
        doAction.towerSetWidth('tower_1', 150)
        doAction.towerSetOverflow('tower_1', 'hidden')
        doAction.towerCreate('tower_2', [], [180, 0])
      } else {
        doAction.towerDelete('tower_1')
        doAction.towerDelete('tower_2')
      }
    } else if ('animal_height' == cc) {
      if (enter) {
        doAction.tileCreate('animal_1', 'kitty', [-300, 0])
        doAction.towerCreate('tower_2', [], [180, 0])
      } else {
        doAction.tileDelete('animal_1')
        doAction.towerDelete('tower_2')
      }
    }
    update_keypad_button_visibility(null, null, null)
  }
  //query_test()
}
