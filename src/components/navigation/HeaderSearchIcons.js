import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import { observer, inject } from 'mobx-react';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserRole } from 'app/src/utility/constant/Constants';
import { makeObservable, observable } from 'mobx';
import {
  isDistributorIdValidator,
  isSpecialCharacterValidator,
} from 'app/src/utility/Validation/Validation';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';
import { Toast } from 'app/src/components/toast/Toast';
import { connectedToInternet, showToast } from 'app/src/utility/Utility';
import { COLOR_CODES } from '../../utility/Theme';

const CAMERA_ICON = require('../../assets/images/searchIcons/camera_icon.png');
const MICROPHONE_ICON = require('../../assets/images/searchIcons/microphone_icon.png');

@inject('search', 'cart', 'auth', 'network', 'profile')
@observer
class HeaderSearchIcons extends Component {
  @observable searchValue = '';
  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    this.props = props;
    makeObservable(this);
  }

  showCameraAndMicrophone = hideIcons => {
    if (!hideIcons) {
      return (
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            disabled={this.props.micColor === '#7CFC00' ? true : false}
            onPress={() => this.props.onMicPress()}>
            <Icon name="ios-mic" size={28} color={this.props.micColor} />
          </TouchableOpacity>
        </View>
      );
    }
  };

  clearButton = value => {
    if (value) {
      return (
        <TouchableOpacity
          style={styles.clearButtonContainer}
          onPress={() => (this.props.search.searchInputValue = '')}>
          <Icon name="ios-close" size={34} color="#8D98A3" />
        </TouchableOpacity>
      );
    }
  };

  render() {
    const {
      showSearch,
      back,
      navigation,
      distributorSearchHeader,
      placeholder,
    } = this.props;
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
    return (
      <View style={styles.searchInputContainer}>
        {showSearch && (
          <View
            style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff' }}>
            <View style={styles.searchIconContainer}>
              <Icon name="md-search" size={18} color="#8D98A3" />
            </View>
            <TextInput
              autoFocus
              style={styles.searchContainerStyle}
              containerStyle={styles.searchBarContainerStyle}
              inputStyle={styles.searchBarInputStyle}
              placeholderTextColor="#8D98A3"
              placeholder={placeholder}
              value={this.props.value}
              onChangeText={value => {
                this.props.onChangeText(value);
              }}
              onSubmitEditing={async () => {
                let checkInterNetConnection = await connectedToInternet();
                if (checkInterNetConnection) {
                  this.props.onSubmitEditing();
                } else {
                  showToast(
                    strings.commonMessages.noInternet,
                    Toast.type.ERROR,
                  );
                }
              }}
            />
            {this.clearButton(this.props.value)}
            {this.showCameraAndMicrophone(this.props.value ? true : false)}
          </View>
        )}
        {distributorSearchHeader && (
          <View style={styles.headerContainer}>
            {back && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                onChangeText={this.searchedAdresses}>
                <Icon
                  name="ios-arrow-back"
                  size={30}
                  color="#3f4967"
                  style={styles.drawerIcon}
                />
              </TouchableOpacity>
            )}
            <View style={styles.searchContainer}>
              <TextInput
                maxLength={8}
                keyboardType="numeric"
                placeholder="Search Distributor"
                placeholderTextColor="gray"
                underlineColorAndroid="transparent"
                style={styles.searchCartInputContainer}
                onChangeText={value => {
                  if (isSpecialCharacterValidator(value)) {
                    setTimeout(
                      () =>
                        showToast(
                          strings.errorMessage.location.inputType,
                          Toast.type.ERROR,
                        ),
                      200,
                    );
                  } else {
                    this.searchValue = value;
                  }
                }}
              />
            </View>
            {this.searchValue.trim().length < 8 ? (
              <Text style={[styles.submitTextStyle, { opacity: 0.4 }]}>
                {this.props.submitButtonText}
              </Text>
            ) : this.searchValue.trim().length === 8 ? (
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  if (isGuestUser) {
                    AlertClass.showAlert(
                      '',
                      strings.commonMessages.guestUserMessage,
                      [
                        //  {text: strings.onboardingScreen.buttonSignUp, onPress: () => this.props.navigation.navigate('signup') },
                        {
                          text: strings.commonMessages.ok,
                          onPress: () => console.log('OK Pressed'),
                        },
                      ],
                      true,
                    );
                    return;
                  }
                  // if(this.props.profile.countryId == 2){
                  // AlertClass.showAlert('',
                  // strings.commonMessages.restrictAddCartCountryMessage,
                  //   [
                  //     // {text: strings.onboardingScreen.buttonSignUp, onPress: () => this.props.navigation.navigate('signup') },
                  //     {text: strings.commonMessages.ok, onPress: () => console.log('OK Pressed') }], true)
                  //     return
                  //   }
                  if (this.searchValue.trim() == '11000001') {
                    AlertClass.showAlert('Error!', 'Invalid ID.', [
                      { text: 'Ok', onPress: () => console.log('Ok') },
                    ]);
                  } else if (
                    isDistributorIdValidator(this.searchValue.trim())
                  ) {
                    if (this.props.submitButtonText === 'Validate') {
                      if (this.props.cart.selectingCarts.length < 3) {
                        this.props.cart.searchDownline(this.searchValue);
                      } else {
                        AlertClass.showAlert(
                          '',
                          strings.cartListProduct.createCartForDownline,
                          [{ text: 'Ok', onPress: () => console.log('Ok') }],
                        );
                      }
                    } else {
                      //  this.props.cart.validateDownline(this.searchValue, this.props.submitButtonText)  // Removing it and adding a new api to find downline
                      this.props.network.fetchSearchData(
                        this.searchValue,
                        this.props.submitButtonText,
                      );
                    }
                  } else {
                    AlertClass.showAlert(
                      '',
                      strings.errorMessage.location.inputType,
                      [{ text: 'Ok', onPress: () => console.log('Ok') }],
                    );
                    return;
                  }
                }}>
                <Text style={styles.submitTextStyle}>
                  {this.props.submitButtonText}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    );
  }
}

export default HeaderSearchIcons;

const styles = StyleSheet.create({
  searchInputContainer: {
    backgroundColor: '#f2f5f8',
    flexDirection: 'row',
    width: '100%',
  },
  searchContainerStyle: {
    flex: 1,
    fontSize: 18,
    backgroundColor: COLOR_CODES.white,
    paddingVertical: 12,
  },
  clearButtonContainer: {
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR_CODES.white,
  },
  searchBarContainerStyle: {
    backgroundColor: COLOR_CODES.ghostWhite,
    flex: 1,
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  searchBarInputStyle: {
    backgroundColor: COLOR_CODES.ghostWhite,
    paddingLeft: 40,
  },
  iconsContainer: {
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR_CODES.cultured,
    // paddingRight: 18,
    // position: 'absolute',
    // right: 0,
    // top: 8
  },
  searchIconContainer: {
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
    // top:2
  },
  cameraIcon: {
    marginLeft: 20,
  },
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    backgroundColor: COLOR_CODES.white,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
  },
  drawerIcon: {
    marginLeft: 16,
  },
  searchCartInputContainer: {
    height: 50,
    fontSize: 18,
    color: '#a6a8b8',
    borderColor: 'white',
    paddingLeft: 18,
  },
  backButtonIconImageStyle: {
    height: 18,
    width: 10,
    margin: 10,
  },
  submitTextStyle: {
    color: '#14aa93',
    fontSize: 14,
    padding: 18,
  },
});
