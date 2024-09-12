
import React, { Component } from 'react';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import autobind from 'autobind-decorator';
import { CustomButton } from 'app/src/components/buttons/Button';
import Banner from 'app/src/screens/Dashboard/Banner';
import { Specs } from 'app/src/utility/Theme';
import { inject, observer } from 'mobx-react';
import { decimalToHex } from 'app/src/utility/Utility';
import { Toast } from 'app/src/components/toast/Toast';
import { Text, View, StyleSheet, Dimensions, FlatList, Clipboard, TouchableWithoutFeedback } from 'react-native';
import { strings } from 'app/src/utility/localization/Localized';
import Share from 'react-native-share';
import { Header } from '../../components';
import dynamicLinks from '@react-native-firebase/dynamic-links';


const REFERRAL_IMAGE = require('app/src/assets/images/shareScreen/referImage.png');

@inject('auth', 'profile')
@observer

export default class ShareScreen extends Component {
    data = [
      {text: strings.referralScreen.message1 },
      {text: strings.referralScreen.message2 },
      {text: strings.referralScreen.message3 }] 

  constructor(props) {
    super(props);
    this.props = props;
  }

  @autobind
  async onShareButtonPress()  {
    var url= await this.generateLink();
    //  Open app :- https://vestigeshopping.page.link/referralCode/?${'REF'+decimalToHex(this.props.auth.distributorID)}
    const shareData = {
      failOnCancel: false,
      message: `Hello,\n
      This is ${this.props.profile.username}, let’s join Vestige family by holding my hands.\n
      Use the referral code mention below while registering yourself through Vestige app.\n
      Code : ${'REF'+decimalToHex(this.props.auth.distributorID)}
      Open app :- ${url}
      Wish you wellth!`,
      title: 'Refer A Friend',
    }
    Share.open(shareData);
    // Share.share({
    //   message: `Hello,
    //   This is ${this.props.profile.username}, let’s join Vestige family by holding my hands.
    //   Use the referral code mention below while registering yourself through Vestige app.
    //   Code : ${'REF'+decimalToHex(this.props.auth.distributorID)}
      
    //   Wish you wellth!`,
    //   title: 'Wow, did you see that?'
    // }, {
    //   // Android only:
    //   dialogTitle: 'Refer A Friend',
    //   // iOS only:
    //   excludedActivityTypes: [
    //     'com.apple.UIKit.activity.PostToTwitter'
    //   ]
    // })
  }


   generateLink = async () => {
    var referalcode=`${'REF'+decimalToHex(this.props.auth.distributorID)}`;
    try {
        const link = await dynamicLinks().buildShortLink({
            link: `https://vestigeshopping.page.link/referralCode?referralCode=${referalcode}`,
            domainUriPrefix: 'https://vestigeshopping.page.link',
            android: {
                packageName: 'com.vestigeshopping',
            },
            ios: {
                appStoreId: '1448596224',
                bundleId: 'com.kellton.vestige',
            },
        }, dynamicLinks.ShortLinkType.DEFAULT)
        console.log('link:', JSON.stringify(link))
        return link
    } catch (error) {
        console.log('Generating Link Error:', error)
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
    })
  }

  render() {
    const { distributorID } = this.props.auth;
    return (
      <View style={{ flex: 1}}>
        <Header
          navigation={this.props.navigation}
          screenTitle={'Refer A Friend'}
        />
        <View>
          <Banner
            styles={styles.bannerView}
            resizeMode='cover'
            source={REFERRAL_IMAGE}
          />
        </View>
        <View>
          <FlatList 
            data={this.data}
            keyExtractor={(item, index) => index.toString()}
            style={styles.referralPointsContainer}
            scrollEnabled={false}
            renderItem={({item, index})=> <Text style={styles.shareDescription}>{index+1}{'.  '}{item.text}</Text>}
          />
        </View>
        <TouchableWithoutFeedback onPress={async ()=> { 
          await Clipboard.setString('REF'+decimalToHex(distributorID))
          this.showToast(strings.referralScreen.copiedToCLipBoardTitle,  Toast.type.SUCCESS) 
        }}
        >
          <View style={styles.referralContainer}>
            <View style={styles.referralContainerText}>
              <Text style={[styles.referralCodeText, {fontSize: 22}]}>
                {'REF'+decimalToHex(distributorID) }
              </Text> 
            </View>
            <View style={styles.referralContainerText}>
              <Text style={[styles.shareDescription, {marginTop: 5}]}>Tap To Copy</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.referralContainerText}>
          <Text style={{paddingTop: 10}}>{strings.referralScreen.referralCodeTitle}</Text>
        </View>
        <View style={{ position: 'absolute', bottom: 20, width: '100%'}}>
          <CustomButton
            handleClick={() =>  this.onShareButtonPress()}
            linearGradient
            buttonTitle='Share'
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
          />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  referralContainer: {
    width: 200,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#a0a3aa',
    backgroundColor: '#fff',
    flexDirection: 'column',
    paddingVertical: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  referralContainerText: {
    flexDirection: 'row', 
    justifyContent: 'center'
  },
  bannerView: {
    width: Dimensions.get('window').width,
  },
  customButtonTitleStyle: {
    color: '#FFFFFF',
    fontSize:16,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  shareDescription: {
    ...Specs.fontRegular,
    fontSize: 14,
    marginTop: 10,
  },
  referralCodeText: {
    ...Specs.fontMedium,
    color: '#000',
    fontSize: 13
  },
  referralPointsContainer: {
    paddingHorizontal: 20,
  }
})