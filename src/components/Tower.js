import React from 'react'
import Block from './Block'
import {StyleSheet, Animated} from 'react-native'
import {query_tower_blocks} from '../providers/query_tower'
import {global_workspace_height} from './Workspace'
import {global_fiver_shadow} from './Num'
import {global_constant} from '../lib/global'
import * as Anim from '../event/animation'

function colorNameToHex(color) {
	const colors = {
		aliceblue: '#f0f8ff',
		antiquewhite: '#faebd7',
		aqua: '#00ffff',
		aquamarine: '#7fffd4',
		azure: '#f0ffff',
		beige: '#f5f5dc',
		bisque: '#ffe4c4',
		black: '#000000',
		blanchedalmond: '#ffebcd',
		blue: '#0000ff',
		blueviolet: '#8a2be2',
		brown: '#a52a2a',
		burlywood: '#deb887',
		cadetblue: '#5f9ea0',
		chartreuse: '#7fff00',
		chocolate: '#d2691e',
		coral: '#ff7f50',
		cornflowerblue: '#6495ed',
		cornsilk: '#fff8dc',
		crimson: '#dc143c',
		cyan: '#00ffff',
		darkblue: '#00008b',
		darkcyan: '#008b8b',
		darkgoldenrod: '#b8860b',
		darkgray: '#a9a9a9',
		darkgreen: '#006400',
		darkkhaki: '#bdb76b',
		darkmagenta: '#8b008b',
		darkolivegreen: '#556b2f',
		darkorange: '#ff8c00',
		darkorchid: '#9932cc',
		darkred: '#8b0000',
		darksalmon: '#e9967a',
		darkseagreen: '#8fbc8f',
		darkslateblue: '#483d8b',
		darkslategray: '#2f4f4f',
		darkturquoise: '#00ced1',
		darkviolet: '#9400d3',
		deeppink: '#ff1493',
		deepskyblue: '#00bfff',
		dimgray: '#696969',
		dodgerblue: '#1e90ff',
		firebrick: '#b22222',
		floralwhite: '#fffaf0',
		forestgreen: '#228b22',
		fuchsia: '#ff00ff',
		gainsboro: '#dcdcdc',
		ghostwhite: '#f8f8ff',
		gold: '#ffd700',
		goldenrod: '#daa520',
		gray: '#808080',
		green: '#008000',
		greenyellow: '#adff2f',
		honeydew: '#f0fff0',
		hotpink: '#ff69b4',
		'indianred ': '#cd5c5c',
		indigo: '#4b0082',
		ivory: '#fffff0',
		khaki: '#f0e68c',
		lavender: '#e6e6fa',
		lavenderblush: '#fff0f5',
		lawngreen: '#7cfc00',
		lemonchiffon: '#fffacd',
		lightblue: '#add8e6',
		lightcoral: '#f08080',
		lightcyan: '#e0ffff',
		lightgoldenrodyellow: '#fafad2',
		lightgrey: '#d3d3d3',
		lightgreen: '#90ee90',
		lightpink: '#ffb6c1',
		lightsalmon: '#ffa07a',
		lightseagreen: '#20b2aa',
		lightskyblue: '#87cefa',
		lightslategray: '#778899',
		lightsteelblue: '#b0c4de',
		lightyellow: '#ffffe0',
		lime: '#00ff00',
		limegreen: '#32cd32',
		linen: '#faf0e6',
		magenta: '#ff00ff',
		maroon: '#800000',
		mediumaquamarine: '#66cdaa',
		mediumblue: '#0000cd',
		mediumorchid: '#ba55d3',
		mediumpurple: '#9370d8',
		mediumseagreen: '#3cb371',
		mediumslateblue: '#7b68ee',
		mediumspringgreen: '#00fa9a',
		mediumturquoise: '#48d1cc',
		mediumvioletred: '#c71585',
		midnightblue: '#191970',
		mintcream: '#f5fffa',
		mistyrose: '#ffe4e1',
		moccasin: '#ffe4b5',
		navajowhite: '#ffdead',
		navy: '#000080',
		oldlace: '#fdf5e6',
		olive: '#808000',
		olivedrab: '#6b8e23',
		orange: '#ffa500',
		orangered: '#ff4500',
		orchid: '#da70d6',
		palegoldenrod: '#eee8aa',
		palegreen: '#98fb98',
		paleturquoise: '#afeeee',
		palevioletred: '#d87093',
		papayawhip: '#ffefd5',
		peachpuff: '#ffdab9',
		peru: '#cd853f',
		pink: '#ffc0cb',
		plum: '#dda0dd',
		powderblue: '#b0e0e6',
		purple: '#800080',
		rebeccapurple: '#663399',
		red: '#ff0000',
		rosybrown: '#bc8f8f',
		royalblue: '#4169e1',
		saddlebrown: '#8b4513',
		salmon: '#fa8072',
		sandybrown: '#f4a460',
		seagreen: '#2e8b57',
		seashell: '#fff5ee',
		sienna: '#a0522d',
		silver: '#c0c0c0',
		skyblue: '#87ceeb',
		slateblue: '#6a5acd',
		slategray: '#708090',
		snow: '#fffafa',
		springgreen: '#00ff7f',
		steelblue: '#4682b4',
		tan: '#d2b48c',
		teal: '#008080',
		thistle: '#d8bfd8',
		tomato: '#ff6347',
		turquoise: '#40e0d0',
		violet: '#ee82ee',
		wheat: '#f5deb3',
		white: '#ffffff',
		whitesmoke: '#f5f5f5',
		yellow: '#ffff00',
		yellowgreen: '#9acd32',
	}

	return typeof colors[color.toLowerCase()] !== 'undefined'
		? colors[color.toLowerCase()]
		: false
}

function from_hex(char0, char1 = '') {
	return parseInt(' 0x' + char0 + char1, 16)
}

export function as_greyscale(color) {
	let rgb
	if ('rgb' === color.substr(0, 3)) {
		console.error('as_greyscale not prepared for rgb input!', color)
		return color
	} else {
		let hex = ''
		if ('#' === color.charAt(0)) {
			// already hex
			hex = color
		} else {
			hex = colorNameToHex(color)
		}
		hex = hex.substr(1)
		if (6 === hex.length) {
			rgb = [
				from_hex(hex.charAt(0), hex.charAt(1)),
				from_hex(hex.charAt(2), hex.charAt(3)),
				from_hex(hex.charAt(4), hex.charAt(5)),
			]
		} else {
			// assume length 3
			rgb = [
				from_hex(hex.charAt(0)),
				from_hex(hex.charAt(1)),
				from_hex(hex.charAt(2)),
			]
		}
	}
	let avg = Math.floor((rgb[0] + rgb[1] + rgb[2]) / 3)
	const res = 'rgb(' + avg + ', ' + avg + ', ' + avg + ')'
	//console.log('as_greyscale color', color, 'res', res)
	return res
}

class Tower extends React.Component {
	state = {
		timer: Anim.new_timer(),
	}

	componentDidMount() {
		Anim.init_anim(this.props.id, this.props.anim_info, this.state.timer)
	}

	componentDidUpdate(prev_props) {
		Anim.update_anim(
			this.props.id,
			this.props.anim_info,
			this.state.timer,
			prev_props.anim_info,
		)
	}

	render() {
		let {
			id,
			name,
			position,
			style = {},
			anim_info = {},
			misc = null,
			block_opacity = [],
			block_anim_info = [],
			just_grey = false,
			scale_factor,
		} = this.props
		// console.log('id', id, 'name', name, 'block_opacity', block_opacity)
		// console.log('id', id, 'name', name, 'misc', misc)
		// console.log('id', id, 'anim_info', anim_info)
		// console.log('id', id, 'block_anim_info', block_anim_info)
		if ('undefined' === typeof name) {
			console.error('Cannot render tower id', id)
			return null
		}
		let animated_style = {}
		if (anim_info) {
			Anim.interpolate_anim_attr(
				id,
				anim_info,
				this.state.timer,
				animated_style,
			)
		}

		const block_info = query_tower_blocks(
			id,
			{name, position, block_opacity},
			null,
			scale_factor,
		)
		//console.log('block_info', block_info)
		const selected_block_index = misc && misc.selected_block_index
		//console.log('selected_block_index', selected_block_index)

		let blocks = [],
			small_in_a_row = 0
		let fiver_in_a_row = 0 // prev_size = null
		for (let i = 0; i < block_info.length; ++i) {
			// compute all the style info for the blocks here, where we have context
			const b = block_info[i]
			const is_small = b.height < 10
			const is_tiny = b.height < 4
			// console.log('is_tiny', is_tiny)
			const is_fiver = b.is_fiver
			const size = b.size
			//console.log('size', size)
			if (is_small && !is_fiver) ++small_in_a_row
			else small_in_a_row = 0

			let width = b.width
			let height = b.height
			const bottom = b.bottom
			let marginBottom = is_tiny || is_fiver ? 0 : 1
			const radius = 0.1 * (0.5 * (height + width))
			let radius_style = {}
			if (1 === 0 && is_fiver) {
				if (1 === fiver_in_a_row || 5 === fiver_in_a_row) height -= 1
				if (1 === fiver_in_a_row) {
					marginBottom = 1
					radius_style = {
						borderBottomLeftRadius: radius,
						borderBottomRightRadius: radius,
					}
				}
				if (5 === fiver_in_a_row) {
					radius_style = {
						borderTopLeftRadius: radius,
						borderTopRightRadius: radius,
					}
				}
			} else {
				if (is_tiny) height -= 0
				else if (is_small) height -= 1
				else height -= 2
				if (!is_small) radius_style = {borderRadius: radius}
			}
			let bg = width < 50 ? 'darkred' : '#dbb'
			let marginLeft = 0
			if (is_small) {
				if (
					//is_fiver ||
					!(small_in_a_row % 2)
				) {
					const rev = misc && misc.reverse_ant_offsets
					marginLeft = rev ? -10 : 10
					if (width < 50) bg = 'red'
				}
			}
			if (just_grey) bg = as_greyscale(bg)
			// console.log('misc', misc)
			if (misc && misc.backgroundColor) {
				bg = misc.backgroundColor
			}
			let view_style = {
				position: 'absolute',
				backgroundColor: bg,
				bottom,
				marginBottom,
				marginLeft,
				//...fiver_style
			}
			if (misc && misc.block_offset && misc.block_offset[i]) {
				view_style.left = misc.block_offset[i][0]
				view_style.bottom = misc.block_offset[i][1]
			}
			let img_name = null
			//const img_name_array = ['unit', 'fiverTurtle', 'turtle']
			// const img_name_array = ['cow3', 'fiverTurtle', 'turtle']
			const img_name_array = ['goat', 'anansi', 'anansi']
			if (-1 === size && !is_fiver) img_name = img_name_array[2]
			else if (-1 === size && is_fiver) img_name = img_name_array[1]
			else if (0 === size && !is_fiver) img_name = img_name_array[0]
			let inner_anim_info
			if (block_anim_info && block_anim_info[i]) {
				inner_anim_info = block_anim_info[i]
			}
			if ('undefined' !== typeof b.block_opacity) {
				view_style.opacity = b.block_opacity
			} else if (
				'undefined' !== typeof selected_block_index &&
				null !== selected_block_index
			) {
				let how_many = 1
				if (misc && misc.num_selected_blocks) {
					how_many = misc.num_selected_blocks
				}
				// console.log('sel', selected_block_index, 'how_many', how_many)
				if (i < selected_block_index || i >= selected_block_index + how_many) {
					view_style.opacity = 0.25
				}
			}

			let text_content = global_constant.tower.size2symbol[size]
			let color = global_constant.tower.size2color[size]
			if (just_grey) color = as_greyscale(color)
			const left = scale_factor / 35 + (size >= 0 ? -0.19 * height : 0)
			let textBottom = (0 === size ? 0.25 : -2 === size ? -1 : 0.1) * height
			let fontSize = (is_tiny ? 0 : is_small ? 2 : 0.75) * height
			let shadow_style = {}
			if (misc && misc.as_diagram) {
				img_name = 'diagram'
				view_style.backgroundColor = 'none'
			}
			if (is_fiver) {
				text_content +=
					'\n' +
					text_content +
					'\n' +
					text_content +
					'\n' +
					text_content +
					'\n' +
					text_content
				fontSize /= 5
				textBottom *= 0.8
				shadow_style = {...global_fiver_shadow[is_fiver]}
				if (just_grey) {
					const orig = shadow_style.textShadowColor
					//console.log('orig', orig)
					shadow_style.textShadowColor = as_greyscale(orig)
				}
				if (misc && misc.as_diagram) {
					let bCol = 'darkred'
					if (just_grey) bCol = as_greyscale(bCol)
					view_style.borderColor = bCol
					view_style.borderWidth = scale_factor / 52
					//view_style.width = 50
					width = scale_factor / 7
					textBottom -= scale_factor / 35
				}
			}
			let text_style = {
				position: 'absolute',
				fontSize,
				color,
				left,
				bottom: textBottom,
				...shadow_style,
			}
			if (0 === size && !is_fiver) {
				// stretch the blue symbol
				text_style.transformOrigin = 'bottom left'
				text_style.transform = [{scaleY: 2.0}]
				text_style.bottom = 0
			}
			if (misc && misc.top_just_outline) {
				if (i + misc.top_just_outline >= block_info.length) {
					just_grey = 'outline'
					view_style.backgroundColor = '#dbb'
				}
			}
			let swap_channel
			if (misc && misc.swap_channel) swap_channel = misc.swap_channel
			const hide_all_symbols = true
			// console.log('width', width, 'height', height)
			blocks.push(
				<Block
					key={i}
					anim_info={inner_anim_info}
					height={height}
					id={id + '.' + i}
					img_name={img_name}
					is_fiver={is_fiver}
					just_grey={just_grey}
					radius_style={radius_style}
					scale_factor={scale_factor}
					swap_channel={swap_channel}
					text_content={hide_all_symbols ? null : text_content}
					text_style={text_style}
					view_style={view_style}
					width={width}
				/>,
			)
		}
		return (
			<Animated.View
				style={[
					styles.tower,
					{height: global_workspace_height},
					style,
					animated_style,
				]}
			>
				{blocks}
			</Animated.View>
		)
	}
}

const styles = StyleSheet.create({
	tower: {
		position: 'absolute',
		bottom: 0,
	},
})

export default Tower
