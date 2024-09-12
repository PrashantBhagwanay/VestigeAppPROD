/**
 * @description add new Address screen
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CustomButton } from 'app/src/components/buttons/Button';
import CustomTextInput from 'app/src/component/textInputComponent';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

// Back button Icon defined here
const LOCATION_ICON = require('../../assets/images/Signup/location.png');
const PROFILE_ICON = require('../../assets/images/Signup/profile.png');
const CHECKED_ICON = require('../../assets/images/Cart/checked.png');

export default class AddAddress extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: null,
      selectedValue: null,
      checkBoxValue: null,
      options: ['Home', 'Office / Commercial'],
      addAddressInput: [
        {
          icon: LOCATION_ICON,
          placeholder: 'Pincode',
          placeholderTextColor: '#3f4967',
          handleFunction: this.handleTextInput,
        },
        {
          icon: LOCATION_ICON,
          placeholder: 'Locality/Town',
          alignRightText: true,
          placeholderTextColor: '#3f4967',
          handleFunction: this.handleTextInput,
        },
        {
          icon: LOCATION_ICON,
          placeholder: 'City',
          placeholderTextColor: '#3f4967',
          handleFunction: this.handleTextInput,
        },
        {
          icon: LOCATION_ICON,
          placeholder: 'State',
          placeholderTextColor: '#3f4967',
          handleFunction: this.handleTextInput,
        },
        {
          icon: LOCATION_ICON,
          placeholder: 'Country',
          placeholderTextColor: '#3f4967',
          handleFunction: this.handleTextInput,
        },
      ],
    };
  }

  /**
   * @function toggle radio button here
   */
  radioButton = (index) => {
    const { options } = this.state;
    this.setState({
      selectedIndex: index,
      selectedValue: options[index],
      options: options,
    });
  }

  /**
   * @function checkBox selected
   */
  checkBoxValue = () => {
    this.setState({
      checkBoxValue: true,
    });
  }

  render() {
    const {
      options, selectedValue, checkBoxValue, addAddressInput,
    } = this.state;
    return (
      <View style={styles.container}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.addNewAddressScreen.screenTitle}
        />
        <ScrollView keyboardShouldPersistTaps='always'>
          <View style={styles.textInputContainer}>
            {addAddressInput.map(addAddress => (
              <CustomTextInput
                textInputContainerStyle={styles.textInputContainerStyle}
                textInputIconStyle={styles.textInputIconStyle}
                textInputVerticalLineStyle={styles.textInputVerticalLineStyle}
                icon={addAddress.icon}
                input={styles.input}
                alignRightText={addAddress.alignRightText}
                textInputRightTextStyle={styles.textInputRightTextStyle}
                placeholder={addAddress.placeholder}
                placeholderTextColor={addAddress.placeholderTextColor}
                handleFunction={value => this.handleTextInput(value)}
                textInputUnderlineStyle={styles.textInputUnderlineStyle}
              />
            ))}
          </View>

          <View style={styles.textInputContainerStyle}>
            <View style={styles.textInputContainerStyle}>
              <Image
                style={styles.profileImageStyle}
                resizeMode="contain"
                source={PROFILE_ICON}
              />
              <View style={styles.textInputVerticalLineStyle} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                autoCorrect={false}
                autoCapitalize="none"
                placeholderTextColor="#3f4967"
                underlineColorAndroid="transparent"
                onChangeText={value => this.handleTextInput(value, 'distributorId')}
              />
            </View>
            <View style={styles.textInputUnderlineStyle} />

            <Text style={styles.addressTitleStyle}>
              {strings.addNewAddressScreen.addressKey}
            </Text>

            <TextInput
              style={styles.addressInputContainer}
              autoCorrect={false}
              autoCapitalize="none"
              multiline
              numberOfLines={5}
              blurOnSubmit={false}
              underlineColorAndroid="transparent"
              maxLength={45}
            />

            <Text style={styles.addressTypeTitleStyle}>
              {strings.addNewAddressScreen.addressType}
            </Text>

            {/* Radio Button code */}
            <View style={{ flexDirection: 'row' }}>
              {options.map((option, i) => (
                <View
                  style={{
                    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: 40,
                  }}
                  key={i.toString()}
                >
                  <TouchableOpacity
                    style={{
                      height: 17,
                      width: 17,
                      borderWidth: 1,
                      borderRadius: 20,
                      borderColor: '#979797',
                      margin: 17,
                      justifyContent: 'center',
                    }}
                    onPress={() => this.radioButton(i)}
                    activeOpacity={0.8}
                  >
                    {selectedValue === option ? (
                      <View
                        style={{
                          borderRadius: 20, height: 9, width: 9, backgroundColor: '#d8d8d8', alignSelf: 'center',
                        }}
                      />
                    ) : null}
                  </TouchableOpacity>
                  <Text style={{ color: '#3f4967', fontSize: 14 }}>
                    {option}
                  </Text>
                </View>
              ))}
            </View>
            {/* Code Ends Here */}

            {/* Check Box code */}
            <View
              style={{
                marginLeft: 17, marginTop: 25, marginBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.checkBoxValue()}>
                {checkBoxValue ? (
                  <TouchableOpacity
                    onPress={() => this.setState({
                      checkBoxValue: false,
                    })
                  }>
                    <Image source={CHECKED_ICON} style={{ height: 15, width: 15 }} tintColor="#979797" />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      height: 15, width: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#979797',
                    }}
                  />
                )}
              </TouchableOpacity>
              <Text
                style={{
                  marginLeft: 20, flex: 1, color: '#6c7a87', fontSize: 12,
                }}>
                {strings.addNewAddressScreen.defaultAddress}
              </Text>
            </View>
            {/* Code ends Here */}

          </View>

          <CustomButton
            {...this.props}
            handleClick={() => this.validateUser()}
            linearGradient
            buttonContainer={styles.button}
            buttonTitle={strings.addNewAddressScreen.confirmAddressButtonTitle}
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
            buttonTitleStyle={styles.buttonTitleStyle}
          />
        </ScrollView>
      </View>
    );
  }
}

/**
 * @description AddAddress Screen CSS defined here
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
  },
  textInputContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  textInputContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  textInputIconStyle: {
    height: 17,
    width: 12,
    marginLeft: 17,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  textInputVerticalLineStyle: {
    marginLeft: 16,
    marginRight: 8,
    opacity: 0.5,
    borderLeftWidth: 1,
    borderLeftColor: '#979797',
    height: 17,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  input: {
    marginRight: 17,
    flex: 1,
  },
  textInputRightTextStyle: {
    fontSize: 10,
    marginRight: 20,
    color: '#134374',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  textInputUnderlineStyle: {
    borderBottomWidth: 1,
    borderBottomColor: '#D4D6DA',
    marginLeft: 17,
    marginRight: 17,
    marginTop: '-1%',
    marginBottom: '2%',
  },
  buttonTitleStyle: {
    fontSize: 15,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  button: {
    marginTop: '5%',
    marginLeft: 16,
    marginRight: 16,
    marginBottom: '3%',
  },
  profileImageStyle: {
    height: 17,
    width: 15,
    marginLeft: 17,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  addressTitleStyle: {
    color: '#3f4967',
    fontSize: 14,
    marginLeft: 17,
    marginTop: 10,
    marginBottom: 10,
  },
  addressInputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#c8c9d3',
    marginLeft: 17,
    marginRight: 17,
    textAlignVertical: 'top',
  },
  addressTypeTitleStyle: {
    color: '#373e73',
    fontSize: 14,
    marginTop: 25,
    marginLeft: 17,
  },
});