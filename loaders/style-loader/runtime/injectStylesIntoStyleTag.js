"use strict";

function modulesToDom(list, options) {
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var obj = {
      css: item[1]
    };
    addStyle(obj, options)
  }
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  // 查找head
  var target = document.querySelector(options.insert)

  target.appendChild(style);
  
  return style;
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  style.appendChild(document.createTextNode(css));
}


function addStyle(obj, options) {
  var style;
  var update;
  style = insertStyleElement(options);
  update = applyToTag.bind(null, style, options);

  update(obj);
}

module.exports = function (list, options) {
  modulesToDom(list, options);
};