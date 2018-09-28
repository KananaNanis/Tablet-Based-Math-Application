import {Platform} from 'react-native'
import {
	global_is_mobile,
	global_is_safari,
	global_screen_width,
} from '../myglobal'
import {load_config_tree} from '../App'
import {window2workspaceCoords} from '../components/Workspace'
import {touch_dispatcher} from './dispatcher'

let mouseTouchID = 100
let currentNumTouches = 0
let mouseIsDown = false
export var numTouchesAtLeft = 0
export var numTouchesAtRight = 0
export var numTouchesAtTop = 0
export var stored_touches = {}
export var ignore_touches = false

function myPreventDefault(synthetic_event) {
	//if (isTeacherInfoLevel()) return;  // don't prevent on this special level!
	//var evt = synthetic_event.nativeEvent
	if (global_is_mobile && !global_is_safari) {
		// check whether we cannot prevent it anyway
		const type = synthetic_event.type.substr(5)
		if ('start' === type || 'move' === type) {
		} else synthetic_event.preventDefault()
	} else synthetic_event.preventDefault()
}

export function touchHandler(synthetic_event, on_grant) {
	myPreventDefault(synthetic_event) // prevent default on everything
	var evt = synthetic_event.nativeEvent
	const type = synthetic_event.type.substr(5)
	//if ('move' != type) console.log('touchHandler ' + type)
	const touches = evt.changedTouches // , first = touches[0]
	currentNumTouches = evt.touches.length
	numTouchesAtLeft = 0
	numTouchesAtRight = 0
	numTouchesAtTop = 0
	numTouchesAtTopLeft = 0
	for (const i = 0, i_end = evt.touches.length; i < i_end; ++i) {
		if (evt.touches[i].clientX < 100) ++numTouchesAtLeft
		if (evt.touches[i].clientX > global_screen_width - 100) ++numTouchesAtRight
		if (evt.touches[i].clientY < 100) ++numTouchesAtTop
		if (evt.touches[i].clientX < 100 && evt.touches[i].clientY < 100)
			++numTouchesAtTopLeft
	}
	//console.log('numTouchesAtLeft ' + numTouchesAtLeft + ' numTouchesAtTop ' + numTouchesAtTop)
	if (false && 1 === numTouchesAtTopLeft) {
		// reload
		load_config_tree()
		return
	}
	if (6 === currentNumTouches) {
		// check whether reload is requested
		if (4 === numTouchesAtTop) {
			// this is to make it harder to do accidentally
			if (Platform.OS === 'web') {
				// reload!
				alert('reloading!')
				window.location.reload(true)
			} else {
				console.warn('reloading not implemented yet')
			}
			return
		}
	}
	const is_mouse = Platform.OS === 'web'
	if (is_mouse) mouseTouchID++
	let handled = []
	for (const i = 0, i_end = touches.length; i < i_end; ++i) {
		const x0 = touches[i].clientX,
			y0 = touches[i].clientY
		// x += document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;  // handle scroll position?
		// y += document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop
		const [x, y] = window2workspaceCoords([x0, y0])
		handlerDispatch(
			type,
			x,
			y,
			is_mouse ? mouseTouchID : touches[i].identifier,
			evt,
		)
		handled.push(touches[i].identifier)
	}
	if (!is_mouse) extraTouchCleanup(evt, handled)
}

function handlerDispatch(type, x, y, touchID, e) {
	//document.getElementById('currentUserButton').textContent = type + ' ' + touchID + ' ignore ' + ignore_touches + ' until ' + global.ignore_until_full_release
	//log(type + ' ' + touchID)
	const v = false
	/*
    NOTE:  add these back!
    // need user interaction for ipad :(
    if (!global.audioInitialized) initAudio()
    if (!global.fullScreenInitialized) {
      global.fullScreenInitialized = true
      document.documentElement.webkitRequestFullscreen()
    }
  */
	if (ignore_touches) {
		/*  NOTE:  add this back, in some form!
    var n = document.elementFromPoint(x, y)
    if (n && n.getAttribute("id") === "currentUserButton")
      ignore_touches = false
    else return
    */
		console.log('ignore_touches ' + ignore_touches)
		return
	}
	if ('down' === type || 'start' === type) {
		if (v) console.log('handerDispatch ' + x + ' ' + y + ' raw ')
		mouseIsDown = true
	} else if (
		'up' == type ||
		'end' == type ||
		'cancel' == type ||
		'cleanup' == type
	) {
		// store_this_touch(type, x, y, touchID);  // wait until after event
		mouseIsDown = false
	} else if (global.is_mobile && 'move' == type) {
		mouseIsDown = true // needed for multi-touch
	}
	let recordTouchesRightAway = mouseIsDown
	if (recordTouchesRightAway) store_this_touch(type, x, y, touchID)
	switch (type) {
		case 'down':
		case 'start':
			touch_dispatcher('down', x, y, touchID)
			break
		case 'move':
			if (global.is_mobile || mouseIsDown) {
				touch_dispatcher('move', x, y, touchID)
			}
			break
		case 'up':
		case 'cancel':
		case 'end':
			touch_dispatcher('up', x, y, touchID)
			break
		default:
			console.log('unrecognized event type: ' + type)
			return
	}
	if ('up' == type || 'end' == type || 'cleanup' == type || 'cancel' == type) {
		store_this_touch(type, x, y, touchID) // wait until after event
	}
}

function addHTMLcircle(x, y, radius) {
	/*
    // this is for the tablet, that seems not to understand the old addPoint fn?
    var c = document.createElement('div')
    c.className = "htmlCircle"
    c.style.left = (x - radius/2) + 'px'
    c.style.top = (y - radius/2) + 'px'
    c.style.width = (radius - 4) + 'px'
    c.style.height = (radius - 4) + 'px'
    document.getElementById('topDiv').appendChild(c)
    return c
  */
}

function store_this_touch(type, x, y, touchID) {
	var showCircles = false
	var radius = 200
	if ('down' === type || 'start' === type) {
		stored_touches[touchID] = {}
		stored_touches[touchID].x = x
		stored_touches[touchID].y = y
		// console.log('creating ' + touchID)
		if (showCircles) {
			var circle = addHTMLcircle(x, y, radius)
			circle.textContent = touchID
			stored_touches[touchID].circle = circle
			// document.getElementById('currentUserButton').textContent = type + ' ' + touchID
		}
	} else if ('move' === type) {
		if (showCircles && stored_touches[touchID].circle) {
			var circle = stored_touches[touchID].circle
			circle.style.left = x - radius / 2 + 'px'
			circle.style.top = y - radius / 2 + 'px'
		}
		if (stored_touches[touchID]) {
			stored_touches[touchID].x = x
			stored_touches[touchID].y = y
		}
	} else if (
		'up' === type ||
		'end' === type ||
		'cleanup' == type ||
		'cancel' === type
	) {
		if (
			showCircles &&
			stored_touches[touchID] &&
			stored_touches[touchID].circle
		) {
			var circle = stored_touches[touchID].circle
			circle.parentNode.removeChild(circle)
			delete stored_touches[touchID].circle
		}
		if (stored_touches[touchID]) {
			if (stored_touches[touchID].preserve) {
				//log('delete prevented due to touch.preserve for id ' + touchID)
			} else {
				// log("delete'ing touch " + touchID)
				delete stored_touches[touchID]
			}
		}
		// console.log('deleting ' + touchID);  // why are empty slots appearing?
	}
	//console.log(stored_touches)
}

function arrayContainsInteger(arr, val) {
	for (const i = 0; i < arr.length; ++i) if (arr[i] == val) return true
	return false
}

function extraTouchCleanup(e, handled = []) {
	// console.log('extraTouchCleanup handled.length ' + handled.length)
	//  assert(e);  // we need the event, for the OS returned touches!
	// log('extraTouchCleanup page ' + Object.keys(stored_touches).length + ' tablet ' + (e ? e.touches.length : 'NaN'))
	if (Object.keys(stored_touches).length > 0) {
		// look for touches that should no longer be in the global touch list
		var allIds = []
		if (e && e.touches) {
			for (var i = 0, i_end = e.touches.length; i < i_end; ++i)
				allIds.push(e.touches[i].identifier)
		}
		var cancelled = [],
			numPreserved = 0
		for (var key in stored_touches) {
			if (!stored_touches.hasOwnProperty(key)) continue
			//if (!allIds.includes(key) && !handled.includes(key))
			if (
				!arrayContainsInteger(allIds, key) &&
				!arrayContainsInteger(handled, key) &&
				!stored_touches[key].preserve
			) {
				// found one that should not be here
				handlerDispatch('cleanup', -1, -1, key, e)
				cancelled.push(key)
			} else if (stored_touches[key].preserve) ++numPreserved
		}
		// log('  numPreserved ' + numPreserved)
		// document.getElementById('currentUserButton').textContent = ' cancelled: ' + cancelled + ' allIds ' + allIds
	}
}
