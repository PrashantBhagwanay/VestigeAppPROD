import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Specs, COLOR_CODES } from '../../../utility/Theme';
import Ionicon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    margin: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: COLOR_CODES.white,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: COLOR_CODES.border,
  },
  text: {
    flex: 1,
    ...Specs.fontSemibold,
    color: COLOR_CODES.labelGrey,
  },
  icon: {
    minWidth: 30,
    minWight: 30,
  },
});

/**
 * @description Custom re-usable picker selector, Design is configurable.
 */
const PickerSelector = ({
  label,
  onPickerPress,
  customStyle,
  iconColor,
  iconName,
  hideDownIcon,
  selectedValue,
  isDisabled,
}) => {
  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={[
        styles.container,
        customStyle?.container,
        isDisabled && { backgroundColor: COLOR_CODES.cultured },
      ]}
      onPress={() => onPickerPress(selectedValue)}>
      <Text style={[styles.text, customStyle?.textStyle]} numberOfLines={2}>
        {label || selectedValue}
      </Text>
      <View style={styles.icon}>
        {!hideDownIcon && (
          <Ionicon
            name={iconName || 'chevron-down'}
            size={30}
            color={iconColor || COLOR_CODES.labelGrey}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PickerSelector;
