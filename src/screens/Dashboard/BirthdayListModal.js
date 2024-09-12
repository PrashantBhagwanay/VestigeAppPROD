/**
 * @description Component use to display Popup modal view 
 */
import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { isIphoneXorAbove } from 'app/src/utility/Utility';
import { CustomButton } from 'app/src/components/buttons/Button';
import { observer, inject } from 'mobx-react';
import AlertClass from 'app/src/utility/AlertClass';
import { Icon } from 'react-native-elements';
import BirthdayListItem from '../birthdayList/BirthdayListItem';

const CLOSE_IMAGE = require('../../assets/images/DashBoardHeader/close.png');

@inject('dashboard', 'profile')
@observer
export default class BirthdayListModal extends Component {
  constructor(props) {
    super(props);
  }

  onPressSendWish = async (users) => {
    const data = users.reduce((res, user) => {
      if (user.mobileNo?.trim()) {
        const birthdayDetail = {
          countryId: user.countryId,
          type: 1,
          phoneNo: user.mobileNo,
          message: strings.birthdayPopup.birthdayWishSent,
        };
        res.push(birthdayDetail);
      }
      return res;
    }, []);
    const res = await this.props.dashboard.sendBirtdhayWish(data);
    if (res.success) {
      AlertClass.showAlert('', strings.birthdayPopup.messageSentSuccessfully, [
        {
          text: 'Ok', onPress: () => console.log('Ok Pressed'),
        },
      ], true);
    }
    else {
      AlertClass.showAlert('', res.message, [
        {
          text: 'Ok', onPress: () => console.log('Ok Pressed')
        },
      ], true);
    }
  }


  render() {
    const { isVisible, closeBirthdayPopup } = this.props;
    const { dashboard } = this.props;
    return (
      <Modal
        animationType="slide"
        visible={isVisible}
        transparent
        onRequestClose={() => closeBirthdayPopup()}
      >
        <View style={styles.mainContainerInfo}>
          <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
            {/* <Banner
              styles={styles.topImageBackgroundStyle}
              resizeMode="contain"
              source={CAKE_IMAGE}
            /> */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
              <TouchableOpacity style={{padding: 10,}} onPress={() =>{ closeBirthdayPopup() }}>
                <Image
                  style={styles.closeButton}
                  source={CLOSE_IMAGE}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.headerInfo, {position: 'absolute', top: 10}]}>
              <Text style={styles.headingText}>{strings.birthdayPopup.title}</Text>
            </View>
            <View style={[styles.headerInfo, { borderRadius: 16, borderWidth: 1.5, borderColor: '#3f5886', marginBottom: 12 }]}>
              <Text style={styles.headingText}>{dashboard.birthdayList && dashboard.birthdayList.length}</Text>
            </View>
            <BirthdayListItem
              birthdayList={dashboard.birthdayList}
              listData={this.listData}
              onPressSendWish={this.onPressSendWish}
              getNameInitials={this.getNameInitials}
              showSendWishButton={this.props.profile.defaultAddressCountryId == 1}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

/**
 * @description: This is the Popup modal stylesheet
 */
const styles = StyleSheet.create({
  mainContainerInfo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 30,
    height: Dimensions.get('window').height - (isIphoneXorAbove() ? 180 : 105),
    marginTop: isIphoneXorAbove() ? 70 : 40,
    marginBottom: isIphoneXorAbove() ? 110 : 65,
    marginLeft: 15,
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  containerInfoAndroid: {
    elevation: 15,
  },
  containerInfoIos: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#e1e5e6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  headerInfo: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    color: '#3f5886',
    fontSize: 16,
    ...Specs.fontSemiBold, 
    textAlign:'center',
  },
  closeButton: {
    width: 30,
    height: 30,
  },
});
