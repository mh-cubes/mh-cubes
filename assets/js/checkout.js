import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
let cart = JSON.parse(localStorage.getItem("cart")) || {};

let phoneInput = document.getElementById("customer-phone");
let phoneMessage = document.getElementById("phone-message");

// ------------------------------
// Phone Validation
// ------------------------------

phoneInput.addEventListener("input", function(){

    let phone = phoneInput.value.trim();

    if(phone === ""){

        phoneMessage.innerText = "";

        phoneInput.classList.remove("phone-valid","phone-invalid");

        return;

    }

    if(/^03\d{9}$/.test(phone)){

        phoneMessage.innerText = "✅ Valid Pakistani phone number";

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

// ------------------------------
// Checkout Items
// ------------------------------

function loadCheckout(){

    let box = document.getElementById("checkout-items");

    box.innerHTML = "";

    for(let product in cart){

        box.innerHTML += `

        <div class="checkout-product">

            <h3>${product}</h3>

            <p>PKR ${cart[product].price}</p>

            <button onclick="decreaseQty('${product}')">−</button>

            <span>${cart[product].quantity}</span>

            <button onclick="increaseQty('${product}')">+</button>

        </div>

        `;

    }

    updateTotal();

}

// ------------------------------
// Quantity Controls
// ------------------------------

function increaseQty(product){

    cart[product].quantity++;

    saveCheckout();

}

function decreaseQty(product){

    cart[product].quantity--;

    if(cart[product].quantity <= 0){

        delete cart[product];

    }

    saveCheckout();

}

function saveCheckout(){

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCheckout();

}

// ------------------------------
// Total Price
// ------------------------------

function updateTotal(){

    let total = 0;

    for(let product in cart){

        total += cart[product].price * cart[product].quantity;

    }

    document.getElementById("checkout-total").innerText =
    "Total: PKR " + total;

}
// ------------------------------
// Place Order
// ------------------------------

async function placeOrder(){

    let name = document.getElementById("customer-name").value.trim();

    let phone = document.getElementById("customer-phone").value.trim();

    let address = document.getElementById("customer-address").value.trim();

    let payment = document.querySelector('input[name="payment"]:checked');

    if(payment){

        payment = payment.value;

    }else{

        payment = "";

    }

    if(name === "" || phone === "" || address === "" || payment === ""){

        alert("Please fill all details and select a payment method.");

        return;

    }

    if(!/^03\d{9}$/.test(phone)){

        alert("Please enter a valid Pakistani phone number.");

        return;

    }

    // Save customer details

    localStorage.setItem("customerName",name);

    localStorage.setItem("customerPhone",phone);

    localStorage.setItem("customerAddress",address);

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    // Maximum 100 active orders

    if(orders.length >= 100){

        alert("Sorry! We are currently at maximum order capacity (100 active orders). Please try again later.");

        return;

    }

    let order={
orderID: "MH" + Date.now(),
        customerName:name,

        phone:phone,

        address:address,

        payment:payment,

        products:cart,

        transactionID:
        localStorage.getItem("transactionID") || "",

        status:"Pending",

        date:new Date().toLocaleString()

    };

    let confirmOrder=confirm("Are you sure you want to place this order?");

    if(!confirmOrder){

        return;

    }

    await addDoc(collection(db, "orders"), order);

    alert(
"🎉 Order placed successfully!\n\nYour Order ID:\n" +
order.orderID +
"\n\nPlease save this Order ID. You will need it to track your order."
);

    localStorage.removeItem("cart");

    localStorage.removeItem("transactionID");

    window.location.href="index.html";

}

// ------------------------------
// Load Saved Customer Details
// ------------------------------

document.getElementById("customer-name").value=
localStorage.getItem("customerName") || "";

document.getElementById("customer-phone").value=
localStorage.getItem("customerPhone") || "";

document.getElementById("customer-address").value=
localStorage.getItem("customerAddress") || "";

loadCheckout();

// ------------------------------
// Payment Selection
// ------------------------------

let paymentOptions=document.querySelectorAll('input[name="payment"]');

paymentOptions.forEach(function(option){

    option.addEventListener("change",function(){

        let method=this.value;

        if(method==="EasyPaisa" || method==="JazzCash"){

            openPaymentPopup(method);

        }

    });

});
// ------------------------------
// Payment Popup
// ------------------------------

function openPaymentPopup(method){

    let loading = document.getElementById("payment-loading");

    let popup = document.getElementById("payment-popup");

    let title = document.getElementById("payment-title");

    let message = document.getElementById("payment-message");

    let number = document.getElementById("payment-number");

    let name = document.getElementById("payment-name");

    loading.style.display = "flex";

    setTimeout(function(){

        loading.style.display = "none";

        popup.style.display = "flex";

        if(method === "EasyPaisa"){

            title.innerHTML = "🟢 EasyPaisa Payment";

            message.innerHTML =
            "⚠️ <b>IMPORTANT!</b><br><br>EasyPaisa payments are manual.<br>Please send the payment first, then enter your Transaction ID below.<br><br>We will confirm your order after we receive your payment.";

            number.innerHTML = "03XXXXXXXXX";

            name.innerHTML = "Account Name: MH CUBES";

        }else{

            title.innerHTML = "🔴 JazzCash Payment";

            message.innerHTML =
            "⚠️ <b>IMPORTANT!</b><br><br>JazzCash payments are manual.<br>Please send the payment first, then enter your Transaction ID below.<br><br>We will confirm your order after we receive your payment.";

            number.innerHTML = "03XXXXXXXXX";

            name.innerHTML = "Account Name: MH CUBES";

        }

    },1200);

}

// ------------------------------
// Close Popup
// ------------------------------

function closePaymentPopup(){

    document.getElementById("payment-popup").style.display = "none";

    document.getElementById("transaction-id").value = "";

}

// ------------------------------
// Confirm Payment
// ------------------------------

function confirmPayment(){

    let id = document.getElementById("transaction-id").value.trim();

    if(id === ""){

        alert("⚠️ Please enter your Transaction ID.");

        return;

    }

    localStorage.setItem("transactionID", id);

    alert("✅ Payment details received.\n\nWe will confirm the order after the payment is received.");

    closePaymentPopup();

}

// ------------------------------
// Close Popup When Clicking Outside
// ------------------------------

window.onclick = function(event){

    let popup = document.getElementById("payment-popup");

    if(event.target === popup){

        closePaymentPopup();

    }

}
