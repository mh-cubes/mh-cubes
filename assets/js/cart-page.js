let cart = JSON.parse(localStorage.getItem("cart")) || {};

function loadCart(){

    let cartItems = document.getElementById("cart-items");

    cartItems.innerHTML = "";

    let total = 0;

    for(let product in cart){

        let item = document.createElement("div");

        item.innerHTML = `
            <img src="${cart[product].image}" width="80">

            <h3>${product}</h3>

            <p>PKR ${cart[product].price}</p>

            <button onclick="decrease('${product}')">−</button>

            <span>${cart[product].quantity}</span>

            <button onclick="increase('${product}')">+</button>

            <button onclick="removeItem('${product}')">❌</button>

            <hr>
        `;

        cartItems.appendChild(item);

        total += cart[product].price * cart[product].quantity;
    }


    let summaryTotal = document.getElementById("summary-total");

    if(summaryTotal){
        summaryTotal.innerText = "Total: PKR " + total;
    }

}


function increase(product){

    cart[product].quantity++;

    saveCart();

}


function decrease(product){

    cart[product].quantity--;

    if(cart[product].quantity <= 0){
        delete cart[product];
    }

    saveCart();

}


function removeItem(product){

    delete cart[product];

    saveCart();

}


function saveCart(){

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();

}


loadCart();