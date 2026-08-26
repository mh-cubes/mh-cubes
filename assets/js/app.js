import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// =========================================
// DOM LOADED
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // LOAD SAVED DARK MODE
    // =========================================

    const savedTheme =
        localStorage.getItem("theme");

    const button =
        document.getElementById("darkModeBtn");


    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        if (button) {
            button.innerHTML =
                "☀️ Light Mode";
        }

    } else {

        document.body.classList.remove("dark-mode");

        if (button) {
            button.innerHTML =
                "🌙 Dark Mode";
        }

    }


    // =========================================
    // CART SYSTEM
    // =========================================

    let cart =
        JSON.parse(localStorage.getItem("cart")) || {};


    document.querySelectorAll(".cart-btn").forEach(function(button) {

        button.addEventListener("click", function() {

            let name;
            let price;
            let image;


            // PRODUCT PAGE BUTTON

            if (button.dataset.name) {

                name = button.dataset.name;
                price = Number(button.dataset.price);
                image = button.dataset.image;

            }


            // HOMEPAGE PRODUCT CARD

            else {

                const productBox =
                    button.closest(".product");

                if (!productBox) return;


                name =
                    productBox
                        .querySelector("h3")
                        ?.innerText;


                price =
                    Number(
                        productBox
                            .querySelector("p")
                            ?.innerText
                            .replace("PKR ", "")
                    );


                image =
                    productBox
                        .querySelector("img")
                        ?.src;

            }


            // SAFETY CHECK

            if (!name || !price) {

                console.error(
                    "Product information missing:",
                    {
                        name,
                        price,
                        image
                    }
                );

                return;

            }


            // ADD TO CART

            if (cart[name]) {

                cart[name].quantity++;

            } else {

                cart[name] = {

                    price: price,

                    quantity: 1,

                    image: image || ""

                };

            }


            // SAVE CART

            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );


            updateCartCount();


            // TOAST

            const toast =
                document.getElementById("toast");


            if (toast) {

                toast.innerText =
                    name + " added to cart 🛒";

                toast.classList.add("show");


                setTimeout(function() {

                    toast.classList.remove("show");

                }, 3000);

            }

        });

    });


    // =========================================
    // SHOP NOW BUTTON
    // =========================================

    document.querySelectorAll(".shop-btn").forEach(function(button) {

        button.addEventListener("click", function() {

            const productBox =
                button.closest(".product");

            if (!productBox) return;


            const name =
                productBox
                    .querySelector("h3")
                    ?.innerText;


            const price =
                Number(
                    productBox
                        .querySelector("p")
                        ?.innerText
                        .replace("PKR ", "")
                );


            const image =
                productBox
                    .querySelector("img")
                    ?.src;


            if (!name || !price) return;


            let cart =
                JSON.parse(
                    localStorage.getItem("cart")
                ) || {};


            if (cart[name]) {

                cart[name].quantity++;

            } else {

                cart[name] = {

                    price: price,

                    quantity: 1,

                    image: image || ""

                };

            }


            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );


            const loading =
                document.getElementById("shop-loading");


            if (loading) {

                loading.classList.add("show");

            }


            setTimeout(function() {

                window.location.href =
                    "checkout.html";

            }, 1500);

        });

    });


    // =========================================
    // UPDATE CART COUNT
    // =========================================

    updateCartCount();


    // =========================================
    // PRODUCT SEARCH
    // =========================================

    const searchInput =
        document.getElementById("searchInput");


    const products =
        document.querySelectorAll(".product");


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function() {

                const searchText =
                    searchInput.value
                        .toLowerCase()
                        .trim();


                products.forEach(function(product) {

                    const productName =
                        product.innerText
                            .toLowerCase();


                    if (
                        productName.includes(
                            searchText
                        )
                    ) {

                        product.style.display = "";

                    } else {

                        product.style.display = "none";

                    }

                });

            }
        );

    }

});


// =========================================
// CART COUNT
// =========================================

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || {};


    let count = 0;


    for (const product in cart) {

        count +=
            Number(cart[product].quantity) || 0;

    }


    const cartCount =
        document.getElementById("cart-count");


    if (cartCount) {

        cartCount.innerText = count;

    }

}


// =========================================
// SCROLL TO PRODUCTS
// =========================================

function scrollToProducts() {

    const products =
        document.querySelector(".products");


    if (products) {

        products.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// =========================================
// WHY CHOOSE MH CUBES
// =========================================

function showWhy(type, element) {

    const details =
        document.getElementById("why-details");


    if (!details) return;


    document
        .querySelectorAll(".why-box")
        .forEach(card => {

            card.classList.remove("active");

        });


    if (element) {

        element.classList.add("active");

    }


    details.style.animation = "none";

    void details.offsetWidth;

    details.style.animation =
        "detailsAppear 0.45s ease";


    // DELIVERY

    if (type === "delivery") {

        details.innerHTML = `

            <div class="details-icon">
                🚚
            </div>

            <h3>
                Fast Delivery
            </h3>

            <p>
                We make sure your cube reaches you
                safely and quickly across Islamabad.
            </p>

            <ul>

                <li>
                    <span>🚀</span>
                    <strong>2–5 Days</strong>
                    <small>Fast delivery</small>
                </li>

                <li>
                    <span>📦</span>
                    <strong>Safe Packaging</strong>
                    <small>Protected during shipping</small>
                </li>

                <li>
                    <span>💵</span>
                    <strong>Cash on Delivery</strong>
                    <small>Easy payment option</small>
                </li>

            </ul>

        `;

    }


    // ORIGINAL

    else if (type === "original") {

        details.innerHTML = `

            <div class="details-icon">
                💯
            </div>

            <h3>
                100% Original Cubes
            </h3>

            <p>
                We focus on providing quality cubes
                that give you a smooth and enjoyable
                cubing experience.
            </p>

            <ul>

                <li>
                    <span>✅</span>
                    <strong>Original Products</strong>
                    <small>Trusted products</small>
                </li>

                <li>
                    <span>⚙️</span>
                    <strong>High Quality</strong>
                    <small>Built for performance</small>
                </li>

                <li>
                    <span>🧩</span>
                    <strong>Smooth Performance</strong>
                    <small>Great turning experience</small>
                </li>

            </ul>

        `;

    }


    // PRICE

    else if (type === "price") {

        details.innerHTML = `

            <div class="details-icon">
                💰
            </div>

            <h3>
                Best Prices
            </h3>

            <p>
                Get premium speed cubes at prices
                that give you excellent value for money.
            </p>

            <ul>

                <li>
                    <span>💸</span>
                    <strong>Affordable</strong>
                    <small>Great prices</small>
                </li>

                <li>
                    <span>🏆</span>
                    <strong>Great Value</strong>
                    <small>Quality for your money</small>
                </li>

                <li>
                    <span>🔥</span>
                    <strong>Special Offers</strong>
                    <small>More value for cubers</small>
                </li>

            </ul>

        `;

    }


    // TRUSTED

    else if (type === "trusted") {

        details.innerHTML = `

            <div class="details-icon">
                ⭐
            </div>

            <h3>
                Trusted by Cubers
            </h3>

            <p>
                MH CUBES is trusted for quality,
                service and a great shopping experience.
            </p>

            <ul>

                <li>
                    <span>💬</span>
                    <strong>Customer Support</strong>
                    <small>We're here to help</small>
                </li>

                <li>
                    <span>💎</span>
                    <strong>Quality Products</strong>
                    <small>Selected with care</small>
                </li>

                <li>
                    <span>😊</span>
                    <strong>Happy Customers</strong>
                    <small>Built for cubers</small>
                </li>

            </ul>

        `;

    }

}


// =========================================
// CONTACT POPUP
// =========================================

function openContactPopup() {

    const popup =
        document.getElementById("contact-popup");

    if (!popup) return;

    popup.classList.remove("closing");

    popup.classList.add("show");

    document.body.style.overflow = "hidden";
}


function closeContactPopup() {

    const popup =
        document.getElementById("contact-popup");

    if (!popup) return;

    popup.classList.add("closing");

    setTimeout(function() {

        popup.classList.remove("show");
        popup.classList.remove("closing");

        document.body.style.overflow = "";

    }, 300);

}

// =========================================
// DARK MODE
// =========================================

function toggleDarkMode() {

    const button =
        document.getElementById("darkModeBtn");

    document.body.classList.toggle("dark-mode");

    const isDark =
        document.body.classList.contains("dark-mode");


    // SAVE THEME

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );


    // CHANGE BUTTON TEXT

    if (button) {

        button.innerHTML =
            isDark
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";

    }

}

// =========================================
// MOBILE MENU
// =========================================

function toggleMobileMenu() {

    const nav =
        document.getElementById("main-nav");


    const menuBtn =
        document.getElementById("menu-btn");


    if (!nav || !menuBtn) return;


    nav.classList.toggle(
        "mobile-open"
    );


    if (
        nav.classList.contains(
            "mobile-open"
        )
    ) {

        menuBtn.innerText = "✕";

    } else {

        menuBtn.innerText = "☰";

    }

}


// =========================================
// MAKE INLINE FUNCTIONS AVAILABLE
// =========================================

window.scrollToProducts =
    scrollToProducts;

window.showWhy =
    showWhy;

window.openContactPopup =
    openContactPopup;

window.closeContactPopup =
    closeContactPopup;

window.toggleDarkMode =
    toggleDarkMode;

window.toggleMobileMenu =
    toggleMobileMenu;


// =========================================
// CUSTOMER AUTHENTICATION
// =========================================

onAuthStateChanged(auth, (user) => {

    const authLink = document.getElementById("auth-link");

    if (!authLink) return;

    if (user) {

        // User is logged in
        console.log("✅ Customer logged in:", user.email);

        authLink.innerHTML = "👤 My Account";
        authLink.href = "customer-account.html";

    } else {

        // User is NOT logged in
        console.log("❌ Customer is not logged in");

        authLink.innerHTML = "👤 Sign In";
        authLink.href = "customer-login.html";

    }

});

