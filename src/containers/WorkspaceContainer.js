import {connect} from 'react-redux'
import Workspace from '../components/Workspace'
//import {toJS} from './to_js'

//function toJS(val) { return ('undefined' === typeof val) ? val : val.toJS() }

const mapStateToProps = (state, ownProps) => {
	//console.log(ownProps)
	//console.log('mapStateToProps tower_ids', state.tower_ids, 'tile_ids', state.tile_ids)
	//console.log('mapStateToProps door_ids', toJS(state.get('door_ids')), 'name', toJS(state.get('name')))
	//console.log('mapStateToProps style', state.get('style'))
	//console.log('mapStateToProps misc', state.get('misc'))
	//console.log('mapStateToProps button_display', state.get('button_display').toJS())
	//console.log('mapStateToProps freeze_display', state.getIn(['prop', 'freeze_display']))
	return {
		style: ownProps.style,
		scale_factor: state.getIn(['prop', 'scale_factor']),
		keypad_kind: state.get('keypad_kind'),
		button_display: state.get('button_display'),
		button_highlight: state.get('button_highlight'),
		freeze_display: state.getIn(['prop', 'freeze_display']),
		num_stars: state.getIn(['prop', 'num_stars']),
		config_path: state.getIn(['path', 'config']),
		center_text: state.getIn(['prop', 'center_text']),
		top_left_text: state.getIn(['prop', 'top_left_text']),
		top_right_text: state.getIn(['prop', 'top_right_text']),
		big_op: state.getIn(['prop', 'big_op']),
		err_box: state.get('err_box'),
		option_values: state.get('option_values'),
		tower_ids: state.get('tower_ids'),
		tile_ids: state.get('tile_ids'),
		door_ids: state.get('door_ids'),
		portal_ids: state.get('portal_ids'),
		five_frame_ids: state.get('five_frame_ids'),
		bar_ids: state.get('bar_ids'),
	}
}

const WorkspaceContainer = connect(mapStateToProps)(Workspace)
//(toJS(Workspace))

export default WorkspaceContainer
