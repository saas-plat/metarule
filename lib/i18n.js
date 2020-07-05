const {
  t
} = require('./util');

const i18n = {
  t
}

module.exports = i18n;
module.exports.registerProvider = ({
  t
}) => {
  i18n.t = t;
}
