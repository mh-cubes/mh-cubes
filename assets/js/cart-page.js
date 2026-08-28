
let cart = JSON.parse(localStorage.getItem("cart")) || {};

function loadCart() {

    const cartItems = document.getElementById("cart-items");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    let subtotal = 0;

    const products = Object.keys(cart);

    if (products.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some cubes and come back here!
                </p>

                <a href="index.html">
                    Start Shopping
                </a>

            </div>
        `;

        updateSummary(0);

        return;
    }


    products.forEach((product) => {

        const item = document.createElement("div");

        item.className = "cart-product";

        item.innerHTML = `

            <img
                src="${cart[product].image}"
                class="cart-image"
                alt="${product}"
            >

            <div class="cart-info">

                <h3>
                    ${product}
                </h3>

                <p>
                    PKR ${cart[product].price}
                </p>

            </div>

            <div class="cart-controls">

                <button
                    class="quantity-btn"
                    onclick="decrease('${product}')"
                    aria-label="Decrease quantity"
                >
                    −
                </button>

                <span class="quantity-number">
                    ${cart[product].quantity}
                </span>

                <button
                    class="quantity-btn"
                    onclick="increase('${product}')"
                    aria-label="Increase quantity"
                >
                    +
                </button>

                <button
                    class="remove-cart-btn"
                    onclick="removeItem('${product}')"
                    title="Remove item"
                    aria-label="Remove item"
                >
                    🗑️
                </button>

            </div>
        `;

        cartItems.appendChild(item);


        subtotal +=
            Number(cart[product].price) *
            Number(cart[product].quantity);

    });


    updateSummary(subtotal);
}


/* =========================================================
   ORDER SUMMARY
========================================================= */

function updateSummary(subtotal) {

    const summaryTotal =
        document.getElementById("summary-total");

    const subtotalElement =
        document.getElementById("cart-subtotal");

    const deliveryElement =
        document.getElementById("cart-delivery");

    const finalTotalElement =
        document.getElementById("cart-final-total");


    /*
       Delivery is calculated later during checkout.
       Cart page shows it as "Calculated at checkout".
    */

    if (subtotalElement) {

        subtotalElement.textContent =
            "PKR " + subtotal;
    }


    if (deliveryElement) {

        deliveryElement.textContent =
            "Calculated at checkout";
    }


    if (finalTotalElement) {

        finalTotalElement.textContent =
            "PKR " + subtotal;
    }


    /*
       Keeps compatibility with your
       existing summary-total element.
    */

    if (summaryTotal) {

        summaryTotal.innerText =
            "Total: PKR " + subtotal;
    }
}


/* =========================================================
   INCREASE
========================================================= */

function increase(product) {

    if (!cart[product]) return;

    cart[product].quantity++;

    saveCart();

    animateQuantity(
        product,
        "increase"
    );
}


/* =========================================================
   DECREASE
========================================================= */

function decrease(product) {

    if (!cart[product]) return;

    cart[product].quantity--;

    if (cart[product].quantity <= 0) {

        delete cart[product];

        saveCart();

        return;
    }

    saveCart();

    animateQuantity(
        product,
        "decrease"
    );
}


/* =========================================================
   REMOVE
========================================================= */

function removeItem(product) {

    if (!cart[product]) return;

    const cards =
        document.querySelectorAll(
            ".cart-product"
        );

    let selectedCard = null;


    cards.forEach((card) => {

        const title =
            card.querySelector(
                ".cart-info h3"
            );

        if (
            title &&
            title.textContent.trim() === product
        ) {

            selectedCard = card;
        }

    });


    if (selectedCard) {

        selectedCard.classList.add(
            "cart-item-removing"
        );


        setTimeout(() => {

            delete cart[product];

            saveCart();

        }, 300);


        return;
    }


    delete cart[product];

    saveCart();
}


/* =========================================================
   QUANTITY ANIMATION
========================================================= */

function animateQuantity(
    product,
    type
) {

    const cards =
        document.querySelectorAll(
            ".cart-product"
        );


    cards.forEach((card) => {

        const title =
            card.querySelector(
                ".cart-info h3"
            );


        if (
            title &&
            title.textContent.trim() === product
        ) {

            const number =
                card.querySelector(
                    ".quantity-number"
                );


            if (!number) return;


            number.classList.remove(
                "quantity-increase",
                "quantity-decrease"
            );


            void number.offsetWidth;


            number.classList.add(
                type === "increase"
                    ? "quantity-increase"
                    : "quantity-decrease"
            );

        }

    });
}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    loadCart();
}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadCart();

