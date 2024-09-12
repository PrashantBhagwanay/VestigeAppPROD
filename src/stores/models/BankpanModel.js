/* eslint-disable import/prefer-default-export */
import { _, get } from 'lodash';
import { observable } from 'mobx';

export class BankPanModel {
  @observable distributorID: String;
  @observable countryID: Number;
  @observable distributorFirstName: String;
  @observable distributorLastName: String;
  @observable distributorDOB: String;
  @observable distributorMobileNumber: String;
  @observable distributorStatus: String;
  @observable distributorCountryCode: String;
  @observable panStatus: Number;
  @observable panNumber: String;
  @observable panRejectionID: Number;
  @observable panRejectReason: String;
  @observable panImageName: String;
  @observable panImageUrl: String;
  @observable panCreatedBy: String;
  @observable panCreatedOn: String;
  @observable panModifiedBy: String;
  @observable panModifiedOn: String;
  @observable bankStatus: Number;
  @observable bankAccountNumber: String;
  @observable ifscCode: String;
  @observable bankID: String;
  @observable bankName: String;
  @observable branchCode: String;
  @observable bankBranch: String;
  @observable bankRejectionID: Number;
  @observable bankRejectReason: String;
  @observable bankImageUrl: String;
  @observable bankImageName: String;
  @observable bankCreatedBy: String;
  @observable bankCreatedOn: String;
  @observable bankModifiedBy: String;
  @observable bankModifiedOn: String;

  constructor(bankPanDetails) {
    this.distributorID = get(bankPanDetails, 'distributorId', '');
    this.countryID = get(bankPanDetails, 'countryId', null);
    this.distributorFirstName = get(bankPanDetails, 'distributorFirstName', '');
    this.distributorLastName = get(bankPanDetails, 'distributorLastName', '');
    this.distributorDOB = get(bankPanDetails, 'distributorDOB', '');
    this.distributorMobileNumber = get(bankPanDetails, 'distributorMobileNumber', '');
    this.distributorStatus = get(bankPanDetails, 'distributorStatus', null);
    this.distributorCountryCode = get(bankPanDetails, 'distributorCountryCode', null);
    this.panStatus = get(bankPanDetails, 'panStatus', null);
    this.panNumber = get(bankPanDetails, 'panNumber', '');
    this.panRejectionID = get(bankPanDetails, 'panRejectionId', null);
    this.panRejectReason = get(bankPanDetails, 'panRejectReason', '');
    this.panImageName = get(bankPanDetails, 'panImageName', '');
    this.panImageUrl = get(bankPanDetails, 'panImageUrl', '');
    this.panCreatedBy = get(bankPanDetails, 'createdBy', '');
    this.panCreatedOn = get(bankPanDetails, 'createdOn', '');
    this.panModifiedBy = get(bankPanDetails, 'modifiedBy', '');
    this.panModifiedOn = get(bankPanDetails, 'modifiedOn', '');
    this.bankStatus = get(bankPanDetails, 'bankStatus', null);
    this.bankAccountNumber = get(bankPanDetails, 'accountNumber', '');
    this.ifscCode = get(bankPanDetails, 'ifscCode', '');
    this.bankID = get(bankPanDetails, 'bankId', '');
    this.bankName = get(bankPanDetails, 'bankName', '');
    this.branchCode = get(bankPanDetails, 'branchCode', '');
    this.bankBranch = get(bankPanDetails, 'bankBranch', '');
    this.bankRejectionID = get(bankPanDetails, 'bankRejectionId', null);
    this.bankRejectReason = get(bankPanDetails, 'bankRejectReason', '');
    this.bankImageUrl = get(bankPanDetails, 'bankImageUrl', '');
    this.bankImageName = get(bankPanDetails, 'bankImageName', '');
    this.bankCreatedBy = get(bankPanDetails, 'bankCreatedBy', '');
    this.bankCreatedOn = get(bankPanDetails, 'bankCreatedOn', '');
    this.bankModifiedBy = get(bankPanDetails, 'bankModifiedBy', '');
    this.bankModifiedOn = get(bankPanDetails, 'bankModifiedOn', '');
  }
}