import {Animated} from 'react-native'
//import {global_constant, image_location} from '../App'
//import {dist2D} from '../event/utils'

const verbose = false

export function interpolate_anim_attr(
	anim_info,
	time_value,
	animated_style,
	secondary_style,
) {
	for (const attr of ['left', 'right', 'top', 'bottom', 'opacity']) {
		if (anim_info[attr]) {
			animated_style[attr] = time_value.interpolate({
				inputRange: [0, 1],
				outputRange: [anim_info[attr][0], anim_info[attr][1]],
			})
		}
	}
	if ('undefined' !== typeof anim_info.blink) {
		//console.log('blink', anim_info.blink)
		animated_style.opacity = time_value.interpolate({
			inputRange: [0, 1],
			outputRange: [anim_info.blink, 1],
		})
	}
	if ('undefined' !== typeof anim_info.handle_blink) {
		//console.log('blink', anim_info.blink)
		secondary_style.opacity = time_value.interpolate({
			inputRange: [0, 1],
			outputRange: [anim_info.handle_blink, 1],
		})
	}
}

export function start_timer(anim_info, time_value, skip_reset = false) {
	if (verbose) console.log('start_timer anim_info', anim_info)
	if (!skip_reset) time_value.setValue(0)
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
		start_anim_bounce(time_value, anim_info.duration)
	} else {
		let params = {toValue: 1, duration: anim_info.duration}
		if (anim_info.delay) params.delay = anim_info.delay
		Animated.timing(time_value, params).start()
	}
}

export function has_timer(anim_info) {
	//console.log('blink', anim_info.blink)
	return (
		anim_info &&
		(anim_info.duration ||
			'undefined' !== typeof anim_info.blink ||
			'undefined' !== typeof anim_info.handle_blink)
		// || 'undefined' !== typeof anim_info.move_extra_dot  // for Tile
	)
}

export function init_anim(anim_info, time_value) {
	if (has_timer(anim_info)) start_timer(anim_info, time_value)
}

export function update_anim(
	anim_info,
	time_value,
	prev_anim_info,
	skip_reset = false,
) {
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
		start_timer(anim_info, time_value, skip_reset)
	}
	if (had_timer && !has_timer(anim_info)) {
		Animated.timing(time_value).stop()
	}
}

export function start_anim_loop(anim_var, duration, delay = 0) {
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
	]).start()
}

export function start_anim_bounce(anim_var, durations, delay = 0) {
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
	Animated.sequence(half).start()
}

// THIS FUNCTION IS OLD, AND SHOULD BE REMOVED
export function start_anim(
	anim_var,
	toValue,
	duration,
	delay = 0,
	ending_function,
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
