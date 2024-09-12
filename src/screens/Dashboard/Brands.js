import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import BrandComponent from 'app/src/components/dashBoard/BrandComponent';
import { strings } from 'app/src/utility/localization/Localized';

const Brands = (props) => (
  <View style={styles.mainView}>
    <Text style={styles.title}>{strings.dashboard.brands.title}</Text>
    <View style={styles.rowView}>
      { props.data.map((item, index) => {
        return (
          <BrandComponent 
            imageContainer={styles.imageContainer} 
            imageStyle={styles.imageStyle} 
            image={item.image} 
            brandStoreClickeHandle={props.onBrandPress}
            title={item.name}
            titleStyle={styles.titleStyle} 
            brandId={item.id}
            key={`Brands ${index.toString()}`}
          />
        )
      })}
    </View>
    <TouchableOpacity
      accessibilityLabel={props.accessibilityLabel} 
      testID={props.accessibilityLabel} 
      style={styles.buttonView} 
      onPress={() => props.onBrandViewAllPress()}>
      <Text style={styles.buttonText}>{strings.dashboard.brands.buttonTitle}</Text>
    </TouchableOpacity>
  </View>
);

export default Brands;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  title: {
    ...Specs.fontSemibold,
    fontSize: 18,
    marginTop: 12,
    marginLeft: 15,
    color: '#373e73',
  },
  rowView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    justifyContent: 'space-between',
    marginTop: 17,
  },
  imageContainer: {
    width: '21.2%',
    height: 63,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    borderRadius: 4,
    elevation: 15,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  imageStyle: {
    marginTop: 15,
    height: 27,
    width: '100%',
  },
  buttonView: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 18,
    marginHorizontal: '31.3%',
    width: '37.5%',
    height: 32,
    borderColor: '#9aadb8',
    borderWidth: 1,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#9aadb8',
  },
  titleStyle: {
    ...Specs.fontMedium,
    alignSelf:'center',
    fontSize: 14,
    color: '#3f4967',
    
  },
});