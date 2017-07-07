import React, { Component, PropTypes } from 'react';

import { View, Image } from 'react-native';

export default class Sprite extends Component {

  static propTypes = {
    offset: PropTypes.array,
    onPlayStateChanged: PropTypes.func,
    repeat: PropTypes.bool,
    scale: PropTypes.number,
    src: PropTypes.number,
    state: PropTypes.number,
    steps: PropTypes.array,
    style: PropTypes.object,
    duration: PropTypes.number,
    tileHeight: PropTypes.number,
    tileWidth: PropTypes.number,
    startStep: PropTypes.number,
  };

  static defaultProps = {
    offset: [0, 0],
    onPlayStateChanged: () => {},
    repeat: true,
    src: '',
    state: 0,
    steps: [],
    duration: 4,
    tileHeight: 64,
    tileWidth: 64,
    startStep: 0,
  };

  static contextTypes = {
    loop: PropTypes.object,
    scale: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.loopID = null;
    this.finished = false;
    this.lastTime = null;
    this.stepDuration = props.duration / props.steps[props.state];

    this.state = {
      currentStep: props.startStep,
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
      this.nextProps.onPlayStateChanged(1);
      this.context.loop.unsubscribe(this.loopID);
      this.lastTime = null;
      this.stepDuration = nextProps.duration / nextProps.steps[nextProps.state];

      this.setState({
        currentStep: nextProps.startStep,
      }, () => {
        const animate = this.animate.bind(this, nextProps);
        this.loopID = this.context.loop.subscribe(animate);
      });
    }
  }

  componentWillUnmount() {
    this.context.loop.unsubscribe(this.loopID);
  }

  animate(props, time) {
    const { repeat, duration, state, steps } = props;

    if (!this.lastTime) {
      this.lastTime = time;
    }

    const stepCount = steps[state];
    if (stepCount === 0 || this.finished) {
      return;
    }

    const deltaTime = time - this.lastTime;
    const step = Math.floor(deltaTime / this.stepDuration);
    const nextStep = step % stepCount;
    const { currentStep } = this.state;
    if (currentStep !== nextStep) {
      this.setState({
        currentStep: nextStep,
      });

      if (step >= (stepCount - 1) && repeat === false) {
        this.finished = true;
        this.props.onPlayStateChanged(0);
      }
    }
  }

  getImageStyles() {
    const { currentStep } = this.state;
    const { state, tileWidth, tileHeight } = this.props;

    const left = this.props.offset[0] + (currentStep * tileWidth);
    const top = this.props.offset[1] + (state * tileHeight);

    return {
      position: 'absolute',
      transform: [
        { translateX: left * -1 },
        { translateY: top * -1 }
      ]
    };
  }

  getWrapperStyles() {
    const scale = this.props.scale || this.context.scale;
    return {
      height: this.props.tileHeight,
      width: this.props.tileWidth,
      overflow: 'hidden',
      position: 'relative',
      transform: [{scale: scale}]
    };
  }

  render() {
    return (
      <View style={{ ...this.getWrapperStyles(), ...this.props.style }}>
        <Image
          style={this.getImageStyles()}
          source={this.props.src}
        />
      </View>
    );
  }

}
