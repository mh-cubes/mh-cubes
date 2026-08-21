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

        <div style="
            text-align:center;
            padding:30px;
        ">

            <h2>
                🔄 Loading your orders...
            </h2>

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


        // Newest orders first

        orders.sort(function(a, b) {

            return Number(
                b.createdAt || 0
            ) - Number(
                a.createdAt || 0
            );

        });


        // =================================
        // NO ORDERS
        // =================================

        if (orders.length === 0) {

            orderBox.innerHTML = `

                <div style="
                    text-align:center;
                    padding:30px;
                ">

                    <h2>
                        📦 No orders found.
                    </h2>

                    <p>
                        You haven't placed any orders
                        with this account yet.
                    </p>

                </div>

            `;

            return;

        }


        // =================================
        // DISPLAY ORDERS
        // =================================

        orderBox.innerHTML = "";


        orders.forEach(function(order) {

            const card =
                document.createElement("div");


            card.className =
                "customer-order-card";


            let productsHTML = "";

            let total = 0;


            Object.keys(
                order.products || {}
            ).forEach(function(product) {

                const item =
                    order.products[product];


                const price =
                    Number(item.price) || 0;


                const quantity =
                    Number(item.quantity) || 0;


                total +=
                    price * quantity;


                productsHTML += `

                    <p>

                        <strong>
                            🧩 ${product}
                        </strong>

                        <br>

                        PKR ${price}
                        × ${quantity}

                    </p>

                `;

            });


            const status =
                order.status ||
                "Pending 🟡";


            card.innerHTML = `

                <div class="order-card-header">

                    <h2>
                        📦
                        ${order.orderID || "Order"}
                    </h2>

                    <span class="order-status">
                        ${status}
                    </span>

                </div>


                <div class="order-details">

                    <p>
                        <strong>
                            👤 Name:
                        </strong>

                        ${order.customerName ||
                        "Not available"}
                    </p>


                    <p>
                        <strong>
                            📱 Phone:
                        </strong>

                        ${order.phone ||
                        "Not available"}
                    </p>


                    <p>
                        <strong>
                            📍 Address:
                        </strong>

                        ${order.address ||
                        "Not available"}
                    </p>


                    <p>
                        <strong>
                            💳 Payment:
                        </strong>

                        ${order.payment ||
                        "Not selected"}
                    </p>


                    <p>
                        <strong>
                            📅 Date:
                        </strong>

                        ${order.date ||
                        "Not available"}
                    </p>

                </div>


                <h3>
                    🧩 Products
                </h3>


                <div class="my-order-products">

                    ${productsHTML}

                </div>


                <div class="order-total">

                    <strong>
                        Total
                    </strong>

                    <strong>
                        PKR ${order.total || total}
                    </strong>

                </div>


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
<a
    href="track-order.html?orderID=${encodeURIComponent(order.orderID)}"
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

            <div style="
                text-align:center;
                padding:30px;
            ">

                <h2>
                    ❌ Failed to load orders.
                </h2>

                <p>
                    Please try again later.
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

            // If logout is happening,
            // stay on this page.

            if (
                sessionStorage.getItem("loggingOut")
                === "true"
            ) {

                return;

            }


            // Normal logged-out customer
            // goes to login page.

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


                // Tell authentication listener
                // that logout is intentional.

                sessionStorage.setItem(
                    "loggingOut",
                    "true"
                );


                // =================================
                // START 5-SECOND REDIRECT TIMER
                // BEFORE SIGN OUT
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


                // Hide logout button

                if (accountActions) {

                    accountActions.style.display =
                        "none";

                }


                // =================================
                // SHOW LOGGED OUT MESSAGE
                // =================================

                orderBox.innerHTML = `

                    <div style="
                        text-align:center;
                        padding:40px;
                    ">

                        <div style="
                            font-size:60px;
                            margin-bottom:15px;
                        ">
                            ✅
                        </div>


                        <h2>
                            Logged out successfully!
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

                    <div style="
                        text-align:center;
                        padding:30px;
                    ">

                        <h2>
                            ❌ Failed to logout.
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
