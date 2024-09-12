import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLOR_CODES, Specs } from '../../utility/Theme';
import { strings } from '../../utility/localization/Localized';

export const Header = observer(props => {
  const {
    navigation, hideBack, showDrawer, screenTitle,
    middleComponent, rightComponent, headerTextStyle,
    onBackPress, leftComponent,
  } = props;

  const goBack = () => {
    try {
      navigation?.goBack();
    } catch (error) {
      console.log('back error => ', error);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftView}>
        {leftComponent}
        {hideBack ? null : (
          <TouchableOpacity onPress={onBackPress ? onBackPress : goBack}>
            <MaterialIcons
              // name="keyboard-backspace"
              name="arrow-back-ios"
              size={30}
              color={COLOR_CODES.darkGrey}
            />
          </TouchableOpacity>
        )}
        {showDrawer && hideBack ? (
          <TouchableOpacity onPress={() => navigation?.toggleDrawer()}>
            <MaterialCommunityIcons
              name="menu"
              size={35}
              color={COLOR_CODES.darkGrey}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.middleView}>
        {middleComponent}
        {screenTitle && (
          <Text style={[styles.title, headerTextStyle]}>{screenTitle}</Text>
        )}
      </View>
      <View style={styles.rightView}>{rightComponent}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLOR_CODES.white,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderBottomColor: COLOR_CODES.border,
    borderBottomWidth: 1,
    alignItems: 'center',
    height: 55,
  },
  leftView: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical: 5,
    maxWidth: 50,
  },
  middleView: {
    flexDirection: 'row',
    marginLeft: 5,
    flex: 1,
  },
  rightView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // paddingVertical: 5,
    maxWidth: 70,
  },
  backBtn: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  title: {
    ...Specs.fontBold,
    color: COLOR_CODES.darkGrey,
    fontSize: 15,
    textAlign: 'center',
  },
});
