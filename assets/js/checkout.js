let cart = JSON.parse(localStorage.getItem("cart")) || {};
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


function updateTotal(){





function placeOrder(){

    let name = document.getElementById("customer-name").value;

    let phone = document.getElementById("customer-phone").value;

    let address = document.getElementById("customer-address").value;


    if(name === "" || phone === "" || address === ""){

        alert("Please fill all details.");

        return;

    }


    let cart = JSON.parse(localStorage.getItem("cart")) || {};


    let order = {

        customerName: name,

        phone: phone,

        address: address,

        products: cart,

        date: new Date().toLocaleString()

    };


    localStorage.setItem(
        "order",
        JSON.stringify(order)
    );


    let confirmOrder = confirm(
        "Are you sure you want to place this order?"
    );


    if(confirmOrder){

        alert("Order placed successfully! 🎉");

        localStorage.removeItem("cart");

        window.location.href = "index.html";

    }

}