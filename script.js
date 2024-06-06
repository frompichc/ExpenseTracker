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
import { getDatabase, orderByChild, orderByKey, startAt, endAt, query, ref, child, get, set, update, remove } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";



const db = getDatabase();

//Inputs
const selectCategoryForm = document.getElementById(`category-form-select`);
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

//Table objects
const tbody = document.getElementById(`table-show-expenses`).getElementsByTagName(`tbody`)[0];

let idGlobal;
let cursorPosition = 0;
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

//Date objects -- change value
firstDate.addEventListener('change', () => {
    fetchAllExpenses();
});

lastDate.addEventListener('change', () => {
    fetchAllExpenses();
})

//Buttons actions
btnAddExpense.addEventListener(`click`, () => {
    fetchAllCategories('expense');
    lblTitleForm.innerText = `EXPENSE`;
    btnConfirmForm.innerHTML = `Add expense`;
    clearForm();
    chkInputs(`Insert`);
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
    const dateYearMonthDay = yearNow + monthNow + dayNow;
    const dateTimeNow = yearNow + monthNow + dayNow + hourNow + minutesNow + secondsNow + milisecondsNow;
    let value = txtAmountForm.value;
    value = value.replace(/[^\d]/g, '');
    set(ref(db, `ExpenseSet/` + parseInt(dateYearMonthDay) + '/' + parseInt(dateTimeNow)), {
            id: parseInt(dateTimeNow),
            category: selectCategoryForm.value,
            description: txtDescriptionForm.value,
            amount: parseFloat(value/100),
            income: chkIncomeForm.checked,
            date: parseInt(dateYearMonthDay)
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
    const dateStart = firstDate.value.substring(0,4) + firstDate.value.substring(5,7) + firstDate.value.substring(8,10);
    const dateEnd = lastDate.value.substring(0,4) + lastDate.value.substring(5,7) + lastDate.value.substring(8,10);
    const dbRef = ref(db);
    //get(child(dbRef, 'ExpenseSet/'))
    const expenseSetRef = child(dbRef,`ExpenseSet/`);
    const expenseQuery = query(expenseSetRef, orderByKey(), startAt(dateStart), endAt(dateEnd));
    get(expenseQuery)
    //get(expenseQuery)
    .then((snapshot) => {
        if (snapshot.exists()){
            fillTable(snapshot.val())
        } else {
            tbody.innerHTML = ``;
            spanValIncome.innerText = formatCurrency(0);
            spanValExpenses.innerText = formatCurrency(0);
            spanValBalance.innerText = formatCurrency(0);
            alert(`No data available`);
        }
    }).catch((error) => {
        alert(`Error retriving data in fetchAllExpenses ${error}`);
    })
}

//Show form for update or delete
function showSingleExpense(infoExpenses, action) {
    chkIncomeForm.checked = infoExpenses.income;
    txtDescriptionForm.value = infoExpenses.description;
    txtAmountForm.value = formatCurrency(infoExpenses.amount);
    btnConfirmForm.innerText= action;
    idGlobal = infoExpenses.id.toString();
    checkIncomeExpense();
    chkInputs(action);
    dialogExpense.showModal();
}

function chkInputs(action) {
    if (action===`Delete`) {
        chkIncomeForm.disabled = true;
        txtAmountForm.disabled = true;
        txtDescriptionForm.disabled = true;
        selectCategoryForm.disabled = true;
    } else {
        chkIncomeForm.disabled = false;
        txtAmountForm.disabled = false;
        txtDescriptionForm.disabled = false;
        selectCategoryForm.disabled = false;
    }
}

//Update expenses 
function updateExpense() {
    let value = txtAmountForm.value;
    value = value.replace(/[^\d]/g, '');
    update(ref(db,`ExpenseSet/` + parseInt(idGlobal.substring(0,8)) +'/'+ parseInt(idGlobal)), {
        category: selectCategoryForm.value,
        description: txtDescriptionForm.value,
        amount: parseFloat(value/100),
        id: idGlobal,
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
    remove(ref(db, `ExpenseSet/` + parseInt(idGlobal.substring(0,8)) + '/' + parseInt(idGlobal)))
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
    
    selectCategoryForm.innerHTML = ``;
    for (const key in data) {
        const infoCategory = data[key];
        const optionCategory = document.createElement(`option`);
        optionCategory.value = infoCategory;
        optionCategory.innerText = infoCategory;
        selectCategoryForm.appendChild(optionCategory);
    }
}


//fill table
function fillTable(data) {
    let valIncome = 0;
    let valExpenses = 0;
    let valBalance = 0;
 
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

            cellDate.textContent = infoExpenses.id.toString().substring(4,6) + "/" + infoExpenses.id.toString().substring(6,8);
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
            btnUpdateExpense.className = `table-button update`;
            cellEditButton.appendChild(btnUpdateExpense);
            btnUpdateExpense.addEventListener(`click`, () => {
                showSingleExpense(infoExpenses, `Update`);
            })


            const spanUpdateIcon = document.createElement(`span`);
            spanUpdateIcon.className = `icon`;
            spanUpdateIcon.innerHTML = `<image src="./resources/update_icon.svg" />`;
            btnUpdateExpense.appendChild(spanUpdateIcon);


            const btnDeleteExpense = document.createElement(`button`);
            btnDeleteExpense.className = `table-button delete`;
            cellDeleteButton.appendChild(btnDeleteExpense);
            btnDeleteExpense.addEventListener(`click`, () => {
                showSingleExpense(infoExpenses, `Delete`);
            })

            const spanDeleteIcon = document.createElement(`span`);
            spanDeleteIcon.className = `icon`;
            spanDeleteIcon.innerHTML = `<image src="./resources/delete_icon.svg" />`;
            btnDeleteExpense.appendChild(spanDeleteIcon);

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
    cursorPosition = txtAmountForm.selectionStart;
    let value = txtAmountForm.value;
    const newCursorPosition = cursorPosition - (txtAmountForm.value.length - value.length);
    value = value.replace(/[^\d]/g, '');
    txtAmountForm.value = value;
 
    if (value) {
        txtAmountForm.value = formatCurrency(parseFloat(value/100));
    } else {
        txtAmountForm.value = '';
    }
    txtAmountForm.setSelectionRange(newCursorPosition, newCursorPosition);
}
 
txtAmountForm.onpaste = function(e) {
    e.preventDefault();
}

window.onload = fetchAllExpenses;