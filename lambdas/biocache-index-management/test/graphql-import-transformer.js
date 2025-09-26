const gql = require("graphql-tag");

module.exports = {
  process(src) {
    var str = JSON.stringify(gql(src));
    return {code: "module.exports=" + str + ";module.exports.default=module.exports;"};
  }
};