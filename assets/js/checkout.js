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