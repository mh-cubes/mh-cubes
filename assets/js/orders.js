
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


// =========================================
// ELEMENTS
// =========================================

const orderBox =
    document.getElementById("order-box");

const accountActions =
    document.getElementById("account-actions");

const logoutButton =
    document.getElementById("logout-button");


// =========================================
// SECURITY
// ESCAPE FIRESTORE DATA BEFORE HTML
// =========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


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

        const ordersQuery =
            query(
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

            const orderData =
                docSnap.data();


            // =================================
            // HIDE CUSTOMER-CANCELLED ORDERS
            // =================================

            const status =
                String(
                    orderData.status || ""
                ).toLowerCase();


            if (
                status === "cancelled" ||
                status === "cancelled by customer"
            ) {

                return;

            }


            orders.push({

                id:
                    docSnap.id,

                ...orderData

            });

        });


        // =================================
        // NEWEST FIRST
        // =================================

        orders.sort(function(a, b) {

            return Number(
                b.createdAt || 0
            )
            -
            Number(
                a.createdAt || 0
            );

        });


        // =================================
        // NO ORDERS
        // =================================

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


        // =================================
        // DISPLAY ORDERS
        // =================================

        orders.forEach(function(order) {

            const card =
                document.createElement("div");


            card.className =
                "customer-order-card";


            // =================================
            // SAFE ORDER VALUES
            // =================================

            const orderID =
                escapeHTML(
                    order.orderID || "Order"
                );


            const customerName =
                escapeHTML(
                    order.customerName ||
                    "Not available"
                );


            const phone =
                escapeHTML(
                    order.phone ||
                    "Not available"
                );


            const address =
                escapeHTML(
                    order.address ||
                    "Not available"
                );


            const payment =
                escapeHTML(
                    order.payment ||
                    "Not selected"
                );


            const date =
                escapeHTML(
                    order.date ||
                    "Not available"
                );


            const status =
                escapeHTML(
                    order.status ||
                    "Pending"
                );


            const notification =
                escapeHTML(
                    order.notification ||
                    ""
                );


            // =================================
            // PRODUCTS
            // =================================

            let productsHTML = "";

            let calculatedTotal = 0;


            Object.keys(
                order.products || {}
            )
            .forEach(function(productName) {

                const item =
                    order.products[productName] || {};


                const price =
                    Number(item.price) || 0;


                const quantity =
                    Number(item.quantity) || 0;


                const subtotal =
                    price * quantity;


                calculatedTotal +=
                    subtotal;


                const safeProductName =
                    escapeHTML(
                        productName
                    );


                const productImage =
                    item.image ||
                    item.img ||
                    "assets/images/placeholder.png";


                /*
                 * Only allow normal image paths.
                 * Block javascript:, data:, etc.
                 */

                const safeImage =
                    typeof productImage === "string" &&
                    /^(https?:\/\/|\/|\.\/|\.\.\/|assets\/)/i
                        .test(productImage)
                        ? escapeHTML(productImage)
                        : "assets/images/placeholder.png";


                productsHTML += `

                    <div
                        class="my-order-product-item"
                    >

                        <div
                            class="my-order-product-image"
                        >

                            <img
                                src="${safeImage}"
                                alt="${safeProductName}"
                                onerror="this.style.display='none';"
                            >

                        </div>


                        <div
                            class="my-order-product-info"
                        >

                            <strong>
                                🧩 ${safeProductName}
                            </strong>

                            <span>
                                PKR
                                ${price.toLocaleString()}
                                × ${quantity}
                            </span>

                        </div>

                    </div>

                `;

            });


            // =================================
            // TOTAL
            // =================================

            const total =
                Number(order.total) ||
                calculatedTotal;


            // =================================
            // TRACK URL
            // =================================

            const trackURL =
                "track-order.html?orderID=" +
                encodeURIComponent(
                    order.orderID || ""
                );


            // =================================
            // CANCEL BUTTON
            // =================================

            let cancelButtonHTML = "";


            if (
                String(
                    order.status || ""
                ).toLowerCase()
                === "pending"
            ) {

                /*
                 * Pass encoded IDs safely.
                 * The function still verifies ownership
                 * against Firebase before updating.
                 */

                const safeDocID =
                    escapeHTML(order.id);


                const safeOrderID =
                    escapeHTML(
                        order.orderID ||
                        "Order"
                    );


                cancelButtonHTML = `

                    <button
                        class="cancel-order-btn"
                        type="button"
                        data-order-doc-id="${safeDocID}"
                        data-order-id="${safeOrderID}"
                    >
                        ❌ Cancel Order
                    </button>

                `;

            }


            // =================================
            // ORDER CARD
            // =================================

            card.innerHTML = `

                <div
                    class="order-card-header"
                >

                    <h2>
                        📦 ${orderID}
                    </h2>

                    <span
                        class="order-status"
                    >
                        ${status}
                    </span>

                </div>


                <div
                    class="order-details"
                >

                    <p>

                        <strong>
                            👤 Name
                        </strong>

                        <br>

                        ${customerName}

                    </p>


                    <p>

                        <strong>
                            📱 Phone
                        </strong>

                        <br>

                        ${phone}

                    </p>


                    <p>

                        <strong>
                            📍 Address
                        </strong>

                        <br>

                        ${address}

                    </p>


                    <p>

                        <strong>
                            💳 Payment
                        </strong>

                        <br>

                        ${payment}

                    </p>


                    <p>

                        <strong>
                            📅 Date
                        </strong>

                        <br>

                        ${date}

                    </p>

                </div>


                <h3>
                    🧩 Products Ordered
                </h3>


                <div
                    class="my-order-products"
                >

                    ${productsHTML}

                </div>


                <div
                    class="order-total"
                >

                    <strong>
                        💰 Total
                    </strong>

                    <strong>
                        PKR
                        ${total.toLocaleString()}
                    </strong>

                </div>


                ${
                    notification
                    ?
                    `

                        <div
                            class="order-notification"
                        >

                            🔔
                            ${notification}

                        </div>

                    `
                    :
                    ""
                }


                <a
                    href="${escapeHTML(trackURL)}"
                    class="track-order-btn"
                >
                    🔍 Track This Order
                </a>


                ${cancelButtonHTML}

            `;


            orderBox.appendChild(card);


            // =================================
            // CANCEL BUTTON EVENT
            // =================================

            const cancelButton =
                card.querySelector(
                    ".cancel-order-btn"
                );


            if (cancelButton) {

                cancelButton.addEventListener(
                    "click",
                    function() {

                        const docID =
                            this.dataset.orderDocId;

                        const displayedOrderID =
                            this.dataset.orderId;

                        cancelOrder(
                            docID,
                            displayedOrderID
                        );

                    }
                );

            }

        });


    } catch (error) {

        console.error(
            "Error loading customer orders:",
            error
        );


        orderBox.innerHTML = `

            <div
                class="orders-message"
            >

                <div
                    class="message-icon"
                >
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
// CUSTOMER CANCEL ORDER
// =========================================

async function cancelOrder(
    orderDocID,
    orderID
) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel order " +
            orderID +
            "?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const user =
            auth.currentUser;


        // =================================
        // AUTH CHECK
        // =================================

        if (!user) {

            alert(
                "❌ Please sign in again."
            );

            return;

        }


        // =================================
        // VERIFY ORDER BELONGS TO USER
        // =================================

        const ordersQuery =
            query(

                collection(
                    db,
                    "orders"
                ),

                where(
                    "customerUID",
                    "==",
                    user.uid
                )

            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        let orderFound = false;


        snapshot.forEach(
            function(docSnap) {

                if (
                    docSnap.id ===
                    orderDocID
                ) {

                    const orderData =
                        docSnap.data();


                    const status =
                        String(
                            orderData.status || ""
                        ).toLowerCase();


                    if (
                        orderData.customerUID ===
                        user.uid
                        &&
                        status === "pending"
                    ) {

                        orderFound =
                            true;

                    }

                }

            }
        );


        if (!orderFound) {

            alert(
                "❌ You cannot cancel this order."
            );

            return;

        }


        // =================================
        // UPDATE ORDER
        // FIRESTORE RULES ALSO VERIFY THIS
        // =================================

        const orderRef =
            doc(
                db,
                "orders",
                orderDocID
            );


        await updateDoc(

            orderRef,

            {

                status:
                    "Cancelled by Customer",

                notification:
                    "❌ This order was cancelled by the customer."

            }

        );


        alert(
            "✅ Order " +
            orderID +
            " has been cancelled."
        );


        // =================================
        // REFRESH
        // =================================

        await loadCustomerOrders(
            user
        );


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

            window.location.replace(
                "customer-login.html"
            );

            return;

        }


        if (accountActions) {

            accountActions.style.display =
                "flex";

        }


        loadCustomerOrders(
            user
        );

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

                logoutButton.disabled =
                    true;


                logoutButton.innerText =
                    "⏳ Logging out...";


                await signOut(
                    auth
                );


                window.location.replace(
                    "index.html"
                );


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

