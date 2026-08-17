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
// ORDER SUCCESS
// ==============================

const successBox =
    document.createElement("div");

successBox.style.position = "fixed";
successBox.style.inset = "0";
successBox.style.background = "rgba(0,0,0,0.75)";
successBox.style.display = "flex";
successBox.style.alignItems = "center";
successBox.style.justifyContent = "center";
successBox.style.zIndex = "99999";
successBox.style.padding = "20px";


const successCard =
    document.createElement("div");

successCard.style.background = "#ffffff";
successCard.style.color = "#111111";
successCard.style.padding = "30px";
successCard.style.borderRadius = "18px";
successCard.style.width = "100%";
successCard.style.maxWidth = "450px";
successCard.style.textAlign = "center";
successCard.style.boxShadow =
    "0 20px 60px rgba(0,0,0,0.3)";


const successTitle =
    document.createElement("h2");

successTitle.textContent =
    "🎉 Order Placed Successfully!";


const successMessage =
    document.createElement("p");

successMessage.textContent =
    "Thank you for ordering from MH CUBES!";


const orderLabel =
    document.createElement("p");

orderLabel.textContent =
    "Your Order ID:";


const orderIdBox =
    document.createElement("div");

orderIdBox.style.display = "flex";
orderIdBox.style.alignItems = "center";
orderIdBox.style.gap = "8px";
orderIdBox.style.margin = "15px 0";


const orderIdInput =
    document.createElement("input");

orderIdInput.type = "text";
orderIdInput.value = order.orderID;
orderIdInput.readOnly = true;

orderIdInput.style.flex = "1";
orderIdInput.style.padding = "12px";
orderIdInput.style.border = "1px solid #ccc";
orderIdInput.style.borderRadius = "8px";
orderIdInput.style.fontSize = "15px";
orderIdInput.style.fontWeight = "bold";


const copyButton =
    document.createElement("button");

copyButton.type = "button";
copyButton.textContent = "📋 Copy";

copyButton.style.padding = "12px 15px";
copyButton.style.border = "none";
copyButton.style.borderRadius = "8px";
copyButton.style.background = "#111111";
copyButton.style.color = "#ffffff";
copyButton.style.fontWeight = "bold";
copyButton.style.cursor = "pointer";


copyButton.addEventListener(
    "click",
    async function () {

        try {

            await navigator.clipboard.writeText(
                order.orderID
            );

            copyButton.textContent =
                "✅ Copied!";

            setTimeout(function () {

                copyButton.textContent =
                    "📋 Copy";

            }, 2000);

        } catch (error) {

            orderIdInput.select();

            document.execCommand("copy");

            copyButton.textContent =
                "✅ Copied!";

            setTimeout(function () {

                copyButton.textContent =
                    "📋 Copy";

            }, 2000);

        }

    }
);


orderIdBox.appendChild(orderIdInput);
orderIdBox.appendChild(copyButton);


const saveMessage =
    document.createElement("p");

saveMessage.textContent =
    "📌 Save this Order ID to track your order later.";

saveMessage.style.fontSize = "14px";
saveMessage.style.color = "#555555";


const continueButton =
    document.createElement("button");

continueButton.type = "button";
continueButton.textContent =
    "Continue Shopping";

continueButton.style.width = "100%";
continueButton.style.padding = "14px";
continueButton.style.border = "none";
continueButton.style.borderRadius = "10px";
continueButton.style.background = "#ff2020";
continueButton.style.color = "#ffffff";
continueButton.style.fontWeight = "bold";
continueButton.style.fontSize = "16px";
continueButton.style.cursor = "pointer";


continueButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "index.html";

    }
);


successCard.appendChild(successTitle);
successCard.appendChild(successMessage);
successCard.appendChild(orderLabel);
successCard.appendChild(orderIdBox);
successCard.appendChild(saveMessage);
successCard.appendChild(continueButton);

successBox.appendChild(successCard);

document.body.appendChild(successBox);


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
    
