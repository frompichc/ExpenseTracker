// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebaseConfig from "./firebaseConfig.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initizlize Firebase Database
import { getDatabase, ref, child, get, set, update, remove } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
const db = getDatabase();

//Inputs
const txtCategoryForm = document.getElementById(`category-form`);
const txtDescriptionForm = document.getElementById(`description-form`);
const txtAmountForm = document.getElementById(`amount-form`);
const chkIncomeForm = document.getElementById(`income-form`);
const sliderIncomeForm = document.getElementById(`slider-income-form`);
const lblTitleForm = document.getElementById(`title-form`);
const inputForm = document.getElementById(`input-dialog`);

//Buttons
const btnAddExpense = document.getElementById(`add-expense-button`);
const btnCancelForm = document.getElementById(`cancel-form-button`);
const btnConfirmForm = document.getElementById(`confirm-form-button`);

//Dialog form
const dialogExpense = document.getElementById(`input-dialog`);

//Values income, expenses, balance
const spanValIncome = document.getElementById(`val-income`);
const spanValExpenses = document.getElementById(`val-expenses`);
const spanValBalance = document.getElementById(`val-balance`);

//Dates objects
const firstDate = document.getElementById(`start-day`);
const lastDate = document.getElementById(`end-day`);

let idGlobal;
let dateToday = new Date();
dateToday.setDate(1);
firstDate.value = dateToday.getFullYear() + '-'
    + (dateToday.getMonth()+1).toString().padStart(2, `0`) + '-' 
    + dateToday.getDate().toString().padStart(2,`0`);

dateToday.setMonth(dateToday.getMonth() + 1);
dateToday.setDate(0);
lastDate.value = dateToday.getFullYear() + `-`
    + (dateToday.getMonth()+1).toString().padStart(2, `0`) + `-`
    + dateToday.getDate().toString().padStart(2, `0`);
//Buttons actions
btnAddExpense.addEventListener(`click`, () => {
    fetchAllCategories('expense');
    lblTitleForm.innerText = `EXPENSE`;
    btnConfirmForm.innerHTML = `Add expense`;
    clearForm();
    dialogExpense.showModal();
})

btnCancelForm.addEventListener(`click`, () => {
    dialogExpense.close();
})

//ch
chkIncomeForm.addEventListener(`click`, () => {
    checkIncomeExpense();
})

function checkIncomeExpense() {
    if (chkIncomeForm.checked) {
        fetchAllCategories('income');
        lblTitleForm.innerText = `INCOME`;
        lblTitleForm.style.color = `#058784`;
        inputForm.style.boxShadow = `0 0 10px 1px #058784`;
        if (btnConfirmForm.innerText === `Add expense`) {
            btnConfirmForm.innerText = `Add income`;
        }
    } else {
        fetchAllCategories('expense');
        lblTitleForm.innerText = `EXPENSE`;
        lblTitleForm.style.color = `#EC1111`;
        inputForm.style.boxShadow = `0px 0px 10px 1px #EC1111`;
        if (btnConfirmForm.innerText === `Add income`) {
            btnConfirmForm.innerText = `Add expense`;
        }

    }
}

btnConfirmForm.addEventListener(`click`, () => {
    switch(btnConfirmForm.innerText) {
        case `Update`:
            updateExpense();
            break;
        case `Delete`:
            deleteExpense();
            break; 
        default:
            addExpense();
            break;
    }
})

//Form functions
function clearForm() {
    txtCategoryForm.value = ``;
    txtDescriptionForm.value = ``
    txtAmountForm.value = formatCurrency(0/100);

    chkIncomeForm.checked = false;
    checkIncomeExpense();
}

//Database functions
function addExpense() {
    const fullDate = new Date();
    const yearNow = fullDate.getFullYear().toString();
    const monthNow = (fullDate.getMonth() + 1).toString().padStart(2, `0`);
    const dayNow = fullDate.getDate().toString().padStart(2, `0`);
    const hourNow = fullDate.getHours().toString().padStart(2, `0`);
    const minutesNow = fullDate.getMinutes().toString().padStart(2, `0`);
    const secondsNow = fullDate.getSeconds().toString().padStart(2, `0`);
    const milisecondsNow = fullDate.getMilliseconds().toString().padStart(2, `0`);
    const dateYearMonth = yearNow + monthNow;
    const dateTimeNow = yearNow + monthNow + dayNow + hourNow + minutesNow + secondsNow + milisecondsNow;
    let value = txtAmountForm.value;
    value = value.replace(/[^\d]/g, '');
    console.info(value);
    set(ref(db, `ExpenseSet/` + dateYearMonth + "/" + dateTimeNow), {
            id: dateTimeNow,
            category: txtCategoryForm.value,
            description: txtDescriptionForm.value,
            amount: parseFloat(value/100),
            income: chkIncomeForm.checked
    }).then(() => {
        fetchAllExpenses();
        dialogExpense.close();
        alert(`Expense saved successfully`);
    }).catch((error) => {
        alert(`Error saving data ${error}`);
    })
}

//Retrieve all categories
function fetchAllCategories(loadDefault) {
    const dbRef = ref(db);
    get(child(dbRef, 'CategorySet/' + loadDefault + '/'))
    .then((snapshot) => {
        if (snapshot.exists()){
            fillSelect(snapshot.val());
        } else {
            alert(`alert, data no available`);
        }
    }).catch(error => {
        alert(`Error retrieving data ${error}`)
    })
} 

//Retrieve all expenses
function fetchAllExpenses() {
    console.info(parseInt(firstDate.value))
    const dbRef = ref(db);
    get(child(dbRef, 'ExpenseSet/'))
    .then((snapshot) => {
        if (snapshot.exists()){
            fillTable(snapshot.val())
        } else {
            alert(`No data available`);
        }
    }).catch((error) => {
        alert(`Error retriving data ${error}`);
    })
}

//Show form for update or delete
function showSingleExpense(infoExpenses, action) {
    chkIncomeForm.checked = infoExpenses.income;
    txtDescriptionForm.value = infoExpenses.description;
    txtAmountForm.value = infoExpenses.amount;
    btnConfirmForm.innerText= action;
    idGlobal = infoExpenses.id;
    checkIncomeExpense();
    if (action===`Delete`) {
        chkIncomeForm.setAttribute(`readonly`, true);
        txtAmountForm.setAttribute(`readonly`, true);
        txtDescriptionForm.setAttribute(`readonly`, true);
    }
    dialogExpense.showModal();
}

//Update expenses 
function updateExpense() {
    console.log(idGlobal.substring(0,6), idGlobal);
    update(ref(db,`ExpenseSet/` + idGlobal.substring(0,6) +'/'+ idGlobal), {
        category: txtCategoryForm.value,
        description: txtDescriptionForm.value,
        amount: parseFloat(txtAmountForm.value),
        income: chkIncomeForm.checked
    }).then(() => {
        fetchAllExpenses();
        dialogExpense.close();
        alert(`Data updated`);
    }).catch((error => {
        alert(`Error updating data ${error}`);
    }))
}

//Delete expenses
function deleteExpense() {
    remove(ref(db, `ExpenseSet/` + idGlobal.substring(0,6) + '/' + idGlobal))
    .then(() => {
        alert(`Data deleted successfully`);
        dialogExpense.close();
        fetchAllExpenses();
    }) .catch(error => {
        alert(`Error deleting data ${error}`);
    })
}

//fill select
function fillSelect(data) {
    const selectCategory = document.getElementById(`category-form`);
    selectCategory.innerHTML = ``;
    for (const key in data) {
        const infoCategory = data[key];
        const optionCategory = document.createElement(`option`);
        optionCategory.value = infoCategory;
        optionCategory.innerText = infoCategory;
        selectCategory.appendChild(optionCategory);
    }
}


//fill table
function fillTable(data) {
    let valIncome = 0;
    let valExpenses = 0;
    let valBalance = 0;
    const tbody = document.getElementById(`table-show-expenses`).getElementsByTagName(`tbody`)[0];
    tbody.innerHTML = ``;
    for (const dateKey in data) {
        const dateInfo = data[dateKey];
        for (const idKey in dateInfo){
            const infoExpenses = dateInfo[idKey];
            const row = tbody.insertRow();
            const cellDate = row.insertCell(0)
            const cellCategory = row.insertCell(1);
            const cellDescription = row.insertCell(2);
            const cellAmount = row.insertCell(3);
            const cellEditButton = row.insertCell(4);
            const cellDeleteButton = row.insertCell(5);

            cellDate.textContent = infoExpenses.id.substring(4,6) + "/" + infoExpenses.id.substring(6,8);
            cellCategory.textContent = infoExpenses.category;
            cellDescription.textContent = infoExpenses.description;
            cellAmount.textContent = formatCurrency(parseFloat(infoExpenses.amount));
            cellAmount.style.textAlign = `right`;

            if (infoExpenses.income) {
                valIncome += parseFloat(infoExpenses.amount);
            } else {
                valExpenses += parseFloat(infoExpenses.amount);
            }

            const btnUpdateExpense = document.createElement(`button`);
            btnUpdateExpense.textContent = `Update`;
            cellEditButton.appendChild(btnUpdateExpense);
            btnUpdateExpense.addEventListener(`click`, () => {
                showSingleExpense(infoExpenses, `Update`);
            })

            const btnDeleteExpense = document.createElement(`button`);
            btnDeleteExpense.textContent = `Delete`;
            cellDeleteButton.appendChild(btnDeleteExpense);
            btnDeleteExpense.addEventListener(`click`, () => {
                showSingleExpense(infoExpenses, `Delete`);
            })

        }
    }

    valBalance = valIncome - valExpenses;
    spanValIncome.innerText = formatCurrency(valIncome);
    spanValExpenses.innerText = formatCurrency(valExpenses);
    spanValBalance.innerText = formatCurrency(valBalance);
}

//Format numbers to currency
function formatCurrency(valInput) {
    let currencyFormat = valInput.toLocaleString(`en-US`, {
        style: `currency`,
        currency: `USD`
    });
    return currencyFormat;
}

//Avoid enter letter in amount input
txtAmountForm.oninput = function(e) {
    let value = txtAmountForm.value;
    value = value.replace(/[^\d]/g, '');
    txtAmountForm.value = value;
 
    if (value) {
        txtAmountForm.value = formatCurrency(parseFloat(value/100));
    } else {
        txtAmountForm.value = '';
       }
}
 
txtAmountForm.onpaste = function(e) {
    e.preventDefault();
}

window.onload = fetchAllExpenses;