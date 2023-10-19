
let hasAdd = false;
let curDownEl = null;

let resultExp = '0';
let resultMonth = '0';
let preResult = '';

// 0: expr 1: date
let inputDest = 0;
// 0: calc 1: rates
let calcMode = 0;

const funKeyList = [
  {
    value: '←',
    className: 'calc-key-ac',
    type: 'back',
  },
  {
    value: 'π',
    style: {
      marginLeft: 0,
    },
    type: 'number',
  },
  {
    value: 'sin',
    type: 'fun',
  },
  {
    value: 'cos',
    type: 'fun',
  },
  {
    value: 'e',
    style: {
      marginLeft: 0,
    },
    type: 'number',
  },
  {
    value: 'tan',
    type: 'fun',
  },
  {
    value: 'log',
    type: 'fun',
  },
  {
    value: 'ANS',
    style: {
      marginLeft: 0,
    },
    type: 'ans',
  },
  {
    value: 'ln',
    type: 'fun',
  },
  {
    value: '√',
    type: 'fun',
  },
];

const baseKeyList = [
  {
    value: '(',
    type: 'operator',
  },
  {
    value: ')',
    type: 'operator',
  },
  {
    value: '%',
    type: 'operator',
  },
  {
    value: 'AC',
    style: {
      marginRight: 0,
    },
    className: 'calc-key-ac',
    type: 'ac',
  },
  {
    value: '7',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '8',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '9',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '÷',
    style: {
      marginRight: 0,
    },
    type: 'operator',
  },
  {
    value: '4',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '5',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '6',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '×',
    style: {
      marginRight: 0,
    },
    type: 'operator',
  },
  {
    value: '1',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '2',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '3',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '-',
    style: {
      marginRight: 0,
    },
    type: 'operator',
  },
  {
    value: '0',
    className: 'calc-key-number',
    type: 'number',
  },
  {
    value: '.',
    className: 'calc-key-number',
    type: 'decimalPoint',
  },
  {
    value: '=',
    className: 'calc-key-equal',
    type: 'equal',
  },
  {
    value: '+',
    style: {
      marginRight: 0,
    },
    type: 'operator',
  },
];

const typeFuns = {
  async equal() {
    console.log(resultExp);
    try {
      if (calcMode == 0) {
        const res = await axios.post(
          '/api/calcResult',
          { expression: resultExp }
        );
        console.log(res.data);
        resultExp = String(res.data.data);

        if (res.data.error != "0") {
          window.alert("表达式错误");
        }

        renderResult(resultExp, true);
      } else {
        const res = await axios.post(
          '/api/rateResult',
          { expression: resultExp, month: resultMonth, mode: String(calcMode)}
        );
        console.log(res.data);

        if (res.data.error != 0) {
          window.alert("时长过短");
        }

        resultExp = String(res.data.data);
        renderResult(resultExp, true);
      }
    } catch(err) {
      console.log(err);
    }
  },
  async ans() {
    try {
      if (calcMode == 0) {
        const res = await axios.get('/api/getAns');
        if (resultExp === '0') {
          resultExp = res.data.data;
        } else {
          resultExp += res.data.data;
        }
        renderResult(resultExp, true);
      }
    } catch(err) {
      console.log(err);
    }
  },
  number(value) {
    if (inputDest == 0) {
      if (resultExp === '0') {
        resultExp = value;
      } else {
        resultExp += value;
      }
    } else {
      if (resultMonth === '0') {
        resultMonth = value;
      } else {
        resultMonth += value;
      }
    }
    renderResult();
  },
  decimalPoint(value) {
    if (/\d/.test(getLast(resultExp)) && !isFloatEnd(resultExp)) {
      resultExp += value;
    }
    renderResult();
  },
  back() {
    if (inputDest == 0) {
      if (resultExp === '0') return;
      resultExp = resultExp.substring(0, resultExp.length - 1) || '0';
    } else {
      if (resultMonth === '0') return;
      resultMonth = resultMonth.substring(0, resultMonth.length - 1) || '0';
    }
    renderResult();
  },
  ac() {
    resultExp = '0';
    resultMonth = '0';
    renderResult();
  },
  operator(value) {
    if (resultExp === '0') {
      resultExp = value;
    } else {
      resultExp += value;
    }
    renderResult();
  },
  fun(value) {
    if (resultExp === '0') {
      resultExp = value;
    } else {
      resultExp += value;
    }
    resultExp += '(';
    renderResult();
  },
};

function renderKey(elSelector, keyList) {
  const el = document.querySelector(elSelector);
  const fragment = document.createDocumentFragment();

  keyList.forEach(item => {
    const { value, style, className } = item;
    const keyDiv = document.createElement('div');
    keyDiv.innerText = value;
    keyDiv.className = 'calc-key-word-spacing';
    if (className) {
      keyDiv.classList.add(className);
    }
    if (style) {
      Object.entries(style).forEach(([styleKey, styleVal]) => {
        keyDiv.style[styleKey] = styleVal;
      });
    }
    addMouseDownHandle(keyDiv);
    addClick(keyDiv, item);
    fragment.appendChild(keyDiv);
  });
  el.appendChild(fragment);
}

function addMouseDownHandle(el) {
  el.addEventListener('mousedown', function() {
    this.classList.add('calc-key-down');
    curDownEl = this;
  });
  if (hasAdd) return;
  hasAdd = true;
  document.addEventListener('mouseup', function() {
    if (!curDownEl) return;
    curDownEl.classList.remove('calc-key-down');
    curDownEl = null;
  });
}

function addClick(el, item) {
  const { type, value } = item;
  el.addEventListener('click', function() {
    if (typeFuns[type]) {
      typeFuns[type](value);
    }
  })
}

const resultExpEl = document.getElementById('result');
const resultBoxEl = document.getElementById('resultBox');
const monthExpEl = document.getElementById('month');
const monthBoxEl = document.getElementById('monthBox');
function renderResult(value, ani) {
  resultExpEl.innerText = value || resultExp;
  if (ani) {
    resultBoxEl.classList.add('calc-show-text-result-ani');
    setTimeout(() => {
      resultBoxEl.classList.remove('calc-show-text-result-ani');
    }, 500);
  }
  monthExpEl.innerText = resultMonth;
  if (calcMode != 0) {
    resultExpEl.innerText += "元";
    monthExpEl.innerText += "月";
  }

  if (resultExpEl.innerText.length > 17) {
    resultBoxEl.style.fontSize = 30 + "px";
  } else {
    resultBoxEl.style.fontSize = 47 + "px";
  }
}

function selMode() {
  calcMode = (calcMode + 1) % 3;

  var sel1 = document.getElementById("sel1");
  var sel2 = document.getElementById("sel2");
  var sel3 = document.getElementById("sel3");
  sel1.classList.remove("active-key");
  sel2.classList.remove("active-key");
  sel3.classList.remove("active-key");
  if (calcMode == 0) {
    sel1.classList.add("active-key");
  } else if (calcMode == 1) {
    sel2.classList.add("active-key");
  } else {
    sel3.classList.add("active-key");
  }

  renderResult();
}

function inputExprOnClick() {
  inputDest = 0;
}

function inputMonthOnClick() {
  inputDest = 1;
}

renderKey('.func-calc', funKeyList);
renderKey('.base-calc', baseKeyList);
