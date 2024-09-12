import React, { Component } from 'react';
import { Text, View, Image, SectionList, TouchableOpacity, StyleSheet, Platform, SafeAreaView, Linking, Alert } from 'react-native';
import autobind from 'autobind-decorator';
import Icon from 'react-native-vector-icons/FontAwesome';
import { inject, observer } from 'mobx-react';
import DeviceInfo from 'react-native-device-info';
import { computed } from 'mobx';
import Share from 'react-native-share';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { SIGNUP_ROUTE, UserRole } from 'app/src/utility/constant/Constants';
import { CommonActions } from '@react-navigation/native';
import { COLOR_CODES } from '../utility/Theme';
// import { trackEvent } from 'app/src/utility/AnalyticsUtils';
// import { NEW_MEMBER_REGISTRATION_BUTTON_PRESS } from 'app/src/utility/GAEventConstants';

const IOS_APP_URL = 'https://itunes.apple.com/in/app/vestige-online-shopping-app/id1448596224'    //TODO: Please verify this url once.
const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.vestigeshopping&hl=en'


const NavLogo = require('app/src/assets/images/logo/nav-logo.png');
const NavLogoNepal = require('app/src/assets/images/logo/nav-logo-nepal.png');

@inject('auth', 'profile', 'dashboard', 'appConfiguration','B2CFlow')
@observer
export default class DrawerScreen extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      buildVersion: ''
    }
  }

  @computed get enableKYC() {
    return false // for Downline KYC, always enable
    // return !!this.props.profile.isEkycDone
  }

  async componentDidMount() {
    const buildVersion = await DeviceInfo.getVersion();
    this.setState({ buildVersion })
  }

  panBankNameConfig = () => {
    const configType = this.props.appConfiguration?.bankPanScreen?.value;
    switch(configType){
      case '0':{
        return strings.drawerScreen.bankPan
      }
      case '1':{
        return strings.bankPan.pan.screenTitlePan
      }
      case '2':{
        return strings.bankPan.pan.screenTitleBank
      }
      default: {
        return strings.drawerScreen.bankPan
      }
    }
  }

  filterSideMenuData(data) {
    let drawerDatassdrawerDatass = data;

    // var arrr = [
    //   {
    //     "id": "5fc7a966d9013bd256acd064",
    //     "menuId": 1,
    //     "menuType": "SideMenu",
    //     "menuName": "Categories",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a973d9013bd256acd099",
    //     "menuId": 2,
    //     "menuType": "SideMenu",
    //     "menuName": "Brands",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a980d9013bd256acd0b3",
    //     "menuId": 3,
    //     "menuType": "SideMenu",
    //     "menuName": "My Dashboard",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a990d9013bd256acd0e0",
    //     "menuId": 4,
    //     "menuType": "SideMenu",
    //     "menuName": "My Profile",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a9abd9013bd256acd131",
    //     "menuId": 5,
    //     "menuType": "SideMenu",
    //     "menuName": "Wishlist",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a9bad9013bd256acd159",
    //     "menuId": 6,
    //     "menuType": "SideMenu",
    //     "menuName": "Schemes",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a9c6d9013bd256acd177",
    //     "menuId": 7,
    //     "menuType": "SideMenu",
    //     "menuName": "My Group PV",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a9d2d9013bd256acd19c",
    //     "menuId": 8,
    //     "menuType": "SideMenu",
    //     "menuName": "My Kyc",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a9dfd9013bd256acd1c0",
    //     "menuId": 9,
    //     "menuType": "SideMenu",
    //     "menuName": "DAF Details",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7a9f0d9013bd256acd1fc",
    //     "menuId": 10,
    //     "menuType": "SideMenu",
    //     "menuName": "My Network",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa08d9013bd256acd237",
    //     "menuId": 11,
    //     "menuType": "SideMenu",
    //     "menuName": "My Consistency",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa15d9013bd256acd259",
    //     "menuId": 12,
    //     "menuType": "SideMenu",
    //     "menuName": "My Funds",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa22d9013bd256acd27f",
    //     "menuId": 13,
    //     "menuType": "SideMenu",
    //     "menuName": "My Voucher",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa39d9013bd256acd2be",
    //     "menuId": 14,
    //     "menuType": "SideMenu",
    //     "menuName": "My Bonus",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa48d9013bd256acd2e4",
    //     "menuId": 15,
    //     "menuType": "SideMenu",
    //     "menuName": "My Orders",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa5bd9013bd256acd317",
    //     "menuId": 16,
    //     "menuType": "SideMenu",
    //     "menuName": "Make Payment",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa6bd9013bd256acd350",
    //     "menuId": 35,
    //     "menuType": "SideMenu",
    //     "menuName": "Vestige Training",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa81d9013bd256acd38a",
    //     "menuId": 17,
    //     "menuType": "SideMenu",
    //     "menuName": "Branches",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aa92d9013bd256acd3ba",
    //     "menuId": 18,
    //     "menuType": "SideMenu",
    //     "menuName": "VBD Stores",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aaa1d9013bd256acd3ea",
    //     "menuId": 19,
    //     "menuType": "SideMenu",
    //     "menuName": "Recommendation",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aab3d9013bd256acd418",
    //     "menuId": 20,
    //     "menuType": "SideMenu",
    //     "menuName": "New Member Registration",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aac2d9013bd256acd43d",
    //     "menuId": 21,
    //     "menuType": "SideMenu",
    //     "menuName": "Refer a Friend",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aad1d9013bd256acd466",
    //     "menuId": 22,
    //     "menuType": "SideMenu",
    //     "menuName": "Change Password",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aae2d9013bd256acd49b",
    //     "menuId": 23,
    //     "menuType": "SideMenu",
    //     "menuName": "AboutUs",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aaf0d9013bd256acd4c3",
    //     "menuId": 24,
    //     "menuType": "SideMenu",
    //     "menuName": "Support",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab00d9013bd256acd4f1",
    //     "menuId": 25,
    //     "menuType": "SideMenu",
    //     "menuName": "Share App With Network",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab1ad9013bd256acd53c",
    //     "menuId": 26,
    //     "menuType": "SideMenu",
    //     "menuName": "Logged-In Devices",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab29d9013bd256acd566",
    //     "menuId": 27,
    //     "menuType": "SideMenu",
    //     "menuName": "Sign Out",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab39d9013bd256acd58d",
    //     "menuId": 28,
    //     "menuType": "SideMenu",
    //     "menuName": "Extra data",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab4ad9013bd256acd5ba",
    //     "menuId": 29,
    //     "menuType": "SideMenu",
    //     "menuName": "Extra data",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab5fd9013bd256acd5f4",
    //     "menuId": 30,
    //     "menuType": "TabMenu",
    //     "menuName": "Dashboard",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab72d9013bd256acd62a",
    //     "menuId": 31,
    //     "menuType": "TabMenu",
    //     "menuName": "Shopping",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab84d9013bd256acd657",
    //     "menuId": 32,
    //     "menuType": "TabMenu",
    //     "menuName": "Search",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7ab94d9013bd256acd68a",
    //     "menuId": 33,
    //     "menuType": "TabMenu",
    //     "menuName": "Scheme",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   },
    //   {
    //     "id": "5fc7aba3d9013bd256acd6b3",
    //     "menuId": 34,
    //     "menuType": "TabMenu",
    //     "menuName": "My Cart",
    //     "createdOn": "2020-12-01T12:15:18.926Z",
    //     "updatedOn": "2020-12-02T10:30:45.936Z",
    //     "createdBy": "Admin",
    //     "updatedBy": "Admin",
    //     "isActive": true,
    //     "countryId": 2
    //   }
    // ]
    var arrr = this.props.profile.menuConfigList
    if (arrr != null && arrr != "" && arrr != undefined && arrr.length > 0) {
      let objSec1 = drawerDatassdrawerDatass[0]
      var objSec2 = drawerDatassdrawerDatass[1]
      var newArr1 = {"data":[]};
      var newArr2 = {"data":[]};
      for (let i = 0; i < arrr.length; i++) {
        const gfgf = objSec1.data.map((obj, index) => {
          if ((arrr[i].menuType === "SideMenu" && arrr[i].menuName === obj.title && arrr[i].isActive)) {
            newArr2.data.push(obj)
          }
        });
      }

      for (let i = 0; i < arrr.length; i++) {
        const gfgf = objSec2.data.map((obj, index) => {
          if ((arrr[i].menuType === "SideMenu" && arrr[i].menuName === obj.title && arrr[i].isActive)) {
            newArr2.data.push(obj)
          }
        });
      }
      // const section1 = arrr.map((obj33, index) => {
      //   const gfgf = objSec1.data.map((obj, index) => {
      //     if ((obj33.menuName === obj.title && obj33.isActive)) {
      //       return obj
      //     }
      //   });
      //   return obj33
      // });

      // const section2 = arrr.map((obj33, index) => {
      //   const gfgf = objSec2.data.map((obj, index) => {
      //     if ((obj33.menuName === obj.title && obj33.isActive)) {
      //       return obj
      //     }
      //   });
      // });
      if(this.props.profile.isDirectorId == 1 && this.props.B2CFlow.B2CUserList.length> 0){

        newArr2.data.splice(0, 0, {
          title: "B2CUser",
          displayTitle: "B2C Joinee List",
          screen: "B2CUser",
          icon: require('app/src/assets/images/drawer/population.png'),
          enable: true,
          isGuestUser: true
    });


      }
      if(this.props.auth.distributorType == 3 && this.props.profile.directorDistributorName!='HO'){
      

        newArr2.data.splice(0, 0, {
         
          title: "B2CUser",
          displayTitle: "Know Your Leader",
          screen: "B2CUser",
          icon: require('app/src/assets/images/drawer/owner.png'),
          enable: true,
          isGuestUser: true
    });
      }
      console.log('newArr1====>'+JSON.stringify(newArr1));

      let drawerDatass = [
        newArr1
        ,
        newArr2,
      ]
      // for ucd login
    
      // for b2c user login
    
     
      return drawerDatass
    }
    else {
      return data
    }

  }

  @autobind
  async onItemPress(item) {
    switch (item.title) {
      case 'Wellness':{
        this.props.navigation.closeDrawer();  
        break;
      }
      case 'Sign Out': {
        const logout = await this.props.auth.signOut(true);
        logout && this.props.navigation.navigate('login');
        break;
      }
      
      case 'Delete Account':{
            const logout = await this.props.auth.deleteAccount(true);
            logout && this.props.navigation.navigate('login');
            break;
      }

      case 'Privacy Policy': {
        Linking.openURL('https://www.myvestige.com/uae/terms-and-conditions.aspx');  
        this.props.navigation.closeDrawer();  
        break;
      }
      case 'Refund & Cancellation Policy': {
        Linking.openURL('https://www.myvestige.com/refund.aspx');  
        this.props.navigation.closeDrawer();  
        break;
      }
      
      case 'Schemes': {
        this.props.navigation.navigate('Schemes');
        break;
      }
      case 'My Group PV': {
        this.props.navigation.navigate('groupPvGraph', { type: 'groupPv' });
        break;
      }
      case 'My Consistency': {
        this.props.navigation.navigate('dynamicScreen', { showConsistencyData: true });
        break;
      }
      // case My Consistency
      case 'My Training': {
        this.props.navigation.navigate('myTrainingScreen', { isTraining: false });
        break;
      }
      case 'My Kyc': {
        var name = this.props.profile.directorDistributorName==null?"":this.props.profile.directorDistributorName;

        if(this.props.auth.distributorType == 3 &&  (name=="HO" || name=="")){

            Alert.alert(
              "",
            "Thank you for your interest in becoming a B2B user. You will be notified for the next step very soon.",
            [
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false },
          );
          return;
        }
        if (!this.enableKYC) {
          if(this.props.auth.distributorType == 3 && this.props.profile.directorDistributorName!='HO' ){
            this.props.navigation.navigate('kycImage', { isLoginRoute: true });
          }else{
            this.props.navigation.navigate('kycImage', { isDrawer: true });
          }

        }
        break;
      }
      // case 'Bank/Pan Details': {
      //   this.props.navigation.navigate('bankPanScreen');
      //   break;
      // }
      case 'Logged-In Devices': {
        this.props.navigation.navigate('LogedinDevicesList', { isDrawer: true });
        break;
      }
      case 'AboutUs': {
        const aboutUsContent = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"></head><body></body></html>' + this.props.dashboard.aboutUs.description;
        this.props.navigation.navigate('aboutUs', { answer: aboutUsContent, title: this.props.dashboard.aboutUs.title });
        break;
      }
      case 'Share App With Network': {
        const shareData = {
          failOnCancel: false,
          url: Platform.OS === 'ios' ? IOS_APP_URL : ANDROID_APP_URL,
          title: 'Share App With Network'
        }
        this.props.navigation.closeDrawer();
        Share.open(shareData);
        break;
      }
      case 'New Member Registration': {
        this.props.auth.setSignupRoutePath(SIGNUP_ROUTE.DASHBOARD_ROUTE);
        // trackEvent(NEW_MEMBER_REGISTRATION_BUTTON_PRESS.eventCategory, NEW_MEMBER_REGISTRATION_BUTTON_PRESS.events.NAVIGATE);
        this.props.navigation.navigate('downlineRegistration');
        break;
      }

      case 'My Dashboard': {
        // this.props.navigation.dispatch(CommonActions.navigate({
        //   name: 'Dashboard'
        // }));
        this.props.navigation.replace('dashboard');
        this.props.navigation.closeDrawer();
        break;
      }
      case 'My Business Insights': {
        this.props.navigation.navigate('myBusinessInsights',{distributorID: this.props.profile.distributorID, screenTitle: 'My Business Insights', token: this.props.auth.authToken})
        break;
      }
      case 'B2CUser': {
        this.props.navigation.navigate('B2CUserList')
        break;
      }

      default: {
        this.props.navigation.closeDrawer();
        break;
      }
    }
    if (item.screen !='myBusinessInsights' && item.screen != 'consistancy' && 
        item.screen !== '' && item.screen !== 'downlineRegistration' && item.screen !== 'groupPvGraph' && 
        item.screen !== 'myTrainingScreen' && item.screen !== 'kycImage' && item.screen !== 'LogedinDevicesList' &&
        item.screen !== 'aboutUs' && item.screen !== 'Schemes') {
      this.props.navigation.navigate(item.screen, { countryId: this.props.profile.countryId });
    }

  }

  renderItem = (data) => {
    const style = data.item.enable ? null : { opacity: 0.5 };
    return (
      <TouchableOpacity
        onPress={() => this.onItemPress(data.item)}
        style={[styles.row]}
        disabled={!data.item.enable}
        accessibilityLabel={data.item.displayTitle}
        testID={data.item.displayTitle}
      >
        <View style={{ width: 40 }}>
          <Image
            style={[styles.icon, style, data.item.displayTitle === 'WishList' ? { width: 20 } : null]}
            source={data.item.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, style]}>
          {(data.item.displayTitle == "My Network" && this.props.profile.countryId == 2) ? "My Team" : (data.item.displayTitle != "My Network") ? data.item.displayTitle : data.item.displayTitle}
        </Text>
        {data.item.displayTitle == "Birthday List" &&(
          <View style={[{ borderRadius: 16, width:20, height:20, borderWidth: 1.5, marginTop:10, marginLeft:10, borderColor: COLOR_CODES.red, marginBottom: 12 }]}>
                  <Text style={styles.headingText}>{(this.props.dashboard.birthdayList!=undefined)?this.props.dashboard.birthdayList && this.props.dashboard.birthdayList?.length:"0"}</Text>
                </View>

        )}
      </TouchableOpacity>
    )
  }


  renderAppVersion = () => {
    return (
      <View style={styles.sectionFooter}>
        <Text style={[styles.title, { ...Specs.fontRegular }]}>
          {`Version - ${this.state.buildVersion}`}
        </Text>
      </View>
    )
  }

  render() {
    // alert("SideMenu" + JSON.stringify(this.props.profile.menuConfigList))

    let drawerDatass = [
      {
        'section': 0, 'data': [
          { 'title': 'Categories', displayTitle: strings.drawerScreen.categories, 'screen': 'categoryList', icon: require('app/src/assets/images/drawer/category.png'), enable: true , isGuestUser: true},
          { 'title': 'Brands', displayTitle: strings.drawerScreen.brands, 'screen': 'brandStore', icon: require('app/src/assets/images/drawer/brand.png'), enable: true, isGuestUser: true }
        ]
      },
      {
        'section': 1, 'data': [
          { 'title': 'My Dashboard', displayTitle: 'My Dashboard', 'screen': 'Dashboard', icon: require('app/src/assets/images/tabIcons/dashboard_active_icon.png'), enable: true, isGuestUser: false  },
          ...(this.props.profile.currentPosition?.toUpperCase() == 'DOUBLE UNIVERSAL CROWN' ? [{ 'title': 'My Business Insights', displayTitle: strings.drawerScreen.myBusinessInsights, 'screen': 'myBusinessInsights', icon: require('app/src/assets/images/drawer/grouppv.png'), enable: true, isGuestUser: false  }] : []),
          { 'title': 'My Profile', displayTitle: strings.drawerScreen.profile, 'screen': 'MyProfile', icon: require('app/src/assets/images/Signup/profile.png'), enable: true, isGuestUser: false  },
          ...(this.props.auth.isKyc === '1' ? [{ 'title': 'Distributor Id Card', displayTitle: strings.drawerScreen.distributorIdCard, 'screen': 'distributorIdCard', icon: require('app/src/assets/images/drawer/KYC_Icon.png'), enable: true, isGuestUser: false  }] : []),
          { 'title': 'Vestige News', displayTitle: strings.drawerScreen.vestigeNews, 'screen': 'news', icon: require('app/src/assets/images/drawer/message.png'), enable: true, isGuestUser: false  },
          { 'title': 'Wishlist', displayTitle: 'WishList', 'screen': 'Wishlist', icon: require('app/src/assets/images/tabIcons/wishlist_inactive_icon.png'), enable: true, isGuestUser: false  },
          { 'title': 'Birthday List', displayTitle: strings.drawerScreen.birthdayList, 'screen': 'birthdayList', icon: require('app/src/assets/images/scheme/scheme.png'), enable: true, isGuestUser: false  },
          { 'title': 'Schemes', displayTitle: 'Schemes', 'screen': 'Schemes', icon: require('app/src/assets/images/scheme/scheme.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Group PV', displayTitle: strings.drawerScreen.groupPv, 'screen': 'groupPvGraph', icon: require('app/src/assets/images/drawer/grouppv.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Kyc', displayTitle: strings.drawerScreen.kyc, 'screen': 'kycImage', icon: require('app/src/assets/images/drawer/KYC_Icon.png'), enable: !this.enableKYC, isGuestUser: false  },
          { 'title': 'Bank/Pan Details', displayTitle: this.panBankNameConfig(),'screen':'bankPanScreen', icon: require('app/src/assets/images/drawer/KYC_Icon.png'), enable: true, isGuestUser: false },
          { 'title': 'DAF Details', displayTitle: strings.drawerScreen.daf, 'screen': 'daf', icon: require('app/src/assets/images/drawer/KYC_Icon.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Network', displayTitle: strings.drawerScreen.network, 'screen': 'myNetwork', icon: require('app/src/assets/images/drawer/network.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Consistency', displayTitle: strings.drawerScreen.consistency, 'screen': 'consistancy', icon: require('app/src/assets/images/drawer/consistency.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Funds', displayTitle: strings.drawerScreen.funds, 'screen': 'myFunds', icon: require('app/src/assets/images/drawer/funds.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Voucher', displayTitle: strings.drawerScreen.voucher, 'screen': 'myVoucher', icon: require('app/src/assets/images/drawer/voucher.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Bonus', displayTitle: strings.drawerScreen.bonus, 'screen': 'myBonus', icon: require('app/src/assets/images/drawer/bouns.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Orders', displayTitle: strings.drawerScreen.order, 'screen': 'orders', icon: require('app/src/assets/images/drawer/shopping.png'), enable: true, isGuestUser: false  },
          { 'title': 'Courier Details', displayTitle: strings.drawerScreen.courierDetails, 'screen': 'courierDetails', icon: require('app/src/assets/images/drawer/shopping.png'), enable: true, isGuestUser: false  },
          { 'title': 'Make Payment', displayTitle: strings.drawerScreen.orderLog, 'screen': 'orderLog', icon: require('app/src/assets/images/drawer/shopping.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Training', displayTitle: strings.drawerScreen.training, 'screen': 'myTrainingScreen', icon: require('app/src/assets/images/drawer/training.png'), enable: true, isGuestUser: false  },
          { 'title': 'Training Dashboard', displayTitle: strings.drawerScreen.trainingDashboard, 'screen': 'trainingDashboard', icon: require('app/src/assets/images/drawer/training.png'), enable: true, isGuestUser: false },
          { 'title': 'Mobile Number Update', displayTitle: strings.drawerScreen.mobileNumberUpdate, 'screen': 'mobileNumberUpdate', icon: require('app/src/assets/images/drawer/mobileNumberUpdate_logo.png'), enable: true, isGuestUser: false  },
          { 'title': 'My Prospect', displayTitle: strings.drawerScreen.My_Prospect, 'screen': 'MyProspect', icon: require('app/src/assets/images/drawer/Mobiles.png'), enable: true, isGuestUser: false },
          { 'title': 'Branches', displayTitle: strings.drawerScreen.branches, 'screen': 'branches', icon: require('app/src/assets/images/drawer/branches_Icon.png'), enable: true, isGuestUser: false  },
          // { 'title': 'VBD Stores', displayTitle: strings.drawerScreen.vbd, 'screen': 'vbdStores', icon: require('app/src/assets/images/drawer/bank.png'), enable: true, isGuestUser: false  },
          { 'title': 'Recommendation', displayTitle: strings.drawerScreen.recommendation, 'screen': 'recommendation', icon: require('app/src/assets/images/drawer/recommendation_icon.png'), enable: true, isGuestUser: false },
          { 'title': 'New Member Registration', displayTitle: 'New Member Registration', 'screen': 'downlineRegistration', icon: require('app/src/assets/images/Signup/profile.png'), enable: true, isGuestUser: false },
          { 'title': 'Refer a Friend', displayTitle: strings.drawerScreen.refer, 'screen': 'shareScreen', icon: require('app/src/assets/images/drawer/referIcon.png'), enable: true, isGuestUser: false },
          { 'title': 'Change Password', displayTitle: strings.drawerScreen.password, 'screen': 'changePassword', icon: require('app/src/assets/images/Signup/password.png'), enable: true, isGuestUser: false },
          ... (!this.props.dashboard.aboutUsFetchError ? [{ 'title': 'AboutUs', displayTitle: this.props.dashboard.aboutUs && this.props.dashboard.aboutUs.title, 'screen': 'aboutUs', icon: require('app/src/assets/images/drawer/aboutUs.png'), enable: true, isGuestUser: true }] : []),
          { 'title': 'Support', displayTitle: 'Support', 'screen': 'generalQueries', icon: require('app/src/assets/images/drawer/message.png'), enable: true, isGuestUser: true },
          { 'title': 'Share App With Network', displayTitle: 'Share App With Network', 'screen': '', icon: require('app/src/assets/images/drawer/referIcon.png'), enable: true, isGuestUser: true },
          { 'title': 'Logged-In Devices', displayTitle: 'Logged-In Devices', 'screen': 'LogedinDevicesList', icon: require('app/src/assets/images/drawer/Mobiles.png'), enable: true, isGuestUser: false },
          { 'title': 'Contact Us', displayTitle: strings.drawerScreen.contactUs, 'screen': 'contactUs', icon: require('app/src/assets/images/drawer/contactUs.png'), enable: true, isGuestUser: true },
          { 'title': 'Wellness', displayTitle: strings.drawerScreen.Wellness, 'screen': 'wellness', icon: require('app/src/assets/images/drawer/wellness.png'), enable: true, isGuestUser: true },
          { 'title': 'Privacy Policy', displayTitle: strings.drawerScreen.privacyPolicy, 'screen': '', icon: require('app/src/assets/images/drawer/img_privacy_policy.png'), enable: true, isGuestUser: true },
          { 'title': 'Refund & Cancellation Policy', displayTitle: strings.drawerScreen.refundCancellation, 'screen': '', icon: require('app/src/assets/images/drawer/img_privacy_policy.png'), enable: true, isGuestUser: true },
          { 'title': 'Delete Account', displayTitle: strings.drawerScreen.deleteAccount, 'screen': '', icon: require('app/src/assets/images/drawer/img_privacy_policy.png'), enable: true, isGuestUser: true },
          { 'title': 'Sign Out', displayTitle: strings.drawerScreen.signOut, 'screen': '', icon: require('app/src/assets/images/drawer/logout.png'), enable: true, isGuestUser: true },

        ]
      }
    ];
    // let drawerData = drawerDatass
    let drawerData = this.filterSideMenuData(drawerDatass);
    if (this.props.auth.userRole === UserRole.GuestUser) {
      const item = { 'title': 'Branches', displayTitle: strings.drawerScreen.branches, 'screen': 'branches', icon: require('app/src/assets/images/drawer/branches_Icon.png'), enable: true , isGuestUser: true }
      // drawerData[1].data.splice(0, 18)
      const guestUserData = drawerData[1].data.filter((item) => {
        return item.isGuestUser == true;
      })
      drawerData[1].data = guestUserData;
      drawerData[1].data.splice(0, 0, item);
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={this.props.profile.countryId != 2 ? NavLogo : NavLogoNepal}
          />
          <Icon name="user-circle-o" size={30} color='#3f4967' style={styles.profileImage} />
        </View>
        <View style={styles.hr} />
        <SectionList
          showsVerticalScrollIndicator={false}
          renderItem={(item) => this.renderItem(item)}
          renderSectionHeader={({ section: { section } }) => (
            section !== 0 && <View style={styles.hr} />
          )}
          sections={drawerData}
          keyExtractor={(item, index) => item + index}
          extraData={drawerData}
          ListFooterComponent={this.renderAppVersion}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Platform.OS === 'ios' ? 64 : 56
  },
  logo: {
    marginLeft: 17
  },
  profileImage: {
    width: 35,
    height: 35,
    marginRight: 17
  },
  hr: {
    height: 1,
    backgroundColor: '#c8c9d3'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  icon: {
    marginLeft: 15,
  },
  title: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#3f4967',
    marginLeft: 19,
  },
  sectionFooter: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 10,
    paddingRight: 15,
  },
  headingText: {
    color: COLOR_CODES.red,
    fontSize: 15,
    ...Specs.fontSemiBold,
    textAlign: 'center',
  },
  
})