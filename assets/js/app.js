document.addEventListener("DOMContentLoaded", () => {

    // LOAD DARK MODE
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

let button = document.getElementById("darkModeBtn");

if(button && savedTheme === "dark"){
    button.innerHTML = "☀️ Light Mode";
}
    // CART SYSTEM
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

            if(toast){
                toast.innerText = name + " added to cart 🛒";

                toast.classList.add("show");

                setTimeout(function(){
                    toast.classList.remove("show");
                },3000);
            }

        });

    });



    // SHOP BUTTON
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

            if(loading){
                loading.classList.add("show");
            }


            setTimeout(function(){
                window.location.href = "checkout.html";
            },1500);


        });

    });



    updateCartCount();

});





// CART COUNT
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





// SCROLL TO PRODUCTS
function scrollToProducts(){

    document.querySelector(".products").scrollIntoView({
        behavior:"smooth"
    });

}





// WHY MH CUBES SECTION
function showWhy(type, element){

const details = document.getElementById("why-details");


document.querySelectorAll(".why-box").forEach(card=>{
    card.classList.remove("active");
});


element.classList.add("active");


switch(type){

case "delivery":

details.innerHTML=`

<h3>🚚 Fast Delivery</h3>

<p>Fast and reliable delivery throughout Islamabad.</p>

<ul>
<li>✅ Delivery in 2–5 business days</li>
<li>✅ Safe packaging</li>
<li>✅ Cash on Delivery available</li>
</ul>

`;

break;



case "original":

details.innerHTML=`

<h3>💯 100% Original Cubes</h3>

<p>Only genuine speed cubes from trusted brands.</p>

<ul>
<li>✅ Original products</li>
<li>✅ High quality</li>
<li>✅ Smooth performance</li>
</ul>

`;

break;



case "price":

details.innerHTML=`

<h3>💰 Best Prices</h3>

<p>Premium cubes at affordable prices.</p>

<ul>
<li>✅ Competitive prices</li>
<li>✅ Great value</li>
<li>✅ Special offers</li>
</ul>

`;

break;



case "trusted":

details.innerHTML=`

<h3>⭐ Trusted by Cubers</h3>

<p>MH CUBES is trusted for quality and service.</p>

<ul>
<li>✅ Customer support</li>
<li>✅ Quality products</li>
<li>✅ Happy customers</li>
</ul>

`;

break;

}


}





// CONTACT POPUP

function openContactPopup(){

    document.getElementById("contact-popup").style.display="flex";

}



function closeContactPopup(){

let popup=document.getElementById("contact-popup");


popup.classList.add("closing");


setTimeout(function(){

popup.style.display="none";

popup.classList.remove("closing");


},300);

}





// DARK MODE BUTTON

function toggleDarkMode(){

    let loading = document.getElementById("shop-loading");

    if(loading){
        loading.classList.add("show");
    }


    setTimeout(function(){

        document.body.classList.toggle("dark-mode");


        let button = document.getElementById("darkModeBtn");


        if(document.body.classList.contains("dark-mode")){

            localStorage.setItem("theme","dark");

            if(button){
                button.innerHTML = "☀️ Light Mode";
            }

        }
        else{

            localStorage.setItem("theme","light");

            if(button){
                button.innerHTML = "🌙 Dark Mode";
            }

        }


        if(loading){
            loading.classList.remove("show");
        }


    },2000);

}