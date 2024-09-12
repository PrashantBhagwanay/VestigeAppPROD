import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { COLOR_CODES } from '../../../../utility/Theme';
/**
 * @description It shows all top view of Training screen
 */
const TrainingTypeFilter = ({ filterList, selectedFilter, setFilter }) => {
  const renderItem = type => {
    const styleOverride =
      type === selectedFilter
        ? styles.selectedStatusView
        : styles.unSelectedStatusView;
    const textStyleOverride =
      type === selectedFilter ? styles.selectedTitle : styles.unSelectedTitle;

    return (
      <TouchableOpacity
        key={Math.random()}
        style={[styles.itemView, styleOverride, { width: type === 'Completed' ? 110 : 100}]}
        onPress={() => setFilter(type)}>
        <Text style={[styles.title, textStyleOverride]}>{type}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainView}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always">
        {filterList.map(item => renderItem(item))}
      </ScrollView>
    </View>
  );
};

export default TrainingTypeFilter;

const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: COLOR_CODES.white,
    height: 50,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  itemView: {
    // width: 100,
    height: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  selectedStatusView: {
    backgroundColor: '#4a90e2',
  },
  unSelectedStatusView: {
    borderWidth: 1,
    borderColor: '#979797',
  },
  title: {
    width: '100%',
    fontSize: 15,
    textAlign: 'center',
  },
  selectedTitle: {
    color: '#ffffff',
    ...Specs.fontSemibold,
  },
  unSelectedTitle: {
    color: '#868c95',
    ...Specs.fontMedium,
  },
});
