/**
 * @description Use to make My My Level screen
 */
import React, { Component } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
} from 'react-native';
import CurrentLevel from 'app/src/screens/myLevel/myLevelComponent/Level';

// Test data.
const data = [
  {title: 'Next Level', data: [{'levelName':'Gold Director','target':'7350','type':'1'}]},
  {title: 'Current Level', data: [{'levelName':'Crown Director','target':'7350','groupPV':'2000','myNetwork':'50,189','type':'2'}]},
  {title: 'Previous Levels', data: [{'levelName':'Silver Member','target':'7350','groupPV':'2000','myNetwork':'50,189','type':'3'},
    {'levelName':'Silver Member','target':'7350','groupPV':'2000','myNetwork':'50,189','type':'3'},
    {'levelName':'Silver Member','target':'7350','groupPV':'2000','myNetwork':'50,189','type':'3'},
  ]},
]

/**
 * @description It contains the My level
 */
class MyLevel extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {    
  }

  render() {
    return(
      <View style={styles.mainView}>
        <SectionList 
          stickySectionHeadersEnabled={false}
          renderItem={({item}) => 
            <CurrentLevel props={item} />
          }
          renderSectionHeader={({section: {title}}) => (
            <View style={styles.sectionView}>
              <Text style={styles.sectionText}>{title}</Text>
            </View>
          )}
          sections={data}
          keyExtractor={(item, index) => item + index}
        />
      </View>
    );
  }
}

/**
 * @description: This is the custom stylesheet for My Level
 */
const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#eef1f6',
    width: '100%',
    flex: 1,
    marginTop: 20,
  },
  sectionView: {
    width: '100%',
    height: 40,
  },
  sectionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a0c9',
    marginLeft: 10,
    marginTop: 5, 
  },
});

export default MyLevel;