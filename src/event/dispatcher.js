import { query_keypad_kind } from '../providers/query_store';
import { getPositionInfoForKeypad, getButtonGeomsFor, buildTower_button_info } from '../components/Keypad';
import { doAction } from '../App';

export function pointIsInRectangle(point, geom, offset = [0, 0])
{
  return (geom[0] + offset[0]) <= point[0] &&
         point[0] <= (geom[0] + offset[0] + geom[2]) &&
         (geom[1] + offset[1]) <= point[1] &&
         point[1] <= (geom[1] + offset[1] + geom[3]);
}

export function touch_dispatcher(state, x, y, touchID)
{
  //console.log('touch_dispatcher state ' + state + ' x ' + x + ' y ' + y + ' touchID ' + touchID);
  const kind = query_keypad_kind();
  const pos = getPositionInfoForKeypad(kind);
  const button_geoms = getButtonGeomsFor(kind);
  let found_one = false
  for(const i = 0; i < button_geoms.length; ++i) {
    if (pointIsInRectangle([x, y], button_geoms[i], pos.position)) {
      doAction.setButtonHighlight(i);
      found_one = true
      if ('up' == state) {
        //doAction.numRemoveBlock('t2');
        const size = buildTower_button_info[i][0];
        const is_fiver = buildTower_button_info[i][1];
        doAction.numAddBlock('t2', size, is_fiver);
      }
    }
  }
  if ('up' == state || !found_one) doAction.setButtonHighlight(null);
}
