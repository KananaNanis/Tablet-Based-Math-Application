# this config tree assumes order, even for yaml hashes!
redbluequiz:
  params:
    generate:
      m1: [pick_from_range, 0.3, 2.1, 0.1]
      m2: [pick_from_range, 0.3, 2.1, 0.1]
      mean_name: m1 + m2
      option_value_delta: 0.2
      option_value_seed: mean_name
      restriction_3: option > 0
      restriction_4: option < 4
    create:
      tower_2: { name: m2 }
      tower_1: { name: m1 }
      tower_frame_2: { name: 1 }
      tower_mixed: []
    modify:
      tower_frame_2:
        position: [0, 0]
        misc:
          is_option: true
          option_offset: 220
          option_width: 110
          backgroundColor: 'black'
      tower_1:
        position: [0, 0]
        misc:
          backgroundColor: 'blue'
          hide_tower_number: true
      tower_2:
        position: [0, 0]
        misc:
          backgroundColor: 'red'
          hide_tower_number: true
      tower_mixed:
        position: [15, 0]
        tower_style: {opacity: 0}
        misc:
          hide_tower_number: true

    event_handling:
      correctness: identical
      target: tower_frame_2
      arg_1: tower_1
    misc:
      new_scale_factor: 200
      config_iteration: 5
      num_stars: 3
      trigger_blocks_moving_to_result: 0
  level_1:
  disappearing:
    params:
      create:
        button_start:
      modify:
        tower_frame_1:
          anim_info: null
          style: { opacity: 0 }
        tower_frame_2:
          style: { opacity: 0 }
      misc:
        freeze_display: true
      delay:
        modify:
          tower_1:
            style: { opacity: 1 }
            anim_info: { opacity: [1, 0], delay: 0, duration: 1000 }
          tower_2:
            style: { opacity: 1 }

    level_2:
    level_3:
        delay:
          modify:
            tower_1:
              style: { opacity: 1 }
              anim_info: { opacity: [1, 0], delay: 0, duration: 2000 }


