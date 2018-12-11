// @flow

export type NativeLayout = {
	layout: {
		width: number,
		height: number,
		x: number,
		y: number,
	},
}

export type DimensionsType = {width: number, height: number}

type Touch = {
	_normalized: boolean,
	clientX: number,
	clientY: number,
	force: number,
	identifier: number,
	locationX: number,
	locationY: number,
	pageX: number,
	pageY: number,
	radiusX: number,
	radiusY: number,
	rotationAngle: number,
	screenX: number,
	screenY: number,
	target: any,
	timestamp: number,
}

export type NativeEvent = {
	_normalized: boolean,
	bubbles: boolean,
	cancelable: boolean,
	changedTouches: Array<Touch>,
	defaultPrevented: boolean,
	identifier: number,
	locationX: number,
	locationY: number,
	pageX: number,
	pageY: number,
	preventDefault: () => any,
	stopImmediatePropagation: () => any,
	stopPropagation: () => any,
	target: any,
	touches: Array<Touch>,
	type: string,
	which: number,
}

export type GestureEvent = PanEvent | RotationEvent

export type PanEvent = {
	x: number,
	y: number,
	state: number,
	translationX: number,
	translationY: number,
	gesture: 2,
}

export type RotationEvent = {
	x: number,
	y: number,
	state: number,
	rotation: number,
	gesture: 1,
}

export type NativeRotationEvent = {
	anchorX: number,
	anchorY: number,
	handlerTag: number,
	numberOfPointers: 2,
	oldState: number,
	rotation: number,
	state: number,
	target: number,
	velocity: number,
}

export type NativePanEvent = {
	absoluteX: number,
	absoluteY: number,
	handlerTag: number,
	numberOfPointers: 1,
	oldState: number,
	state: number,
	target: number,
	translationX: number,
	translationY: number,
	velocityX: number,
	velocityY: number,
	x: number,
	y: number,
}
