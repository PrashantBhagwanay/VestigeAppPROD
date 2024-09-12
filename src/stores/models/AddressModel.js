
import { add, get } from 'lodash';

export default class Address {

  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  addressType: string;
  isDefault: Boolean;
  cityId: string;
  stateId: string;
  countryId: string;
  locationId: string;
  locationCode: string;
  locationName: string;
  timings : string;
  distance: string;
  isOnlinePayment: Boolean;
  addressTypeResidential: String;
  alternateContactNumber: String;
  isExpressShipping: String;
  caterLocationDTO: Array;
  
  constructor(address: any){
    this.address= get(address, 'address1','No Address Found');
    this.id = get(address, 'id')
    this.distributorId = get(address, 'distributorId')
    this.city = get(address, 'cityName', 'No City Found');
    this.state = get(address, 'stateName', 'No State Found');
    this.country = get(address, 'countryName', 'No Country Found');
    this.pincode = get(address, 'pincode.pincode','Pincode not found');
    this.addressType = get(address, 'addressType');
    this.cityId = get(address, 'cityId');
    this.stateId = get(address, 'stateId');
    this.countryId = get(address, 'countryId')
    this.isDefault = get(address, 'isDefault');
    this.locationId = get(address, 'locationId');
    this.locationCode = get(address, 'locationCode');
    this.locationName = get(address, 'locationName');
    this.timings = get(address, 'timings');
    this.distance = get(address, 'distance');
    this.isOnlinePayment = get(address, 'isOnlinePayment');
    this.alternateContactNumber = get(address, 'alternateContactNumber');
    this.addressTypeResidential = get(address, 'addressTypeResidential','');
    this.isExpressShipping = get(address, 'isExpressShipping', '0')
    this.caterLocationDTO = get(address, 'caterLocationDTO', [])
  }
}