import { db } from "./firebase-config.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ==============================
// CART
// ==============================

let cart = JSON.parse(localStorage.getItem("cart")) || {};


// ==============================
// LOAD CHECKOUT
// ==============================

function loadCheckout() {

    cart = JSON.parse(localStorage.getItem("cart")) || {};

    const box = document.getElementById("checkout-items");

    const totalElement =
        document.getElementById("checkout-total");

    if (!box) return;

    box.innerHTML = "";

    let total = 0;

    for (const product in cart) {

        const item = cart[product];

        const price = Number(item.price);
        const quantity = Number(item.quantity);

        total += price * quantity;

        const div = document.createElement("div");

        div.className = "checkout-product";

        const info = document.createElement("div");

        info.className = "checkout-product-info";

        const image = document.createElement("img");

        image.src = item.image;
        image.alt = product;
        image.className = "checkout-image";

        const details = document.createElement("div");

        const title = document.createElement("h3");

        title.textContent = product;

        const priceText = document.createElement("p");

        priceText.textContent = "PKR " + price;

        details.appendChild(title);
        details.appendChild(priceText);

        info.appendChild(image);
        info.appendChild(details);


        const controls = document.createElement("div");

        controls.className = "checkout-controls";


        const decreaseButton =
            document.createElement("button");

        decreaseButton.textContent = "−";

        decreaseButton.onclick = function () {
            decreaseQty(product);
        };


        const quantityText =
            document.createElement("span");

        quantityText.textContent = quantity;


        const increaseButton =
            document.createElement("button");

        increaseButton.textContent = "+";

        increaseButton.onclick = function () {
            increaseQty(product);
        };


        controls.appendChild(decreaseButton);
        controls.appendChild(quantityText);
        controls.appendChild(increaseButton);


        div.appendChild(info);
        div.appendChild(controls);

        box.appendChild(div);
    }


    if (totalElement) {

        totalElement.innerText =
            "Total: PKR " + total;

    }

}


// ==============================
// INCREASE QUANTITY
// ==============================

function increaseQty(product) {

    if (!cart[product]) return;

    cart[product].quantity++;

    saveCart();

}


// ==============================
// DECREASE QUANTITY
// ==============================

function decreaseQty(product) {

    if (!cart[product]) return;

    cart[product].quantity--;

    if (cart[product].quantity <= 0) {

        delete cart[product];

    }

    saveCart();

}


// ==============================
// SAVE CART
// ==============================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    loadCheckout();

}


// ==============================
// PHONE VALIDATION
// ==============================

const phoneInput =
    document.getElementById("customer-phone");

const phoneMessage =
    document.getElementById("phone-message");


if (phoneInput) {

    phoneInput.addEventListener("input", function () {

        const phone =
            phoneInput.value.trim();


        if (phone === "") {

            phoneMessage.innerText = "";

            phoneInput.classList.remove(
                "phone-valid",
                "phone-invalid"
            );

            return;

        }


        if (/^03\d{9}$/.test(phone)) {

            phoneMessage.innerText =
                "✅ Valid Pakistani phone number";

            phoneMessage.className =
                "valid-phone";

            phoneInput.classList.add(
                "phone-valid"
            );

            phoneInput.classList.remove(
                "phone-invalid"
            );

        } else {

            phoneMessage.innerText =
                "❌ Phone number must be 11 digits and start with 03";

            phoneMessage.className =
                "invalid-phone";

            phoneInput.classList.add(
                "phone-invalid"
            );

            phoneInput.classList.remove(
                "phone-valid"
            );

        }

    });

}


// ==============================
// SAVED CUSTOMER DETAILS
// ==============================

const nameInput =
    document.getElementById("customer-name");

const addressInput =
    document.getElementById("customer-address");


if (nameInput) {

    nameInput.value =
        localStorage.getItem("customerName") || "";

}


if (phoneInput) {

    phoneInput.value =
        localStorage.getItem("customerPhone") || "";

}


if (addressInput) {

    addressInput.value =
        localStorage.getItem("customerAddress") || "";

}
// ==============================
// PAYMENT SELECTION
// ==============================

const paymentOptions =
    document.querySelectorAll(
        'input[name="payment"]'
    );


paymentOptions.forEach(function (option) {

    option.addEventListener("change", function () {

        const method = this.value;


        // EasyPaisa and JazzCash
        // are currently disabled / coming soon.

        if (
            method === "EasyPaisa" ||
            method === "JazzCash"
        ) {

            this.checked = false;

            alert(
                "🚧 This payment method is coming soon.\n\nPlease select Cash On Delivery."
            );

        }

    });

});


// ==============================
// PAYMENT POPUP
// ==============================

function openPaymentPopup(method) {

    // Payment popup is currently disabled
    // because only Cash On Delivery is active.

    alert(
        "🚧 " +
        method +
        " payments are coming soon.\n\nPlease select Cash On Delivery."
    );

}


// ==============================
// CLOSE PAYMENT POPUP
// ==============================

function closePaymentPopup() {

    const popup =
        document.getElementById("payment-popup");

    const transaction =
        document.getElementById("transaction-id");


    if (popup) {

        popup.style.display = "none";

    }


    if (transaction) {

        transaction.value = "";

    }

}


// ==============================
// CONFIRM PAYMENT
// ==============================

function confirmPayment() {

    alert(
        "🚧 Online payments are coming soon.\n\nPlease use Cash On Delivery for now."
    );

}


// ==============================
// PLACE ORDER - START
// ==============================

async function placeOrder() {

    cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || {};


    if (Object.keys(cart).length === 0) {

        alert(
            "🛒 Your cart is empty."
        );

        return;

    }


    const name =
        document.getElementById("customer-name")
        .value.trim();


    const phone =
        document.getElementById("customer-phone")
        .value.trim();


    const address =
        document.getElementById("customer-address")
        .value.trim();


    const paymentElement =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    const payment =
        paymentElement
            ? paymentElement.value
            : "";


    // ==============================
    // BASIC VALIDATION
    // ==============================

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


    // ==============================
    // ONLY COD IS ALLOWED
    // ==============================

    if (payment !== "Cash On Delivery") {

        alert(
            "🚧 Online payments are coming soon.\n\nPlease select Cash On Delivery."
        );

        return;

    }


    // ==============================
    // PHONE VALIDATION
    // ==============================

    if (!/^03\d{9}$/.test(phone)) {

        alert(
            "Please enter a valid Pakistani phone number."
        );

        return;

    }


    // ==============================
    // SAVE CUSTOMER DETAILS
    // ==============================

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


    // ==============================
    // CALCULATE TOTAL
    // ==============================

    let total = 0;


    for (const product in cart) {

        total +=
            Number(cart[product].price) *
            Number(cart[product].quantity);

    }


    // ==============================
    // CREATE ORDER ID
    // ==============================

    const orderID =
        "MH" + Date.now();


    // ==============================
    // CREATE ORDER
    // ==============================

    const order = {

        orderID:
            orderID,

        customerName:
            name,

        phone:
            phone,

        address:
            address,

        payment:
            "Cash On Delivery",

        products:
            cart,

        total:
            total,

        transactionID:
            "",

        status:
            "Pending",

        date:
            new Date().toLocaleString()

    };


    // ==============================
    // CONFIRM ORDER
    // ==============================

    const confirmed =
        confirm(
            "Are you sure you want to place this order?"
        );


    if (!confirmed) {

        return;

    }


    try {

        // ==============================
        // SAVE TO FIRESTORE
        // ==============================

        await addDoc(
            collection(db, "orders"),
            order
        );
// ==============================
// ORDER SUCCESS POPUP
// ==============================

const successOverlay =
    document.createElement("div");

successOverlay.style.position = "fixed";
successOverlay.style.top = "0";
successOverlay.style.left = "0";
successOverlay.style.width = "100%";
successOverlay.style.height = "100%";
successOverlay.style.background = "rgba(0,0,0,0.75)";
successOverlay.style.display = "flex";
successOverlay.style.alignItems = "center";
successOverlay.style.justifyContent = "center";
successOverlay.style.zIndex = "999999";
successOverlay.style.padding = "20px";
successOverlay.style.boxSizing = "border-box";


const successPopup =
    document.createElement("div");

successPopup.style.background = "#ffffff";
successPopup.style.color = "#111111";
successPopup.style.width = "100%";
successPopup.style.maxWidth = "450px";
successPopup.style.padding = "30px";
successPopup.style.borderRadius = "20px";
successPopup.style.textAlign = "center";
successPopup.style.boxSizing = "border-box";


successPopup.innerHTML =

    "<h2>🎉 Order Placed Successfully!</h2>" +

    "<p>Thank you for ordering from MH CUBES.</p>" +

    "<h3>Your Order ID</h3>" +

    "<div style='display:flex;gap:8px;margin:15px 0;'>" +

        "<input " +
            "id='success-order-id' " +
            "type='text' " +
            "value='" + order.orderID + "' " +
            "readonly " +
            "style='flex:1;padding:12px;border:1px solid #ccc;border-radius:8px;font-weight:bold;'>" +

        "<button " +
            "id='copy-order-id' " +
            "type='button' " +
            "style='padding:12px 15px;background:#111;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;'>" +

            "📋 Copy" +

        "</button>" +

    "</div>" +

    "<p style='font-size:14px;color:#666;'>" +
        "📌 Save your Order ID to track your order later." +
    "</p>" +

    "<button " +
        "id='continue-shopping' " +
        "type='button' " +
        "style='width:100%;padding:14px;background:#ff2020;color:white;border:none;border-radius:10px;font-weight:bold;font-size:16px;cursor:pointer;'>" +

        "Continue Shopping" +

    "</button>";


successOverlay.appendChild(successPopup);

document.body.appendChild(successOverlay);


// ==============================
// COPY ORDER ID
// ==============================

const copyOrderButton =
    document.getElementById("copy-order-id");


copyOrderButton.addEventListener(
    "click",
    async function () {

        const orderId =
            order.orderID;

        try {

            await navigator.clipboard.writeText(
                orderId
            );

            copyOrderButton.textContent =
                "✅ Copied!";

            setTimeout(function () {

                copyOrderButton.textContent =
                    "📋 Copy";

            }, 2000);

        } catch (error) {

            const input =
                document.getElementById(
                    "success-order-id"
                );

            input.select();

            input.setSelectionRange(
                0,
                99999
            );

            document.execCommand("copy");

            copyOrderButton.textContent =
                "✅ Copied!";

            setTimeout(function () {

                copyOrderButton.textContent =
                    "📋 Copy";

            }, 2000);

        }

    }
);


// ==============================
// CONTINUE SHOPPING
// ==============================

const continueButton =
    document.getElementById(
        "continue-shopping"
    );


continueButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "index.html";

    }
);


// ==============================
// CLEAR CART
// ==============================

localStorage.removeItem("cart");

localStorage.removeItem(
    "transactionID"
);


// ==============================
// ERROR HANDLING
// ==============================

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


// ==============================
// CLICK OUTSIDE PAYMENT POPUP
// ==============================

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


// ==============================
// MAKE FUNCTIONS AVAILABLE
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
// START CHECKOUT
// ==============================

loadCheckout();
