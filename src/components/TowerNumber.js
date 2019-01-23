import React from 'react'
import {StyleSheet, Animated, Image, Text} from 'react-native'
import * as Anim from '../event/animation'
import {image_location} from '../lib/images'

class TowerNumber extends React.Component {
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
			// position,
			anim_info,
			keypad_column,
			target,
			tower_number_style,
			hide_image,
			// just_grey = false,
		} = this.props
		// console.log('TowerNumber id', this.props.id, 'name', this.props.name)

		if ('undefined' === typeof name) {
			console.error('Cannot render tower number id', id)
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

		let digits = [0, 0, 0] // goats, anansis, baby anansis
		for (let i = 0; i < name.length; ++i) {
			if (name[i] > 0.999) digits[0] += Math.round(name[i])
			else if (10 * name[i] > 0.999) digits[1] += Math.round(10 * name[i])
			else if (100 * name[i] > 0.999) digits[2] += Math.round(100 * name[i])
		}
		//console.log(digits)

		let goat_style = {}
		let spider_style = {}
		let ant_style = {}
		if (id === target) {
			if (keypad_column === 'goat') {
				goat_style = {
					borderWidth: '2px solid black',
				}
			}
			if (keypad_column === 'spider') {
				spider_style = {
					borderWidth: '2px solid black',
				}
			}
			if (keypad_column === 'ant') {
				ant_style = {
					borderWidth: '2px solid black',
				}
			}
		}

		let name_elements = []
		if (!hide_image) {
			name_elements.push(
				<Image
					key={1}
					source={image_location('goat')}
					style={[styles.goat_image, goat_style]}
				/>,
			)
			name_elements.push(
				<Image
					key={2}
					source={image_location('anansi')}
					style={[styles.anansi_image, spider_style]}
				/>,
			)
			name_elements.push(
				<Image
					key={3}
					source={image_location('ant')}
					style={[styles.ant_image, ant_style]}
				/>,
			)
		}

		let show_digit = false
		for (let i = 0; i < digits.length; ++i) {
			if (digits[i] > 0 || i + 1 === digits.length) show_digit = true
			if (show_digit) {
				name_elements.push(
					<Text
						key={4 + i}
						style={[styles.tower_number_element, {left: 60 * i - 10}]}
					>
						{digits[i]}
					</Text>,
				)
			}
		}
		return (
			<Animated.View
				style={[styles.tower_number, tower_number_style, animated_style]}
			>
				{name_elements}
			</Animated.View>
		)
	}
}

const styles = StyleSheet.create({
	tower_number: {
		position: 'absolute',
		bottom: -90,
		left: 5,
	},
	goat_image: {
		position: 'absolute',
		width: 60,
		height: 72,
		bottom: 11,
		left: -12,
	},
	anansi_image: {
		position: 'absolute',
		width: 50,
		height: 40,
		left: 55,
		bottom: 11,
	},
	ant_image: {
		position: 'absolute',
		width: 40,
		height: 30,
		left: 120,
		bottom: 11,
	},
	tower_number_element: {
		position: 'absolute',
		bottom: -90,
		fontSize: 100,
	},
})

export default TowerNumber
