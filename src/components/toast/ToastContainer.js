import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  // ViewPropTypes,
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Easing,
  Keyboard,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { COLOR_CODES } from '../../utility/Theme';
const TOAST_MAX_WIDTH = 0.8;
const TOAST_ANIMATION_DURATION = 200;

const positions = {
  TOP: 74,
  BOTTOM: -54,
  CENTER: 0,
};

const durations = {
  LONG: 7500,
  SHORT: 4000,
};

const type = {
  // ERROR: 'red',
  // SUCCESS: 'green',
  // WARNING: '#B2122C',
  ERROR: COLOR_CODES.vividRed,
  SUCCESS: COLOR_CODES.labelGreen,
  WARNING: COLOR_CODES.orange,
};

export { positions, durations, type };

export default class ToastContainer extends Component {
  static displayName = 'ToastContainer';

  static propTypes = {
    // ...ViewPropTypes,
    // containerStyle: ViewPropTypes.style,
    duration: PropTypes.number,
    visible: PropTypes.bool,
    position: PropTypes.number,
    type: PropTypes.string,
    animation: PropTypes.bool,
    shadow: PropTypes.bool,
    backgroundColor: PropTypes.string,
    opacity: PropTypes.number,
    shadowColor: PropTypes.string,
    textColor: PropTypes.string,
    textStyle: PropTypes.func,
    delay: PropTypes.number,
    hideOnPress: PropTypes.bool,
    onPress: PropTypes.func,
    onHide: PropTypes.func,
    onHidden: PropTypes.func,
    onShow: PropTypes.func,
    onShown: PropTypes.func,
  };

  static defaultProps = {
    visible: false,
    duration: durations.SHORT,
    animation: true,
    shadow: false,
    position: positions.TOP,
    opacity: 1,
    delay: 0,
    type: type.SUCCESS,
    hideOnPress: true,
  };

  constructor() {
    super(...arguments);
    const window = Dimensions.get('window');
    this.state = {
      visible: this.props.visible,
      opacity: new Animated.Value(0),
      windowWidth: window.width,
      windowHeight: window.height,
      keyboardScreenY: window.height,
    };
  }

  UNSAFE_componentWillMount() {
    this.dimensionListener = Dimensions.addEventListener('change', this._windowChanged);
    this.keyboardListener = Keyboard.addListener(
      'keyboardDidChangeFrame',
      this._keyboardDidChangeFrame,
    );
  }

  componentDidMount = () => {
    if (this.state.visible) {
      this._showTimeout = setTimeout(() => this._show(), this.props.delay);
    }
  };

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (nextProps.visible !== this.props.visible) {
      if (nextProps.visible) {
        clearTimeout(this._showTimeout);
        clearTimeout(this._hideTimeout);
        this._showTimeout = setTimeout(() => this._show(), this.props.delay);
      } else {
        this._hide();
      }

      this.setState({
        visible: nextProps.visible,
      });
    }
  };

  UNSAFE_componentWillUpdate() {
    const { windowHeight, keyboardScreenY } = this.state;
    this._keyboardHeight = Math.max(windowHeight - keyboardScreenY, 0);
  }

  componentWillUnmount = () => {
    this.dimensionListener?.remove();
    this.keyboardListener?.remove();
    this._hide();
  };

  _animating = false;
  _root = null;
  _hideTimeout = null;
  _showTimeout = null;
  _keyboardHeight = 0;

  _windowChanged = ({ window }) => {
    this.setState({
      windowWidth: window.width,
      windowHeight: window.height,
    });
  };

  _keyboardDidChangeFrame = ({ endCoordinates }) => {
    this.setState({
      keyboardScreenY: endCoordinates.screenY,
    });
  };

  _show = () => {
    clearTimeout(this._showTimeout);
    if (!this._animating) {
      clearTimeout(this._hideTimeout);
      this._animating = true;
      this._root.setNativeProps({
        pointerEvents: 'auto',
      });
      this.props.onShow && this.props.onShow(this.props.siblingManager);
      Animated.timing(this.state.opacity, {
        toValue: this.props.opacity,
        duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          this._animating = !finished;
          this.props.onShown && this.props.onShown(this.props.siblingManager);
          if (this.props.duration > 0) {
            this._hideTimeout = setTimeout(
              () => this._hide(),
              this.props.duration,
            );
          }
        }
      });
    }
  };

  _hide = () => {
    clearTimeout(this._showTimeout);
    clearTimeout(this._hideTimeout);
    if (!this._animating) {
      this._root.setNativeProps({
        pointerEvents: 'none',
      });
      this.props.onHide && this.props.onHide(this.props.siblingManager);
      Animated.timing(this.state.opacity, {
        toValue: 0,
        duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          this._animating = false;
          this.props.onHidden && this.props.onHidden(this.props.siblingManager);
        }
      });
    }
  };

  render() {
    let { props } = this;
    const { windowWidth } = this.state;
    let offset = props.position;
    let position = offset
      ? {
          [offset < 0 ? 'bottom' : 'top']:
            offset < 0 ? this._keyboardHeight - offset : offset,
        }
      : {
          top: 0,
          bottom: this._keyboardHeight,
        };

    return this.state.visible || this._animating ? (
      <View style={[styles.defaultStyle, position]} pointerEvents="box-none">
        <TouchableWithoutFeedback
          onPress={() => {
            typeof this.props.onPress === 'function'
              ? this.props.onPress()
              : null;
            this.props.hideOnPress ? this._hide() : null;
          }}>
          <Animated.View
            style={[
              styles.containerStyle,
              { marginHorizontal: windowWidth * ((1 - TOAST_MAX_WIDTH) / 2) },
              props.containerStyle,
              props.backgroundColor
                ? { backgroundColor: props.backgroundColor }
                : { backgroundColor: props.type },
              {
                opacity: this.state.opacity,
              },
              props.shadow && styles.shadowStyle,
              props.shadowColor && { shadowColor: props.shadowColor },
            ]}
            pointerEvents="none"
            ref={ele => (this._root = ele)}>
            <Text
              style={[
                styles.textStyle,
                props.textStyle,
                props.textColor && { color: props.textColor },
              ]}>
              {this.props.children}
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerStyle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#000',
    opacity: 1,
    borderRadius: 15,
  },
  shadowStyle: {
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 10,
  },
  textStyle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    ...Specs.fontMedium,
  },
});
