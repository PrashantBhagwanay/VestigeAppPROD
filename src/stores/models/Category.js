
export default class Category {
  constructor(payload: any) {
    const { categoryId, categoryName, isChildAvailable } = payload;

    this.id = categoryId;
    this.name = categoryName;
    this.isChildAvailable = isChildAvailable;
  }
}