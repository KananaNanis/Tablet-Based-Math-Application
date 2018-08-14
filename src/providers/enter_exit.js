import { doAction, global_constant } from '../App'
import {
  query_path, query_prop, height2tower_name,
} from './query_store'
import { update_keypad_button_visibility } from '../event/dispatcher'
import { generate_with_restrictions } from '../containers/generate'
import { global_screen_width } from '../components/Workspace'
import { get_config, as_position, width_pixels_from_name, height_pixels_from_name } from './change_config';

function do_timed_action(id, key, val) {
  // handle the following:
  // appear_after: 2000,
  // start_fade: 2500, end_fade: 3000
  let delay = val
  if ('appear_after' == key) doAction.setOpacity(id, 0);
  if ('fade_anim' == key) delay = val.start
  window.setTimeout(function () {
    if ('appear_after' == key) doAction.setOpacity(id, 1.0)
    else if ('fade_anim' == key) {
      doAction.setAnimInfo(id, { 'fade_duration': val.duration })
    }
  }, delay)
}

export function enter_exit_config(enter, verbose) {
  let keep_names = false
  if (query_prop('problem_stage')) {
    if (enter) keep_names = true
    else return
  }
  const cp = query_path('config')
  //console.log('cp', cp)
  const config = get_config(cp)
  if (verbose) console.log('enter_exit_config enter', enter, 'config', config)
  // let's handle the various parts of the config one at a time
  let sc = global_constant.scale_factor_from_yaml  // may not be available
  const gen_vars = enter ? generate_with_restrictions(config['generate']) : {}
  if (config['create']) {
    const c = config['create']
    for (const id in c) {
      if ('button_submit' == id) doAction.setButtonDisplay('submit', enter ? true : null)
      else if ('button_delete' == id) doAction.setButtonDisplay('delete', enter ? true : null)
      else if ('button_next' == id) doAction.setButtonDisplay('next', enter ? true : null)
      else if ('center_text' == id) doAction.setProp('center_text', enter ? c[id] : null)
      else if ('err_box' == id) doAction.setErrBox(enter ? { 'show': true } : null)
      else if ('keypad_kind' == id) {
        doAction.setKeypadKind(enter ? c[id] : null)
        if ('buildTower' == c[id]) {
          update_keypad_button_visibility(null, null, null)
        }
      } else if (id.startsWith('tower_') || id.startsWith('tile_') || id.startsWith('door_') || id.startsWith('portal_')) {
        if (keep_names) { }  // skip!
        else {
          // assert: we have necessary info in the 'modify' area
          let name = null
          if (enter) {
            name = c[id]
            if ('object' == typeof name && name['name'])
              name = name['name']
            if (Array.isArray(name)) {
              for (const i = 0; i < name.length; ++i) {
                if (gen_vars.hasOwnProperty(name[i]))
                  name[i] = gen_vars[name[i]]
              }
            } else {
              if (gen_vars.hasOwnProperty(name))
                name = gen_vars[name]
            }
          }
          if (id.startsWith('tower_')) {
            if (enter) {
              if ('number' == typeof name)
                name = height2tower_name(name)
              const w = width_pixels_from_name(name, sc)
              const h = height_pixels_from_name(name, sc)
              doAction.towerCreate(id, name,
                as_position(config['modify'][id]['position'], w, h))
            } else {
              //console.log('deleting', id)
              doAction.towerDelete(id)
            }
          } else if (id.startsWith('tile_')) {
            if (enter) {
              const w = width_pixels_from_name(name, sc)
              const h = height_pixels_from_name(name, sc)
              doAction.tileCreate(id, name,
                as_position(config['modify'][id]['position'], w, h))
            } else doAction.tileDelete(id)
          } else if (id.startsWith('door_')) {
            if (enter) {
              doAction.doorCreate(id, name,
                as_position(config['modify'][id]['position']))
            } else doAction.doorDelete(id)
          } else if (id.startsWith('portal_')) {
            if (enter) {
              //console.log('reading a portal')
              doAction.portalCreate(id, name,
                as_position(config['modify'][id]['position']))
            } else doAction.portalDelete(id)
          }
        }
      }
    }
  }
  if (config['modify']) {
    const c = config['modify']
    for (const id in c) {
      for (const key in c[id]) {
        if (['appear_after', 'fade_anim'].includes(key)) {
          do_timed_action(id, key, c[id][key])
        } else if ('style' == key) {
          let props = c[id][key]
          for (const key2 in props)
            doAction.addObjStyle(id, key2, enter ? props[key2] : null)
        } else if ('misc' == key) {
          let props = c[id][key]
          for (const key2 in props) {
            const val2 = enter ? props[key2] : null
            // console.log('misc id', id, 'key2', key2, 'val2', val2)
            doAction.addObjMisc(id, key2, val2)
          }
        } else if (id.startsWith('tower_') || id.startsWith('tile_')) {
          if ('width' == key) {
            if (enter) {
              let val = c[id][key]
              if ('string' === typeof val && val.endsWith('vw'))
                val = global_screen_width * (+val.slice(0, -2)) / 100.
              doAction.towerSetWidth(id, val)
            } else doAction.towerSetWidth(id, null)
          } else if ('overflow' == key)
            doAction.towerSetOverflow(id, enter ? c[id][key] : null)
        }
      }
    }
  }
  if (config['event_handling']) {
    const c = config['event_handling']
    for (const key in c) {
      doAction.setEventHandlingParam(key, enter ? c[key] : null)
    }
  }
  if (config['misc']) {
    const c = config['misc']
    for (const key in c) {
      if ('config_iteration' == key) {
        let iter_val = c[key]
        if (0 == iter_val || !enter) iter_val = null
        doAction.setProp('config_iteration', iter_val)
      } else if ('goto_config' == key) {
        // this attribute is special:  it is not erased at the end!
        if (enter) {
          const iter = query_prop('goto_iteration')
          if (iter == null || !(iter > 0)) {
            console.log('iter was', iter, 'setting goto iteration', c[key][0], 'path', c[key][1])
            doAction.setProp('goto_iteration', c[key][0])
          } else {
            console.log('skipping setting iteration, iter', iter)
          }
        }
        doAction.setPath('goto', enter ? c[key][1] : null)
      } else if ('num_stars' == key)
        doAction.setProp('num_stars', enter ? c[key] : null)
      else if ('skip_submit' == key)
        doAction.setProp('skip_submit', enter ? c[key] : null)
      else if ('skip_in_between' == key)
        doAction.setProp('skip_in_between', enter ? c[key] : null)
      else if ('problem_stage' == key)
        doAction.setProp('problem_stage', enter ? c[key] : null)
      else if ('remove_on_exit' == key && !enter) {
        //console.log('remove_on_exit', c[key])
        if ('button_submit' == c[key]) doAction.setButtonDisplay('submit', null)
        else if ('err_box' == c[key]) doAction.setErrBox(null)
      }
    }
  }
  if (enter) doAction.setProp('freeze_display', false);
  // query_test()
}
