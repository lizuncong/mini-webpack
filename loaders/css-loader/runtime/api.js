"use strict";

// cssWithMappingToString就是一个函数： function(item){ return item[1] }
module.exports = function (cssWithMappingToString) {
  var list = []; 

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);
      return content;
    }).join("");
  };

  list.i = function (modules) {
    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);
      list.push(item);
    }
  };

  return list;
};