global.gid = global.gid || 0;

// 分配全局id
exports.assignId = (pre) => {
  // 每次加一
  global.gid = global.gid + 1;
  return (pre || '') + global.gid;
}

exports.t = (template, data) => {
  return template.replace(/\{\{([\w\.]*)\}\}/g, function (str, key) {
    var keys = key.split("."),
      v = data[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
}
