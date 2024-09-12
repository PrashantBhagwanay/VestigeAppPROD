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
 import Carenation from 'carenation-react-native-component';
 
 import {UserRole } from 'app/src/utility/constant/Constants';
 import { Header } from '../../components';
import { TESLON_CONFIG } from '../../network/Urls';
 
 const CLOSE_IMAGE = require('../../assets/images/DashBoardHeader/close.png');
 
 @inject('dashboard', 'auth', 'profile')
 @observer
 export default class Wellness extends Component {
 
   constructor(props) {
     super(props);
   }
 
   async componentDidMount() {
     
   }
 

   render() {
     const { email } = this.props.profile;
     console.log(`Email ==> ${email}`);
     return (
      <View style={{ flex: 1 }}>
         <Header
           navigation={this.props.navigation}
           screenTitle={'Wellness'}
         />
           <Carenation 
            apiKey="a131bbe3-8b4c-4da2-9200-860793768935" 
            identifier={email}
            domain="vestige.carenation.in" />
        
       </View>
     );
   }
 }
 