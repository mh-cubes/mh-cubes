import { db, auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const orderBox = document.getElementById("order-box");
const accountActions = document.getElementById("account-actions");
const logoutButton = document.getElementById("logout-button");


// =========================================
// LOAD CUSTOMER ORDERS
// =========================================

async function loadCustomerOrders(user) {

    if (!orderBox) return;

    orderBox.innerHTML = `
        <div class="order-loading">
            <div class="loader"></div>
            <h3>🔄 Loading your orders...</h3>
        </div>
    `;

    try {

        const ordersQuery = query(
            collection(db, "orders"),
            where("customerUID", "==", user.uid)
        );

        const snapshot = await getDocs(ordersQuery);

       const orders = [];

snapshot.forEach(function(docSnap) {

    const orderData = docSnap.data();

    // Hide cancelled orders from customer's My Orders
    if (
        String(orderData.status || "").toLowerCase() === "cancelled"
    ) {
        return;
    }

    orders.push({
        id: docSnap.id,
        ...orderData
    });

});


        // =====================================
        // NEWEST FIRST
        // =====================================

        orders.sort(function(a, b) {

            return Number(b.createdAt || 0) -
                   Number(a.createdAt || 0);

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


        orderBox.innerHTML = "";


        // =====================================
        // DISPLAY ORDERS
        // =====================================

        orders.forEach(function(order) {

            const card = document.createElement("div");

            card.className = "customer-order-card";


            // =================================
            // PRODUCTS
            // =================================

            let productsHTML = "";

            let calculatedTotal = 0;


            Object.keys(order.products || {}).forEach(function(productName) {

                const item = order.products[productName];

                const price = Number(item.price) || 0;

                const quantity = Number(item.quantity) || 0;

                const subtotal = price * quantity;

                calculatedTotal += subtotal;


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

            const status = order.status || "Pending";


            // =================================
            // TOTAL
            // =================================

            const total =
                Number(order.total) ||
                calculatedTotal;


            // =================================
            // ORDER ID
            // =================================

            const orderID =
                order.orderID || "Order";


            // =================================
            // TRACK URL
            // =================================

            const trackURL =
                "track-order.html?orderID=" +
                encodeURIComponent(orderID);


            // =================================
            // CANCEL BUTTON
            // =================================

            let cancelButtonHTML = "";


            if (
                status.toLowerCase() === "pending"
            ) {

                cancelButtonHTML = `

                    <button
                        class="cancel-order-btn"
                        onclick="cancelOrder('${order.id}', '${orderID}')"
                    >
                        ❌ Cancel Order
                    </button>

                `;

            }


            // =================================
            // ORDER CARD
            // =================================

            card.innerHTML = `

                <div class="order-card-header">

                    <h2>
                        📦 ${orderID}
                    </h2>

                    <span class="order-status">
                        ${status}
                    </span>

                </div>


                <div class="order-details">

                    <p>
                        <strong>👤 Name</strong>
                        <br>
                        ${order.customerName || "Not available"}
                    </p>

                    <p>
                        <strong>📱 Phone</strong>
                        <br>
                        ${order.phone || "Not available"}
                    </p>

                    <p>
                        <strong>📍 Address</strong>
                        <br>
                        ${order.address || "Not available"}
                    </p>

                    <p>
                        <strong>💳 Payment</strong>
                        <br>
                        ${order.payment || "Not selected"}
                    </p>

                    <p>
                        <strong>📅 Date</strong>
                        <br>
                        ${order.date || "Not available"}
                    </p>

                </div>


                <h3>
                    🧩 Products Ordered
                </h3>


                <div class="my-order-products">

                    ${productsHTML}

                </div>


                <div class="order-total">

                    <strong>
                        💰 Total
                    </strong>

                    <strong>
                        PKR ${total.toLocaleString()}
                    </strong>

                </div>


                ${
                    order.notification
                    ?
                    `
                        <div class="order-notification">
                            🔔 ${order.notification}
                        </div>
                    `
                    :
                    ""
                }


                <a
                    href="${trackURL}"
                    class="track-order-btn"
                >
                    🔍 Track This Order
                </a>


                ${cancelButtonHTML}

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
// CANCEL ORDER
// =========================================

async function cancelOrder(orderDocID, orderID) {

    const confirmed = confirm(
        "Are you sure you want to cancel order " +
        orderID +
        "?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const user = auth.currentUser;

        if (!user) {
            alert("❌ Please sign in again.");
            return;
        }

        const orderRef = doc(
            db,
            "orders",
            orderDocID
        );

        // Get the customer's orders
        const ordersQuery = query(
            collection(db, "orders"),
            where("customerUID", "==", user.uid)
        );

        const snapshot = await getDocs(ordersQuery);

        let orderFound = false;

        snapshot.forEach(function(docSnap) {

            if (docSnap.id === orderDocID) {

                const orderData = docSnap.data();

                // Only allow cancelling pending orders
                if (
                    String(orderData.status || "")
                        .toLowerCase() === "pending"
                ) {
                    orderFound = true;
                }

            }

        });

        if (!orderFound) {

            alert(
                "❌ You cannot cancel this order."
            );

            return;
        }

        // Cancel order
        await updateDoc(
            orderRef,
            {
                status: "Cancelled",
                notification:
                    "❌ This order was cancelled by the customer."
            }
        );

        alert(
            "✅ Order " +
            orderID +
            " has been cancelled."
        );

        // Reload My Orders
        loadCustomerOrders(user);

    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );

        alert(
            "❌ Could not cancel the order.\n\n" +
            "Please try again."
        );

    }

}

// =========================================
// AUTHENTICATION
// =========================================

onAuthStateChanged(
    auth,
    function(user) {

        if (!user) {

            window.location.href =
                "customer-login.html";

            return;
        }


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


                await signOut(auth);


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                logoutButton.disabled =
                    false;

                logoutButton.innerText =
                    "🚪 Logout";


                alert(
                    "❌ Failed to logout. Please try again."
                );

            }

        }
    );

}


// =========================================
// MAKE FUNCTION AVAILABLE TO HTML
// =========================================

window.cancelOrder = cancelOrder;
