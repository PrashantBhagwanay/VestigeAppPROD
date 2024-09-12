import React, { Component } from 'react';
import {
  View,
  Modal,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import PropTypes from 'prop-types';
import { Specs } from 'app/src/utility/Theme';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import autobind from 'autobind-decorator';
import TurtorialStep from './TurtorialStep';

const { width, height } = Dimensions.get('window');

const SHOWCOACHMARKS = AsyncStore.addPrefix('show_coachmarks');

export default class CoachMarks extends Component {
  static propTypes = {
    numberOfSteps: PropTypes.number,
    coachMarks: PropTypes.array,
    visible: PropTypes.bool,
    congratsText: PropTypes.string,
    congratsImage: PropTypes.number,
    onClose: PropTypes.func,
    skipCongrats: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      stepStates: [],
      isStarting: false,
      isEnding: false,
    };
  }

  componentDidMount() {
    this.setDefaultStepStates();
  }

  @autobind
  async dismiss() {
    LayoutAnimation.easeInEaseOut();
    requestAnimationFrame(async()=>{
      this.setState({ isEnding: true });
      this.props.onClose();
      await AsyncStore.set(SHOWCOACHMARKS, '1');
    })
   

  }

  startTutorial() {
    LayoutAnimation.easeInEaseOut();
    requestAnimationFrame(async()=>{
    this.setState({ isStarting: true });
    this.startCoachMarks();
    })
  }

  setDefaultStepStates() {
    const states = [];
    for (let i = 0; i < this.props.numberOfSteps; i++) {
      states.push(0);
    }
    this.setState(
      { stepStates: states, isStarting: Boolean(this.props.skipCongrats) },
      () => {
        if (this.props.skipCongrats) {
          this.startTutorial();
        }
      },
    );
  }

  startCoachMarks() {
    const states = this.state.stepStates;
    for (let i = 0; i < this.props.numberOfSteps; i++) {
      if (i === 0) {
        states[i] = 1;
      } else {
        states[i] = 0;
      }
    }

    this.setState({ stepStates: states });
  }

  OKBtn(step, onPressOK) {
    const states = this.state.stepStates;
    if (step === this.props.numberOfSteps - 1) {
      this.dismiss();
    }
    for (let i = 0; i < this.props.numberOfSteps; i++) {
      if (i === step + 1) {
        states[i] = 1;
      } else {
        states[i] = 0;
      }
    }
    this.setState({ stepStates: states });

    if (onPressOK) {
      onPressOK();
    }
  }

  renderCM() {
    const { numberOfSteps, coachMarks } = this.props;
    const CM = [];
    for (let i = 0; i < numberOfSteps; i++) {
      const state = this.state.stepStates[i];
      CM.push(
        <TurtorialStep
          key={i}
          step={i}
          tooltip={coachMarks[i].tooltip}
          style={coachMarks[i].style}
          position={coachMarks[i].position}
          tooltipPosition={coachMarks[i].tooltipPosition}
          visible={state !== 0}
          onPress={step => this.OKBtn(step, coachMarks[i].onPressOK)}
          styles={this.props.styles}
          okEnable={coachMarks[i].okEnable}
          onPressMark={coachMarks[i].onPressMark}
          endModal={coachMarks[i].endModal}
          isCircleMask={coachMarks[i].isCircleMask}
          icon={coachMarks[i].icon}
          description={coachMarks[i].description}
        />,
      );
    }
    return <View>{CM}</View>;
  }

  render() {
    return (
      <Modal
        animationType="none"
        transparent
        visible={this.props.visible && !this.state.isEnding}
        onRequestClose={() => {
          this.dismiss();
        }}>
        {!this.state.isStarting && (
          <View style={styles.visibleContainer}>
            <TouchableOpacity style={styles.backArea} activeOpacity={1} />
            <View style={styles.scene}>
              <View style={styles.container}>
                {this.props.congratsImage && (
                  <Image
                    style={{ width: 150, height: 150 }}
                    source={this.props.congratsImage}
                  />
                )}
                <Text style={styles.centeringTxt}>
                  {this.props.congratsText}
                </Text>
                <View style={styles.divider} />
                <View style={styles.button}>
                  <TouchableOpacity onPress={() => this.startTutorial()}>
                    <Text style={styles.buttonText}>Start Tutorial</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        {this.renderCM()}
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  visibleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000066',
  },
  scene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArea: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: 300,
    borderColor: 'rgba(0,0,0,1)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeringTxt: {
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    lineHeight: 24,
    fontSize: 16,
    ...Specs.fontBold,
  },
  divider: {
    backgroundColor: '#fff',
    width: 268,
    height: 2,
  },
  button: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#fff',
    padding: 6,
  },
});
