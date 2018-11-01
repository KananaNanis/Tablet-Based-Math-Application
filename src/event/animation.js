import { Animated } from 'react-native'
import { doAction, global_constant } from '../App'
import { query_position_of, query_obj_style } from '../providers/query_store';
import { store_config_modify } from '../providers/enter_exit';
import { get_config } from '../providers/change_config';
import { fromJS, List } from 'immutable';
//import {dist2D} from '../event/utils'

const verbose = true

export function new_timer() {
	let res = {}
	for (const attr of global_constant.anim_all_attributes) {
		res[attr] = new Animated.Value(0)
	}
	return res
}

function constructXformFor(id, attr, val) {
	const old_style = query_obj_style(id)
	let xform = (old_style && old_style.hasOwnProperty('transform')) ? old_style.transform : []
	let found_it = false
	for (let i = 0; i < xform.length; ++i) {
		if (xform[i].hasOwnProperty(attr)) {
			found_it = true
			xform[i][attr] = val
		}
	}
	if (!found_it) {
		xform.push({ [attr]: val })
	}
	return xform
}

export function interpolate_anim_attr(
	id,
	anim_info,
	timer,
	animated_style,
	secondary_style,
) {
	// NOTE: check for whether we've started the timer?
	for (const attr in anim_info) {
		if (anim_info.hasOwnProperty(attr)) {
			if (verbose) console.log('interpolate attr', attr, 'to', anim_info[attr].to)
			if (['rotate', 'scale'].includes(attr)) {
				let t = timer[attr].interpolate({
					inputRange: [0, 1],
					outputRange: [anim_info[attr].from, anim_info[attr].to],
				})
				const xform = constructXformFor(id, attr, t)
				animated_style.transform = xform
			} else if (global_constant.anim_all_attributes.includes(attr)) {
				let attr2 = attr
				if (['blink', 'handle_blink'].includes(attr)) attr2 = 'opacity'
				let t = timer[attr2].interpolate({
					inputRange: [0, 1],
					outputRange: [anim_info[attr].from, anim_info[attr].to],
				})
				if ('handle_blink' === attr) secondary_style[attr2] = t
				else animated_style[attr2] = t
			} else {
				console.error('Warning in interpolate_anim_attr:  unrecognized anim_info attr', attr)
			}
		}
	}
}

function make_tower_empty() {
	// this function is intended to be the starting point for a nicer animation
	//   used in the midst of a tower swipe.  That animation is not working
	//   working yet, though.
	console.log('make_tower_empty')
	const tower = 'tower_moving'
	doAction.setName(tower, [])
	doAction.clearAnimInfo(tower)
}

function start_timer_old(anim_info, time_value, skip_reset = false) {
	console.error('start_timer_old is deprecated.')
	if (verbose) console.log('start_timer anim_info', anim_info)
	if (!skip_reset) time_value.setValue(0)
	let ending_function
	if ('undefined' !== typeof anim_info.empty_at_end) {
		ending_function = make_tower_empty
	}
	if (
		'undefined' !== typeof anim_info.blink ||
		'undefined' !== typeof anim_info.handle_blink
	) {
		const blink_duration = anim_info.duration ? anim_info.duration : 500
		//console.log('blink_duration', blink_duration)
		start_anim_loop(time_value, blink_duration, anim_info.delay)
	} else if (anim_info.loop) {
		start_anim_loop(time_value, anim_info.duration, anim_info.delay)
	} else if (Array.isArray(anim_info.duration)) {
		start_anim_bounce(time_value, anim_info.duration, anim_info.delay, ending_function)
	} else {
		let params = { toValue: 1, duration: anim_info.duration }
		if (anim_info.delay) params.delay = anim_info.delay
		Animated.timing(time_value, params).start(ending_function)
	}
}

function trigger_continuation(on_end) {
	if (Array.isArray(on_end)) {  // this is a path to instructions
		const w = get_config(fromJS(on_end))
		console.log(w)
		store_config_modify(w.modify, true)
	} else if ('function' === typeof on_end) {
		on_end()
	} else {
		console.error('Warning in trigger_continuation:  unexpected', on_end)
	}
}

function collapse_anim_info(id, attr, info) {
	if (['left', 'right', 'bottom', 'top'].includes(attr)) {
		// positional update
		const old_pos = query_position_of(id).toJS()
		const new_pos = info.to
		if ('left' === attr) {
			doAction.setPosition(id, [new_pos, old_pos[1]])
		} else if ('bottom' === attr) {
			doAction.setPosition(id, [old_pos[0], new_pos])
		} else {
			console.error('Warning in collapse_anim_info:  attr not completed implemented', attr)
		}
	} else if ('rotate' === attr) {
		const xform = constructXformFor(id, attr, info.to)
		doAction.addObjStyle(id, 'transform', xform)
	} else if (['blink', 'opacity'].includes(attr)) {
		doAction.addObjStyle(id, 'opacity', info.to)
	} else {
		console.error('Warning in collapse_anim_info:  not implemented for attr', attr)
	}
	doAction.addAnimInfo(id, { [attr]: null })
	// console.log('done with collapsing attr', attr)
}

function start_timer(id, attr, info, atimer, skip_reset = false) {
	if (verbose) console.log('start_timer attr', attr, 'info', info, 'atimer', atimer)
	if (!skip_reset) atimer.setValue(0)
	function abc() {
		console.log('ABC')
	}
	function ending_function() {
		let on_end = info.on_end
		collapse_anim_info(id, attr, info)
		if (on_end) trigger_continuation(on_end)
	}
	/*
	if ('undefined' !== typeof info.empty_at_end) {
		ending_function = make_tower_empty
	}
	*/
	if (info.loop) {
		start_anim_loop(atimer, info.duration, info.delay, ending_function)
	} else if (Array.isArray(info.duration)) {
		start_anim_bounce(atimer, info.duration, info.delay, ending_function)
	} else {
		let params = { toValue: 1, duration: info.duration }
		if (info.delay) params.delay = info.delay
		Animated.timing(atimer, params).start(ending_function)
	}
}

export function has_timer(anim_info) {
	//console.log('blink', anim_info.blink)
	console.error('has_timer is deprecated.')
	return (
		anim_info &&
		(anim_info.duration ||
			'undefined' !== typeof anim_info.blink ||
			'undefined' !== typeof anim_info.handle_blink)
		// || 'undefined' !== typeof anim_info.move_extra_dot  // for Tile
	)
}

export function init_anim(id, anim_info, timer, time_value, skip_reset = false) {
	for (const attr in anim_info) {
		if (anim_info.hasOwnProperty(attr)) {
			if (global_constant.anim_all_attributes.includes(attr)) {
				start_timer(id, attr, anim_info[attr], timer[attr], skip_reset)
			}
		} else {
			console.error('old anim property?', attr)
			start_timer_old(anim_info, time_value, skip_reset)
		}
	}
}

export function update_anim(
	id,
	anim_info,
	timer,
	time_value,
	prev_anim_info,
	skip_reset = false,
) {
	time_value
	let all_attr = [...new Set([...Object.keys(anim_info), ...Object.keys(prev_anim_info)])]
	console.log('update_anim all_attr', all_attr)
	for (const attr of all_attr) {
		if (global_constant.anim_all_attributes.includes(attr)) {
			if (anim_info.hasOwnProperty(attr)) {
				if (prev_anim_info.hasOwnProperty(attr)) {
					// attr is present in both current and prev
					if (anim_info[attr].id !== prev_anim_info[attr].id) {
						Animated.timing(timer[attr]).stop()
						start_timer(id, attr, anim_info[attr], timer[attr], skip_reset)
					}
				} else {  // only in current
					start_timer(id, attr, anim_info[attr], timer[attr], skip_reset)
				}
			} else {  // only in prev
				Animated.timing(timer[attr]).stop()
			}
		} else {
			console.error('Warning in update_anim:  unrecognized attr', attr)
		}
	}
	/*
	const had_timer = prev_anim_info && prev_anim_info.duration
	if (verbose) {
		console.log(
			'update_anim had_timer',
			had_timer,
			'has_timer',
			has_timer(anim_info),
		)
	}
	if (!had_timer && has_timer(anim_info)) {
		if (anim_info.hasOwnProperty('left'))
			start_timer(anim_info, timer['left'], skip_reset)
		if (anim_info.hasOwnProperty('bottom'))
			start_timer(anim_info, timer['bottom'], skip_reset)
		start_timer(anim_info, time_value, skip_reset)
	}
	if (had_timer && !has_timer(anim_info)) {
		// Animated.timing(timer['left']).stop()
		// Animated.timing(timer['bottom']).stop()
		Animated.timing(time_value).stop()
	}
	*/
}

export function start_anim_loop(anim_var, duration, delay = 0, ending_function = null) {
	//console.log('start_anim_loop delay', delay)
	Animated.sequence([
		Animated.delay(delay),
		Animated.loop(
			Animated.sequence([
				Animated.timing(anim_var, {
					toValue: 1,
					duration,
				}),
				Animated.timing(anim_var, {
					toValue: 0,
					duration,
				}),
			]),
		),
	]).start(ending_function)
}

export function start_anim_bounce(anim_var, durations, delay = 0, ending_function = null) {
	let half = []
	for (let i = 0; i < durations.length; ++i) {
		const duration = durations[i]
		half.push(
			Animated.timing(anim_var, {
				toValue: (i + 1) % 2,
				duration,
				delay,
			}),
		)
	}
	Animated.sequence(half).start(ending_function)
}

// THIS FUNCTION IS OLD, AND SHOULD BE REMOVED
export function start_anim(
	anim_var,
	toValue,
	duration,
	delay = 0,
	ending_function = null,
) {
	console.log('REMOVE start_anim toValue', toValue, 'duration', duration)
	/*
  function onEnd(x) {
    console.log('onEnd x', x)
    anim_var.setValue(0)
  }
  */
	//anim_var.setValue(0)
	Animated.timing(anim_var, {
		toValue,
		duration,
		delay,
	}).start(ending_function)
}
