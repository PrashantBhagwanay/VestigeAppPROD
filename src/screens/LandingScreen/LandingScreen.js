/**
 * @description
 * The screen loads after splash
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getApplicationLanguage } from '../../utility/constant/Constants';

// Landing Screen CSS
const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D9766',
  },
  customButton: {
    borderWidth: 1,
    flex: 1,
    height: 30,
    marginLeft: 20,
    borderRadius: 8,
  },
});


export default class LandingScreen extends Component {
  // static defaultProps = {
  //   navigation: null,
  // };

  constructor(props) {
    super(props);
    this.state = {
      getLandingScreenData: {},
    };
  }

  componentDidMount() {
    const languageData = getApplicationLanguage();
    this.setState({
      getLandingScreenData: languageData,
    });
  }

    /**
     * @description
     * handling the click and the route to selected screen
    */
    handleClick = (routeParams) => {
      const { navigation } = this.props;
      navigation.navigate(routeParams);
    }

    render() {
      const { getLandingScreenData } = this.state;
      return (
        <View>
          <Text style={styles.title}>
            {getLandingScreenData.VESTIGE_WHYJOIN}
          </Text>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => this.handleClick('login')}
            >
              <Text style={{ alignSelf: 'center', paddingTop: 5 }}>
                {getLandingScreenData.VESTIGE_LOGIN_TITLE}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.customButton, { marginRight: 20 }]}
              onPress={() => this.handleClick('selectSignup')}
            >
              <Text style={{ paddingTop: 5, textAlign: 'center' }}>
                {getLandingScreenData.VESTIGE_SIGNUP_TITLE}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.customButton, { marginRight: 20 }]}
              onPress={() => this.handleClick('kycImage')}
            >
              <Text style={{ paddingTop: 5, textAlign: 'center' }}>
                {getLandingScreenData.VESTIGE_KYC_TITLE}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customButton, { marginRight: 20 }]}
              onPress={() => this.handleClick('dashboard')}
            >
              <Text style={{ paddingTop: 5, textAlign: 'center' }}>
                {getLandingScreenData.VESTIGE_DASHBOARD_TITLE}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
}
// LandingScreen.propTypes = {
//   navigation: PropTypes.object,
// };
