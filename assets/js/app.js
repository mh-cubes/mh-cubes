import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// =========================================
// DOM LOADED
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // LOAD SAVED THEME
    // =========================================

    const savedTheme =
        localStorage.getItem("theme");

    const darkModeButton =
        document.getElementById("darkModeBtn");


    if (savedTheme === "dark") {

        document.body.classList.add("dark-mode");

        if (darkModeButton) {
            darkModeButton.innerHTML =
                "☀️ Light Mode";
        }

    } else {

        document.body.classList.remove("dark-mode");

        if (darkModeButton) {
            darkModeButton.innerHTML =
                "🌙 Dark Mode";
        }

    }


    // =========================================
    // CART SYSTEM
    // =========================================

    let cart =
        JSON.parse(localStorage.getItem("cart")) || {};


    document
        .querySelectorAll(".cart-btn")
        .forEach((button) => {

            button.addEventListener("click", () => {

                let name = "";
                let price = 0;
                let image = "";


                // PRODUCT DETAIL PAGE

                if (button.dataset.name) {

                    name =
                        button.dataset.name;

                    price =
                        Number(button.dataset.price);

                    image =
                        button.dataset.image || "";

                }


                // HOMEPAGE PRODUCT CARD

                else {

                    const productBox =
                        button.closest(".product");

                    if (!productBox) return;


                    const nameElement =
                        productBox.querySelector("h3");

                    const priceElement =
                        productBox.querySelector("p");

                    const imageElement =
                        productBox.querySelector("img");


                    name =
                        nameElement
                            ?.innerText
                            .trim();


                    price =
                        Number(
                            priceElement
                                ?.innerText
                                .replace(/[^0-9]/g, "")
                        );


                    image =
                        imageElement
                            ?.getAttribute("src") || "";

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


                // ADD PRODUCT

                if (cart[name]) {

                    cart[name].quantity =
                        Number(cart[name].quantity) + 1;

                } else {

                    cart[name] = {

                        price: price,

                        quantity: 1,

                        image: image

                    };

                }


                // SAVE CART

                localStorage.setItem(
                    "cart",
                    JSON.stringify(cart)
                );


                // UPDATE CART COUNT

                updateCartCount();


                // SHOW TOAST

                showCartToast(
                    `${name} added to cart 🛒`
                );

            });

        });


    // =========================================
    // SHOP NOW BUTTON
    // =========================================

    document
        .querySelectorAll(".shop-btn")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const productBox =
                    button.closest(".product");

                if (!productBox) return;


                const name =
                    productBox
                        .querySelector("h3")
                        ?.innerText
                        .trim();


                const price =
                    Number(
                        productBox
                            .querySelector("p")
                            ?.innerText
                            .replace(/[^0-9]/g, "")
                    );


                const image =
                    productBox
                        .querySelector("img")
                        ?.getAttribute("src") || "";


                if (!name || !price) {

                    console.error(
                        "Shop Now product information missing."
                    );

                    return;

                }


                let currentCart =
                    JSON.parse(
                        localStorage.getItem("cart")
                    ) || {};


                if (currentCart[name]) {

                    currentCart[name].quantity =
                        Number(
                            currentCart[name].quantity
                        ) + 1;

                } else {

                    currentCart[name] = {

                        price: price,

                        quantity: 1,

                        image: image

                    };

                }


                localStorage.setItem(
                    "cart",
                    JSON.stringify(currentCart)
                );


                updateCartCount();


                // SHOP LOADING

                const loading =
                    document.getElementById(
                        "shop-loading"
                    );


                if (loading) {

                    loading.classList.add("show");

                }


                setTimeout(() => {

                    window.location.href =
                        "checkout.html";

                }, 1500);

            });

        });


    // =========================================
    // INITIAL CART COUNT
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
            () => {

                const searchText =
                    searchInput.value
                        .toLowerCase()
                        .trim();


                products.forEach((product) => {

                    const productName =
                        product.innerText
                            .toLowerCase();


                    if (
                        productName.includes(
                            searchText
                        )
                    ) {

                        product.style.display =
                            "";

                    } else {

                        product.style.display =
                            "none";

                    }

                });

            }
        );

    }


    // =========================================
    // CONTACT POPUP CLOSE BUTTON
    // =========================================

    const contactPopup =
        document.getElementById(
            "contact-popup"
        );


    if (contactPopup) {

        const closeButton =
            contactPopup.querySelector(
                ".close-contact"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeContactPopup
            );

        }


        // CLOSE WHEN CLICKING OUTSIDE THE BOX

        contactPopup.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    contactPopup
                ) {

                    closeContactPopup();

                }

            }
        );

    }


    // =========================================
    // ESC KEY CLOSES CONTACT POPUP
    // =========================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                const popup =
                    document.getElementById(
                        "contact-popup"
                    );


                if (
                    popup &&
                    popup.classList.contains("show")
                ) {

                    closeContactPopup();

                }

            }

        }
    );

});


// =========================================
// UPDATE CART COUNT
// =========================================

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || {};


    let count = 0;


    for (const product in cart) {

        count +=
            Number(
                cart[product].quantity
            ) || 0;

    }


    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (cartCount) {

        cartCount.innerText =
            count;

    }

}


// =========================================
// CART SUCCESS TOAST
// =========================================

function showCartToast(message) {

    let toast =
        document.getElementById("toast");


    // CREATE TOAST IF IT DOESN'T EXIST

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "toast";

        document.body.appendChild(toast);

    }


    // FIXED TOAST HTML

    toast.innerHTML = `
        <span class="toast-icon">✓</span>
        <span>${message}</span>
    `;


    toast.classList.remove("show");


    // RESTART ANIMATION

    void toast.offsetWidth;


    toast.classList.add("show");


    clearTimeout(
        window.cartToastTimer
    );


    window.cartToastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}


// =========================================
// SCROLL TO PRODUCTS
// =========================================

function scrollToProducts() {

    const products =
        document.querySelector(
            ".products"
        );


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
        document.getElementById(
            "why-details"
        );


    if (!details) return;


    // REMOVE ACTIVE FROM ALL CARDS

    document
        .querySelectorAll(".why-box")
        .forEach((card) => {

            card.classList.remove(
                "active"
            );

        });


    // ACTIVE CARD

    if (element) {

        element.classList.add(
            "active"
        );

    }


    // RESTART ANIMATION

    details.style.animation =
        "none";

    void details.offsetWidth;

    details.style.animation =
        "detailsAppear 0.45s ease";


    // =========================================
    // DELIVERY
    // =========================================

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


    // =========================================
    // ORIGINAL
    // =========================================

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


    // =========================================
    // PRICE
    // =========================================

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


    // =========================================
    // TRUSTED
    // =========================================

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
        document.getElementById(
            "contact-popup"
        );


    if (!popup) return;


    popup.classList.remove(
        "closing"
    );


    popup.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


function closeContactPopup() {

    const popup =
        document.getElementById(
            "contact-popup"
        );


    if (!popup) return;


    popup.classList.add(
        "closing"
    );


    setTimeout(() => {

        popup.classList.remove(
            "show"
        );

        popup.classList.remove(
            "closing"
        );

        document.body.style.overflow =
            "";

    }, 300);

}


// =========================================
// DARK MODE
// =========================================

function toggleDarkMode() {

    const button =
        document.getElementById(
            "darkModeBtn"
        );


    document.body.classList.toggle(
        "dark-mode"
    );


    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );


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
        document.getElementById(
            "main-nav"
        );


    const menuButton =
        document.getElementById(
            "menu-btn"
        );


    if (!nav || !menuButton) return;


    nav.classList.toggle(
        "mobile-open"
    );


    if (
        nav.classList.contains(
            "mobile-open"
        )
    ) {

        menuButton.innerText =
            "✕";

    } else {

        menuButton.innerText =
            "☰";

    }

}


// =========================================
// MAKE FUNCTIONS AVAILABLE TO HTML
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

onAuthStateChanged(
    auth,
    (user) => {

        const authLink =
            document.getElementById(
                "auth-link"
            );


        if (!authLink) return;


        if (user) {

            console.log(
                "✅ Customer logged in:",
                user.email
            );


            authLink.innerHTML =
                "👤 My Account";


            authLink.href =
                "customer-account.html";

        } else {

            console.log(
                "❌ Customer is not logged in"
            );


            authLink.innerHTML =
                "👤 Sign In";


            authLink.href =
                "customer-login.html";

        }

    }
);


// =========================================
// SMOOTH NAVIGATION ANIMATION
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll('a[href^="#"]')
            .forEach((link) => {

                link.addEventListener(
                    "click",
                    function(event) {

                        const targetID =
                            this.getAttribute(
                                "href"
                            );


                        if (
                            !targetID ||
                            targetID === "#"
                        ) {

                            return;

                        }


                        // Don't interfere with Contact popup

                        if (
                            this.getAttribute(
                                "onclick"
                            )?.includes(
                                "openContactPopup"
                            )
                        ) {

                            return;

                        }


                        const target =
                            document.querySelector(
                                targetID
                            );


                        if (!target) return;


                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });


                        target.classList.remove(
                            "nav-click-animation"
                        );


                        void target.offsetWidth;


                        target.classList.add(
                            "nav-click-animation"
                        );

                    }
                );

            });

    }
);
