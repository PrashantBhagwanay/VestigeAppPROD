import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { observer, inject } from 'mobx-react';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';

const FEEDBACKICON = require('app/src/assets/images/feedbackIcon.png');
@inject('deviceListing')
@observer

export default class DeviceItem extends Component {
  constructor(props) {
    super(props);
  }

  handleClick = () => {
    const { item } = this.props;

  }

  showArrowIcon = (item) => {

    return (
      <Icon
        name='arrow-down'
        type='simple-line-icon'
        color='black'
        size={16}
      />
    )
  }


  render() {
    // const { showDescription }  = this.state;
    const { item } = this.props;
    let name = 'Peter Martin';
    let id = 'ID: 981078920182';
    let pvValue = '800Pts';
    let bonusPercent = '750Pts';


    return (
      <View style={styles.mainView}>
        <View style={[styles.textView, styles.cellView]}>
          <View style={styles.titleView}>
            {/* <Text style={[styles.nameText]} numberOfLines={2}>
             {"device name : "}{item.deviceName}
            </Text> */}
            <Text style={[styles.nameText, { color: 'rgba(50,50,50,1.0)' }]}>
              {"Device Name : "}
              <Text style={styles.nameText}>
                {item.deviceName} </Text>
            </Text>
          </View>
          <View style={styles.subTitleView}>
            <View style={styles.DeviceIdView}>
              <Text style={[styles.nameText, { color: 'rgba(50,50,50,1.0)' }]}>
                {"Last Activity : "}
                <Text style={styles.nameText}>
                  {item.modifiedDate} </Text>
              </Text>
            </View>
          </View>
          <View style={styles.subTitleView}>
            <View style={styles.DeviceIdView}>
              <Text style={[styles.nameText, { color: 'rgba(50,50,50,1.0)' }]}>
                {"Device Id : "}
                <Text style={styles.nameText}>
                  {item.deviceId} </Text>
              </Text>
            </View>
          </View>
          {this.props.deviceId != item.deviceId &&
            <TouchableOpacity style={styles.logoutButtonCss}
              onPress={() => {
                if (this.props.deviceId != item.deviceId) {
                  AlertClass.showAlert('VESTIGE', "Are you sure you want to logout " + item.deviceName + " ?", [
                    {
                      text: "No",
                      onPress: () => {
                      }
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        this.props.postDeviceUnregister(item)
                      }
                    }
                  ]);
                }
              }
              }
            >
              <Text style={[styles.nameText, { fontSize: 15, color: 'rgba(255,255,255,1.0)' }]}>
                {"Log Out"}
              </Text>
            </TouchableOpacity>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#e8ebf0',
    flexDirection: 'column',
    flex: 1
  },
  cellView: {
    zIndex: -1,
    paddingBottom: 22,
    paddingTop: 12,
    paddingHorizontal: 20,
    marginLeft: 20,
    marginRight: 17,
    marginTop: 8,
    borderRadius: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
  },
  textView: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    marginTop: 11,
    backgroundColor: '#fff'
  },
  titleView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameText: {
    ...Specs.fontBold,
    fontSize: 12,
    color: '#848484',
    // width: '60%'
  },
  pvValuesView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  DeviceIdView: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  pvText: {
    color: '#404652',
    ...Specs.fontSemiBold,
    fontSize: 12
  },
  pvValueText: {
    color: '#31cab3',
    marginLeft: 15,
    paddingLeft: 10
  },
  subTitleView: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  idText: {
    ...Specs.fontMedium,
    fontSize: 12,
    color: 'red',
  },
  pvTargetValueText: {
    color: '#f5a623',
    marginLeft: 5,
    ...Specs.fontMedium,
    fontSize: 12,
  },
  accordionArrow: {
    elevation: 3,
    // flexDirection:'row'?,
    shadowOffset: { width: 2, height: 4 },
    shadowColor: '#80646464',
    shadowOpacity: 0.2,
    zIndex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    top: -15,
    backgroundColor: '#fff',
    width: 30,
    height: 30,
    borderRadius: 50
  },
  logoutButtonCss: {
    elevation: 3,
    shadowOffset: { width: 2, height: 4 },
    shadowColor: '#80646464',
    shadowOpacity: 0.2,
    zIndex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    top: 5,
    backgroundColor: '#6797d4',
    width: 150,
    height: 35,
    marginTop: 5,
    borderRadius: 17.5
  },
  descriptionFooterText: {
    ...Specs.fontRegular,
    borderBottomColor: '#515867',
    textDecorationLine: 'underline',
    color: '#515867',
    fontSize: 12,
    paddingVertical: 8
  },
  networkDistributorDetails: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  footerLabels: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textHeading: {
    ...Specs.fontRegular,
    fontSize: 12,
    color: '#6c7a87',

  },
  text: {
    ...Specs.fontMedium,
    fontSize: 12,
    color: '#6c7a87',

  }
});
