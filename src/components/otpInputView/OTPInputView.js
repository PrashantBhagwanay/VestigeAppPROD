import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, StyleSheet, 
  // ViewPropTypes 
} from 'react-native';
import _ from 'lodash';

// if ViewPropTypes is not defined fall back to View.propType (to support RN < 0.44)
// const viewPropTypes = ViewPropTypes || View.propTypes;

export default class OTPInputView extends Component {
  static propTypes = {
    codeLength: PropTypes.number,
    inputPosition: PropTypes.string,
    size: PropTypes.number,
    space: PropTypes.number,
    className: PropTypes.string,
    cellBorderWidth: PropTypes.number,
    activeColor: PropTypes.string,
    inactiveColor: PropTypes.string,
    ignoreCase: PropTypes.bool,
    autoFocus: PropTypes.bool,
    // codeInputStyle: TextInput.propTypes.style,
    // containerStyle: viewPropTypes.style,
    onFulfill: PropTypes.func,
  };
  
  static defaultProps = {
    codeLength: 5,
    inputPosition: 'center',
    autoFocus: true,
    size: 40,
    className: 'border-box',
    cellBorderWidth: 1,
    activeColor: 'rgba(0, 0, 0, 1)',
    inactiveColor: 'rgba(0, 0, 0, 0.4)',
    space: 8,
    ignoreCase: false
  };
  
  constructor(props) {
    super(props);
    
    this.state = {
      codeArr: new Array(this.props.codeLength).fill(''),
      currentIndex: 0
    };
    
    this.codeInputRefs = [];
  }
  
  componentDidMount() {
    const { codeLength, inputPosition } = this.props;   
    if (_.indexOf(['center', 'left', 'right', 'full-width'], inputPosition) === -1) {
      console.log('Invalid input position. Must be in: center, left, right, full');
    }
  }
  
  clear() {
    this.setState({
      codeArr: new Array(this.props.codeLength).fill(''),
      currentIndex: 0
    });
    this._setFocus(0);
  }
  _setFocus(index) {
    this.codeInputRefs[index].focus();
  }
  
  _blur(index) {
    this.codeInputRefs[index].blur();
  }
  
  _onFocus(index) {
    let newCodeArr =  _.clone(this.state.codeArr);
    const currentEmptyIndex = _.findIndex(newCodeArr, c => !c);
    if (currentEmptyIndex !== -1 && currentEmptyIndex < index) {
      return this._setFocus(currentEmptyIndex);
    }
    for (const i in newCodeArr) {
      if (i>= index) {
        newCodeArr[i] = '';
      }
    }
    const code = newCodeArr.join('');
    this.props.onFulfill(code);
    this.setState({
      codeArr: newCodeArr,
      currentIndex: index
    })
  }
  
  _getContainerStyle(size, position) {
    switch (position) {
      case 'left':
        return {
          justifyContent: 'flex-start',
          height: size
        };
      case 'center':
        return {
          justifyContent: 'center',
          height: size
        };
      case 'right':
        return {
          justifyContent: 'flex-end',
          height: size
        };
      default:
        return {
          justifyContent: 'space-between',
          height: size
        }
    }
  }
  
  _getInputSpaceStyle(space) {
    const { inputPosition } = this.props;
    switch (inputPosition) {
      case 'left':
        return {
          marginRight: space
        };
      case 'center':
        return {
          marginRight: space/2,
          marginLeft: space/2
        };
      case 'right':
        return {
          marginLeft: space
        };
      default:
        return {
          marginRight: 0,
          marginLeft: 0
        };
    }
  }
  
  _getClassStyle(className, active) {
    const { cellBorderWidth, activeColor, inactiveColor, space } = this.props;
    let classStyle = {
      ...this._getInputSpaceStyle(space),
      color: activeColor
    };
    
    switch (className) {
      case 'clear':
        return _.merge(classStyle, { borderWidth: 0 });
      case 'border-box':
        return _.merge(classStyle, {
          borderWidth: cellBorderWidth,
          borderColor: (active ? activeColor : inactiveColor)
        });
      case 'border-circle':
        return _.merge(classStyle, {
          borderWidth: cellBorderWidth,
          borderRadius: 50,
          borderColor: (active ? activeColor : inactiveColor)
        });
      case 'border-b':
        return _.merge(classStyle, {
          borderBottomWidth: cellBorderWidth,
          borderColor: (active ? activeColor : inactiveColor),
        });
      case 'border-b-t':
        return _.merge(classStyle, {
          borderTopWidth: cellBorderWidth,
          borderBottomWidth: cellBorderWidth,
          borderColor: (active ? activeColor : inactiveColor)
        });
      case 'border-l-r':
        return _.merge(classStyle, {
          borderLeftWidth: cellBorderWidth,
          borderRightWidth: cellBorderWidth,
          borderColor: (active ? activeColor : inactiveColor)
        });
      default:
        return className;
    }
  }
  
  _onKeyPress(e) {
    if (e.nativeEvent.key === 'Backspace') {
      const { currentIndex } = this.state;
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      this._setFocus(nextIndex);
    }
  }
  
  _onInputCode(character, index) {
    console.log(character, index)
    const { codeLength, onFulfill, ignoreCase } = this.props;
    let newCodeArr = _.clone(this.state.codeArr);
    newCodeArr[index] = character;
    
    if (index == codeLength - 1) {
      const code = newCodeArr.join('');
      onFulfill(code);
      this._blur(this.state.currentIndex);
    } 
    else {
      const code = newCodeArr.join('');
      onFulfill(code);
      this._setFocus(this.state.currentIndex + 1);
    }
    
    this.setState(prevState => {
      return {
        codeArr: newCodeArr,
        currentIndex: prevState.currentIndex + 1
      };
    });
  }
  
  render() {
    const {
      codeLength,
      codeInputStyle,
      containerStyle,
      inputPosition,
      autoFocus,
      autoFill,
      className,
      size,
      activeColor,
      cellHorizontalMargin,
      onFocus = () => {}
    } = this.props;
    console.log('autofill',autoFill,activeColor)
    const initialCodeInputStyle = {
      width: size,
      height: size
    };
    
    let codeInputs = [];
    for (let i = 0; i < codeLength; i++) {
      const id = i;
      codeInputs.push(
        <View key={id} style={cellHorizontalMargin}>
          <TextInput
            ref={ref => (this.codeInputRefs[id] = ref)}
            style={[
              styles.codeInput, 
              initialCodeInputStyle, 
              this._getClassStyle(className, this.state.currentIndex == id),
              codeInputStyle
            ]}
            underlineColorAndroid='transparent'
            selectionColor={activeColor}
            keyboardType='name-phone-pad'
            returnKeyType='done'
            {...this.props}
            autoFocus={autoFocus && id == 0}
            onFocus={() => {
              onFocus()
              this._onFocus(id)
            }}
            value={this.state.codeArr[id] ? this.state.codeArr[id].toString() : ''}
            onChangeText={text => this._onInputCode(text, id)}
            onKeyPress={(e) => this._onKeyPress(e)}
            maxLength={1}
          />
        </View>
      )
    }
    
    return (
      <View style={[styles.container, this._getContainerStyle(size, inputPosition), containerStyle]}>
        {codeInputs}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginVertical:5
  },
  codeInput: {
    backgroundColor: 'transparent',
    textAlign: 'center',
    padding: 0
  }
});