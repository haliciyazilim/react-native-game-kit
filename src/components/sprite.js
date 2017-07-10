import React, { Component, PropTypes } from 'react';

import { StyleSheet, View, Image } from 'react-native';

export default class Sprite extends Component {

  static propTypes = {
    offset: PropTypes.array,
    onPlayStateChanged: PropTypes.func,
    repeat: PropTypes.bool,
    scale: PropTypes.number,
    src: PropTypes.number,
    state: PropTypes.number,
    frameCounts: PropTypes.array,
    startFrame: PropTypes.number,
    frameDuration: PropTypes.number,
    style: View.propTypes.style,
    tileHeight: PropTypes.number,
    tileWidth: PropTypes.number,
  };

  static defaultProps = {
    offset: [0, 0],
    onPlayStateChanged: () => {},
    repeat: true,
    src: '',
    state: 0,
    frameCounts: [],
    startFrame: 0,
    frameDuration: 125,
    tileHeight: 64,
    tileWidth: 64,
  };

  static contextTypes = {
    loop: PropTypes.object,
    scale: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.loopID = null;
    this.finished = false;
    this.lastTick = null;

    this.state = {
      currentFrame: props.startFrame,
    };
  }

  componentDidMount() {
    this.props.onPlayStateChanged(1);
    const animate = this.animate.bind(this, this.props);
    this.loopID = this.context.loop.subscribe(animate);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.state !== this.props.state) {
      this.finished = false;
      this.props.onPlayStateChanged(1);
      this.context.loop.unsubscribe(this.loopID);
      this.lastTick = null;

      this.setState({
        currentFrame: nextProps.startFrame,
      }, () => {
        const animate = this.animate.bind(this, nextProps);
        this.loopID = this.context.loop.subscribe(animate);
      });
    }
  }

  componentWillUnmount() {
    this.context.loop.unsubscribe(this.loopID);
  }

  animate(props, tick) {
    const { repeat, state, frameCounts, frameDuration } = props;

    if (!this.lastTick) {
      this.lastTick = tick;
    }

    const frameCount = frameCounts[state];
    if (frameCount === 0 || this.finished) {
      return;
    }

    const deltaTime = tick - this.lastTick;
    const frame = Math.floor(deltaTime / frameDuration);
    const nextFrame = frame % frameCount;
    const { currentFrame } = this.state;
    if (currentFrame !== nextFrame) {
      this.setState({
        currentFrame: nextFrame,
      });

      if (frame >= (frameCount - 1) && repeat === false) {
        this.finished = true;
        this.props.onPlayStateChanged(0);
      }
    }
  }

  render() {
    const scale = this.props.scale || this.context.scale;
    const { currentFrame } = this.state;
    const {
      style,
      offset,
      state,
      tileWidth,
      tileHeight,
    } = this.props;
    const containerStyles = [
      styles.container,
      {
        width: tileWidth * scale,
        height: tileHeight * scale,
      },
      style,
    ];
    const spriteStyles = [
      styles.sprite,
      {
        width: tileWidth,
        height: tileHeight,
        transform: [{scale: scale}]
      }
    ];
    const left = offset[0] + (currentFrame * tileWidth);
    const top = offset[1] + (state * tileHeight);
    const imageStyles = [
      styles.image,
      {
        transform: [
          { translateX: left * -1 },
          { translateY: top * -1 }
        ]
      }
    ];
    return (
      <View style={containerStyles}>
        <View style={spriteStyles}>
          <Image
            style={imageStyles}
            source={this.props.src}
          />
        </View>
      </View>
    );
  }

}

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sprite: {
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
});
