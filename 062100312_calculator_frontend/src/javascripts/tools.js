// 是否以小数结尾
function isFloatEnd(val) {
  return /\d\.\d+$/.test(val);
}

function getLast(val) {
  return val[val.length - 1];
}