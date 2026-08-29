
import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// =========================================
// CART
// =========================================

let cart =
    JSON.parse(localStorage.getItem("cart")) || {};


// =========================================
// CUSTOMER AUTHENTICATION
// =========================================

let currentUser = null;

onAuthStateChanged(auth, function (user) {

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
        function () {

            const phone =
                phoneInput.value.trim();

            if (phone === "") {

                if (phoneMessage) {
                    phoneMessage.innerText = "";
                    phoneMessage.className = "";
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


    const products =
        Object.keys(cart);


    if (products.length === 0) {

        box.innerHTML = `
            <div class="checkout-empty">
                🛒 Your cart is empty.
            </div>
        `;

        updateTotal();

        return;

    }


    products.forEach(function (product) {

        const item =
            cart[product];


        const price =
            Number(item.price) || 0;


        const quantity =
            Number(item.quantity) || 0;


        const subtotal =
            price * quantity;


        box.innerHTML += `

            <div class="checkout-product">

                <div class="checkout-product-image">

                    <img
                        src="${item.image || ""}"
                        alt="${product}"
                        onerror="this.style.display='none';"
                    >

                </div>


                <div class="checkout-product-info">

                    <h3>
                        ${product}
                    </h3>

                    <p class="checkout-product-price">
                        PKR ${price.toLocaleString()}
                    </p>


                    <div class="checkout-quantity">

                        <button
                            type="button"
                            onclick="decreaseQty('${product}')"
                        >
                            −
                        </button>

                        <span>
                            ${quantity}
                        </span>

                        <button
                            type="button"
                            onclick="increaseQty('${product}')"
                        >
                            +
                        </button>

                    </div>

                </div>


                <div class="checkout-product-total">

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        PKR ${subtotal.toLocaleString()}
                    </strong>

                </div>

            </div>

        `;

    });


    updateTotal();

}


// =========================================
// INCREASE QUANTITY
// =========================================

function increaseQty(product) {

    if (!cart[product]) {
        return;
    }


    const quantity =
        Number(cart[product].quantity) || 0;


    cart[product].quantity =
        quantity + 1;


    saveCheckout();

}


// =========================================
// DECREASE QUANTITY
// =========================================

function decreaseQty(product) {

    if (!cart[product]) {
        return;
    }


    const quantity =
        Number(cart[product].quantity) || 0;


    cart[product].quantity =
        quantity - 1;


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
// CALCULATE TOTAL
// =========================================

function calculateCartTotal() {

    let total = 0;


    for (const product in cart) {

        const item =
            cart[product];


        const price =
            Number(item.price) || 0;


        const quantity =
            Number(item.quantity) || 0;


        total +=
            price * quantity;

    }


    return total;

}


// =========================================
// UPDATE TOTAL DISPLAY
// =========================================

function updateTotal() {

    const totalElement =
        document.getElementById(
            "checkout-total"
        );


    if (!totalElement) {
        return;
    }


    const total =
        calculateCartTotal();


    totalElement.innerText =
        "Total: PKR " +
        total.toLocaleString();

}


// =========================================
// PLACE ORDER
// =========================================

async function placeOrder() {

    // Always get the latest cart
    cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || {};


    // =====================================
    // CART CHECK
    // =====================================

    if (
        Object.keys(cart).length === 0
    ) {

        alert(
            "🛒 Your cart is empty."
        );

        return;

    }


    // =====================================
    // LOGIN CHECK
    // =====================================

    if (!currentUser) {

        alert(
            "🔐 Please login to your customer account before placing an order."
        );


        window.location.href =
            "customer-login.html";


        return;

    }


    // =====================================
    // GET CUSTOMER DETAILS
    // =====================================

    const nameInput =
        document.getElementById(
            "customer-name"
        );


    const phoneInputElement =
        document.getElementById(
            "customer-phone"
        );


    const addressInput =
        document.getElementById(
            "customer-address"
        );


    const paymentElement =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const phone =
        phoneInputElement
            ? phoneInputElement.value.trim()
            : "";


    const address =
        addressInput
            ? addressInput.value.trim()
            : "";


    const payment =
        paymentElement
            ? paymentElement.value
            : "";


    // =====================================
    // REQUIRED FIELDS
    // =====================================

    if (
        name === "" ||
        phone === "" ||
        address === "" ||
        payment === ""
    ) {

        alert(
            "❌ Please fill all details and select a payment method."
        );

        return;

    }


    // =====================================
    // PHONE VALIDATION
    // =====================================

    if (
        !/^03\d{9}$/.test(phone)
    ) {

        alert(
            "❌ Please enter a valid Pakistani phone number."
        );

        return;

    }


    // =====================================
    // PAYMENT VALIDATION
    // =====================================

    const allowedPayments = [
        "EasyPaisa",
        "JazzCash",
        "Card On Delivery",
        "Cash On Delivery"
    ];


    if (
        !allowedPayments.includes(payment)
    ) {

        alert(
            "❌ Invalid payment method."
        );

        return;

    }


    // =====================================
    // SAVE CUSTOMER DETAILS LOCALLY
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
    // CONFIRM ORDER
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

        const total =
            calculateCartTotal();


        // =================================
        // CREATE ORDER ID
        // =================================

        const orderID =
            "MH" + Date.now();


        // =================================
        // GET TRANSACTION ID
        // =================================

        const transactionID =
            localStorage.getItem(
                "transactionID"
            ) || "";


        // =================================
        // CREATE ORDER
        // =================================

        const order = {

            orderID:

                orderID,


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

                transactionID,


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

            collection(
                db,
                "orders"
            ),

            order

        );


        // =================================
        // SUCCESS
        // =================================

        alert(

            "🎉 Order placed successfully!\n\n" +

            "Your Order ID:\n" +

            orderID +

            "\n\n" +

            "Please save this Order ID."

        );


        // =================================
        // CLEAR CART
        // =================================

        localStorage.removeItem(
            "cart"
        );


        localStorage.removeItem(
            "transactionID"
        );


        // =================================
        // GO HOME
        // =================================

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
// LOAD SAVED CUSTOMER DETAILS
// =========================================

const savedNameInput =
    document.getElementById(
        "customer-name"
    );


const savedAddressInput =
    document.getElementById(
        "customer-address"
    );


if (savedNameInput) {

    savedNameInput.value =
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


if (savedAddressInput) {

    savedAddressInput.value =
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
    function (option) {

        option.addEventListener(
            "change",
            function () {

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


    if (
        !loading ||
        !popup
    ) {

        return;

    }


    loading.style.display =
        "flex";


    setTimeout(
        function () {

            loading.style.display =
                "none";


            popup.style.display =
                "flex";


            if (
                method === "EasyPaisa"
            ) {

                if (title) {

                    title.innerHTML =
                        "🟢 EasyPaisa Payment";

                }


                if (message) {

                    message.innerHTML =

                        "⚠️ <b>IMPORTANT!</b><br><br>" +

                        "EasyPaisa payments are manual.<br>" +

                        "Please send the payment first, then enter your Transaction ID below.";

                }

            } else {

                if (title) {

                    title.innerHTML =
                        "🔴 JazzCash Payment";

                }


                if (message) {

                    message.innerHTML =

                        "⚠️ <b>IMPORTANT!</b><br><br>" +

                        "JazzCash payments are manual.<br>" +

                        "Please send the payment first, then enter your Transaction ID below.";

                }

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
// CLOSE POPUP WHEN CLICKING OUTSIDE
// =========================================

window.addEventListener(
    "click",
    function (event) {

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

