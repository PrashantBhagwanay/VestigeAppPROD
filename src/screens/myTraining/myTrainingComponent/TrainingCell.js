/**
 * @description Use to make training cell
 */
import React, { Component } from 'react';
import {
  View, 
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { Icon } from 'react-native-elements';

/**
 * @description It contains the complete training design
 */
export default class TrainingCell extends Component {
  constructor(props) {
    super(props);
    this.props = props
  }
  cellClickedHandle = (item) => {
    const { navigation } = this.props;
    if(item.isFilter) {
      navigation.navigate('selectTrainingScreen',{data:item});
    } 
    else{
      navigation.push('myTrainingScreen',{data:item,isTraining:false}); // or can use replace
    }
  }

  render() {
    const { item } = this.props;
    let name = '';

    if (item && item.name != null) {
      name = item.name;
    }

    return(
      <TouchableOpacity
        style={styles.mainView}
        onPress={() =>{this.cellClickedHandle(item)}}  
      >
        <Text style={styles.titleText}>
          {name}
        </Text>
        <Icon
          name='arrow-right'
          type='simple-line-icon'
          color='#82889e'
          size={16}
          style={{position:'relative', top:18}}
        />
      </TouchableOpacity>
    );
  }
}
/**
 * @description: This is the custom stylesheet for training cell
 */
const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    marginTop: 10,
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e8e9ed',
    paddingRight: 20,
  },
  titleText: {
    color: '#414456',
    ...Specs.fontMedium,
    fontSize: 14,
    marginBottom: 4,
    alignSelf: 'center',
    marginLeft: 16,
  },
  
});