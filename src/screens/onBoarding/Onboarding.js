import React, { Component } from 'react';
import { View, ScrollView, Dimensions, TouchableOpacity, Text, StyleSheet, Image, Platform, SafeAreaView } from 'react-native';
import tinycolor from 'tinycolor2';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { inject, observer } from 'mobx-react';

import PageData from './components/PageData';
import Paginator from './components/Paginator';

// const SHARE_ICON = require('../../assets/images/OnBoarding/share_icon.png');
@inject('auth')
@observer
export default class Onboarding extends Component {

  static defaultProps = {
    bottomOverlay: true,
  };

  constructor(props) {
    super(props);
    this.props = props

    this.state = {
      currentPage: 0,
    };
  }

  updatePosition = (event) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const pageFraction = contentOffset.x / layoutMeasurement.width;
    const page = Math.round(pageFraction);
    const isLastPage = this.props.pages.length === page + 1;
    if (isLastPage && pageFraction - page > 0.3) {
      this.props.onPressSignIn();
    } 
    else {
      this.setState({ currentPage: page });
    }
  };

  goNext = () => {
    const { width } = Dimensions.get('window');
    const { currentPage } = this.state;
    const nextPage = currentPage + 1;
    const offsetX = nextPage * width;
    this.refs.scroll.scrollTo({
      x: offsetX,
      animated: true
    }, () => {
      this.setState({ currentPage: nextPage });
    });
  };

  render() {
    const { width } = Dimensions.get('window');
    const { pages, bottomOverlay } = this.props;
    const currentPage = pages[this.state.currentPage] || pages[0];
    const { backgroundColor } = currentPage;
    const isLight = tinycolor(backgroundColor).getBrightness() > 180;
    const marginTop = Platform.OS === 'ios' ? 33 : 25
    
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor}}>
        <View style={{ flex: 1, backgroundColor: backgroundColor, justifyContent: 'center' }}>
          {this.props.logo && <Image style={{ alignSelf:'center', marginTop: marginTop, marginBottom: 20}} source={this.props.logo} />}
          <ScrollView
            refs='scroll'
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={this.updatePosition}
            scrollEventThrottle={100}
            keyboardShouldPersistTaps='always'
          >
            {pages.map(({ image, title, subtitle, titleStyles, subtitleStyles }, index) => (
              <PageData
                key={index.toString()}
                isLight={isLight}
                image={image}
                title={title}
                subtitle={subtitle}
                titleStyles={titleStyles}
                subtitleStyles={subtitleStyles}
                width={width}
              />
            ))}
          </ScrollView>
          <Paginator
            isLight={isLight}
            overlay={bottomOverlay}
            pages={pages.length}
            currentPage={this.state.currentPage}
          />
        </View>
        <View style={{ paddingVertical: 27, flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'space-evenly' , alignItems: 'center' }}>
          <TouchableOpacity
            style={[ styles.buttonContainer, { backgroundColor: '#6598d3'}]}
            onPress={() => {this.props.onPressSignIn()}}
            accessibilityLabel="Onboarding_Signin_Button"
            testID="Onboarding_Signin_Button"
          >
            <Text style={styles.buttonText}>{strings.onboardingScreen.buttonSignIn}</Text>
          </TouchableOpacity>
          {(Platform.OS==='android' || this.props.auth.isSignupEnabled == true)? (
            <TouchableOpacity
              style={[styles.buttonContainer, { backgroundColor: '#58cdb4' }]}
              onPress={() => {this.props.onPressSignUp()}}
              accessibilityLabel="Onboarding_SignUp_Button"
              testID="Onboarding_Signup_Button"
            >
              <Text style={styles.buttonText}>{strings.onboardingScreen.buttonSignUp}</Text>
              {/* <Text style={styles.buttonText}>Guest/Easy Sign In</Text> */}
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create ({
  buttonContainer : {
    paddingVertical: 11, 
    paddingHorizontal: 48, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 30
  },
  buttonText: {
    ...Specs.fontMedium,
    color: 'white', 
    fontSize: 16
  }
})