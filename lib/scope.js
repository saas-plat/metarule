const gt = exports.gt = (v1, v2) => {
  const vk1 = v1.split('.').map(v => parseInt(v));
  const vk2 = v2.split('.').map(v => parseInt(v));
  for (let i = 0; i < vk1.length || i < vk2.length; i++) {
    if (vk1[i] > vk2[i]) {
      return true;
    }
  }
  return false;
}

// 版本version是否在升级范围内
exports.versionAt = (action, version) => {
  return gt(version, action.from) && !gt(version, action.to);
}

// 序列是否在升级范围内
exports.seriesIn = (action, ...series) => {
  return series.indexOf(action.series) > -1;
}
