/**
 * @description Component use to display Popup modal view
 */
import React, { Component } from 'react';
import {
  View,
  Text,
  Platform,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { isIphoneXorAbove } from 'app/src/utility/Utility';
import { CustomButton } from 'app/src/components/buttons/Button';
import { observer, inject } from 'mobx-react';
import AlertClass from 'app/src/utility/AlertClass';
import { Icon } from 'react-native-elements';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import Loader from '../../components/loader/Loader';
import styles from './styles';
import BirthdayListItem from './BirthdayListItem';


import {UserRole } from 'app/src/utility/constant/Constants';
import { Header } from '../../components';

const CLOSE_IMAGE = require('../../assets/images/DashBoardHeader/close.png');

@inject('dashboard', 'auth', 'profile')
@observer
export default class BirthdayList extends Component {

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    await this.props.dashboard.getBirthdayList();
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
    const { dashboard } = this.props;
    const { birthdayList, isBirthdayLoader } = dashboard;
    return (
      <View style={styles.mainContainerInfo}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.birthdayPopup.title}
        />
        <Loader loading={isBirthdayLoader} />
        {
          (!birthdayList || !birthdayList.length)
            ? (
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.headingText}>No birthday found</Text>
              </View>
            )
            : (
              <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
                {/* <Banner
                  styles={styles.topImageBackgroundStyle}
                  resizeMode="contain"
                  source={CAKE_IMAGE}
                /> */}
                <View style={[styles.headerInfo]}>
                  <Text style={styles.headingText}>Total Birthdays</Text>
                </View>
                <View style={[styles.headerInfo, { borderRadius: 16, borderWidth: 1.5, borderColor: '#3f5886', marginBottom: 12 }]}>
                  <Text style={styles.headingText}>{birthdayList && birthdayList?.length}</Text>
                </View>
                <BirthdayListItem
                  birthdayList={birthdayList}
                  listData={this.listData}
                  onPressSendWish={this.onPressSendWish}
                  getNameInitials={this.getNameInitials}
                  showSendWishButton={this.props.profile.defaultAddressCountryId == 1}
                />
              </View>
            )
        }
      </View>
    );
  }
}
