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

let box = document.getElementById("admin-order-box");


// ------------------------------
// Check Firebase Authentication
// ------------------------------

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "owner-login.html";

        return;

    }

    loadOrders();

});


// ------------------------------
// Load Orders From Firebase
// ------------------------------

async function loadOrders(){

    try{

        let orders = [];

        const snapshot = await getDocs(
            collection(db, "orders")
        );


        snapshot.forEach((docSnap) => {

            orders.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });


        if(orders.length === 0){

            box.innerHTML =
                "<h2>No active orders.</h2>";

            return;

        }


        box.innerHTML = "";


        orders.forEach((order) => {

            box.innerHTML += `

            <div class="admin-order-card">

                <h2>
                    Order #${order.orderID}
                </h2>


                <p>
                    <strong>Name:</strong>
                    ${order.customerName}
                </p>


                <p>
                    <strong>Phone:</strong>
                    ${order.phone}
                </p>


                <p>
                    <strong>Address:</strong>
                    ${order.address}
                </p>


                <p>
                    <strong>Payment:</strong>
                    ${order.payment}
                </p>


                <p>
                    <strong>Transaction ID:</strong>
                    ${order.transactionID || "Not provided"}
                </p>


                <h3>Products</h3>


                ${Object.keys(order.products).map(product => `

                    <p>
                        ${product}
                        - PKR ${order.products[product].price}
                        × ${order.products[product].quantity}
                    </p>

                `).join("")}


                <p>
                    <strong>Status:</strong>
                    ${order.status || "Pending"}
                </p>


                <button onclick="confirmOrder('${order.id}')">
                    Confirm ✅
                </button>


                <button onclick="processOrder('${order.id}')">
                    Processing 📦
                </button>


                <button onclick="shipOrder('${order.id}')">
                    Ship 🚚
                </button>


                <button onclick="deliverOrder('${order.id}')">
                    Deliver ✅
                </button>


                <button onclick="cancelAdminOrder('${order.id}')">
                    Cancel ❌
                </button>


            </div>

            `;

        });


    }catch(error){

        console.error(
            "Error loading orders:",
            error
        );

        box.innerHTML =
            "<h2>Error loading orders.</h2>";

    }

}


// ------------------------------
// Update Order Status
// ------------------------------

async function updateOrderStatus(
    id,
    status,
    message
){

    try{

        await updateDoc(
            doc(db, "orders", id),
            {

                status: status,

                notification: message

            }
        );


        location.reload();


    }catch(error){

        console.error(
            "Error updating order:",
            error
        );

        alert(
            "Failed to update order."
        );

    }

}


// ------------------------------
// Confirm Order
// ------------------------------

async function confirmOrder(id){

    await updateOrderStatus(
        id,
        "Confirmed ✅",
        "🎉 Your order has been confirmed and is now being prepared."
    );

}


// ------------------------------
// Processing Order
// ------------------------------

async function processOrder(id){

    await updateOrderStatus(
        id,
        "Processing 📦",
        "📦 Your order is now being prepared."
    );

}


// ------------------------------
// Ship Order
// ------------------------------

async function shipOrder(id){

    await updateOrderStatus(
        id,
        "Shipped 🚚",
        "🚚 Your order has been shipped and is on the way!"
    );

}


// ------------------------------
// Deliver Order
// ------------------------------

async function deliverOrder(id){

    await updateOrderStatus(
        id,
        "Delivered ✅",
        "✅ Your order has been delivered. Thank you for shopping with MH CUBES!"
    );

}


// ------------------------------
// Cancel Order
// ------------------------------

async function cancelAdminOrder(id){

    const confirmCancel = confirm(
        "Are you sure you want to cancel this order?"
    );


    if(!confirmCancel){

        return;

    }


    try{

        await deleteDoc(
            doc(db, "orders", id)
        );


        location.reload();


    }catch(error){

        console.error(
            "Error cancelling order:",
            error
        );

        alert(
            "Failed to cancel order."
        );

    }

}


// ------------------------------
// Owner Logout
// ------------------------------

async function logoutOwner(){

    const ordersBox =
        document.querySelector(".orders");


    if(ordersBox){

        ordersBox.innerHTML = `

            <h2>
                Logging out...
            </h2>

        `;

    }


    try{

        await signOut(auth);


        localStorage.removeItem(
            "adminAccess"
        );


        window.location.href =
            "owner-login.html";


    }catch(error){

        console.error(
            "Logout error:",
            error
        );


        alert(
            "Failed to logout."
        );

    }

}


// ------------------------------
// Make Functions Available
// To HTML Buttons
// ------------------------------

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
