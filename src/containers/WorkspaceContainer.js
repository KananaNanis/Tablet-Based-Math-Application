import { connect } from 'react-redux'
import Workspace from '../components/Workspace'
import { consolidate_info_for_ids } from '../providers/query_store'

const mapStateToProps = (state, ownProps) => {
  //console.log(ownProps)
  //console.log('mapStateToProps tower_ids', state.tower_ids, 'tile_ids', state.tile_ids)
  //console.log('mapStateToProps door_ids', state.door_ids, 'name', state.name)
  //console.log('mapStateToProps style', state.get('style'))
  //console.log('mapStateToProps misc', state.get('misc'))
  return {
    style: ownProps.style,
    scale_factor: state.get('scale_factor'),
    keypad_kind: state.get('keypad_kind'),
    button_display: state.get('button_display'),
    button_highlight: state.get('button_highlight'),
    freeze_display: state.get('freeze_display'),
    num_stars: state.get('num_stars'),
    config_path: state.getIn(['path', 'config']),
    center_text: state.get('center_text'),
    top_right_text: state.get('top_right_text'),
    err_box: state.get('err_box'),
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