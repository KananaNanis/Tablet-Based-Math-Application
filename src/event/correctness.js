import {
	query_name_of,
	query_event,
	query_arg,
	query_path,
	query_prop,
	query_obj_misc,
	with_suffix,
} from '../providers/query_store'
import {
	query_tower_name,
	query_tower_height,
	height2tower_name,
} from '../providers/query_tower'
import {doAction, global_constant} from '../App'
import {
	expand_into_units,
	approx_equal,
	namesAreIdentical,
	reduce_num_stars,
	dist2D,
} from './utils'
import {
	describe_numerical,
	get_err_box_location,
	show_thin_height,
	get_door_or_tile_height,
} from './extract'
import {landmark_location} from '../components/Tile'

export function correct_next_button() {
	const verbose = false
	let expand = false
	let correct,
		curr,
		res = null
	const how = query_event('correctness')
	const tgt = query_event('target')
	const src = query_event('comparison_source')
	if ('identical' === how) {
		correct = query_tower_name(src).toJS()
		curr = query_tower_name(tgt).toJS()
		expand = true
	} else if ('same_height' === how) {
		let height
		if (src.startsWith('tile_')) {
			const animal_name = query_name_of(src)
			height = global_constant.animals[animal_name].height
		} else height = query_name_of(src).get(0)
		correct = height2tower_name(height)
		//console.log('animal_name', animal_name, 'correct', correct)
		// console.log('height', height, 'correct', correct)
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
		console.warn(
			'Warning in correct_next_button:  curr len ' +
				curr.length +
				' is > correct len ' +
				correct.length,
		)
		return false
	}
	for (let i = 0; i < curr.length; ++i) {
		if (!approx_equal(curr[i], correct[i])) {
			console.log(
				'Warning in correct_next_button:  i' +
					i +
					' curr ' +
					curr[i] +
					' correct ' +
					correct[i],
			)
			return false
		}
	}
	if (curr.length < correct.length) res = correct[curr.length]

	if (verbose) {
		console.log(
			'correct_next_button correct',
			correct,
			'curr',
			curr,
			'res',
			res,
		)
	}
	return res
}

export function show_err_with_delay(
	arg_1,
	arg_2,
	result,
	stars,
	curr_time,
	f1,
	f2,
	f3,
) {
	const cp = query_path('config').toJS()
	const arg_1_name = query_tower_name(arg_1)

	if (3 === stars) {
		// error is small, round to zero
		if (query_event('just_proportion')) doAction.setName(result, [f3])
		else doAction.setName(result, [f3, f3])
		const correct = f1 * f2
		doAction.setAnimInfo(result, {slide_target: correct, slide_duration: 200})
		if (arg_1_name.size <= 1 || arg_1_name.get(0) !== arg_1_name.get(1)) {
			doAction.setAnimInfo(arg_1, {slide_target: f1, slide_duration: 200})
			window.setTimeout(function() {
				show_thin_height(arg_1, arg_2, result)
			}, 400)
			delay = 2000
		} else {
			//console.log('show_thin')
			show_thin_height(arg_1, arg_2, result)
			delay = 1000
		}
		doAction.addLogEntry(curr_time, [
			with_suffix(cp),
			'is_correct',
			stars,
			f3,
			f1,
			f2,
		])
		return delay
	}

	let err_box_delay = 0
	//console.log('skip_slide_down', query_prop('skip_slide_down'))
	if (!query_prop('skip_slide_down')) {
		if (arg_1_name.size <= 1 || arg_1_name.get(0) !== arg_1_name.get(1)) {
			doAction.setAnimInfo(arg_1, {slide_target: f1, slide_duration: 500})
			err_box_delay = 1500
		}
	}
	window.setTimeout(function() {
		doAction.addLogEntry(curr_time, [
			with_suffix(cp),
			'is_correct',
			stars,
			f3,
			f1,
			f2,
		])
		if ('option' !== result) {
			const [position, width, height] = get_err_box_location(
				arg_1,
				arg_2,
				result,
			)
			//console.log('setting err_box with position', position)
			doAction.setErrBox({position, width, height, duration: 500, delay: 500})
		}
		if (-1 === stars) {
			// slide back
			window.setTimeout(function() {
				doAction.setAnimInfo(arg_1, {slide_target: 1, slide_duration: 500})
			}, 1500)
		}
	}, err_box_delay)
	let delay = 1500 + err_box_delay
	return delay
}

export function is_correct() {
	const tgt = query_event('target')
	const src = query_event('comparison_source')
	const how = query_event('correctness')
	const curr_time = Date.now() // when anwer was given
	const cp = query_path('config').toJS()
	let delay = 'incorrect'
	//console.log('is_correct src', src, 'how', how)
	if ('same_height' === how || 'approx_height' === how) {
		const tgt_height = query_tower_height(tgt)
		let eq = 'unchecked'
		let src_height
		if (src.startsWith('tile_')) {
			const name = query_name_of(src)
			if (name) {
				src_height = global_constant.animals[name].height
				if ('approx_height' === how) {
					eq = approx_equal(src_height, tgt_height, 0.075)
				} else eq = approx_equal(src_height, tgt_height)
			}
		} else {
			src_height = query_name_of(src).get(0)
			eq = approx_equal(src_height, tgt_height)
		}
		// console.log('src_height', src_height, 'tgt_height', tgt_height, 'eq', eq)
		if (eq !== 'unchecked') {
			if (eq) delay = 0
			doAction.addLogEntry(curr_time, [
				with_suffix(cp),
				'is_correct',
				0 === delay,
				tgt_height,
				src_height,
			])
		}
	} else if ('identical' === how) {
		let name1, name2
		// console.log('src', src, 'tgt', tgt)
		if (src.startsWith('five_frame_')) {
			name1 = query_name_of(src).toJS()
			name2 = query_name_of(tgt).toJS()
			// console.log('name1', name1, 'name2', name2)
			if (name1 === name2) delay = 0
		} else {
			name1 = query_tower_name(src).toJS()
			name2 = query_tower_name(tgt).toJS()
			if (namesAreIdentical(name1, name2)) delay = 0
		}
		doAction.addLogEntry(curr_time, [
			with_suffix(cp),
			'is_correct',
			0 === delay,
			name2,
			name1,
		])
	} else if ('near_height' === how) {
		const arg_1 = query_arg(1)
		const arg_2 = query_arg(2)
		const result = query_arg('result')
		const {f1, f2, f3, err, stars} = describe_numerical(arg_1, arg_2, result)
		err

		if (!query_event('show_camel')) {
			// just show the err_box
			if (3 === stars) {
				// close enough... don't show the box
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
				const [position, width, height] = get_err_box_location(
					arg_1,
					arg_2,
					result,
				)
				console.log('setting err_box with  position', position)
				doAction.setErrBox({position, width, height})
				window.setTimeout(function() {
					doAction.setErrBox({})
				}, 1000)
				if (-1 === stars || 0 === stars) {
					reduce_num_stars()
					delay = 'do_not_transition'
				} else delay = 1000
			}
			return delay
		}

		delay = show_err_with_delay(
			arg_1,
			arg_2,
			result,
			stars,
			curr_time,
			f1,
			f2,
			f3,
		)
		if (-1 === stars) delay = 'do_not_transition'
		//delay = 'do_not_transition'
	} else if ('near_discrete_height' === how || 'half_height' === how) {
		let correct_height
		//const src_height = query_tower_height(src)
		if ('half_height' === how) {
			correct_height = 0.5 * query_name_of(src)
		} else if (src) {
			correct_height = query_tower_height(src)
		} else {
			const arg_1 = query_arg(1)
			const val_1 = get_door_or_tile_height(arg_1)
			const arg_2 = query_arg(2)
			const val_2 = get_door_or_tile_height(arg_2)
			//console.log('arg_1', arg_1, 'name_1', name_1, 'val_1', val_1)
			correct_height = val_1 + val_2
			// console.log('correct_height', correct_height)
		}
		const tgt_height = query_name_of(tgt).get(0)
		// console.log('correct_height', correct_height)
		// console.log('tgt_height', tgt_height)
		if (Math.abs(correct_height - tgt_height) < 0.05) {
			// console.log('got it!')
			const curr = query_name_of('door_3').get(0)
			doAction.setName('door_3', [curr, curr])
			doAction.towerAddStyle('tower_1', 'opacity', null)
			const scale_factor = query_prop('scale_factor')
			const duration = 10 * scale_factor * Math.abs(correct_height - tgt_height)
			doAction.setAnimInfo('door_3', {
				slide_target: correct_height,
				slide_duration: duration,
			})
			delay = duration + 1000
			if ('half_height' === how) {
				doAction.addObjStyle('bar_1', 'backgroundColor', 'lightgreen')
				window.setTimeout(function() {
					doAction.addObjStyle('bar_1', 'backgroundColor', null)
				}, delay)
			}
		} else {
			// still incorrect
			if ('half_height' === how) {
				doAction.addObjStyle('bar_1', 'backgroundColor', 'red')
				window.setTimeout(function() {
					doAction.addObjStyle('bar_1', 'backgroundColor', null)
				}, global_constant.incorrect_freeze_time)
			}
		}
	} else if ('move_dot' === how) {
		const arg_1 = query_arg(1)
		const landmark_index = query_obj_misc(arg_1).get('landmark_index')
		const tile_tgt = 'tile_2'
		//console.log('arg_1', arg_1, 'landmark_index', landmark_index)
		//  do we need to know how far it moves?  Yes!
		const name = query_name_of(arg_1)
		const loc0 = landmark_location(name, landmark_index)
		const misc2 = query_obj_misc(tile_tgt)
		const extra_scale2 =
			misc2 && 'undefined' !== typeof misc2.get('extra_scale')
				? misc2.get('extra_scale')
				: 1
		const loc0b = [extra_scale2 * loc0[0], extra_scale2 * loc0[1]]
		const loc1 = misc2.get('extra_dot').toJS()
		const d_pixels = dist2D(loc0b, loc1)
		const scale_factor = query_prop('scale_factor')
		const d = d_pixels / (extra_scale2 * scale_factor)
		//console.log('extra_scale2', extra_scale2, 'loc0b', loc0b, 'd', d)
		// decide whether we are too far from the correct location
		let too_far = false
		if ('move_handle_dot' === query_event('move')) {
			const delta_pixels = Math.abs(loc0b[1] - loc1[1])
			const delta = delta_pixels / (extra_scale2 * scale_factor)
			// console.log('delta_pixels', delta_pixels, 'delta', delta)
			too_far = delta > global_constant.extra_dot_threshold
		} else {
			// just the dot
			too_far = d > global_constant.extra_dot_threshold
		}
		//console.log('loc0b', loc0b, 'loc1', loc1, 'd', d)
		if (too_far) {
			reduce_num_stars()
			//incorrect_button_response()  // doesn't seem to work!
			delay = 'do_not_transition'
		} else {
			doAction.addObjStyle('tile_1', 'opacity', 1)
			doAction.addObjStyle(tile_tgt, 'opacity', 1)
			doAction.addObjMisc(tile_tgt, 'landmark_index', landmark_index)
			doAction.setAnimInfo(tile_tgt, {move_extra_dot: true})
			if ('move_handle_dot' === query_event('move')) {
				// also move the handle into place
				const y3 = loc0b[1] / scale_factor
				const animal_value = global_constant.animals[name].height
				const y3b = y3 / (animal_value * extra_scale2)
				doAction.setName('door_2', [query_name_of('door_2').get(0), y3b])
				doAction.setAnimInfo('door_2', {
					slide_target: y3,
					slide_duration: 100 * d,
				})
			}
			// delay = 'do_not_transition'
			delay = 100 * d_pixels + 1000
		}
	} else {
		console.error('unrecognized correctness attribute?!', how)
	}
	return delay
}
