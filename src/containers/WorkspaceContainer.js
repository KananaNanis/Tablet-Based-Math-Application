import { connect } from 'react-redux'
import Workspace from '../components/Workspace'
import { consolidate_info_for_ids } from '../providers/query_store'

const mapStateToProps = (state, ownProps) => {
  //console.log(ownProps)
  //console.log('mapStateToProps tower_ids', state.tower_ids, 'tile_ids', state.tile_ids)
  return {
    style: ownProps.style,
    scale_factor: state.scale_factor,
    keypad_kind: state.keypad_kind,
    button_display: state.button_display,
    button_highlight: state.button_highlight,
    freeze_display: state.freeze_display,
    num_stars: state.num_stars,
    config_path: state.config_path,
    center_text: state.center_text,
    all_nums: consolidate_info_for_ids(
      state.tower_ids,
      state.name,
      state.position,
      state.style,
      state.tower_style,
      state.block_opacity,
      state.misc),
    all_tiles: consolidate_info_for_ids(
      state.tile_ids,
      state.name,
      state.position,
      state.style,
      state.misc),
    all_lifts: consolidate_info_for_ids(
      state.lift_ids,
      state.name,
      state.position,
      state.style,
      state.misc)
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