import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements'
import { Specs } from 'app/src/utility/Theme';

export default class SubCategory extends Component<any, any> {
  
  static propTypes = {
    data: PropTypes.array,
  };

  static defaultProps = {
    data: [],
  };

  constructor(props) {
    super(props)
    this.props = props;
  }

  render() {
    const { data, navigation } = this.props;
    return(
      <View style={styles.containerView}>
        {data.map((item, index) => {
          return(
            <TouchableOpacity
              key={index.toString()}
              activeOpacity={1.0}
              accessibilityLabel={item.name} 
              testID={item.name}
              style={[styles.row, {borderBottomWidth: 1, borderBottomColor: '#97979733'}]}
              onPress={() => {
                navigation.navigate('productList',{type:'subCategoryList', param: `categoryId=${item.categoryId},subCategoryId=${item.subCategoryId}`, title: item.name});
              }}
            >
              <Text style={styles.title}>{item.name}</Text>
              <Icon containerStyle={styles.arrow} name='arrow-right' type='simple-line-icon' color='#878993' size={10} />
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row', 
    height: 41, 
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  title: {
    ...Specs.fontMedium,
    fontSize: 14,
    marginLeft: 7,
    color: '#2b2e42'
  },
  arrow: {
    marginRight: 2,
  }
});