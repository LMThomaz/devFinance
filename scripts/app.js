const Modal = {
  toggle() {
    document.querySelector(".modal-overlay").classList.toggle("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    let income = 0;

    Transaction.all
      .filter(({ amount }) => amount > 0)
      .forEach(({ amount }) => (income += amount));

    return income;
  },

  expenses() {
    let expense = 0;

    Transaction.all
      .filter(({ amount }) => amount < 0)
      .forEach(({ amount }) => (expense += amount));

    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#dataTable tbody"),

  addTransaction(transaction, index) {
    const classCSS = transaction.amount > 0 ? "income" : "expense";

    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    tr.classList.add(classCSS);

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction({ description, amount, date }, index) {
    const amountCurrency = Utils.formatCurrency(amount);

    const html = `
      <td>${description}</td>
      <td>${amountCurrency}</td>
      <td class="date">${date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
      </td>
    `;

    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearElement(element) {
    element.innerHTML = "";
  },

  clearTransactions() {
    DOM.clearElement(DOM.transactionsContainer);
  },

  renderTransactions(allTransactions) {
    DOM.clearTransactions();
    allTransactions.forEach(DOM.addTransaction);
  },
};

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },

  formatAmount(value) {
    value = Number(value) * 100;

    return Math.round(value);
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    const [year, month, day] = splittedDate;

    return `${day}/${month}/${year}`;
  },

  capitalizeFirstLetter(value) {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (description.trim() === "" || amount.trim() === "" || date === "")
      throw new Error("Por favor, preencha todos os campos");
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    description = Utils.capitalizeFirstLetter(description).trim();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clear() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Form.saveTransaction(transaction);
      Form.clear();
      Modal.toggle();
    } catch (err) {
      alert(err.message);
    }
  },
};

const App = {
  init() {
    DOM.renderTransactions(Transaction.all);
    Storage.set(Transaction.all);
    DOM.updateBalance();
  },
  reload() {
    App.init();
  },
};

App.init();

particlesJS.load("particlesJs", "../particles.json", function () {});
