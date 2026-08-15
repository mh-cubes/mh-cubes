import { db } from "./firebase.js";
import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ==============================
// CART
// ==============================

let cart = JSON.parse(localStorage.getItem("cart")) || {};


// ==============================
// PHONE VALIDATION
// ==============================

let phoneInput = document.getElementById("customer-phone");
let phoneMessage = document.getElementById("phone-message");

if(phoneInput){

    phoneInput.addEventListener("input", function(){

        let phone = phoneInput.value.trim();

        if(phone === ""){

            phoneMessage.innerText = "";

            phoneInput.classList.remove(
                "phone-valid",
                "phone-invalid"
            );

            return;
        }


        if(/^03\d{9}$/.test(phone)){

            phoneMessage.innerText =
                "✅ Valid Pakistani phone number";

            phoneMessage.className = "valid-phone";

            phoneInput.classList.add("phone-valid");

            phoneInput.classList.remove("phone-invalid");

        }else{

            phoneMessage.innerText =
                "❌ Phone number must be 11 digits and start with 03";

            phoneMessage.className = "invalid-phone";

            phoneInput.classList.add("phone-invalid");

            phoneInput.classList.remove("phone-valid");

        }

    });

}


// ==============================
// LOAD CHECKOUT
// ==============================

function loadCheckout(){

    let box = document.getElementById("checkout-items");

    if(!box) return;

    box.innerHTML = "";

    let total = 0;


    for(let product in cart){

        let item = document.createElement("div");

        item.className = "checkout-product";


        item.innerHTML = `

            <h3>${product}</h3>

            <p>
                PKR ${cart[product].price}
            </p>

            <button onclick="decreaseQty('${product}')">
                −
            </button>

            <span>
                ${cart[product].quantity}
            </span>

            <button onclick="increaseQty('${product}')">
                +
            </button>

        `;


        box.appendChild(item);


        total +=
            Number(cart[product].price) *
            Number(cart[product].quantity);

    }


    updateTotal(total);

}


// ==============================
// UPDATE TOTAL
// ==============================

function updateTotal(total = 0){

    let totalElement =
        document.getElementById("checkout-total");

    if(totalElement){

        totalElement.innerText =
            "Total: PKR " + total;

    }

}


// ==============================
// INCREASE QUANTITY
// ==============================

function increaseQty(product){

    if(!cart[product]) return;

    cart[product].quantity++;

    saveCheckout();

}


// ==============================
// DECREASE QUANTITY
// ==============================

function decreaseQty(product){

    if(!cart[product]) return;

    cart[product].quantity--;


    if(cart[product].quantity <= 0){

        delete cart[product];

    }


    saveCheckout();

}


// ==============================
// SAVE CHECKOUT
// ==============================

function saveCheckout(){

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    loadCheckout();

}


// ==============================
// PLACE ORDER
// ==============================

async function placeOrder(){

    let name =
        document.getElementById("customer-name")
        .value.trim();


    let phone =
        document.getElementById("customer-phone")
        .value.trim();


    let address =
        document.getElementById("customer-address")
        .value.trim();


    let paymentElement =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    let payment =
        paymentElement
        ? paymentElement.value
        : "";


    // CHECK CART

    if(Object.keys(cart).length === 0){

        alert("🛒 Your cart is empty.");

        return;

    }


    // CHECK DETAILS

    if(
        name === "" ||
        phone === "" ||
        address === "" ||
        payment === ""
    ){

        alert(
            "Please fill all details and select a payment method."
        );

        return;

    }


    // CHECK PHONE

    if(!/^03\d{9}$/.test(phone)){

        alert(
            "Please enter a valid Pakistani phone number."
        );

        return;

    }


    // SAVE CUSTOMER DETAILS

    localStorage.setItem(
        "customerName",
        name
    );

    localStorage.setItem(
        "customerPhone",
        phone
    );

    localStorage.setItem(
        "customerAddress",
        address
    );


    // CREATE ORDER

    let order = {

        orderID:
            "MH" + Date.now(),

        customerName:
            name,

        phone:
            phone,

        address:
            address,

        payment:
            payment,

        products:
            cart,

        transactionID:
            localStorage.getItem(
                "transactionID"
            ) || "",

        status:
            "Pending",

        date:
            new Date().toLocaleString()

    };


    // CONFIRM

    let confirmed =
        confirm(
            "Are you sure you want to place this order?"
        );


    if(!confirmed){

        return;

    }


    try{

        // SAVE DIRECTLY TO FIRESTORE

        await addDoc(
            collection(db, "orders"),
            order
        );


        alert(
            "🎉 Order placed successfully!\n\n" +
            "Your Order ID:\n" +
            order.orderID +
            "\n\n" +
            "Please save this Order ID."
        );


        // CLEAR CART

        localStorage.removeItem("cart");

        localStorage.removeItem(
            "transactionID"
        );


        // GO HOME

        window.location.href =
            "index.html";


    }catch(error){

        console.error(
            "Order error:",
            error
        );


        alert(
            "❌ Order could not be placed.\n\n" +
            "Please try again."
        );

    }

}


// ==============================
// LOAD SAVED CUSTOMER DETAILS
// ==============================

let savedName =
    localStorage.getItem("customerName") || "";

let savedPhone =
    localStorage.getItem("customerPhone") || "";

let savedAddress =
    localStorage.getItem("customerAddress") || "";


let nameInput =
    document.getElementById("customer-name");

let phoneField =
    document.getElementById("customer-phone");

let addressInput =
    document.getElementById("customer-address");


if(nameInput){

    nameInput.value = savedName;

}


if(phoneField){

    phoneField.value = savedPhone;

}


if(addressInput){

    addressInput.value = savedAddress;

}


// ==============================
// PAYMENT SELECTION
// ==============================

let paymentOptions =
    document.querySelectorAll(
        'input[name="payment"]'
    );


paymentOptions.forEach(function(option){

    option.addEventListener(
        "change",
        function(){

            let method = this.value;


            if(
                method === "EasyPaisa" ||
                method === "JazzCash"
            ){

                openPaymentPopup(method);

            }

        }
    );

});


// ==============================
// PAYMENT POPUP
// ==============================

function openPaymentPopup(method){

    let loading =
        document.getElementById(
            "payment-loading"
        );


    let popup =
        document.getElementById(
            "payment-popup"
        );


    let title =
        document.getElementById(
            "payment-title"
        );


    let message =
        document.getElementById(
            "payment-message"
        );


    let number =
        document.getElementById(
            "payment-number"
        );


    let accountName =
        document.getElementById(
            "payment-name"
        );


    if(!loading || !popup) return;


    loading.style.display = "flex";


    setTimeout(function(){

        loading.style.display = "none";

        popup.style.display = "flex";


        if(method === "EasyPaisa"){

            title.innerHTML =
                "🟢 EasyPaisa Payment";


            message.innerHTML =
                "⚠️ <b>IMPORTANT!</b><br><br>" +
                "EasyPaisa payments are manual.<br>" +
                "Please send the payment first, " +
                "then enter your Transaction ID below.";


            number.innerHTML =
                "03XXXXXXXXX";


            accountName.innerHTML =
                "Account Name: MH CUBES";

        }else{

            title.innerHTML =
                "🔴 JazzCash Payment";


            message.innerHTML =
                "⚠️ <b>IMPORTANT!</b><br><br>" +
                "JazzCash payments are manual.<br>" +
                "Please send the payment first, " +
                "then enter your Transaction ID below.";


            number.innerHTML =
                "03XXXXXXXXX";


            accountName.innerHTML =
                "Account Name: MH CUBES";

        }

    },1200);

}


// ==============================
// CLOSE PAYMENT POPUP
// ==============================

function closePaymentPopup(){

    let popup =
        document.getElementById(
            "payment-popup"
        );


    let transaction =
        document.getElementById(
            "transaction-id"
        );


    if(popup){

        popup.style.display = "none";

    }


    if(transaction){

        transaction.value = "";

    }

}


// ==============================
// CONFIRM PAYMENT
// ==============================

function confirmPayment(){

    let input =
        document.getElementById(
            "transaction-id"
        );


    let id =
        input.value.trim();


    if(id === ""){

        alert(
            "⚠️ Please enter your Transaction ID."
        );

        return;

    }


    localStorage.setItem(
        "transactionID",
        id
    );


    alert(
        "✅ Payment details received."
    );


    closePaymentPopup();

}


// ==============================
// CLICK OUTSIDE POPUP
// ==============================

window.addEventListener(
    "click",
    function(event){

        let popup =
            document.getElementById(
                "payment-popup"
            );


        if(
            popup &&
            event.target === popup
        ){

            closePaymentPopup();

        }

    }
);


// ==============================
// MAKE FUNCTIONS AVAILABLE
// TO HTML BUTTONS
// ==============================

window.placeOrder =
    placeOrder;

window.increaseQty =
    increaseQty;

window.decreaseQty =
    decreaseQty;

window.openPaymentPopup =
    openPaymentPopup;

window.closePaymentPopup =
    closePaymentPopup;

window.confirmPayment =
    confirmPayment;


// ==============================
// START
// ==============================

loadCheckout();