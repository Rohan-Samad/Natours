class apiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const excludedWords = ["page", "sort", "limit"];
    const url = { ...this.queryStr };
    excludedWords.forEach((el) => {
      delete url[el];
    });
    let queryStri = JSON.stringify(url);
    queryStri = queryStri.replace(/\b(lte|lt|gt|gte)\b/g, (word) => `$${word}`);
    this.query = this.query.find(JSON.parse(queryStri));
    return this;
  }

  populate(popOne) {
    if (popOne) {
      this.query = this.query.populate({
        path: popOne,
        select: "-_id -__v -id",
      });
    }
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortField = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortField);
    }
    return this;
  }
  // unwind() {
  //   this.query = this.query.unwind("startDates");
  // }

  fields() {
    if (this.queryStr.fields) {
      let fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }

    return this;
  }

  pagination() {
    const limit = this.queryStr.limit || 10;
    const page = this.queryStr.page || 1;
    const key = (page - 1) * limit;
    this.query = this.query.skip(key).limit(limit);
    return this;
  }
}
module.exports = apiFeatures;
