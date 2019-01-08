import React from 'react'
import {Text, View, StyleSheet} from 'react-native'
import Tile from './Tile'
import FiveFrame from './FiveFrame'
import Num from './Num'
import {global_constant} from '../lib/global'
import {height2tower_name} from '../providers/query_tower'
import {query_prop} from '../providers/query_store'
//import { global_screen_width, global_screen_height} from './Workspace'

function init_page_dimensions(
	use11x17,
	landscape,
	scale_down_for_laptop,
	rotate_whole_page,
) {
	let width, height
	if (use11x17) {
		if (landscape) {
			width = global_constant.print_size11x17.height
			height = global_constant.print_size11x17.width
		} else {
			width = global_constant.print_size11x17.width
			height = global_constant.print_size11x17.height
		}
	} else {
		// use 8.5 x 11
		if (landscape) {
			width = global_constant.print_size8p5x11.height
			height = global_constant.print_size8p5x11.width
		} else {
			width = global_constant.print_size8p5x11.width
			height = global_constant.print_size8p5x11.height
		}
	}
	let transform = []
	if (scale_down_for_laptop) {
		// temporary scale factor, so that I can see what the eventual result
		//   looks like:
		if (use11x17) transform.push({scale: 0.28})
		else {
			if (landscape) transform.push({scale: 0.58})
			//if (landscape) transform.push({ 'scale': 0.28 })
			else transform.push({scale: 0.38})
		}
	}
	if (rotate_whole_page) {
		transform.push({rotate: '90deg'})
		transform.push({translateY: -1 * height})
	}
	return [width, height, transform]
}

const PrintFigure = () => {
	const scale_down_for_laptop = true
	const rotate_whole_page = false
	let use11x17 = true
	let landscape = false
	let show_purple_border = true

	if (!global_constant.print_size11x17) return null
	const extra_scale =
		global_constant.print_pixels_per_cm / global_constant.screen_pixels_per_cm

	let content = []
	const skip = false
	const keep = true
	if (skip) {
		// print all the animals, multiple per sheet
		let anim1 = {
			// first animal figure positions
			kitty: [1100, 1600],
			puppy: [1100, 1950],
			rhino: [5, 1300],
			dragon: [5, 5],
			giraffe: [795, 5],
		}
		let anim2 = {
			crab: [1020, 5],
			duck: [945, 1900],
			pig: [5, 1850],
			horse: [5, 930],
			moose: [5, 5],
			ladybug: [1100, 700],
			mouse: [1100, 550],
			fish: [1100, 300],
		}
		let anim3 = {
			chimpanzee: [1130, 1600],
			bear: [700, 1600],
			chick: [5, 1600],
			sloth: [750, 830],
			deer: [5, 850],
			bull: [720, 5],
			unicorn: [5, 5],
		}
		anim1, anim2, anim3
		const anim = anim3
		for (const name in anim) {
			if (anim.hasOwnProperty(name)) {
				content.push(
					<Tile
						key={name}
						extra_scale={extra_scale}
						name={name}
						position={anim[name]}
					/>,
				)
			}
		}
	} else if (skip) {
		// print just one animal, large!
		if (skip) {
			const name = 'unicorn'
			const misc = {extra_scale: 2.9 * extra_scale}
			content.push(
				<Tile key={name} misc={misc} name={name} position={[-350, 5]} />,
			)
		} else if (skip) {
			// two somewhat smaller unicorns
			const name = 'unicorn'
			let misc = {extra_scale: 2 * extra_scale}
			content.push(<Tile key={1} misc={misc} name={name} position={[5, 5]} />)
			misc = {extra_scale: 1.5 * extra_scale}
			content.push(
				<Tile
					key={2}
					misc={misc}
					name={name}
					position={[300, 1500]}
					style={{transform: [{rotate: '90deg'}]}}
				/>,
			)
		} else if (keep) {
			const name = 'giraffe'
			const misc = {extra_scale: 1.94 * extra_scale}
			content.push(
				<Tile key={name} misc={misc} name={name} position={[5, 5]} />,
			)
		} else if (skip) {
			// two somewhat smaller giraffes
			const name = 'giraffe'
			let misc = {extra_scale: 1.4 * extra_scale}
			content.push(<Tile key={1} misc={misc} name={name} position={[5, 5]} />)
			misc = {extra_scale: 1.2 * extra_scale}
			content.push(
				<Tile
					key={2}
					misc={misc}
					name={name}
					position={[300, 1370]}
					style={{transform: [{rotate: '90deg'}]}}
				/>,
			)
		}
	} else if (skip) {
		// print 5-frames
		use11x17 = false
		landscape = true
		show_purple_border = false
		for (let i = 0; i < 6; ++i) {
			content.push(<FiveFrame key={i} name={5} position={[5 + i * 245, 5]} />)
		}
	} else if (keep) {
		console.log('HI')
		use11x17 = false
		landscape = true
		show_purple_border = true
		// const vals = [0.1, 0.5, 1.0]
		// const scale_factor = query_prop('scale_factor')
		for (let i = 0; i < 3; ++i) {
			content.push(<FiveFrame key={i} name={5} position={[5 + i * 245, 5]} />)
			/*
				content.push(
					<Num
						key={i}
						id={'tower_' + i}
						misc={{hide_tower_name: true}}
						name={height2tower_name(vals[i % 3])}
						position={[150 * (i) + 50 * i + 50, 0]}
						scale_factor={scale_factor}
					/>,
				)
				*/
		}
	} else if (skip) {
		// print worksheets for learning to draw tower diagrams
		use11x17 = false
		landscape = true
		show_purple_border = false
		const page1 = true
		if (page1) {
			content.push(
				<Text key="name" style={styles.draw_diagram_page1}>
					10/15/2018 Name: _____________________________
				</Text>,
			)
		}
		const vals = page1 ? [0.6, 1.1, 0.4] : [0.8, 1.6, 1.9]
		const opacity = [1, 0.2, 0]
		const scale_factor = query_prop('scale_factor')
		for (let i = 0; i < 3; ++i) {
			for (let j = 0; j < 3; ++j) {
				content.push(
					<Num
						key={3 * i + j}
						id={'tower_' + i}
						just_grey={true}
						misc={{as_diagram: true, hide_tower_name: true}}
						name={height2tower_name(vals[i % 3])}
						position={[150 * (3 * i + j) + 50 * i + 50, 0]}
						scale_factor={scale_factor}
						style={{opacity: opacity[j]}}
					/>,
				)
			}
			content.push(
				<View key={'sep' + i} style={[styles.draw_diagram, {left: 500 * i}]} />,
			)
		}
	} else {
		// print packets for teams building from diagrams
		use11x17 = false
		landscape = true
		//show_purple_border = false
		const page = 1
		const vals = [1.1, 0.3, 0.4, 1.2, 0.6, 0.8, 1.7, 1.8]
		const val = vals[page]
		if (skip) {
			content.push(
				<Text key="name" style={styles.draw_diagram_page1}>
					9/20/2018 Name: _________________
				</Text>,
			)
		}
		const scale_factor = query_prop('scale_factor')
		for (let i = 0; i < 4; ++i) {
			for (let j = 0; j < 2; ++j) {
				let val2 = (page + j) % 2 ? 0 : val
				val2 = vals[2 * i + j] // temporary!
				content.push(
					<Num
						key={2 * i + j}
						id={'tower_' + (2 * i + j)}
						just_grey={true}
						misc={{as_diagram: true, hide_tower_name: true}}
						name={height2tower_name(val2)}
						position={[150 * (2 * i + j) + 50 * i + 50, 0]}
						scale_factor={scale_factor}
					/>,
				)
				content.push(
					<View
						key={'sep' + i}
						style={[
							{
								left: 175 * (2 * i + j),
							},
							styles.draw_diagram,
						]}
					/>,
				)
			}
		}
	}
	let [width, height, transform] = init_page_dimensions(
		use11x17,
		landscape,
		scale_down_for_laptop,
		rotate_whole_page,
	)
	let borderWidth = show_purple_border ? 1 : 0
	borderWidth = 20
	console.log('OK')
	content = null
	width = 100
	height = 100
	console.log(width, height, transform)

	return (
		<View style={[styles.print_figure, {width, height, borderWidth}]}>
			<Text>HELLO?</Text>
		</View>
	)
	/*
	return (
		<View
			style={[styles.print_figure, {width, height, transform, borderWidth}]}
		>
			{content}
		</View>
	)
*/
}

const pageBorder = 'purple'
const diagramBorder = 'black'
const styles = StyleSheet.create({
	print_figure: {
		position: 'absolute',
		display: 'block',
		borderColor: pageBorder,
		transformOrigin: 'top left',
	},
	draw_diagram_page1: {
		position: 'absolute',
		left: 50,
		top: 50,
		fontSize: 30,
	},
	draw_diagram: {
		position: 'absolute',
		bottom: 0,
		width: 0,
		height: 1000,
		borderLeftWidth: 2,
		borderLeftColor: diagramBorder,
	},
})

export default PrintFigure
