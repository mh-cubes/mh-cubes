import { db, auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =========================================
// OWNER UID
// =========================================

const OWNER_UID =
    "UPdmuwyLEcdEyMxFENPGRlAhxwa2";


// =========================================
// ADMIN ORDER BOX
// =========================================

const box =
    document.getElementById("admin-order-box");


// =========================================
// OWNER AUTHENTICATION
// =========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href =
            "owner-login.html";

        return;

    }


    console.log(
        "Admin user email:",
        user.email
    );

    console.log(
        "Admin user UID:",
        user.uid
    );


    // =====================================
    // OWNER ONLY
    // =====================================

    if (user.uid !== OWNER_UID) {

        alert(
            "❌ You are not authorized to access the Owner Dashboard."
        );


        signOut(auth).then(() => {

            window.location.href =
                "owner-login.html";

        });

        return;

    }


    // =====================================
    // OWNER AUTHORIZED
    // =====================================

    loadOrders();

});


// =========================================
// LOAD ORDERS FROM FIRESTORE
// =========================================

async function loadOrders() {

    if (!box) {
        return;
    }


    box.innerHTML = `

        <div style="
            padding:20px;
            text-align:center;
        ">

            🔄 Loading orders...

        </div>

    `;


    try {

        const orders = [];


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        snapshot.forEach((docSnap) => {

            orders.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });


        console.log(
            "Orders loaded:",
            orders
        );


        // =====================================
        // NO ORDERS
        // =====================================

        if (orders.length === 0) {

            box.innerHTML = `

                <div style="
                    padding:30px;
                    text-align:center;
                ">

                    <h2>
                        📦 No orders yet
                    </h2>

                    <p>
                        Customer orders will appear here.
                    </p>

                </div>

            `;

            return;

        }


        // =====================================
        // NEWEST ORDERS FIRST
        // =====================================

        orders.sort((a, b) => {

            return Number(
                b.createdAt || 0
            ) - Number(
                a.createdAt || 0
            );

        });


        // =====================================
        // CLEAR BOX
        // =====================================

        box.innerHTML = "";


        // =====================================
        // DISPLAY ORDERS
        // =====================================

        orders.forEach((order) => {


            // =================================
            // STATUS
            // =================================

            const status =
                order.status ||
                "Pending";


            const statusLower =
                String(status)
                    .toLowerCase();


            // =================================
            // PRODUCTS
            // =================================

            const productsHTML =

                Object.keys(
                    order.products || {}
                )

                .map((productName) => {

                    const item =
                        order.products[
                            productName
                        ] || {};


                    const price =
                        Number(
                            item.price
                        ) || 0;


                    const quantity =
                        Number(
                            item.quantity
                        ) || 0;


                    return `

                        <p>

                            🧩

                            <strong>
                                ${productName}
                            </strong>

                            — PKR
                            ${price.toLocaleString()}

                            ×
                            ${quantity}

                        </p>

                    `;

                })

                .join("");


            // =================================
            // CUSTOMER CANCELLED
            // =================================

            const customerCancelled =
                statusLower.includes(
                    "cancelled by customer"
                );


            // =================================
            // ADMIN BUTTONS
            // =================================

            let buttonsHTML = "";


            if (customerCancelled) {

                buttonsHTML = `

                    <div
                        style="
                            margin-top:15px;
                            padding:12px;
                            border-radius:10px;
                            background:#fff3cd;
                            color:#856404;
                            font-weight:bold;
                        "
                    >

                        ❌ Cancelled by Customer

                    </div>

                    <button
                        onclick="deleteCancelledOrder('${order.id}')"
                        style="
                            background:
                                linear-gradient(
                                    135deg,
                                    #6b7280,
                                    #374151
                                );
                        "
                    >
                        🗑️ Remove From Dashboard
                    </button>

                `;

            }

            else {

                buttonsHTML = `

                    <button
                        onclick="confirmOrder('${order.id}')"
                    >
                        Confirm ✅
                    </button>


                    <button
                        onclick="processOrder('${order.id}')"
                    >
                        Processing 📦
                    </button>


                    <button
                        onclick="shipOrder('${order.id}')"
                    >
                        Ship 🚚
                    </button>


                    <button
                        onclick="deliverOrder('${order.id}')"
                    >
                        Deliver ✅
                    </button>


                    <button
                        onclick="cancelAdminOrder('${order.id}')"
                    >
                        Cancel ❌
                    </button>

                `;

            }


            // =================================
            // ORDER CARD
            // =================================

            box.innerHTML += `

                <div
                    class="admin-order-card"
                >

                    <h2>

                        📦 Order #

                        ${order.orderID || "N/A"}

                    </h2>


                    <p>

                        <strong>
                            Customer:
                        </strong>

                        ${order.customerName || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Phone:
                        </strong>

                        ${order.phone || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Address:
                        </strong>

                        ${order.address || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Payment:
                        </strong>

                        ${order.payment || "N/A"}

                    </p>


                    <p>

                        <strong>
                            Transaction ID:
                        </strong>

                        ${order.transactionID || "Not provided"}

                    </p>


                    <p>

                        <strong>
                            Date:
                        </strong>

                        ${order.date || "N/A"}

                    </p>


                    <h3>
                        🛒 Products
                    </h3>


                    <div class="admin-products">

                        ${productsHTML || `
                            <p>
                                No product information available.
                            </p>
                        `}

                    </div>


                    <p>

                        <strong>
                            Status:
                        </strong>

                        ${status}

                    </p>


                    ${
                        order.notification
                        ?
                        `

                            <p>

                                <strong>
                                    🔔 Notification:
                                </strong>

                                ${order.notification}

                            </p>

                        `
                        :
                        ""
                    }


                    <div
                        class="admin-order-buttons"
                    >

                        ${buttonsHTML}

                    </div>

                </div>

            `;

        });


    }

    catch (error) {

        console.error(
            "🔥 FIRESTORE ERROR:",
            error
        );


        console.error(
            "Error code:",
            error.code
        );


        console.error(
            "Error message:",
            error.message
        );


        box.innerHTML = `

            <div style="
                padding:25px;
                text-align:center;
            ">

                <h2>
                    ❌ Error Loading Orders
                </h2>

                <p>

                    <strong>
                        Error Code:
                    </strong>

                    ${error.code || "Unknown"}

                </p>


                <p>

                    <strong>
                        Message:
                    </strong>

                    ${error.message || "Unknown error"}

                </p>

            </div>

        `;

    }

}


// =========================================
// UPDATE ORDER STATUS
// =========================================

async function updateOrderStatus(
    id,
    status,
    message
) {

    try {

        await updateDoc(
            doc(
                db,
                "orders",
                id
            ),
            {

                status:
                    status,

                notification:
                    message

            }
        );


        location.reload();

    }

    catch (error) {

        console.error(
            "Error updating order:",
            error
        );


        alert(
            "❌ Failed to update order."
        );

    }

}


// =========================================
// CONFIRM ORDER
// =========================================

async function confirmOrder(id) {

    await updateOrderStatus(

        id,

        "Confirmed ✅",

        "🎉 Your order has been confirmed and is now being prepared."

    );

}


// =========================================
// PROCESS ORDER
// =========================================

async function processOrder(id) {

    await updateOrderStatus(

        id,

        "Processing 📦",

        "📦 Your order is now being prepared."

    );

}


// =========================================
// SHIP ORDER
// =========================================

async function shipOrder(id) {

    await updateOrderStatus(

        id,

        "Shipped 🚚",

        "🚚 Your order has been shipped and is on the way!"

    );

}


// =========================================
// DELIVER ORDER
// =========================================

async function deliverOrder(id) {

    await updateOrderStatus(

        id,

        "Delivered ✅",

        "✅ Your order has been delivered. Thank you for shopping with MH CUBES!"

    );

}


// =========================================
// ADMIN CANCEL ORDER
// =========================================

async function cancelAdminOrder(id) {

    const confirmCancel =
        confirm(
            "⚠️ Are you sure you want to cancel this order?\n\nThis will permanently remove the order from Firestore."
        );


    if (!confirmCancel) {

        return;

    }


    try {

        // =================================
        // DELETE ORDER FROM FIRESTORE
        // =================================

        await deleteDoc(
            doc(
                db,
                "orders",
                id
            )
        );


        alert(
            "✅ Order cancelled and removed from the dashboard."
        );


        // =================================
        // RELOAD DASHBOARD
        // =================================

        location.reload();

    }

    catch (error) {

        console.error(
            "Error cancelling order:",
            error
        );


        alert(
            "❌ Failed to cancel order."
        );

    }

}


// =========================================
// REMOVE CUSTOMER-CANCELLED ORDER
// =========================================

async function deleteCancelledOrder(id) {

    const confirmed =
        confirm(
            "Remove this customer-cancelled order from the Owner Dashboard?\n\nThis will permanently delete it from Firestore."
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "orders",
                id
            )
        );


        alert(
            "✅ Cancelled order removed."
        );


        location.reload();

    }

    catch (error) {

        console.error(
            "Error removing cancelled order:",
            error
        );


        alert(
            "❌ Failed to remove cancelled order."
        );

    }

}


// =========================================
// OWNER LOGOUT
// =========================================

async function logoutOwner() {

    try {

        await signOut(auth);


        localStorage.removeItem(
            "adminAccess"
        );


        window.location.href =
            "owner-login.html";

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "❌ Logout failed. Please try again."
        );

    }

}


// =========================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =========================================

window.confirmOrder =
    confirmOrder;


window.processOrder =
    processOrder;


window.shipOrder =
    shipOrder;


window.deliverOrder =
    deliverOrder;


window.cancelAdminOrder =
    cancelAdminOrder;


window.deleteCancelledOrder =
    deleteCancelledOrder;


window.logoutOwner =
    logoutOwner;
