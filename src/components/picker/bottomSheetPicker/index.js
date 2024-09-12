import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Dimensions,
  Text,
  FlatList,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import RBSheet from '../../../lib/reactBottomSheet';
import Ionicon from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import { COLOR_CODES, Specs } from '../../../utility/Theme';

const BottomSheetItems = props => {
  const { itemList, schema, customStyles, onItemPress } = props;
  return (
    <FlatList
      data={itemList}
      contentContainerStyle={styles.bottomSheetItem}
      renderItem={({ item }) => {
        return (
          <TouchableOpacity
            onPress={() => onItemPress(item)}
            style={[styles.pickerItems, customStyles?.pickerItems]}>
            <Text
              style={[
                styles.bottomSheetItemText,
                customStyles?.bottomSheetItemText,
              ]}>
              {item[schema.label]}
            </Text>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(_, i) => i.toString()}
      ItemSeparatorComponent={() => <View style={{ height:6 }} />}
    />
  );
};

const SheetTitle = props => {
  const { title } = props;
  return (
    <View>
      {title && (
        <View style={styles.bottomSheetItem}>
          <Text style={styles.bottomSheetTitleText}>{title}</Text>
        </View>
      )}
    </View>
  );
};

export const BottomSheetPicker = props => {
  const {
    pickerItems,
    heightMax,
    children,
    title,
    schema,
    customStyles,
    onItemPress,
    emptyMessage, 
    isVisible,
    onModalClose,
  } = props;
  const refRBSheet = useRef(null);

  const maxHeight = heightMax ?? 485;
  const height = pickerItems
    ? pickerItems?.length * 50 + (title ? 170 : 60)
    : maxHeight;

  useEffect(() => {
    if (isVisible) {
      refRBSheet?.current?.open();
    } else {
      refRBSheet?.current?.close();
    }
  }, [isVisible]);

  const handleModalClose = () => {
    onModalClose(false);
  };

  if (isVisible) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <RBSheet
          ref={refRBSheet}
          animationType={'fade'}
          dragFromTopOnly
          closeOnDragDown
          closeOnPressMask={true}
          onClose={handleModalClose}
          height={Math.min(height, maxHeight)}
          customStyles={{
            wrapper: {
              backgroundColor: '#33333350',
            },
            draggableIcon: {
              backgroundColor: COLOR_CODES.extraLightGrey,
              width: 100,
            },
            container: {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            },
          }}>
          <SheetTitle {...props} title={title} />
          {pickerItems?.length > 0 && (
            <BottomSheetItems {...props} itemList={pickerItems} />
          )}
          {pickerItems?.length <= 0  && emptyMessage && (
            <Text style={{ textAlign: 'center', ...Specs.fontBold, fontSize: 16}}>{emptyMessage}</Text>
          )}
          {children}
        </RBSheet>
      </SafeAreaView>
    );
  }
  return null;
};

BottomSheetPicker.defaultProps = {
  schema: { label: 'label', value: 'value' },
};
