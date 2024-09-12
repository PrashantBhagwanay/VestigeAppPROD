// Access Device’s Contact List in React Native App
// https://aboutreact.com/access-contact-list-react-native/

import React, {memo} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import { Checkbox } from 'app/src/components/buttons/Button';
import { strings } from '../../../../utility/localization/Localized';

import PropTypes from 'prop-types';
import Avatar from './Avatar';

const getAvatarInitials = (textString) => {
  if (!textString) return '';
  const text = textString.trim();
  const textSplit = text.split(' ');
  if (textSplit.length <= 1) return text.charAt(0);
  const initials =
    textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0);
  return initials;
};

const ListItem = (props) => {
  const shouldComponentUpdate = () => {
    return false;
  };
  const {item, onPress, selectItem} = props;
  return (
    console.log('Item from lIst Item',item),
    <>
      <TouchableOpacity onPress={() => onPress(item)}>
        <View style={styles.itemContainer}>
          <View style={styles.leftElementContainer}>
            <Avatar
              img={
                item.hasThumbnail ?
                  {uri: item.thumbnailPath} : undefined
              }
              placeholder={getAvatarInitials(
                `${item.givenName} ${item.familyName}`,
              )}
              width={40}
              height={40}
            />
          </View>
          <View style={styles.rightSectionContainer}>
            <View style={styles.mainTitleContainer}>
              <Text
                style={
                  styles.titleStyle
                }>{`${item.givenName} ${item.familyName}`}</Text>
            </View>
            
          </View>
          <View style={styles.checkboxStyle}>
          <Checkbox
            overrideStyles={{ marginRight: 0, marginLeft: 0 }}
            isSelected={item.isActive}
            getQuantity={() =>selectItem(!item.isActive,item)}
          />
          </View>
        </View>
    
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    minHeight: 44,
    height: 63,
  },
  leftElementContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2,
    paddingLeft: 13,
  },
  rightSectionContainer: {
    marginLeft: 18,
    flexDirection: 'row',
    flex: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#515151',
    // borderWidth: 1
  },
  checkboxStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center'
  },
  mainTitleContainer: {
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  titleStyle: {
    fontSize: 16,
  },
});

export default memo(ListItem);

ListItem.propTypes = {
  item: PropTypes.object,
  onPress: PropTypes.func,
};