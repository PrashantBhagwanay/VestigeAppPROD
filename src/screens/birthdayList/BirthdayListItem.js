import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { strings } from 'app/src/utility/localization/Localized';
import { CustomButton } from 'app/src/components/buttons/Button';
import styles from './styles';

const listData = (
  item,
  colorize,
  getNameInitials,
  onPressSendWish,
  showSendWishButton
) => {
  const title = item.name || '';

  const renderSendWishButton = () => {
    if(!showSendWishButton) {
      return false;
    }
    if (item.mobileNo?.trim()) {
      if (!item.isSendWish) {
        return (
          <TouchableOpacity
            onPress={() => onPressSendWish([item])}
            style={styles.sendWishBtn}
          >
            <Text style={styles.sendWish}>{strings.birthdayPopup.sendWish}</Text>
          </TouchableOpacity>
        );
      }
      return (
        <View style={styles.sendWishBtn}>
          <Icon name="check" size={30} color="#3f4967" />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.textContainer}>
      <View style={{ width: 40, height: 40, borderRadius: 40, backgroundColor: colorize(title), justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[styles.titleText, { color: 'white' }]}>{getNameInitials(title)}</Text>
      </View>
      <Text style={[styles.titleText, { marginLeft: 10, width: 150 }]} numberOfLines={2}>{title}</Text>
      {renderSendWishButton()}
    </View>
  );
};

const BirthdayListItem = ({
  birthdayList,
  onPressSendWish,
  showSendWishButton
}) => {
  const colorize = (str) => {
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    const color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
    return `#${Array(6 - color.length + 1).join('0')}${color}`;
  };

  const getNameInitials = (title) => {
    let initials = title.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    return initials;
  };

  return (
    <FlatList
      keyExtractor={(item, index) => index.toString()}
      data={birthdayList}
      extraData={birthdayList}
      renderItem={({ item }) => listData(item, colorize, getNameInitials, onPressSendWish, showSendWishButton)}
      ListFooterComponent={() => (
        (birthdayList?.length > 1 && showSendWishButton) && (
          <CustomButton
            handleClick={() => onPressSendWish(birthdayList)}
            linearGradient
            disabled={birthdayList.find(item => item.isSendWish === false) ? false : true}
            buttonContainer={styles.button}
            buttonTitle={strings.birthdayPopup.sendWishToAll}
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor="#58cdb4"
            secondaryColor="#58cdb4"
          />
        )
      )}
    />
  );
};

export default BirthdayListItem;
