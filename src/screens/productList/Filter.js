
import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { observer, inject } from 'mobx-react';
import { observable,makeObservable} from 'mobx';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Specs } from 'app/src/utility/Theme';
import { Checkbox } from 'app/src/components/buttons/Button';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Loader from 'app/src/components/loader/Loader';
import { strings } from 'app/src/utility/localization/Localized';
import { Toast } from 'app/src/components/toast/Toast';
import { Header } from '../../components';

const STATIC_DATA = [
  {
    Category: strings.product.category[0],
    value: 'brands'
  },
  {
    Category: strings.product.category[1],
    value: 'categories'
  },
  {
    Category: strings.product.category[2],
    value: 'price'
  },
  {
    Category: strings.product.category[3],
    value: 'pv'
  },
]

@inject('products', 'profile')
@observer
export default class Filter extends Component {

  @observable price: Object<any> = { 'maximum': '', 'minimum': '' };
  @observable pv: Object<any> = { maximum: '', minimum: '' };


  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      selectedValue: true,
      selectedKey: 'brands',
      brands: [],
      categories: [],
      isUpdate: false,
      static_filter_types: STATIC_DATA
    };
  }

  async componentDidMount() {
    if (this.props.profile.isCategoriesShow === false && this.props.profile.isBrandsShow === true) {
      this.setState({
        static_filter_types: [
          {
            Category: strings.product.category[0],
            value: 'brands',
          },
          {
            Category: strings.product.category[2],
            value: 'price',
          },
          {
            Category: strings.product.category[3],
            value: 'pv',
          }],
        selectedKey: 'brands',
      });
    }
    if (this.props.profile.isBrandsShow === false && this.props.profile.isCategoriesShow === true) {
      this.setState({
        static_filter_types: [
          {
            Category: strings.product.category[1],
            value: 'categories',
          },
          {
            Category: strings.product.category[2],
            value: 'price',
          },
          {
            Category: strings.product.category[3],
            value: 'pv',
          }],
        selectedKey: 'categories',
      });
    }
    if (this.props.profile.isCategoriesShow === false && this.props.profile.isBrandsShow === false) {
      this.setState({
        static_filter_types: [
          {
            Category: strings.product.category[2],
            value: 'price',
          },
          {
            Category: strings.product.category[3],
            value: 'pv',
          }],
        selectedKey: 'price',
      });
    }
    const { products } = this.props;
    await products.fetchFilterOptions();

    if (products.filterMessage) {
      this.toast(products.filterMessage, Toast.type.ERROR)
    }
    this.price.minimum = products.filter.selectedPrice.minimum;
    this.price.maximum = products.filter.selectedPrice.maximum
    this.pv.minimum = products.filter.selectedPv.minimum
    this.pv.maximum = products.filter.selectedPv.maximum
  }

  toast(message, toastType: Toast.type,) {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  optionSelected(item) {
    if (item === 'brands' || item === 'categories') {
      this.setState({ selectedValue: true, selectedKey: item })
    }
    else {
      this.setState({ selectedValue: false, selectedKey: item })
    }
  }

  async clearFilter() {
    const { products } = this.props;
    products.filter.brands.map((data) => {
      data.isSelected = false
    });
    products.filter.categories.map((data) => {
      data.isSelected = false
    });
    this.price.minimum = products.filter.price.minimum;
    this.price.maximum = products.filter.price.maximum
    this.pv.minimum = products.filter.pv.minimum
    this.pv.maximum = products.filter.pv.maximum
    this.setState({ isUpdate: !this.state.isUpdate })
  }

  goBack() {
    const { navigation, route } = this.props;
    route.params.onSelect({ selected: true });
    navigation.goBack();
  }

  updateFilter(data) {
    const { type, index } = data;
    const { filter } = this.props.products;
    filter[type][index].isSelected = !filter[type][index].isSelected
    this.setState({ isUpdate: true })
  }

  async applyFilter() {
    const { products } = this.props;
    this.state.brands = []
    this.state.categories = []
    products.filter.brands.map((data) => {
      if (data.isSelected) {
        this.state.brands.push(data.id)
      }
    });
    products.filter.categories.map((data) => {
      if (data.isSelected) {
        this.state.categories.push(data.id)
      }
    });

    let priceRange = `${this.price.minimum}-${this.price.maximum}`
    products.filter.selectedPrice.minimum = this.price.minimum
    products.filter.selectedPrice.maximum = this.price.maximum
    products.filter.selectedPv.minimum = this.pv.minimum
    products.filter.selectedPv.maximum = this.pv.maximum
    let pvRange = `${this.pv.minimum}-${this.pv.maximum}`
    await products.applyFilter(this.state.brands, this.state.categories, priceRange, pvRange)
    this.goBack();
  }

  multiSliderValuesChange(event) {
    var { selectedKey } = this.state;
    this[selectedKey].minimum = event[0]
    this[selectedKey].maximum = event[1]
  }

  render() {
    const { selectedKey, selectedValue } = this.state;
    const { filter, isLoading } = this.props.products;
    console.log("check1",this[selectedKey]?.minimum, this[selectedKey]?.maximum)
    console.log("check2",filter[selectedKey]?.minimum, filter[selectedKey]?.maximum)
    return (
      <>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.product.filterTitle}
        />
        <View style={styles.mainView}>
          <Loader loading={isLoading} />
          <View style={styles.leftView}>
            <FlatList
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 24 }}
              data={this.state.static_filter_types.length > 0 ? this.state.static_filter_types : []}
              extraData={this.state.isUpdate}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item }) => {
                return (
                  (item.value === selectedKey) ? (
                    <TouchableOpacity
                      style={[styles.leftComponent, styles.selectedLeftComponent]}
                      onPress={() => this.optionSelected(item.value)}
                    >
                      <Text style={styles.leftLabels}>
                        {item.Category}
                      </Text>
                    </TouchableOpacity>) :
                    (
                      <TouchableOpacity
                        style={styles.leftComponent}
                        onPress={() => this.optionSelected(item.value)}
                      >
                        <Text style={styles.leftLabels}>
                          {item.Category}
                        </Text>
                      </TouchableOpacity>)
                );
              }
              }
            />
          </View>
          <View style={styles.rightView}>
            <View style={{ flex: 9.3 }}>
              {(selectedValue) ?
                (
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{ marginTop: 24 }}
                    data={filter[selectedKey].length > 0 ? filter[selectedKey] : []}
                    keyExtractor={(_, i) => { `L${i}` }}
                    extraData={this.state.isUpdate}
                    renderItem={({ item, index }) => {
                      return (
                        <Checkbox label={item.name} type={selectedKey} value={item.Id} isSelected={item.isSelected} getQuantity={(data) => { this.updateFilter(data) }} index={index} />
                      );
                    }
                    }
                  />) :
                (
                  <View style={[{ flex: 1, marginTop: 20 }, { display: (filter[selectedKey].minimum !== null && filter[selectedKey].minimum !== undefined && (filter[selectedKey].minimum !== filter[selectedKey].maximum)) ? 'flex' : 'none' }]}>
                    <MultiSlider
                      values={[this[selectedKey].minimum, this[selectedKey].maximum]}
                      onValuesChange={(event) => this.multiSliderValuesChange(event)}
                      trackStyle={{ height: 2 }}
                      selectedStyle={{ backgroundColor: '#f77268' }}
                      containerStyle={{ height: 20, alignSelf: 'center' }}
                      sliderLength={180}
                      min={filter[selectedKey].minimum}
                      max={filter[selectedKey].maximum || 1}
                      step={1}
                      allowOverlap
                      snapped
                    // touchDimensions={{height: 50,width: 50,borderRadius: 15,slipDisplacement: 2}}
                    // touchDimensions={{height: 150,width: 150,borderRadius: 15,slipDisplacement: 2000}}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15 }}>
                      <Text>{filter[selectedKey].minimum}</Text>
                      <Text>{filter[selectedKey].maximum}</Text>

                    </View>
                    <Text style={{ marginTop: 20, marginHorizontal: 15 }}>
                      {`${strings.product.selectedRange} = ${this[selectedKey].minimum}-${this[selectedKey].maximum}`}
                    </Text>
                  </View>)}
            </View>
            <View style={styles.buttonView}>
              <TouchableOpacity
                onPress={() => this.clearFilter()}
                style={styles.clearButton}
              >
                <Text style={[styles.buttonText, { color: '#515867' }]}>
                  {strings.product.clearFilter}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.applyFilter()}
                style={[styles.clearButton, { backgroundColor: '#6797d4' }]}
              >
                <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                  {strings.product.applyFilter}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    flexDirection: 'row'
  },
  leftView: {
    backgroundColor: '#f2f5f8',
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#ececf0'
  },
  leftComponent: {
    justifyContent: 'center',
  },
  leftLabels: {
    color: '#000000',
    fontSize: 14,
    marginLeft: 15,
    marginVertical: 11,
    opacity: 0.8,
    ...Specs.fontMedium,

  },
  rightView: {
    backgroundColor: '#ffffff',
    flex: 1.8
  },
  buttonView: {
    flex: 0.7,
    flexDirection: 'row',
    marginRight: 17,
    marginBottom: 13
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    marginVertical: 8,
    ...Specs.fontSemibold
  },
  selectedLeftComponent: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c8c9d3'
  }
});
