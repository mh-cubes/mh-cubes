
import { db, auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const orderBox =
    document.getElementById("order-box");

const accountActions =
    document.getElementById("account-actions");

const logoutButton =
    document.getElementById("logout-button");


// =========================================
// LOAD CUSTOMER ORDERS
// =========================================

async function loadCustomerOrders(user) {

    if (!orderBox) {
        return;
    }


    orderBox.innerHTML = `

        <div class="order-loading">

            <div class="loader"></div>

            <h3>
                🔄 Loading your orders...
            </h3>

        </div>

    `;


    try {

        const ordersQuery = query(

            collection(db, "orders"),

            where(
                "customerUID",
                "==",
                user.uid
            )

        );


        const snapshot =
            await getDocs(ordersQuery);


        const orders = [];


        snapshot.forEach(function(docSnap) {

            orders.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });


        // =====================================
        // NEWEST ORDERS FIRST
        // =====================================

        orders.sort(function(a, b) {

            return Number(
                b.createdAt || 0
            ) - Number(
                a.createdAt || 0
            );

        });


        // =====================================
        // NO ORDERS
        // =====================================

        if (orders.length === 0) {

            orderBox.innerHTML = `

                <div class="orders-message">

                    <div class="message-icon">
                        📦
                    </div>

                    <h2>
                        No Orders Yet
                    </h2>

                    <p>
                        You haven't placed any orders
                        with this account yet.
                    </p>

                </div>

            `;

            return;

        }


        // =====================================
        // CLEAR ORDER BOX
        // =====================================

        orderBox.innerHTML = "";


        // =====================================
        // DISPLAY ORDERS
        // =====================================

        orders.forEach(function(order) {

            const card =
                document.createElement("div");


            card.className =
                "customer-order-card";


           // =================================
// PRODUCTS
// =================================

let productsHTML = "";

let calculatedTotal = 0;


Object.keys(
    order.products || {}
).forEach(function(productName) {

    const item =
        order.products[productName];


    const price =
        Number(item.price) || 0;


    const quantity =
        Number(item.quantity) || 0;


    const subtotal =
        price * quantity;


    calculatedTotal +=
        subtotal;


    // PRODUCT IMAGE

    const productImage =
        item.image ||
        item.img ||
        "assets/images/placeholder.png";


    productsHTML += `

        <div class="my-order-product-item">

            <div class="my-order-product-image">

                <img
                    src="${productImage}"
                    alt="${productName}"
                    onerror="this.style.display='none';"
                >

            </div>


            <div class="my-order-product-info">

                <strong>
                    🧩 ${productName}
                </strong>

                <span>
                    PKR ${price.toLocaleString()}
                    × ${quantity}
                </span>

            </div>

        </div>

    `;

});

            // =================================
            // STATUS
            // =================================

            const status =
                order.status ||
                "Pending 🟡";


            // =================================
            // TOTAL
            // =================================

            const total =
                Number(order.total) ||
                calculatedTotal;


            // =================================
            // TRACK LINK
            // =================================

            const orderID =
                order.orderID || "";


            const trackURL =
                "track-order.html?orderID=" +
                encodeURIComponent(orderID);


            // =================================
            // ORDER CARD
            // =================================

            card.innerHTML = `

                <div class="order-card-header">

                    <h2>
                        📦
                        ${orderID || "Order"}
                    </h2>


                    <span class="order-status">

                        ${status}

                    </span>

                </div>


                <!-- ORDER DETAILS -->

                <div class="order-details">

                    <p>

                        <strong>
                            👤 Name
                        </strong>

                        <br>

                        ${order.customerName ||
                        "Not available"}

                    </p>


                    <p>

                        <strong>
                            📱 Phone
                        </strong>

                        <br>

                        ${order.phone ||
                        "Not available"}

                    </p>


                    <p>

                        <strong>
                            📍 Address
                        </strong>

                        <br>

                        ${order.address ||
                        "Not available"}

                    </p>


                    <p>

                        <strong>
                            💳 Payment
                        </strong>

                        <br>

                        ${order.payment ||
                        "Not selected"}

                    </p>


                    <p>

                        <strong>
                            📅 Date
                        </strong>

                        <br>

                        ${order.date ||
                        "Not available"}

                    </p>

                </div>


                <!-- PRODUCTS -->

                <h3>
                    🧩 Products Ordered
                </h3>


                <div class="my-order-products">

                    ${productsHTML}

                </div>


                <!-- TOTAL -->

                <div class="order-total">

                    <strong>
                        💰 Total
                    </strong>


                    <strong>
                        PKR ${total.toLocaleString()}
                    </strong>

                </div>


                <!-- NOTIFICATION -->

                ${
                    order.notification
                    ?
                    `

                    <div class="order-notification">

                        🔔
                        ${order.notification}

                    </div>

                    `
                    :
                    ""
                }


                <!-- TRACK ORDER -->

                <a
                    href="${trackURL}"
                    class="track-order-btn"
                >

                    🔍 Track This Order

                </a>

            `;


            orderBox.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Error loading customer orders:",
            error
        );


        orderBox.innerHTML = `

            <div class="orders-message">

                <div class="message-icon">
                    ❌
                </div>

                <h2>
                    Failed to Load Orders
                </h2>

                <p>
                    Something went wrong while
                    loading your orders.
                </p>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


// =========================================
// AUTHENTICATION
// =========================================

onAuthStateChanged(
    auth,
    function(user) {

        // =================================
        // NOT LOGGED IN
        // =================================

        if (!user) {

            if (
                sessionStorage.getItem("loggingOut")
                === "true"
            ) {

                return;

            }


            window.location.href =
                "customer-login.html";

            return;

        }


        // =================================
        // LOGGED IN
        // =================================

        if (accountActions) {

            accountActions.style.display =
                "flex";

        }


        loadCustomerOrders(user);

    }
);


// =========================================
// LOGOUT
// =========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            try {

                logoutButton.disabled = true;


                logoutButton.innerText =
                    "⏳ Logging out...";


                sessionStorage.setItem(
                    "loggingOut",
                    "true"
                );


                // =================================
                // REDIRECT AFTER 5 SECONDS
                // =================================

                setTimeout(function() {

                    sessionStorage.removeItem(
                        "loggingOut"
                    );


                    window.location.href =
                        "https://mh-cubes.pages.dev/";

                }, 5000);


                // =================================
                // SIGN OUT
                // =================================

                await signOut(auth);


                if (accountActions) {

                    accountActions.style.display =
                        "none";

                }


                // =================================
                // SUCCESS MESSAGE
                // =================================

                orderBox.innerHTML = `

                    <div class="orders-message">

                        <div class="message-icon">
                            ✅
                        </div>


                        <h2>
                            Logged Out Successfully!
                        </h2>


                        <p>
                            Redirecting to MH CUBES...
                        </p>


                        <p>
                            ⏳ Please wait 5 seconds
                        </p>

                    </div>

                `;


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                sessionStorage.removeItem(
                    "loggingOut"
                );


                logoutButton.disabled =
                    false;


                logoutButton.innerText =
                    "🚪 Logout";


                orderBox.innerHTML = `

                    <div class="orders-message">

                        <div class="message-icon">
                            ❌
                        </div>


                        <h2>
                            Failed to Logout
                        </h2>


                        <p>
                            Please try again.
                        </p>

                    </div>

                `;

            }

        }
    );

}

