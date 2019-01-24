import React from 'react'
import {StyleSheet, Animated, Image, Text, View} from 'react-native'
import * as Anim from '../event/animation'
import {image_location} from '../lib/images'
import {global_constant} from '../lib/global'

class TowerViewabilityImages extends React.Component {
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

		let ant_images = []
		let number_of_ants = name[name.length - 1] < 0.1 ? name[name.length - 1] * 100 : null
    let ant2_image = {name: 'ant2', style: styles.ant2_image, extra_style: {} }
    console.log("Number of ants", number_of_ants)
		for (let i = 0; i < number_of_ants; ++i) {
			ant_images.push(
				<View key={9 + i}>
						<Image
							key={1}
							source={ image_location(ant2_image.name) }
							style={ ant2_image.style }
						/>
				</View>,
			)
		}
		return (
			<Animated.View
				style={[styles.tower_number, tower_number_style]}
			>
				{ant_images}
			</Animated.View>
		)
	}
}

const styles = StyleSheet.create({
	tower_number: {
		position: 'absolute',
		top: 0,
		left: 15,
	},
	ant2_image: {
		top: -80,
		width: 40,
		height: 30,
		right: global_constant.tower.size2depth[get_block_size_from_group(-2)]                                                                                                                                       0,
		// marginBottom: 30
	},
	tower_number_text: {
		fontSize: 100,
	},
	tower_number_text_wrapper: {
		position: 'absolute',
		top: 60,
	},
	tower_number_element: {
		position: 'absolute',
		height: 300,
		width: 60,
		borderLeftWidth: 1,
	},
})

export default TowerViewabilityImages
