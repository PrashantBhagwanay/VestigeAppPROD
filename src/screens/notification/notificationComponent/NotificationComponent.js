/**
 * @description Use to make training cell
 */
import React, { Component } from 'react';
import {
  View, 
  StyleSheet,
  Text,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';

/**
 * @description It contains the complete Notification cell design
 */
export default class NotificationComponent extends Component {
  constructor(props) {
    super(props);
    this.props = props
  }

  render() {
    return(
      <View style={styles.mainView}>
        <View style={styles.cellView}>
          <Text style={styles.titleText}>
            {strings.notification.text}
          </Text>
          <Text style={styles.timeText}>
            {strings.notification.time}
          </Text>
        </View>
      </View>
    );
  }
}

/**
 * @description: This is the custom stylesheet for Notification cell
 */
const styles = StyleSheet.create({
  mainView: {
    width: '100%',
  },
  cellView: {
    zIndex: -1,
    backgroundColor: '#ffffff',
    paddingTop:2,
    paddingLeft: 8,
    paddingRight:6,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 8,
    borderRadius: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
  },
  titleText: {
    color: '#515867',
    ...Specs.fontMedium,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 17,
    marginRight: 17,
  },
  timeText: {
    color: '#515867',
    ...Specs.fontRegular,
    fontSize: 12,
    marginBottom: 14,
    marginLeft: 17,
  },
  
});