import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View, Animated, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Specs } from 'app/src/utility/Theme';

const SUPPORTED_ORIENTATIONS = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right'
];

export default class ASAlert extends Component {
  static propTypes = {
    customStyles: PropTypes.object,
    title: PropTypes.string,
    message: PropTypes.string,
    showCancel: PropTypes.bool,
    showConfirm: PropTypes.bool,
    textCancel: PropTypes.string,
    textConfirm: PropTypes.string,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    onClose: PropTypes.func,
    closeOnPressMask: PropTypes.bool
  };

  static defaultProps = {
    customStyles: {},
    title: 'Do you want to continue?',
    message: '',
    showCancel: true,
    showConfirm: true,
    textCancel: 'No',
    textConfirm: 'Ok',
    closeOnPressMask: true
  };

  constructor() {
    super();

    this.state = {
      visible: false
    };

    this.springValue = new Animated.Value(0);

    this.onCancel = this.onCancel.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.onClose = this.onClose.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  componentWillUnmount() {
    this.springValue.setValue(0);
  }

  animatedConfirm() {
    Animated.spring(this.springValue, {
      toValue: 1,
      speed: 15,
      useNativeDriver: true
    }).start();
  }

  onCancel() {
    if (typeof this.props.onCancel === 'function') {
      this.props.onCancel();
    }
  }

  onConfirm() {
    if (typeof this.props.onConfirm === 'function') {
      this.props.onConfirm();
    }
  }

  onClose() {
    if (typeof this.props.onClose === 'function') {
      this.props.onClose();
    }
  }

  open() {
    this.setState({ visible: true }, () => this.animatedConfirm());
  }

  close() {
    this.setState({ visible: false }, () => {
      this.springValue.setValue(0);
      this.onClose();
    });
  }

  render() {
    const {
      title,
      message,
      showCancel,
      showConfirm,
      textCancel,
      textConfirm,
      customStyles,
      closeOnPressMask
    } = this.props;
    return (
      <Modal
        visible={this.state.visible}
        transparent
        animationType='fade'
        supportedOrientations={SUPPORTED_ORIENTATIONS}
        onRequestClose={() => {}}
        onBackButtonPress={() => this.setState({ visible: false })}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeOnPressMask ? this.close : null}
          style={[styles.background, customStyles.mask]}
        >
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ scale: this.springValue }]
              },
              customStyles.container
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.content}>
                <Text style={[styles.title, customStyles.title]}>{title}</Text>
                {message ? (
                  <Text style={[styles.message, customStyles.message]}>
                    {message}
                  </Text>
                ) : null}
              </View>

              <View style={styles.buttonContainer}>
                {showCancel ? (
                  <TouchableOpacity
                    onPress={this.onCancel}
                    style={[
                      styles.button,
                      styles.buttonCancel,
                      customStyles.buttonCancel
                    ]}
                  >
                    <Text style={[styles.textButton, customStyles.textCancel]}>
                      {textCancel}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {showConfirm ? (
                  <TouchableOpacity
                    onPress={this.onConfirm}
                    style={[styles.button, customStyles.buttonConfirm]}
                  >
                    <Text style={[styles.textButton, customStyles.textConfirm]}>
                      {textConfirm}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#FFF',
    maxWidth: 350,
    marginHorizontal: 30,
    borderRadius: 5
  },
  content: {
    justifyContent: 'center',
    padding: 20
  },
  title: {
    textAlign: 'center',
    ...Specs.fontSemibold,
    fontSize: 18,
    color: '#333',
    lineHeight: 25
  },
  message: {
    textAlign: 'center',
    fontSize: 17,
    color: '#666',
    paddingTop: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 5,
    flexWrap: 'wrap'
  },
  button: {
    backgroundColor: '#00ACEF',
    marginBottom: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 90
  },
  buttonCancel: {
    backgroundColor: '#F53D3D'
  },
  textButton: {
    fontSize: 15,
    ...Specs.fontBold,
    textAlign: 'center',
    color: '#FFF',
  }
});