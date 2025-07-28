Shopify.formatMoney = function(t, r) {
    function o(t, r) {
        return void 0 === t ? r : t
    }
    function e(t, r, e, a) {
        if (r = o(r, 2),
        e = o(e, ","),
        a = o(a, "."),
        isNaN(t) || null == t)
            return 0;
        var n = (t = (t / 100).toFixed(r)).split(".");
        return n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + e) + (n[1] ? a + n[1] : "")
    }
    "string" == typeof t && (t = t.replace(".", ""));
    var a = ""
      , n = /\{\{\s*(\w+)\s*\}\}/
      , i = r || Shopify.money_format;
    switch (i.match(n)[1]) {
    case "amount":
        a = e(t, 2);
        break;
    case "amount_no_decimals":
        a = e(t, 0);
        break;
    case "amount_with_comma_separator":
        a = e(t, 2, ".", ",");
        break;
    case "amount_with_space_separator":
        a = e(t, 2, " ", ",");
        break;
    case "amount_with_period_and_space_separator":
        a = e(t, 2, " ", ".");
        break;
    case "amount_no_decimals_with_comma_separator":
        a = e(t, 0, ".", ",");
        break;
    case "amount_no_decimals_with_space_separator":
        a = e(t, 0, ".", "");
        break;
    case "amount_with_space_separator":
        a = e(t, 2, ",", "");
        break;
    case "amount_with_apostrophe_separator":
        a = e(t, 2, "'", ".")
    }
    return i.replace(n, a)
}


window.SPOHooks = window.SPOHooks || {};

SPOHooks.__priceUpdate = function(price) {
  console.log("price",price)
  updatePrice(price * 100);
  return false;
};

SPOHooks.__getConvertedPrice = function(returnPrice, Price) {
  if (Math.round(Price) == Math.round(returnPrice)) {
    return Price * 100;
  }
  Price = Price * 100;
  newReturnPrice = roundUp(Price);
  return newReturnPrice;
};



let cartJsonOld = JSON.stringify(null);
if (cartJsonOld.indexOf("af_custombuilder") > 0) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      location.reload();
    }
  };
  xhttp.open("GET", "/cart/clear.js");
  xhttp.send();
}

function getURL(url) {
  return fetch(url)
    .then(response => response.text())
    .then(data => data);
}

function stripHtml(html) {
  let tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function array_sum(arr) {
  return arr.reduce((sum, value) => sum + parseFloat(value), 0);
}

function preparePriceToNumber(productPrice) {
  if (Shopify.money_format.indexOf("with_comma_separator") != -1) {
    var wholeNumber = productPrice.replace(/[^0-9,-]+/g, "");
    wholeNumber = wholeNumber.replace(/,/g, '.');
  } else {
    var wholeNumber = productPrice.replace(/[^0-9.-]+/g, "");
  }
  wholeNumber = wholeNumber.replace(/^\./, '');
  return wholeNumber;
}

function updatePrice(price) {
  price = roundUp(price);
  let priceSelectors = document.querySelectorAll(".price-container .price__default .price__current");
  priceSelectors.forEach(el => {
    let productPrice = el.getAttribute('content');
    if (!productPrice) return;

    let productPriceAmt = productPrice.replace(/[^0-9-]+/g, "").replace(/^,/, '.');
    let totalPriceAddOn = parseFloat(productPriceAmt) + parseFloat(price);

    el.innerHTML = convertPriceValue(totalPriceAddOn, false);
  });
}

function convertPriceValue(price, multiplier = true) {
  var afPrice = price * (multiplier ? Shopify.currency['rate'] : 1);
  return stripHtml(Shopify.formatMoney(afPrice, Shopify.money_format));
}

function roundUp(number) {
  var currentCurrency = Shopify.currency.rate;
  var shopifyRate = Shopify.currency.rate;
  var settings = [];
  if(typeof window.roundOffSettings == "undefined")
    return number * parseFloat(shopifyRate);

  roundOffSettings.forEach((value) => {
    if (value.currency == currentCurrency) {
      settings = value;
    }
  });
  let rate = settings.rate;
  var isNearInt = isInt(settings.roundUp);
  var near = parseInt(settings.roundUp);
  if (!isNearInt) {
    near = parseFloat(settings.roundUp);
  }

  if (settings.rate == "auto") {
    rate = Shopify.currency.rate;
  }
  number = number * parseFloat(rate);

  var multiplierRate = (near * 100);
  if ((settings.roundUp != settings.rate) && (number % multiplierRate === 0)) return number;
  if (settings.roundUp == settings.rate == 1) return number;
  var finalDifference = 0;
console.log("settings",settings)

  if (multiplierRate <= 10) {
    multiplierRate = 10;
    finalDifference = 10 - multiplierRate;
  } else if (multiplierRate > 10 && multiplierRate <= 100) {
    finalDifference = 100 - multiplierRate;
    multiplierRate = 100;
  } else if (multiplierRate > 100 && multiplierRate <= 1000) {
    finalDifference = 1000 - multiplierRate;
    multiplierRate = 1000;
  } else if (multiplierRate > 1000) {
    finalDifference = 10000 - multiplierRate;
    multiplierRate = 10000;
  }
  var finalResult = (parseInt(number / multiplierRate, 10) + 1) * multiplierRate;
  return finalResult - finalDifference;
}

function isInt(n) {
  if (n.lastIndexOf('.00') != -1) return true;
  return n % 1 === 0;
}

function add(accumulator, a) {
  return parseFloat(accumulator) + parseFloat(a);
}

function addPrice(accumulator, a) {
  return accumulator + a;
}

function getCurrencyFormat() {
  var currencyFormat = Shopify.money_format;
  currencyFormat = currencyFormat.replace('\{\{', '[[');
  currencyFormat = currencyFormat.replace('\}\}', ']]');
  return currencyFormat;
}

function calculateAddOnPrice() {
  var addOnPrice = [];
  document.querySelectorAll("#aFCustomOptionMainDiv input.variant__input-:checked").forEach(input => {
    var priceDom = input.closest('.afPriceAddon');
    var priceAmount = priceDom.textContent.trim();
    var priceToNumber = preparePriceToNumber(priceAmount);
    if (priceToNumber != '') {
      addOnPrice.push(priceToNumber);
    }
  });

  var totalAddOnPrice = array_sum(addOnPrice);
  updatePrice(totalAddOnPrice * 100);
}

function numberToMoney(wholeValue) {
  var wholeValue = wholeValue.toString();
  var digit, whole_money, wholeAmount, finalAmount, money_format_first, money_format_second;

  this.af_cd_money_format = getCurrencyFormat();

  if (this.af_cd_money_format.indexOf("amount_no_decimals_with_comma_separator") != "-1" || this.af_cd_money_format.indexOf("amount_with_comma_separator") != "-1") {
    digit = (wholeValue.substring(wholeValue.length - 2, wholeValue.length) == '0') ? "00" : wholeValue.substring(wholeValue.length - 2, wholeValue.length);
    whole_money = (wholeValue.substring(0, wholeValue.length - 2) == '') ? "0" : wholeValue.substring(0, wholeValue.length - 2);
    wholeAmount = parseInt(whole_money).toLocaleString();
    wholeAmount = wholeAmount.replace(/,/g, '.');
    finalAmount = wholeAmount + "," + digit;
    money_format_first = this.af_cd_money_format.split("[[");
    money_format_second = money_format_first[1].split("]]");
  } else if (this.af_cd_money_format.indexOf("amount_with_apostrophe_separator") != "-1") {
    digit = (wholeValue.substring(wholeValue.length - 2, wholeValue.length) == '0') ? "00" : wholeValue.substring(wholeValue.length - 2, wholeValue.length);
    whole_money = (wholeValue.substring(0, wholeValue.length - 2) == '') ? "0" : wholeValue.substring(0, wholeValue.length - 2);
    wholeAmount = parseInt(whole_money).toLocaleString();
    wholeAmount = wholeAmount.replace(/,/g, "'");
    finalAmount = wholeAmount + "." + digit;
    money_format_first = this.af_cd_money_format.split("[[");
    money_format_second = money_format_first[1].split("]]");
  } else {
    digit = (wholeValue.substring(wholeValue.length - 2, wholeValue.length) == '0') ? "00" : wholeValue.substring(wholeValue.length - 2, wholeValue.length);
    whole_money = (wholeValue.substring(0, wholeValue.length - 2) == '') ? "0" : wholeValue.substring(0, wholeValue.length - 2);
    wholeAmount = parseInt(whole_money).toLocaleString();
    finalAmount = wholeAmount;
    money_format_first = this.af_cd_money_format.split("[[");
    money_format_second = money_format_first[1].split("]]");
  }

  let convertedMoneyStr = money_format_first[0] + finalAmount + money_format_second[1];
  return convertedMoneyStr;
}
if(document.querySelector('.shopify-currency-form select')){
  document.querySelector('.shopify-currency-form select').addEventListener('change', function() {
    this.closest('form').submit();
  });
}
// Remove jQuery and update getVariantPrice
function getVariantPrice(ids, async = false) {
  if (localStorage.getItem("price_timestamp") === null) {
    return getPrice(ids, async);
  } else {
    var timestampObj = JSON.parse(localStorage.getItem("price_timestamp"));
    dateString = timestampObj.timestamp;
    now = new Date().getTime().toString();

    if (Math.round((now - dateString) / (1000 * 60)) > 30 && async == true) {
      return getPrice(ids, async);
    } else {
      var priceList = localStorage.getItem("price_list");
      return getPriceForParticularVariant(ids);
    }
  }
}

// Replacing the $.ajax call with fetch API
function getPrice(idList, async = false) {
  return fetch("https://tools.anglerfox.com/clients/siliconlovers_7nxP9a/getVariant/index.php?ids=all")
    .then(response => response.json())
    .then(result => {
      var timestampObj = { timestamp: new Date().getTime() };
      localStorage.setItem("price_timestamp", JSON.stringify(timestampObj));
      localStorage.setItem("price_list", JSON.stringify(result));
      return getPriceForParticularVariant(idList);
    });
}

function getPriceForParticularVariant(listId) {
  var priceList = localStorage.getItem("price_list");
  var jsonObj = JSON.parse(priceList);
  return (typeof jsonObj[listId] != "undefined") ? jsonObj[listId] : 0;
}

// Asynchronously update price to local storage
// getVariantPrice(31368728707183,true);

document.body.addEventListener('click', function(event) {
  if (event.target && event.target.classList.contains('variant__button-label')) {
    event.target.classList.add('activeLabel');
    setTimeout(() => {
      event.target.classList.remove('activeLabel');
      // calculateAddOnPrice(); // Uncomment to run on click
    }, 400);
  }
});

function errorPlacement() {
  document.querySelectorAll(".variant__label~.help-block:not(.variant__label+.help-block)").forEach(elem => {
    let clonedElem = elem.cloneNode(true);
    elem.parentNode.querySelector(".variant__label").after(clonedElem);
    elem.remove();
  });

  document.querySelectorAll("label.form-label~.help-block:not(label.form-label+.help-block)").forEach(elem => {
    let clonedElem = elem.cloneNode(true);
    elem.parentNode.querySelector("label.form-label").after(clonedElem);
    elem.remove();
  });
}

function updateCartPrice() {
  let divs = document.querySelectorAll('[data-itemkey]');
  divs.forEach((div) => {
    getFinalPrice(div.getAttribute('data-itemkey'));
  });
  updateCartTotalPrice();
}

function getFinalPrice(key) {
  var getItems = afDraftOrderCartObject.items;
  var itemMainPrice = [];
  var priceDomSelector = document.querySelector(`[data-itemkey="${key}"]`);
  var realPrice = 0;

  getItems.forEach((element) => {
    if (element.properties != null && typeof element.properties._af_custom_option != "undefined" && element.properties._af_custom_option == key) {
      itemMainPrice.push(element.price);
    }
    if ((element.key == key) || (typeof element.properties._af_item_key != 'undefined' && element.properties._af_item_key == key)) {
      realPrice = element.price;
    }
  });

  var cartArraySum = array_sum(itemMainPrice);
  var totalLinePrice = parseFloat(realPrice) + (cartArraySum);
  var quantity = document.querySelector(`[data-itemkey="${key}"]`).closest('li.item').querySelector('.quantity-container input').value;

  var roundItemPrice = totalLinePrice * quantity;
  priceDomSelector.setAttribute('data-price', roundItemPrice);
  priceDomSelector.classList.remove('hideInLoading');
  priceDomSelector.innerHTML = convertPriceValue(roundItemPrice, false);
}

function updateCartTotalPrice() {
  var totalPrice = [];
  var divs = document.querySelectorAll('[data-itemkey]');
  divs.forEach((div) => {
    totalPrice.push(div.getAttribute('data-price'));
  });
  var totalCartPrice = array_sum(totalPrice);
  var totalPriceElem = document.querySelector('.bcpo-cart-original-total');
  if (totalPriceElem) {
    totalPriceElem.innerHTML = convertPriceValue(totalCartPrice, false);
  }
}

function modifyConfig() {
  window.af_co_formFields.forEach((formField) => {
    const match = window.af_masterfieldList.find((masterField) => masterField.id === formField.id && masterField.options);
    if (match) {
      formField.options = formField.options.map((opt, index) => {
        const correspondingOpt = match.options && match.options[index];
        if (correspondingOpt) {
          const updatedOption = { ...correspondingOpt };
          if (opt.default_value !== undefined) {
            updatedOption.default_value = opt.default_value;
          } else {
            delete updatedOption.default_value;
          }
          return updatedOption;
        }
        return opt;
      });
    }
  });
}