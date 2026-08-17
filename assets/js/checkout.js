import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


let cart =
    JSON.parse(localStorage.getItem("cart")) || {};


// =========================================
// CUSTOMER AUTHENTICATION
// =========================================

let currentUser = null;

onAuthStateChanged(auth, function(user) {

    currentUser = user;

});


// =========================================
// ELEMENTS
// =========================================

const phoneInput =
    document.getElementById("customer-phone");

const phoneMessage =
    document.getElementById("phone-message");


// =========================================
// PHONE VALIDATION
// =========================================

if (phoneInput) {

    phoneInput.addEventListener(
        "input",
        function() {

            const phone =
                phoneInput.value.trim();

            if (phone === "") {

                if (phoneMessage) {
                    phoneMessage.innerText = "";
                }

                phoneInput.classList.remove(
                    "phone-valid",
                    "phone-invalid"
                );

                return;
            }


            if (/^03\d{9}$/.test(phone)) {

                if (phoneMessage) {

                    phoneMessage.innerText =
                        "✅ Valid Pakistani phone number";

                    phoneMessage.className =
                        "valid-phone";

                }

                phoneInput.classList.add(
                    "phone-valid"
                );

                phoneInput.classList.remove(
                    "phone-invalid"
                );

            } else {

                if (phoneMessage) {

                    phoneMessage.innerText =
                        "❌ Phone number must be 11 digits and start with 03";

                    phoneMessage.className =
                        "invalid-phone";

                }

                phoneInput.classList.add(
                    "phone-invalid"
                );

                phoneInput.classList.remove(
                    "phone-valid"
                );

            }

        }
    );

}


// =========================================
// LOAD CHECKOUT
// =========================================

function loadCheckout() {

    const box =
        document.getElementById("checkout-items");

    if (!box) {
        return;
    }


    box.innerHTML = "";


    for (const product in cart) {

        const item =
            cart[product];


        box.innerHTML += `

            <div class="checkout-product">

                <h3>
                    ${product}
                </h3>

                <p>
                    PKR ${item.price}
                </p>

                <button
                    onclick="decreaseQty('${product}')">
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    onclick="increaseQty('${product}')">
                    +
                </button>

            </div>

        `;

    }


    updateTotal();

}


// =========================================
// QUANTITY CONTROLS
// =========================================

function increaseQty(product) {

    if (!cart[product]) {
        return;
    }


    cart[product].quantity++;

    saveCheckout();

}


function decreaseQty(product) {

    if (!cart[product]) {
        return;
    }


    cart[product].quantity--;


    if (cart[product].quantity <= 0) {

        delete cart[product];

    }


    saveCheckout();

}


// =========================================
// SAVE CART
// =========================================

function saveCheckout() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    loadCheckout();

}


// =========================================
// TOTAL
// =========================================

function updateTotal() {

    let total = 0;


    for (const product in cart) {

        total +=
            Number(cart[product].price) *
            Number(cart[product].quantity);

    }


    const totalElement =
        document.getElementById("checkout-total");


    if (totalElement) {

        totalElement.innerText =
            "Total: PKR " + total;

    }

}


// =========================================
// PLACE ORDER
// =========================================

async function placeOrder() {

    cart =
        JSON.parse(localStorage.getItem("cart")) || {};


    if (Object.keys(cart).length === 0) {

        alert(
            "🛒 Your cart is empty."
        );

        return;

    }


    // =====================================
    // REQUIRE CUSTOMER LOGIN
    // =====================================

    if (!currentUser) {

        alert(
            "🔐 Please login to your customer account before placing an order."
        );

        window.location.href =
            "customer-login.html";

        return;

    }


    const name =
        document
            .getElementById("customer-name")
            .value
            .trim();


    const phone =
        document
            .getElementById("customer-phone")
            .value
            .trim();


    const address =
        document
            .getElementById("customer-address")
            .value
            .trim();


    const paymentElement =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    const payment =
        paymentElement
            ? paymentElement.value
            : "";


    // =====================================
    // VALIDATION
    // =====================================

    if (
        name === "" ||
        phone === "" ||
        address === "" ||
        payment === ""
    ) {

        alert(
            "Please fill all details and select a payment method."
        );

        return;

    }


    if (!/^03\d{9}$/.test(phone)) {

        alert(
            "Please enter a valid Pakistani phone number."
        );

        return;

    }


    // =====================================
    // SAVE CUSTOMER DETAILS
    // =====================================

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


    // =====================================
    // CONFIRM
    // =====================================

    const confirmed =
        confirm(
            "Are you sure you want to place this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        // =================================
        // CALCULATE TOTAL
        // =================================

        let total = 0;


        for (const product in cart) {

            total +=
                Number(cart[product].price) *
                Number(cart[product].quantity);

        }


        // =================================
        // CREATE ORDER
        // =================================

        const order = {

            orderID:
                "MH" + Date.now(),

            customerUID:
                currentUser.uid,

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

            total:
                total,

            transactionID:
                localStorage.getItem(
                    "transactionID"
                ) || "",

            status:
                "Pending",

            notification:
                "",

            date:
                new Date().toLocaleString(),

            createdAt:
                Date.now()

        };


        // =================================
        // SAVE TO FIRESTORE
        // =================================

        await addDoc(
            collection(db, "orders"),
            order
        );


        // =================================
        // SUCCESS
        // =================================

        alert(
            "🎉 Order placed successfully!\n\n" +
            "Your Order ID:\n" +
            order.orderID +
            "\n\n" +
            "Please save this Order ID."
        );


        localStorage.removeItem(
            "cart"
        );

        localStorage.removeItem(
            "transactionID"
        );


        window.location.href =
            "index.html";


    } catch (error) {

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


// =========================================
// LOAD SAVED DETAILS
// =========================================

const nameInput =
    document.getElementById(
        "customer-name"
    );


const addressInput =
    document.getElementById(
        "customer-address"
    );


if (nameInput) {

    nameInput.value =
        localStorage.getItem(
            "customerName"
        ) || "";

}


if (phoneInput) {

    phoneInput.value =
        localStorage.getItem(
            "customerPhone"
        ) || "";

}


if (addressInput) {

    addressInput.value =
        localStorage.getItem(
            "customerAddress"
        ) || "";

}


// =========================================
// PAYMENT SELECTION
// =========================================

const paymentOptions =
    document.querySelectorAll(
        'input[name="payment"]'
    );


paymentOptions.forEach(
    function(option) {

        option.addEventListener(
            "change",
            function() {

                const method =
                    this.value;


                if (
                    method === "EasyPaisa" ||
                    method === "JazzCash"
                ) {

                    openPaymentPopup(
                        method
                    );

                }

            }
        );

    }
);


// =========================================
// PAYMENT POPUP
// =========================================

function openPaymentPopup(method) {

    const loading =
        document.getElementById(
            "payment-loading"
        );


    const popup =
        document.getElementById(
            "payment-popup"
        );


    const title =
        document.getElementById(
            "payment-title"
        );


    const message =
        document.getElementById(
            "payment-message"
        );


    const number =
        document.getElementById(
            "payment-number"
        );


    const accountName =
        document.getElementById(
            "payment-name"
        );


    if (!loading || !popup) {
        return;
    }


    loading.style.display =
        "flex";


    setTimeout(
        function() {

            loading.style.display =
                "none";


            popup.style.display =
                "flex";


            if (method === "EasyPaisa") {

                title.innerHTML =
                    "🟢 EasyPaisa Payment";


                message.innerHTML =
                    "⚠️ <b>IMPORTANT!</b><br><br>" +
                    "EasyPaisa payments are manual.<br>" +
                    "Please send the payment first, then enter your Transaction ID below.";

            } else {

                title.innerHTML =
                    "🔴 JazzCash Payment";


                message.innerHTML =
                    "⚠️ <b>IMPORTANT!</b><br><br>" +
                    "JazzCash payments are manual.<br>" +
                    "Please send the payment first, then enter your Transaction ID below.";

            }


            if (number) {

                number.innerHTML =
                    "03XXXXXXXXX";

            }


            if (accountName) {

                accountName.innerHTML =
                    "Account Name: MH CUBES";

            }

        },
        1200
    );

}


// =========================================
// CLOSE PAYMENT POPUP
// =========================================

function closePaymentPopup() {

    const popup =
        document.getElementById(
            "payment-popup"
        );


    const transaction =
        document.getElementById(
            "transaction-id"
        );


    if (popup) {

        popup.style.display =
            "none";

    }


    if (transaction) {

        transaction.value =
            "";

    }

}


// =========================================
// CONFIRM PAYMENT
// =========================================

function confirmPayment() {

    const input =
        document.getElementById(
            "transaction-id"
        );


    if (!input) {
        return;
    }


    const id =
        input.value.trim();


    if (id === "") {

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


// =========================================
// CLOSE POPUP OUTSIDE
// =========================================

window.addEventListener(
    "click",
    function(event) {

        const popup =
            document.getElementById(
                "payment-popup"
            );


        if (
            popup &&
            event.target === popup
        ) {

            closePaymentPopup();

        }

    }
);


// =========================================
// FUNCTIONS FOR HTML
// =========================================

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


// =========================================
// START
// =========================================

loadCheckout();
