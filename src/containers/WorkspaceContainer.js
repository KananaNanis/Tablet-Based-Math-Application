import { connect } from 'react-redux'
import Workspace from '../components/Workspace'
import { consolidate_info_for_ids } from '../providers/query_store'

const mapStateToProps = (state, ownProps) => {
  //console.log(ownProps)
  //console.log('mapStateToProps tower_ids', state.tower_ids, 'tile_ids', state.tile_ids)
  //console.log('mapStateToProps door_ids', state.door_ids, 'name', state.name)
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
    err_box: state.get('err_box'),
    option_values: state.get('option_values'),
    all_nums: consolidate_info_for_ids(
      state.get('tower_ids'),
      state.get('name'),
      state.get('position'),
      state.get('style'),
      state.get('anim_info'),
      state.get('misc'),
      state.get('tower_style'),
      state.get('block_opacity')),
    all_tiles: consolidate_info_for_ids(
      state.get('tile_ids'),
      state.get('name'),
      state.get('position'),
      state.get('style'),
      state.get('anim_info'),
      state.get('misc')),
    all_doors: consolidate_info_for_ids(
      state.get('door_ids'),
      state.get('name'),
      state.get('position'),
      state.get('style'),
      state.get('anim_info'),
      state.get('misc')),
    all_portals: consolidate_info_for_ids(
      state.get('portal_ids'),
      state.get('name'),
      state.get('position'),
      state.get('style'),
      state.get('anim_info'),
      state.get('misc')),
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

const WorkspaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Workspace)

export default WorkspaceContainer