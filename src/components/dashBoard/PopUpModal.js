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
} from 'react-native';

/**
 * @description: This is the Popup modal stylesheet
 */
const styles = StyleSheet.create({
  mainContainerInfo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#00000040',
    // opacity: 0,
  },
  containerInfo: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 200,
    marginTop: 100,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  headerInfo: {
    width: '100%',
    height: 80,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headingText: {
    color: '#3f5886',
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginLeft: 120,
  },
  closeButton: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  backgroundContainer: {
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },

  textContainer: {
    width: Dimensions.get('window').width - 80,
    height: 30,
    marginTop: 5,
    marginLeft: 20,
    marginRight: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  titleText: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
  },
  subTitleText: {
    color: 'black',
    fontSize: 14,
  },
});

const CLOSE_IMAGE = require('../../assets/images/DashBoardHeader/close.png');

function listData(title, value) {
  return (
    <View style={styles.textContainer}>
      <Text style={styles.titleText}>
        {title}
      </Text>
      <Text style={styles.subTitleText}>
        {value}
      </Text>
    </View>
  );
}

function showData(obj) {
  const { responseData } = obj.props;
  const { pointsData } = obj.props;
  const { isGroupPV } = obj.state;

  let pointsDataLocal = null;
  if (pointsData && (pointsData !== null || pointsData !== undefined)) {
    pointsDataLocal = pointsData;
  }
  let responseDataLocal = null;
  if (responseData && (responseData !== null || responseData !== undefined)) {
    responseDataLocal = responseData;
  }
  if (isGroupPV === false) {
    return (
      <View style={styles.backgroundContainer}>
        {responseDataLocal ? listData('Current Position', responseDataLocal.currentPosition) : null}
        {responseDataLocal ? listData('Previous Position', responseDataLocal.previousPosition) : null}
        {responseDataLocal ? listData('Next Position', responseDataLocal.nextPosition) : null}
      </View>
    );
  }
  return (
    <View style={styles.backgroundContainer}>
      {pointsDataLocal ? listData('Previous Cumulative PV', pointsDataLocal.previousCumuLativePv) : null}
      {pointsDataLocal ? listData('Exclusive PV', pointsDataLocal.exclusivePv) : null}
      {pointsDataLocal ? listData('Group PV', pointsDataLocal.groupPV) : null}
      {pointsDataLocal ? listData('Total PV', pointsDataLocal.totalPv) : null}
      {pointsDataLocal ? listData('Current Cumulative PV', pointsDataLocal.currentCumulativePv) : null}
      {pointsDataLocal ? listData('Self BV', pointsDataLocal.selfBv) : null}
      {pointsDataLocal ? listData('Self PV', pointsDataLocal.selfPv) : null}
      {pointsDataLocal ? listData('Total Business Volume', pointsDataLocal.totalBusinessVolume) : null}
    </View>
  );
}

export default function getPopupModalView(obj) {
  return (
    <Modal animationType="slide" visible={obj.state.showModal} transparent onRequestClose={() => {}}>
      <View style={styles.mainContainerInfo}>
        <View style={styles.containerInfo}>
          <View style={styles.headerInfo}>
            <Text style={styles.headingText}>
              INFO
            </Text>
            <TouchableOpacity
              onPress={() =>{ obj.setState({ showModal: false }) }}
            >
              <Image
                style={styles.closeButton}
                source={CLOSE_IMAGE}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {showData(obj)}
        </View>
      </View>
    </Modal>
  );
}
