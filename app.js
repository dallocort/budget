/* eslint-disable quotes */
/* eslint-disable no-console */
"use strict";

var UIcontroler = (function() {
  var domStrings = {
    type: ".add__type",
    des: ".add__description",
    value: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetValue: ".budget__value",
    incomeValue: ".budget__income--value",
    expensesValue: ".budget__expenses--value",
    percentageValue: ".budget__expenses--percentage",
    container: ".container",
    //ovde ispod nema tačke jer  proveravamo classList.contains()
    deleteBtn: "item__delete--btn",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];
    if (int.length > 3) {
      //int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
      int = int.substring(0, int.length - 3) + "." + int.substring(int.length - 3);
    }
    return (type === "exp" ? "-" : "+") + " " + int + "," + dec;
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(domStrings.type).value,
        description: document.querySelector(domStrings.des).value,
        value: parseFloat(document.querySelector(domStrings.value).value)
      };
    },
    getDOMstrings: function() {
      return domStrings;
    },
    addListItem: function(obj, type) {
      var html, element;
      if (type === "inc") {
        element = domStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
      } else if (type === "exp") {
        element = domStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>  <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
      }
      html = html
        .replace("%id%", obj.id)
        .replace("%description%", obj.description)
        .replace("%value%", formatNumber(obj.value, type));
      document.querySelector(element).insertAdjacentHTML("beforeend", html);
    },
    deleteItemList: function(elementId) {
      var element;
      element = document.getElementById(elementId);
      element.parentElement.removeChild(element);
    },
    clearFields: function() {
      var fields;
      fields = document.querySelectorAll(`${domStrings.des}, ${domStrings.value}`);
      /*ili može da se prvo pretvori u pravi niz sa:
      Array.prototype.slice.call(fields);
      [...fields];
      */
      fields.forEach(element => {
        element.value = "";
      });
      fields[0].focus();
    },
    displayPercentages: function(persentages) {
      var fields = document.querySelectorAll(domStrings.expensesPercLabel);
      fields.forEach((el, index) => (el.textContent = persentages[index] !== -1 ? persentages[index] + "%" : "--"));
    },
    displayMonth: function() {
      var now, year, month, months;
      now = new Date();
      months = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(domStrings.dateLabel).textContent = `${months[month]} ${year}.`;
    },
    changedType: function() {
      var fields;
      fields = document.querySelectorAll(`${domStrings.type},${domStrings.des},${domStrings.value}`);
      fields.forEach(element => element.classList.toggle("red-focus"));
      document.querySelector(domStrings.inputBtn).classList.toggle("red");
    },
    displayBudget: function(obj) {
      var type;
      obj.budget >= 0 ? (type = "inc") : (type = "exp");
      document.querySelector(domStrings.budgetValue).textContent = formatNumber(obj.budget, type);
      document.querySelector(domStrings.incomeValue).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(domStrings.expensesValue).textContent = formatNumber(obj.totalExp, "exp");
      document.querySelector(domStrings.percentageValue).textContent = obj.percentage !== -1 ? obj.percentage + "%" : "--";
    }
  };
})();

var budgetControler = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(current => {
      sum = sum + current.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function(type, description, value) {
      var newItem, id;
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }
      if (type === "exp") {
        newItem = new Expense(id, description, value);
      } else if (type === "inc") {
        newItem = new Income(id, description, value);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(current => current.id);
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      calculateTotal("exp");
      calculateTotal("inc");
      data.budget = data.totals.inc - data.totals.exp;
      data.percentage =
        data.totals.inc > 0 ? Math.round(data.totals.exp <= data.totals.inc ? (data.totals.exp / data.totals.inc) * 100 : (data.totals.exp / data.totals.inc - 1) * -100) : -1;
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(element => element.calcPercentage(data.totals.inc));
    },
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(el => el.getPercentage());
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    //TODO posle brisati testing funkciju
    testing: function() {
      return data;
    }
  };
})();
var controler = (function(budgetCtrl, UICtrl) {
  var domStrings = UICtrl.getDOMstrings();
  var setupEventListeners = function() {
    document.querySelector(domStrings.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(event) {
      if (event.charCode === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(domStrings.container).addEventListener("click", ctrlDeleteItem);
    document.querySelector(domStrings.type).addEventListener("change", UICtrl.changedType);
  };
  //kako je u funkciju uklopio tri poziva funkcije koja rade zajedno update Budget
  var updateBudget = function() {
    budgetCtrl.calculateBudget();
    var budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };
  var updatePercentages = function() {
    budgetCtrl.calculatePercentages();
    var percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(percentages);
  };
  function ctrlAddItem() {
    var input, newItem;
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
      updatePercentages();
    } else {
      UICtrl.clearFields();
    }
  }
  function ctrlDeleteItem(event) {
    var itemID, splitID, type, id;
    //da budem siguran da je kliknuto na <i> tag unutar button-a jer dešava se da kliknem na nešto drugo pa bude error jer idem tačan broj ka gore do tražnog id-a
    if (event.target.parentElement.classList.contains(domStrings.deleteBtn)) {
      itemID = event.target.parentElement.parentElement.parentElement.parentElement.id;
      if (itemID) {
        splitID = itemID.split("-");
        type = splitID[0];
        id = parseInt(splitID[1]);
        budgetCtrl.deleteItem(type, id);
        UICtrl.deleteItemList(itemID);
        updateBudget();
        updatePercentages();
      }
    }
  }

  return {
    init: function() {
      console.log("startovanje");
      UICtrl.displayMonth();
      UICtrl.displayBudget({ budget: 0, totalInc: 0, totalExp: 0, percentage: 0 });
      setupEventListeners();
    }
  };
})(budgetControler, UIcontroler);

controler.init(); //TODO ovo posle brisati
