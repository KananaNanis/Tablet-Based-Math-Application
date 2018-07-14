import { doAction } from '../App'
import { query_current_config } from './query_store'

export function enter_exit_config(enter) {
  const cc = query_current_config();
  if ('in_between' == cc) {
    doAction.setButtonDisplay('next', enter ? true : null)
  } else {  // levels that are a variation on copy_tower
    doAction.setCurrentConfigIteration(1)  // 2 exercises?
    doAction.setKeypadKind(enter ? 'buildTower' : null)
    doAction.setNumStars(enter ? 3 : 0)
    for (const i of [0, 1, 3, 8, 9])
      doAction.setButtonDisplay(i, enter ? false : null)
    doAction.setButtonDisplay('submit', enter ? true : null)
    doAction.setButtonDisplay('delete', enter ? true : null)
    if ('copy_tower' == cc) {
      if (enter) {
        doAction.towerCreate('t1', [.5, .1], [5, 0])
        doAction.towerSetWidth('t1', 150)
        doAction.towerSetOverflow('t1', 'hidden')
        doAction.towerCreate('t2', [], [180, 0])
      } else {
        doAction.towerDelete('t1')
        doAction.towerDelete('t2')
      }
    } else if ('animal_height' == cc) {
      if (enter) {
        doAction.tileCreate('a1', 'kitty', [-300, 0])
        doAction.towerCreate('t2', [], [180, 0])
      } else {
        doAction.tileDelete('a1')
        doAction.towerDelete('t2')
      }
    }
  }
  //query_test()
}
