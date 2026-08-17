
import { db, auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const orderBox =
    document.getElementById("order-box");


// =========================================
// LOAD CUSTOMER ORDERS
// =========================================

async function loadCustomerOrders(user) {

    if (!orderBox) {
        return;
    }


    orderBox.innerHTML =
        "<h2>🔄 Loading your orders...</h2>";


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

                id:
                    docSnap.id,

                ...docSnap.data()

            });

        });


        // =================================
        // SORT NEWEST FIRST
        // =================================

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

                <h2>
                    📦 No orders found.
                </h2>

                <p>
                    You haven't placed any orders
                    with this account yet.
                </p>

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
            )
            .forEach(function(product) {

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

                        ${order.customerName || "Not available"}

                    </p>


                    <p>

                        <strong>
                            📱 Phone:
                        </strong>

                        ${order.phone || "Not available"}

                    </p>


                    <p>

                        <strong>
                            📍 Address:
                        </strong>

                        ${order.address || "Not available"}

                    </p>


                    <p>

                        <strong>
                            💳 Payment:
                        </strong>

                        ${order.payment || "Not selected"}

                    </p>


                    <p>

                        <strong>
                            📅 Date:
                        </strong>

                        ${order.date || "Not available"}

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

            `;


            orderBox.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Error loading customer orders:",
            error
        );


        orderBox.innerHTML = `

            <h2>
                ❌ Failed to load orders.
            </h2>

            <p>
                Please try again.
            </p>

        `;

    }

}


// =========================================
// AUTHENTICATION CHECK
// =========================================

onAuthStateChanged(
    auth,
    function(user) {

        if (!user) {

            orderBox.innerHTML = `

                <h2>
                    🔐 Login Required
                </h2>

                <p>
                    Please login to your customer
                    account to view your orders.
                </p>

                <button
                    onclick="window.location.href='customer-login.html'"
                >
                    Login / Create Account
                </button>

            `;

            return;

        }


        loadCustomerOrders(user);

    }
);

