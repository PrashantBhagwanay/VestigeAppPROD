/**
 * @author satyam singh
 * @description  This screen is for contact us detail of vestige
 *
 */
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { observer, inject } from 'mobx-react';
import { strings } from 'app/src/utility/localization/Localized';
import Loader from 'app/src/components/loader/Loader';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { CONTACT_US_IMAGES } from 'app/src/utility/constant/Constants';
import { Specs } from 'app/src/utility/Theme';
import { isNullOrEmpty } from 'app/src/utility/Utility';
import { Header } from '../../components';

@inject('location', 'profile')
@observer
export default class ContactUs extends Component {

  async componentDidMount() {
    await this.props.location.fetchVestigeContactDetails();
  }

  handleUrl = (item) => {
    if (item.type === 'address' && !isNullOrEmpty(item.mapData)) {
      return this.getDirection(item.mapData?.label, item.mapData?.lat, item.mapData?.lng);
    }
    return item.linkingUrl;
  }

  getDirection = (label = 'Vestige Marketing Pvt. Ltd.', lat = 28.5382753, lng = 77.2701008) => {
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const latLng = `${lat},${lng}`;
    const data = Platform.OS === 'ios' ? `${label}@${latLng}` : `${latLng}(${label})`;
    return `${scheme}${data}`;
  }

  onButtonPress = (url) => {
    Linking.openURL(url);
  }

  handleImage = (item) => {
    if (item.type === 'phone') {
      return CONTACT_US_IMAGES.PHONE_CALL;
    }
    if (item.type === 'email') {
      return CONTACT_US_IMAGES.EMAIL;
    }
    if (item.type === 'address') {
      return CONTACT_US_IMAGES.LOCATION;
    }
    return CONTACT_US_IMAGES.whatsapp;
  }

  renderItem = (item) => {
    const img = this.handleImage(item);
    const url = this.handleUrl(item);
    return (
      <View style={styles.item}>
        <Image source={img} />
        <TouchableOpacity onPress={() => (item.type !== 'address' ? this.onButtonPress(url) : null)}>
          <Text style={[styles.heading, { fontWeight: 'bold' }]}>{item.heading}</Text>
        </TouchableOpacity>
        {item.subHeading ? (
          <Text style={styles.heading}>{item.subHeading}</Text>
        ) : null
        }
        { !isNullOrEmpty(url)
          ? (
            <TouchableOpacity style={styles.buttonContainer} onPress={() => this.onButtonPress(url)}>
              <Text style={styles.buttonText}>{item.buttonLabel}</Text>
            </TouchableOpacity>
          )
          : null
        }
      </View>
    );
  }

  fetchSocialImage = (item) => {
    switch (item.buttonLabel?.toUpperCase()) {
      case 'FACEBOOK':
        return CONTACT_US_IMAGES.FACEBOOK;
      case 'INSTAGRAM':
        return CONTACT_US_IMAGES.INSTAGRAM;
      case 'YOUTUBE':
        return CONTACT_US_IMAGES.YOUTUBE;
      case 'TWITTER':
        return CONTACT_US_IMAGES.TWITTER;
      default:
        return null;
    }
  }

  renderHeadingBanner = () => {
    return (
      <View>
        <Image 
          source={CONTACT_US_IMAGES.LETS_CONNECT} 
          resizeMode='stretch'
          style={{width: '100%'}}
        />
      </View>
    )
  }

  render() {
    const { contactUsData, isLoading } = this.props.location;
    const data = contactUsData?.contactDetails ? contactUsData.contactDetails: [];
    const socialData= contactUsData?.socialDetails ? contactUsData.socialDetails : [];
    return (
      <SafeAreaView style={styles.container}>
        <Loader isLoading={isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.contactUs}
        />
        {this.renderHeadingBanner()}
        <FlatList
          data={data}
          renderItem={({item}) => this.renderItem(item)}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{padding:5}}
          ItemSeparatorComponent={()=><View style={{height:6}} />}
        />
        <View style={styles.socialContainer}>
          {socialData.map((item ,index)=> {
            const img = this.fetchSocialImage(item);
            return(
              <View style={styles.socialItem} key={index.toString()}>
                <TouchableOpacity onPress={() => this.onButtonPress(item.url)}>
                  <Image source={img} />
                </TouchableOpacity>
                <Text style={styles.socialText}>{item.buttonLabel}</Text>
              </View>
            )
          })}
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1
  },
  banner: {
    width: '100%'
  },
  item: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },  
  headerTitle:{
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
    width: Dimensions.get('window').width-100
  },
  heading: {
    ...Specs.fontRegular,
    textAlign: 'center',
    lineHeight: 18,
    color: '#46586F',
    fontSize: 14,
    marginTop: 5
  },
  buttonText: {
    color: '#6896D4',
    ...Specs.fontRegular,
  },
  buttonContainer: {
    padding: 5
  },
  socialContainer: {
    bottom:0,
    marginBottom:20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  socialText: {
    ...Specs.fontRegular,
    fontSize: 10,
  }
});