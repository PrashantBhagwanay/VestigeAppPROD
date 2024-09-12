/**
 * @description This screen is used to select/add address for mi user doing shopping for other distributors.
 *              address changed or modified here is separate from user's main address detail and list.
 */

import React, {Component } from 'react';
import {
  View,
  Text,
  Keyboard,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import autobind from 'autobind-decorator';
import { Specs } from 'app/src/utility/Theme';
import { Toast } from 'app/src/components/toast/Toast';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { inject, observer } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { CustomButton, RadioButton } from 'app/src/components/buttons/Button';
import Loader  from 'app/src/components/loader/Loader';
import { LOCATION_ROUTE_PATH, SHIPPING_TYPE_ID, SHIPPING_TYPE } from 'app/src/utility/constant/Constants';
import { capitalizeFirstCharacter, searchFromArray, connectedToInternet } from 'app/src/utility/Utility';
import Banner from 'app/src/screens/Dashboard/Banner';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { strings } from 'app/src/utility/localization/Localized';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view';
import AlertClass from 'app/src/utility/AlertClass';
import CateringLocation from 'app/src/components/cateringLocation/CateringLocation';
import { Header } from '../../components';

const addressTypeTabTitle = [
  { title: 'Home Delivery' },
  { title: 'Store Pick-up' },
];


@inject('profile', 'location', 'auth', 'dashboard', 'cart')
@observer
export default class SelectMiUserAddress extends Component {
  @observable selectedRecentAddressIndex: String = '';
  @observable selectedRecentAddressValue = null;
  @observable isLoading = false;
  @observable isInternetConnected: Boolean = true;
  @observable backScreenCount: Boolean = 1;
  @observable defaultStoreAddress: Object = {};

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      selectedAddressTypeTab: this.props.profile.miUserShopForOthersType == '2' ? addressTypeTabTitle[1].title : addressTypeTabTitle[0].title,
    };
    this.backScreenCount = this.props.route?.params?.backScreenCount || 1;
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      this.getMiniDLCPStore();
      await this.props.profile.fetchMiUserAddresses();
    }
  }

  getMiniDLCPStore = async () => {
    const resStore = await this.props.profile.fetchMiUserStoreAddress();
    if (resStore.success) {
      const { data } = resStore || {};
      const formattedAddress = {
        distributorId: data.distributorId,
        isDefault: false,
        address1: data.branchAddress,
        cityId: Number(data.cityId),
        addressType: 'shipping',
        cityName: data.cityName,
        stateId: Number(data.stateId),
        stateName: data.stateName,
        countryId: Number(data.countryId),
        alternateContactNumber: '',
        countryName: data.countryName,
        isStoreAddress: true,
        pincode: {
          pincode: data.pincode,
        },
        caterLocationDTO: [data.warehouseDetails, data.miniDLCPStoreDetails],
      };
      this.defaultStoreAddress = formattedAddress;
    }
  }


  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      this.props.profile.fetchUserAddresses();
    }
  }

  @autobind
  showToast(message: string, toastType: Toast.type) {
  // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  handleAddressTypeTabCallback = (value) => {
    if (value !== this.state.selectedAddressTypeTab) {
      this.setState({
        selectedAddressTypeTab: value,
      });
    }
  }

  selectValue = async (item, index) => {
    const res = await this.props.location.getCountryStateCity(item.pincode);
    // console.log(res);
    if (res) {
      this.showToast(res, Toast.type.ERROR);
      return;
    }
    this.selectedRecentAddressValue = item;
    this.selectedRecentAddressIndex = index;
  }

  /**
  * @description used for edit the selected address from the recent address list.
  */
  editAddress = (item, type) => {
    this.props.navigation.navigate('addMiUserAddress',
      {
        selectedDeliveryType: this.state.selectedAddressTypeTab,
        pincode: item.pincode,
        address: item.address,
        alternateContactNumber: item.alternateContactNumber,
        editAddress: true,
        addressType: item.addressType,
        id: item.id,
        isDefault: item.isDefault,
        backScreenCount: this.backScreenCount + 1,
        clearSelectedAddress: this.clearSelectedAddress,
      });
  }

  /**
  * @description used for delete the selected address from the recent address list.
  */
  deleteAddress = async (item) => {
    const res = await this.props.profile.alterMiUserAddress(item, 'delete');
    if (res.success) {
      this.showToast(strings.locationScreen.addressDeleteMessage, Toast.type.SUCCESS);
    }
    else {
      this.showToast(res.message, Toast.type.ERROR);
    }
  }

  clearSelectedAddress = () => {
    this.selectedRecentAddressIndex = '';
    this.selectedRecentAddressValue = '';
  }

  @autobind
  navigateScreen() {
    this.props.dashboard.onAddressChange();
    this.props.navigation.pop(this.backScreenCount);
  }

  /**
  * @description hit the api for saving the homedelivery type address of mini dlcp user shopping for others.
  */
  @autobind
  async saveHomeDeliveryAddress(address) {
    let homeDeliveryData = {};
    if (address.cityId && address.stateId && address.countryId) {
      homeDeliveryData = {
        distributorId: this.props.auth.distributorID,
        isDefault: true,
        address1: address.address,
        cityId: address.cityId,
        cityName: address.city,
        stateId: address.stateId,
        stateName: address.state,
        countryId: address.countryId,
        countryName: address.country,
        isStoreAddress: false,
        pincode: {
          pincode: address.pincode,
        },
      };
    }
    else {
      const formatCountryName = capitalizeFirstCharacter(address.country);
      const formatStateName = capitalizeFirstCharacter(address.state);
      const formatCityName = capitalizeFirstCharacter(address.city);
      const response = await this.props.location.getCountryStateCityId(formatCountryName,formatStateName,formatCityName);
      if (response) {
        this.showToast(response, Toast.type.ERROR);
        return;
      }
      homeDeliveryData = {
        distributorId: this.props.auth.distributorID,
        isDefault: true,
        address1: address.address,
        cityId: this.props.location.countryStateCityId.cityId,
        cityName: address.city,
        stateId: this.props.location.countryStateCityId.stateId,
        stateName: address.state,
        countryId: this.props.location.countryStateCityId.countryId,
        countryName: address.country,
        isStoreAddress: false,
        pincode: {
          pincode: address.pincode,
        },
      };
    }
    this.isLoading = true;
    const status = await this.props.profile.saveMiUserAddress(homeDeliveryData, 'home');
    this.isLoading = false;
    if (status) {
      this.showToast(strings.errorMessage.location.locationSave, Toast.type.SUCCESS);
      if (this.props.route?.params?.cartId) {
        this.props.cart.updateLocationOnCartAdd(this.props.route.params.cartId);
      }
      this.navigateScreen();
    }
    else {
      this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR);
    }
  }

  /**
  * @description hit the api for saving the storepickup type address of mini dlcp user shopping for others.
  */
  @autobind
  async saveDefaultStoreAddress(address) {
    this.isLoading = true;
    const status = await this.props.profile.saveMiUserAddress(address, 'defaultStore');
    this.isLoading = false;
    if (status) {
      this.showToast(strings.errorMessage.location.locationSave, Toast.type.SUCCESS);
      if (this.props.route?.params?.cartId) {
        this.props.cart.updateLocationOnCartAdd(this.props.route.params.cartId);
      }
      this.navigateScreen();
    }
    else {
      this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR);
    }
  }


  /**
   * @description on press continue it will save address for both homedelivery and store pickup (depends on selected type)
   */
  submitAddress = async () => {
    if (this.state.selectedAddressTypeTab === 'Home Delivery') {
      await this.saveHomeDeliveryAddress(this.selectedRecentAddressValue);
    }
    else {
      await this.saveDefaultStoreAddress(this.defaultStoreAddress);
    }
    console.log('mi user "shop for other" address changed called');
    this.props.dashboard.onAddressChange();
    this.navigateScreen();
  }

  renderHomeDeliveryAddressFormat = (item) => {
    return (
      <Text
        numberOfLines={5}
        style={styles.addressTextStyle}
      >
        {`${item.address}, ${item.city}, ${item.state}, ${item.country}, ${item.pincode}`}
        { item.alternateContactNumber && <Text style={{ fontSize: 12, ...Specs.fontRegular, color: '#3f4967' }}>{`\nMobile No.: +${item.alternateContactNumber}`}</Text> }
        {/* { item.isExpressShipping == SHIPPING_TYPE_ID.expressDelivery && <Text style={{ fontSize: 12, ...Specs.fontSemiBold, color: '#3aa65c', borderRadius:3 }}>{`\n ${'Express Delivery available'}`}</Text>} */}
      </Text>
    );
  }

  renderMiUserSelectedAddress = (address) => {
    if (address && address.id) {
      return (
        <View style={styles.selectedAddressContainer}>
          <Text style={styles.recentAddressStyle} opacity={0.5}>
            {strings.selectMiUserAddress.selectedShippingAddressTitle}
          </Text>
          <View style={{ paddingLeft: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
            { address.addressType === 'Shipping' ? this.renderHomeDeliveryAddressFormat(address) : null }
          </View>
          <CateringLocation
            navigation={this.props.navigation}
            disabled
            // navigationParams={{ selectLocationRoute: true, buttonPressed: this.buttonPressed, defaultShoppingMode: this.defaultShoppingMode }}
            containerStyle={{ marginTop: 15, marginHorizontal: 5 }}
          />
        </View>
      );
    }
    return null;
  }

  renderAddressType = () => {
    const { selectedAddressTypeTab } = this.state;
    return (
      <CustomTopTab
        selectedValue={selectedAddressTypeTab}
        handleTabCallback={this.handleAddressTypeTabCallback}
        data={addressTypeTabTitle}
        style={styles.addressTypeTabContainer}
        selectedTabStyle={[styles.addressTypeTab, { backgroundColor: '#3054C4' }]}
        unSelectedTabStyle={[styles.addressTypeTab, { backgroundColor: '#E6EBF9' }]}
        selectedTextStyle={[styles.addressTypeTabText, {color: '#fff'}]}
        unSelectedTextStyle={[styles.addressTypeTabText]}
      />
    );
  }

  renderStorePickupAddress = () => {
    const { caterLocationDTO } = this.defaultStoreAddress;
    const warehouseCatering = caterLocationDTO?.find((value) => value.isWarehouse === 1) || {};
    const regularCatering = caterLocationDTO?.find((value) => value.isWarehouse !== 1) || {};
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 5, paddingTop: 10 }}>
          <Text style={[styles.addressTextStyle]}>
            {strings.selectMiUserAddress.cateringBranch}
          </Text>
          <Text style={[styles.addressTextStyle, { ...Specs.fontRegular, fontSize: 13 }]}>
            {`${warehouseCatering?.locationName} - ${warehouseCatering?.locationCode}`}
          </Text>
          <Text style={[styles.addressTextStyle, { marginTop: 15 }]}>
            {strings.selectMiUserAddress.pickupStore}
          </Text>
          <Text style={[styles.addressTextStyle, { ...Specs.fontMedium, fontSize: 13 }]}>
            {`${regularCatering?.locationName} - ${regularCatering?.locationCode}`}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            buttonContainer={{ width: '100%' }}
            buttonStyle={styles.button}
            disabled={false}
            handleClick={this.submitAddress}
            linearGradient
            buttonTitle={strings.selectMiUserAddress.proceedButton}
            primaryColor="#6896D4"
            secondaryColor="#3054C4"
            buttonTitleStyle={styles.customButtonTitleStyle}
          />
        </View>
      </View>
    );
  }

  renderHomeDeliveryAddress = () => {
    return (
      <View style={{ flex: 1 }}>
        {this.props.profile.miUserShopForOthersAddressList.length >= 1 ? (
          <View style={{ flex: 1 }}>
            <KeyboardAwareSectionList
              keyboardShouldPersistTaps="handled"
              extraScrollHeight={30}
              extraData={this.selectedRecentAddressIndex}
              initialNumToRender={this.props.profile.miUserShopForOthersAddressList.length}
              sections={[
                { title: strings.locationScreen.recentAddressesTitle, data: this.props.profile.miUserShopForOthersAddressList.slice() },
              ]}
              renderSectionHeader={({ section }) => (
                <Text style={styles.recentAddressStyle} opacity={0.5}>{section.title}</Text>
              )}
              renderItem={({ item, index }) => (
                item.addressType === 'Shipping' && (
                  <TouchableOpacity
                    style={styles.recentAddressContainer}
                    onPress={() => { this.selectValue(item, index); }}
                  >
                    <View style={styles.radioButtonContainer}>
                      <RadioButton
                        showButtonText={false}
                        // buttonText={this.selectedDeliveryType === 'Home Delivery'? index : index}
                        buttonText={index}
                        onPress={() => { this.selectValue(item, index); }}
                        selectedValue={this.selectedRecentAddressIndex}
                      />
                    </View>
                    <View style={[styles.recentAddressTextStyle, { paddingLeft: 17 }]}>
                      {this.renderHomeDeliveryAddressFormat(item)}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <TouchableOpacity style={{ paddingRight: 10, borderRightWidth: 1 }} onPress={() => this.editAddress(item)}>
                        <FontAwesome name="pencil" size={18} color="#01000260" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ paddingLeft: 10 }}
                        onPress={() => {
                          AlertClass.showAlert('Alert!',
                            strings.locationScreen.askForDeleteAddress,
                            [{ text: 'Cancel', onPress: () => { console.log('Cancelled Pressed'); } },
                              { text: strings.commonMessages.ok, onPress: () => { this.deleteAddress(item); } },
                            ]);
                        }}
                      >
                        <FontAwesome name="trash-o" size={18} color="#ff0000" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )
              )}
              keyExtractor={(item, index) => index}
              stickySectionHeadersEnabled={false}
            />
          </View>
        )
          : (
            <View style={[styles.radioButtonContainer, { flex: 1 }]}>
              <Text style={styles.recentAddressStyle} opacity={0.5}>{strings.locationScreen.noAddressesAddedTitle}</Text>
            </View>
          )
        }
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 50, alignItems: 'center' }}>
          <CustomButton
            {...this.props}
            linearGradient
            primaryColor="#6896D4"
            secondaryColor="#3054C4"
            buttonContainer={{ width: '50%' }}
            buttonStyle={styles.button}
            handleClick={() => {
              this.props.navigation.navigate('addMiUserAddress', {
                backScreenCount: this.backScreenCount + 1,
                selectedDeliveryType: this.state.selectedAddressTypeTab,
              });
            }}
            buttonTitleStyle={styles.customButtonTitleStyle}
            buttonTitle={strings.locationScreen.addNewAddress}
          />
          <CustomButton
            {...this.props}
            linearGradient
            primaryColor="#58cdb4"
            secondaryColor="#58cdb4"
            buttonContainer={{ width: '50%' }}
            buttonStyle={styles.button}
            handleClick={() => {
              this.submitAddress();
            }}
            buttonTitleStyle={styles.customButtonTitleStyle}
            buttonTitle="Continue"
          />
        </View>
      </View>
    );
  }

  renderSelectAddressContainer = () => {
    const { selectedAddressTypeTab } = this.state;
    return (
      <View style={styles.addressSelectionContainer}>
        {this.renderAddressType()}
        { selectedAddressTypeTab === addressTypeTabTitle[0].title
          ? this.renderHomeDeliveryAddress()
          : this.renderStorePickupAddress()
        }
      </View>
    );
  }

  render() {
    // const { defaultShippingAddress, defaultStoreAddress } = this.props.profile;
    return (
      <View style={styles.container}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.profile.isLoading || this.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.selectMiUserAddress.screenTitle}
        />
        {this.renderMiUserSelectedAddress(this.props.profile.miUserShopForOthersSelectedAddress)}
        {this.renderSelectAddressContainer()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dde5ee',
  },
  textTitleStyle: {
    color: '#373e73',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 17,
    ...Specs.fontBold,
  },
  selectedAddressContainer: {
    backgroundColor: '#FFF',
    marginTop: 10,
    paddingHorizontal: 10,
    marginHorizontal: 7,
    borderRadius: 15,
    paddingBottom: 10,
  },
  recentAddressStyle: {
    color: '#3f4967',
    fontSize: 14,
    marginTop: 10,
    ...Specs.fontBold,
    marginBottom: 5,
    marginLeft: 10,
  },
  addressTextStyle: {
    fontSize: 14,
    ...Specs.fontBold,
    color: '#3f4967',
    width: '90%',
  },
  addressSelectionContainer: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#fff',
    marginHorizontal: 7,
    borderRadius: 15,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  addressTypeTabContainer: {
    flexDirection: 'row',
    height: 40,
    width: '100%',
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 15,
    backgroundColor: '#E6EBF9',
    overflow: 'hidden',
  },
  addressTypeTab: {
    flex: 1,
    borderRadius: 15,
    justifyContent: 'center',
  },
  addressTypeTabText: {
    fontSize: 15,
    ...Specs.fontBold,
  },
  buttonContainer: {
    height: 50,
    justifyContent: 'center',
  },
  button: {
    marginBottom: 0,
  },
  customButtonTitleStyle: {
    ...Specs.fontBold,
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  recentAddressContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    paddingRight: 5,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 201, 211,0.5)',
    marginBottom: 10,
  },
  recentAddressTextStyle: {
    marginBottom: 10,
    width: '70%',
    justifyContent: 'center',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
});
