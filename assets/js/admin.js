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


    // OWNER ONLY

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


    // OWNER AUTHORIZED

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
        <div style="padding:20px;text-align:center;">
            🔄 Loading orders...
        </div>
    `;


    try {

        const orders = [];


        const snapshot =
            await getDocs(
                collection(db, "orders")
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
                <div style="padding:30px;text-align:center;">

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
        // CLEAR BOX
        // =====================================

        box.innerHTML = "";


        // =====================================
        // DISPLAY ORDERS
        // =====================================

        orders.forEach((order) => {


            // =================================
            // PRODUCTS
            // =================================

            const productsHTML =
                Object.keys(
                    order.products || {}
                )
                .map((product) => {

                    const item =
                        order.products[product];


                    return `
                        <p>

                            🧩
                            <strong>
                                ${product}
                            </strong>

                            —
                            PKR ${item.price}

                            × ${item.quantity}

                        </p>
                    `;

                })
                .join("");


            // =================================
            // STATUS
            // =================================

            const status =
                order.status ||
                "Pending";


            // =================================
            // ORDER CARD
            // =================================

            box.innerHTML += `

                <div class="admin-order-card">


                    <h2>
                        📦 Order #${order.orderID || "N/A"}
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

                        ${order.transactionID ||
                        "Not provided"}
                    </p>


                    <h3>
                        🛒 Products
                    </h3>


                    <div class="admin-products">

                        ${productsHTML}

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


                    <div class="admin-order-buttons">


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


                    </div>


                </div>

            `;

        });


    } catch (error) {

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

            <div
                style="
                    padding:25px;
                    text-align:center;
                "
            >

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
            doc(db, "orders", id),
            {

                status:
                    status,

                notification:
                    message

            }
        );


        location.reload();


    } catch (error) {

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
            "Are you sure you want to permanently delete this order?"
        );


    if (!confirmCancel) {

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
            "✅ Order deleted successfully."
        );


        location.reload();


    } catch (error) {

        console.error(
            "Error deleting order:",
            error
        );


        alert(
            "❌ Failed to delete order."
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


    } catch (error) {

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
// MAKE FUNCTIONS AVAILABLE
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

window.logoutOwner =
    logoutOwner;
