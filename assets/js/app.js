let cart = JSON.parse(localStorage.getItem("cart")) || {};

document.querySelectorAll(".cart-btn").forEach(function(button){

    button.addEventListener("click", function(){

        let productBox = button.closest(".product");

        let name = productBox.querySelector("h3").innerText;

        let price = Number(
            productBox.querySelector("p").innerText.replace("PKR ", "")
        );

        if(cart[name]){
            cart[name].quantity++;
        }
        else{
           cart[name] = {
    price: price,
    quantity: 1,
    image: productBox.querySelector("img").src
};
        }

        localStorage.setItem("cart", JSON.stringify(cart));
updateCartCount();
        let toast = document.getElementById("toast");

toast.innerText = name + " added to cart 🛒";

toast.classList.add("show");

setTimeout(function(){
    toast.classList.remove("show");
},3000);

        console.log(cart);

    });

});
function updateCartCount(){

    let cart = JSON.parse(localStorage.getItem("cart")) || {};

    let count = 0;

    for(let product in cart){
        count += cart[product].quantity;
    }

    let cartCount = document.getElementById("cart-count");

    if(cartCount){
        cartCount.innerText = count;
    }
}


updateCartCount();
document.querySelectorAll(".shop-btn").forEach(function(button){

    button.addEventListener("click", function(){

        let productBox = button.closest(".product");

        let name = productBox.querySelector("h3").innerText;

        let price = Number(
            productBox.querySelector("p").innerText.replace("PKR ", "")
        );

        let image = productBox.querySelector("img").src;


        let cart = JSON.parse(localStorage.getItem("cart")) || {};


        if(cart[name]){

            cart[name].quantity++;

        }
        else{

            cart[name] = {
                price: price,
                quantity: 1,
                image: image
            };

        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


       let loading = document.getElementById("shop-loading");

loading.classList.add("show");


setTimeout(function(){

    window.location.href = "checkout.html";

},1500);


    });

});
function scrollToProducts(){

    document.querySelector(".products").scrollIntoView({
        behavior: "smooth"
    });

}
function showWhy(type, element) {

    const details = document.getElementById("why-details");

    document.querySelectorAll(".why-box").forEach(card => {
        card.classList.remove("active");
    });

    element.classList.add("active");

    switch(type) {

        case "delivery":
            details.innerHTML = `
                <h3>🚚 Fast Delivery</h3>
                <p>Fast and reliable delivery throughout Islamabad.</p>
                <ul>
                    <li>✅ Delivery in 2–5 business days</li>
                    <li>✅ Safe & secure packaging</li>
                    <li>✅ Cash on Delivery available</li>
                </ul>
            `;
            break;

        case "original":
            details.innerHTML = `
                <h3>💯 100% Original Cubes</h3>
                <p>We sell only genuine speed cubes from trusted brands.</p>
                <ul>
                    <li>✅ Original products only</li>
                    <li>✅ High-quality materials</li>
                    <li>✅ Smooth and durable performance</li>
                </ul>
            `;
            break;

        case "price":
            details.innerHTML = `
                <h3>💰 Best Prices</h3>
                <p>Get premium speed cubes at affordable prices.</p>
                <ul>
                    <li>✅ Competitive prices</li>
                    <li>✅ Great value for money</li>
                    <li>✅ Regular special offers</li>
                </ul>
            `;
            break;

        case "trusted":
            details.innerHTML = `
                <h3>⭐ Trusted by Cubers</h3>
                <p>MH CUBES is trusted by cubers for quality and service.</p>
                <ul>
                    <li>✅ Excellent customer support</li>
                    <li>✅ Quality products</li>
                    <li>✅ Happy customers</li>
                </ul>
            `;
            break;
    }
}
function openContactPopup(){
    document.getElementById("contact-popup").style.display = "flex";
}

function closeContactPopup(){

    let popup = document.getElementById("contact-popup");

    popup.classList.add("closing");

    setTimeout(function(){
        popup.style.display = "none";
        popup.classList.remove("closing");
    },300);

}