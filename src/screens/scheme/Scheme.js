import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  FlatList,
  Modal,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import autobind from 'autobind-decorator';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import Banner from 'app/src/screens/Dashboard/Banner';
import { socialShare } from 'app/src/utility/Utility';
// import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import {
  BANNER_PRESSED,
  VBD_BANNER_PRESSED,
} from 'app/src/utility/GAEventConstants';
import Icon from 'react-native-vector-icons/Ionicons';
import ImageZoom from 'react-native-image-pan-zoom';
import ImageViewer from 'react-native-image-zoom-viewer';
import Loader from '../../components/loader/Loader';
import SignupInput from '../signup/component/SignupInput';
import {
  VESTIGE_IMAGE,
  INPUT_COMPONENT_TYPE,
  PICKER_ENUM,
} from '../../utility/constant/Constants';
import { Header } from '../../components';

const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const SHARE_IMAGE = require('app/src/assets/images/DashBoardHeader/share_icon.png');
const { height, width } = Dimensions.get('window');
@inject('dashboard', 'location', 'profile')
@observer
class Scheme extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showImage: false,
      imageUrl: '',
      countryPickerVisible: false,
      selectedCountry: 'Select Country',
      countryData: [],
    };
  }

  async componentDidMount() {
    this.focusListenerUnsubscribe = this.props.navigation.addListener(
      'focus', async () => {
        this.fetchCountryDetails();
      },
    );
  }

  componentWillUnmount() {
    this.focusListenerUnsubscribe?.();
  }

  fetchCountryDetails = async () => {
    const { location, profile } = this.props;
    await location.countryList();
    const { getShoppableCountryName, countryListData } = location;
    this.setState({ countryData: getShoppableCountryName });
    const selectedCountryObject = countryListData.find(
      obj => obj.countryId === profile.defaultAddressCountryId,
    );
    const defaultCountryObject = countryListData.find(
      obj => obj.countryId === 1,
    );
    if (selectedCountryObject) {
      const selectedCountryName = getShoppableCountryName?.includes(
        selectedCountryObject.countryName,
      )
        ? selectedCountryObject.countryName
        : defaultCountryObject.countryName;
      await this.setPickerValue(
        selectedCountryName,
        this.state.countryData,
        PICKER_ENUM.COUNTRY_PICKER,
        true,
      );
    }
  };

  bannerPress(bannerUrl) {
    this.setState({
      showImage: true,
      imageUrl: bannerUrl,
    });
  }

  /**
   * @param {*} visible true, false
   * @param {*} openPickerType picker key { country, state, city, pincode }
   */
  @autobind
  openPicker(visible, openPickerType) {
    switch (openPickerType) {
      case PICKER_ENUM.COUNTRY_PICKER: {
        this.setState({ countryPickerVisible: visible });
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * @param {*} selectedPickerValue selected value
   * @param {*} selectedPickerIndex picker key { 0, 1,2.... }
   * @param {*} selectedPickerKey picker key { country, state, city, pincode }
   */
  @autobind
  async setPickerValue(
    selectedPickerValue,
    selectedPickerIndex,
    selectedPickerKey,
    openPickerDisabled,
  ) {
    if (selectedPickerIndex !== 0) {
      switch (selectedPickerKey) {
        case PICKER_ENUM.COUNTRY_PICKER: {
          this.setState({ selectedCountry: selectedPickerValue });
          const listWait = new Promise((resolve, reject) => {
            this.props.location.countryListData.filter(async country => {
              if (
                country.countryName === selectedPickerValue &&
                this.countryID !== country.countryId
              ) {
                this.setState({ isLoading: true });
                await this.props.dashboard.fetchBanners(
                  'screenTypes=[DASHBOARD,SHOPPING,SCHEMES]',
                  country.countryId,
                );
                this.setState({ isLoading: false });
                resolve();
              }
            });
          });
          await listWait.then(() => {
            console.log('promise completed');
          });
          if (!openPickerDisabled)
            this.openPicker(
              !this.state.countryPickerVisible,
              selectedPickerKey,
            );
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  renderCountryPicker = () => {
    const countryPickerData = [
      {
        data: this.state.countryData,
        key: PICKER_ENUM.COUNTRY_PICKER,
        visible: this.state.countryPickerVisible,
        selected: this.state.selectedCountry,
        defaultValue: 'Country',
      },
    ];
    const countryPicker = {
      type: INPUT_COMPONENT_TYPE.PICKER,
      inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
      pickerData: countryPickerData,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
    };
    return (
      <View key={this.refreshKey} style={{ backgroundColor: '#fff' }}>
        <SignupInput {...this.props} data={countryPicker} />
      </View>
    );
  };

  renderImage(imageUrl) {
    return (
      // <View style={{ ...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'}}>
      //   <TouchableOpacity style={styles.closeIcon} onPress={()=>this.setState({showImage:false})}>
      //     <Icon name='ios-close' size={34} color='#8D98A3' />
      //   </TouchableOpacity>
      // //   <Image
      //     style={{...styles.bannerView,width:'94%'}}
      //     resizeMode={(imageUrl) ? 'cover' : 'contain'}
      //     source={imageUrl}
      //   />
      // </View>
      <Modal
        visible={this.state.showImage}
        transparent
        onRequestClose={() => {
          this.setState({ showImage: false });
        }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => this.setState({ showImage: false })}>
            <Icon name="ios-close" size={34} color="#8D98A3" />
          </TouchableOpacity>
          <ImageViewer
            imageUrls={[{ url: imageUrl }]}
            enableSwipeDown
            backgroundColor="rgba(0,0,0,0.5)"
            onCancel={() => this.setState({ showImage: false })}
          />
        </View>
      </Modal>
    );
  }

  renderHeaderShopFor = () => {
    return (
      <HeaderLeftIcons logo updateLocation navigation={this.props.navigation} />
    );
  };

  renderHeaderNotificationIcon = () => {
    return <HeaderRightIcons notification navigation={this.props.navigation} />;
  };

  render() {
    const { schemeScreenBanners } = this.props.dashboard;
    return (
      <View style={styles.mainView}>
        <Loader
          loading={
            this.props.location.isLoading ||
            this.state.isLoading ||
            this.props.profile.isLoading
          }
        />
        <Header
          navigation={this.props.navigation}
          hideBack
          showDrawer
          middleComponent={this.renderHeaderShopFor()}
          rightComponent={this.renderHeaderNotificationIcon()}
        />
        {this.renderCountryPicker()}
        <FlatList
          style={styles.containerView}
          ListEmptyComponent={
            !schemeScreenBanners.length && <EmptyScreen schemes />
          }
          contentContainerStyle={
            schemeScreenBanners.length === 0 && styles.emptyScreenView
          }
          data={schemeScreenBanners.length > 0 ? schemeScreenBanners : []}
          renderItem={({ item, index }) => {
            const image = item.bannerUrl
              ? { uri: item.bannerUrl }
              : PRODUCT_PLACEHOLDER;
            let profileView: any;
            return (
              <View
                collapsable={false}
                ref={screenShot => (profileView = screenShot)}>
                <TouchableOpacity
                  key={index.toString()}
                  activeOpacity={1.0}
                  accessibilityLabel={item.landingScreen}
                  testID={item.landingScreen}
                  onPress={() => {
                    if (item.bannerType.toUpperCase() === 'VBD') {
                      // trackEvent(VBD_BANNER_PRESSED.eventCategory, VBD_BANNER_PRESSED.events.NAVIGATE);
                      Linking.openURL(item.deepLinkUrl);
                    } else {
                      // trackEvent(BANNER_PRESSED.eventCategory, BANNER_PRESSED.events.NAVIGATE);
                      this.bannerPress(item.bannerUrl);
                    }
                  }}>
                  <Image
                    style={{ ...styles.bannerView }}
                    resizeMode={image ? 'stretch' : 'contain'}
                    source={image}
                  />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      right: 10,
                      padding: 10,
                      top: 220,
                    }}
                    onPress={() => socialShare(profileView)}>
                    <Banner
                      styles={styles.shareIcon}
                      source={SHARE_IMAGE}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
        />
        {this.renderImage(this.state.imageUrl)}
      </View>
    );
  }
}

export default Scheme;

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  containerView: {
    marginVertical: 10,
  },
  bannerView: {
    height: 250,
    marginHorizontal: 13,
    marginTop: 13,
  },
  shareIcon: {
    height: 20,
    width: 20,
    tintColor: '#ffffffd6',
  },
  closeIcon: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    right: 16,
    top: height * 0.5 - 150,
    opacity: 1,
    zIndex: 30,
  },
  emptyScreenView: {
    flex: 1,
    marginBottom: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
