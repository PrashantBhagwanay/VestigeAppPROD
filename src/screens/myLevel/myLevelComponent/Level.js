import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import UserImageLevel from '../../../components/userImageLevel/UserImageLevel';
const PROFILEDEFAULT_IMAGE = require('../../../assets/images/DashBoardHeader/profileImage.png');
import { strings } from 'app/src/utility/localization/Localized';
/**
 * @description: It shows levels on the basis of parameter 
 * @param parameter level data
 */ 
const Level = (parameter) =>  {
  const vieStyle = parameter.props.type === '3' ? [styles.whiteBackgroundView, styles.grayBackgroundView] : styles.whiteBackgroundView;
  return (
    <View style={styles.mainView}>
      <View style={vieStyle}>
        {parameter.props.type === '2' ? leftSeprator() :null}
        {parameter.props.type === '1' ? nextLevelWithImage(parameter) :otherLevelWithImage(parameter) }
        {parameter.props.type === '1' ? nextLevel(parameter) :otherLevel(parameter) }
      </View>
    </View>
  )
}

/**
 * @description: Show left seprator
 * @param parameter level data
 */ 
const leftSeprator = () => {
  return (
    <View style={styles.leftSepratorView} />
  )
}

/**
 * @description: Show next level and user image
 * @param parameter level data
 */ 
const nextLevelWithImage = (parameter) => {
  return (
    <View style={styles.imageBackgroundView}>
      <UserImageLevel userImage={PROFILEDEFAULT_IMAGE} type={parameter.props.type} />
      <Text style={styles.levelText}>
        {parameter.props.levelName}
      </Text>
    </View>
  )
}

/**
 * @description: Show current/previous level and user image
 * @param parameter level data
 */ 
const otherLevelWithImage = (parameter) => {
  return (
    <View style={styles.imageBackgroundView}>
      <UserImageLevel userImage={PROFILEDEFAULT_IMAGE} />
      <Text style={styles.levelText}>
        {parameter.props.levelName}
      </Text>
    </View>
  )
}

/**
 * @description: Show next level target
 * @param parameter level data
 */ 
const nextLevel = (parameter) => {
  return (
    <View style={styles.textBackgroundView}>
      <Text style={styles.rightText}>
        {`${strings.levelComponent.targetKey} : `}
        <Text style={{color: '#f5a623',}}>
          {` ${parameter.props.target} ${strings.levelComponent.ptsKey} `}
        </Text> 
      </Text>
    </View>
  )
}

/**
 * @description: Show current/Previous level target
 * @param parameter level data
 */ 
const otherLevel = (parameter) => {
  return (
    <View style={styles.textBackgroundView}>
      <Text style={styles.rightText}>
        {`${strings.levelComponent.groupPv} :  ${parameter.props.groupPV} ${strings.levelComponent.ptsKey}`}
      </Text>
      <Text style={styles.rightText}>
        {`${strings.levelComponent.myNetwork} : ${parameter.props.myNetwork}`}
      </Text>
    </View>
  )
}

/**
 * @description: This is the custom stylesheet for user Level
 */
const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    height: 90,
  },
  whiteBackgroundView: {
    backgroundColor: '#ffffff',
    width: '94%',
    height: '80%',
    marginLeft: '3%',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 10 },
    shadowColor: 'gray',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  grayBackgroundView: {
    backgroundColor: '#EFF3F7',
  },
  leftSepratorView: {
    backgroundColor: '#57a5cf',
    height: '100%',
    width: 2,
    position: 'absolute',
  },
  imageBackgroundView: {
    height: '100%',
    marginRight: '3%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  textBackgroundView: {
    height: '100%',
    marginRight: '3%',
    justifyContent: 'center',
  },
  rightText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#696f91',
    marginBottom: 5,
    marginTop: 5,
  },
});

export default Level;