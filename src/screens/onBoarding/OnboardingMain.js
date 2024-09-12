
import React, { Component } from 'react';
import {Platform} from 'react-native';
import { get } from 'lodash';
import { inject } from 'mobx-react';
import { strings } from 'app/src/utility/localization/Localized';
import { SIGNUP_ROUTE } from 'app/src/utility/constant/Constants';
import Onboarding from './Onboarding';


const logo = require('../../assets/images/logo/logo.png');
const onBoardOne = require('../../assets/images/OnBoarding/onboardingImageFirst.png');
const onBoardTwo = require('../../assets/images/OnBoarding/onboardingImageSecond.png');
const onBoardThree = require('../../assets/images/OnBoarding/onboardingImageThird.png');

@inject('auth')
export default  class OnboardingMain extends Component {
    
  constructor(props) {
    super(props)
    this.props = props;
  }

  onPressSignIn = () => {
    const { navigation } = this.props;
    navigation.navigate('login');
  }

  onPressSignUp = () => {
    const { navigation } = this.props;
    this.props.auth.setSignupRoutePath(SIGNUP_ROUTE.ONBOARDING_ROUTE)
    // Platform.OS==='android' ? navigation.navigate('signup') : navigation.navigate('guestUser')
    navigation.navigate('signup')
  }
    
  render() {
    const { onboarding } = get(strings,'onboardingScreen');
    return(
      <Onboarding
        pages={[
          { backgroundColor: '#f5fffb',image: onBoardOne,  title: onboarding[0].title, subtitle: onboarding[0].subTitle },
          { backgroundColor: '#f5fffb',image: onBoardTwo,  title: onboarding[1].title, subtitle: onboarding[1].subTitle },
          { backgroundColor: '#f5fffb',image: onBoardThree,  title: onboarding[2].title, subtitle: onboarding[2].subTitle },
        ]}
        logo={logo}
        onPressSignIn={this.onPressSignIn}
        onPressSignUp={this.onPressSignUp}
      />
    );
  }
}