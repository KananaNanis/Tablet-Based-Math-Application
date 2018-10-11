import React from 'react'
import {StyleSheet, Animated, Text} from 'react-native'
import {global_fiver_shadow} from './Num'
import {query_whole_tower} from '../providers/query_tower'
import {global_constant} from '../App'
import {as_greyscale} from './Tower'
import * as Anim from '../event/animation'

class TowerName extends React.Component {
	state = {
		time_value: new Animated.Value(0),
	}

	componentDidMount() {
		Anim.init_anim(this.props.anim_info, this.state.time_value)
	}

	componentDidUpdate(prev_props) {
		Anim.update_anim(
			this.props.anim_info,
			this.state.time_value,
			prev_props.anim_info,
		)
	}

	render() {
		let {id, name, position, anim_info, just_grey = false} = this.props
		let animated_style = {}
		if (Anim.has_timer(anim_info)) {
			Anim.interpolate_anim_attr(
				anim_info,
				this.state.time_value,
				animated_style,
			)
		}

		// expand the name into individual texts
		const name_info = query_whole_tower(id, {name, position})
		/*
    const name_info = [{bottom: 0, quantity: 3, size: 0},
                       {bottom: 40, quantity: 5, size: -1}, ]
    */
		let name_elements = [],
			height
		for (let i = 0; i < name_info.length; ++i) {
			let size = name_info[i].size
			const is_fiver = name_info[i].is_fiver
			let color = global_constant.tower.size2color[size]
			if (just_grey) color = as_greyscale(color)
			let shadow_style = {...global_fiver_shadow[is_fiver]}
			if (is_fiver) {
				if (just_grey) {
					const orig = shadow_style.textShadowColor
					shadow_style.textShadowColor = as_greyscale(orig)
				}
			}
			name_elements.push(
				<Text
					key={i}
					style={[
						styles.tower_name_element,
						{
							bottom: name_info[i].bottom,
							color,
							fontSize: global_constant.tower.size2fontsize[size],
							//paddingLeft: global_constant.tower.size2padding[size],
						},
						shadow_style,
						name_info[i].style,
					]}
				>
					{name_info[i].quantity}
					{' ' + global_constant.tower.size2symbol[size]}
				</Text>,
			)
			height = name_info[i].bottom + global_constant.tower.size2fontsize[size]
		}
		height += 5
		//console.log(height)
		return (
			<Animated.View style={[styles.tower_name, {height}, animated_style]}>
				{name_elements}
			</Animated.View>
		)
	}
}

const towerNameBGcolor = 'white'
const styles = StyleSheet.create({
	tower_name: {
		backgroundColor: towerNameBGcolor,
		width: 70,
		position: 'absolute',
		bottom: 10,
		left: 60,
	},
	tower_name_element: {
		position: 'absolute',
		left: 5,
	},
})

export default TowerName
