import {
  query_name_of_tile, query_event, query_arg, query_path
} from '../providers/query_store'
import {
  query_tower_name,
  query_tower_height, height2tower_name,
} from '../providers/query_tower'
import { doAction, global_constant } from '../App'
import { expand_into_units, approx_equal, namesAreIdentical, reduce_num_stars } from './utils';
import { describe_numerical, get_err_box_location, show_thin_height } from './extract';

export function correct_next_button() {
  const verbose = false
  let expand = false
  let correct, curr, res = null
  const how = query_event('correctness')
  const tgt = query_event('target')
  const src = query_event('comparison_source')
  if ('identical' == how) {
    correct = query_tower_name(src).toJS()
    curr = query_tower_name(tgt).toJS()
    expand = true
  } else if ('same_height' == how) {
    const animal_name = query_name_of_tile(src)
    const height = global_constant.animals[animal_name].height
    correct = height2tower_name(height)
    //console.log('animal_name', animal_name, 'correct', correct)
    curr = query_tower_name(tgt).toJS()
    expand = true
  } else {
    console.warn('Warning in correct_next_button: correctness', how)
  }
  if (expand) {
    correct = expand_into_units(correct)
    curr = expand_into_units(curr)
  }
  if (curr.length > correct.length) {
    console.warn('Warning in correct_next_button:  curr len ' + curr.length
      + ' is > correct len ' + correct.length);
    return false;
  }
  for (var i = 0; i < curr.length; ++i) {
    if (!approx_equal(curr[i], correct[i])) {
      console.log('Warning in correct_next_button:  i' + i
        + ' curr ' + curr[i] + ' correct ' + correct[i]);
      return false;
    }
  }
  if (curr.length < correct.length) res = correct[curr.length];

  if (verbose) {
    console.log('correct_next_button correct', correct,
      'curr', curr, 'res', res)
  }
  return res
}

export function is_correct() {
  const tgt = query_event('target')
  const src = query_event('comparison_source')
  const how = query_event('correctness')
  const curr_time = Date.now()  // when anwer was given
  const cp = query_path('config').toJS()
  let delay = 'incorrect'
  if ('same_height' == how) {
    const name = query_name_of_tile(src)
    if (name) {
      const animal_height = global_constant.animals[name].height
      const tgt_height = query_tower_height(tgt)
      //console.log(name, animal_height, tgt_height)
      if (approx_equal(animal_height, tgt_height)) delay = 0
      doAction.addLogEntry(curr_time, [cp, 'is_correct', (0 == delay), tgt_height, animal_height])
    }
  } else if ('identical' == how) {
    const name1 = query_tower_name(src).toJS()
    const name2 = query_tower_name(tgt).toJS()
    if (namesAreIdentical(name1, name2)) delay = 0
    doAction.addLogEntry(curr_time, [cp, 'is_correct', (0 == delay), name2, name1])
  } else if ('near_height' == how) {
    const arg_1 = query_arg(1)
    const arg_2 = query_arg(2)
    const result = query_arg('result')
    const { f1, f2, f3, err, stars } = describe_numerical(arg_1, arg_2, result)

    if (!query_event('show_camel')) {  // just show the err_box
      if (3 == stars) {   // close enough... don't show the box
        /*
        doAction.setAnimInfo(arg_1, { slide_target: f1, slide_duration: 100 })
        window.setTimeout(function () {
          doAction.setAnimInfo(arg_1, { slide_target: 1, slide_duration: 500 })
          window.setTimeout(function () {
            doAction.setAnimInfo(arg_1, { slide_target: f1, slide_duration: 500 })
            window.setTimeout(function () {
              show_thin_height(arg_1, arg_2, result)
            }, 1000)
          }, 1000)
        }, 200)
        */
        show_thin_height(arg_1, arg_2, result)
        delay = 1000
      } else {
        const [position, width, height] = get_err_box_location(arg_1, arg_2, result)
        console.log('setting err_box with  position', position)
        doAction.setErrBox({ position, width, height })
        window.setTimeout(function () {
          doAction.setErrBox({})
        }, 1000)
        if (-1 == stars || 0 == stars) {
          reduce_num_stars()
          delay = 'do_not_transition'
        } else delay = 1000
      }
      return delay
    }

    if (-1 == stars || 3 == stars) {
      if (-1 == stars) {   // error is huge, don't animate at all
        delay = 'do_not_transition'
      } else if (3 == stars) {  // error is small, round to zero
        doAction.setName(result, [f3, f3])
        const correct = f1 * f2
        doAction.setAnimInfo(result, { slide_target: correct, slide_duration: 200 })
        delay = 1000
      }
      doAction.addLogEntry(curr_time, [cp, 'is_correct', stars, f3, f1, f2])
      doAction.setErrBox({})
      return delay
    }

    doAction.setAnimInfo(arg_1, { slide_target: f1, slide_duration: 500 })
    window.setTimeout(function () {
      doAction.addLogEntry(curr_time, [cp, 'is_correct', stars, f3, f1, f2])
      const [position, width, height] = get_err_box_location(arg_1, arg_2, result)
      //console.log('setting err_box with position', position)
      doAction.setErrBox({ position, width, height, duration: 500, delay: 500 })
    }, 1500)
    delay = 3000
    //delay = 'do_not_transition'
  } else {
    console.error('unrecognized correctness attribute?!', how)
  }
  return delay
}