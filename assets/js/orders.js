import { db } from "./firebase.js";

import {
collection,
getDocs,
query,
where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const orderBox =
document.getElementById("order-box");

const phone =
localStorage.getItem("customerPhone") || "";

async function loadCustomerOrders() {

```
if (!orderBox) {
    return;
}


if (!phone) {

    orderBox.innerHTML = `
        <h2>No saved customer information.</h2>
        <p>
            Please place an order first.
        </p>
    `;

    return;

}


orderBox.innerHTML =
    "<h2>🔄 Loading your orders...</h2>";


try {

    const ordersQuery = query(
        collection(db, "orders"),
        where("phone", "==", phone)
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


    orders.sort(function(a, b) {

        return String(b.date || "")
            .localeCompare(String(a.date || ""));

    });


    if (orders.length === 0) {

        orderBox.innerHTML = `
            <h2>No orders found.</h2>
            <p>
                No orders were found for this phone number.
            </p>
        `;

        return;

    }


    orderBox.innerHTML = "";


    orders.forEach(function(order) {

        const card =
            document.createElement("div");


        card.className =
            "customer-order-card";


        let productsHTML = "";


        Object.keys(order.products || {})
            .forEach(function(product) {

                const item =
                    order.products[product];


                productsHTML += `
                    <p>
                        <strong>${product}</strong>
                        -
                        PKR ${item.price}
                        ×
                        ${item.quantity}
                    </p>
                `;

            });


        const status =
            order.status || "Pending 🟡";


        card.innerHTML = `

            <h2>
                📦 Order ${order.orderID || ""}
            </h2>

            <p>
                <strong>Name:</strong>
                ${order.customerName || "Not available"}
            </p>

            <p>
                <strong>Phone:</strong>
                ${order.phone || "Not available"}
            </p>

            <p>
                <strong>Address:</strong>
                ${order.address || "Not available"}
            </p>

            <p>
                <strong>Payment:</strong>
                ${order.payment || "Not selected"}
            </p>

            <p>
                <strong>Date:</strong>
                ${order.date || "Not available"}
            </p>

            <h3>
                Products
            </h3>

            ${productsHTML}

            <p>
                <strong>Total:</strong>
                PKR ${order.total || 0}
            </p>

            <p>
                <strong>Status:</strong>
                ${status}
            </p>

            <hr>

        `;


        orderBox.appendChild(card);

    });


} catch (error) {

    console.error(
        "Error loading customer orders:",
        error
    );


    orderBox.innerHTML = `
        <h2>❌ Failed to load orders.</h2>
        <p>
            Please try again.
        </p>
    `;

}
```

}

loadCustomerOrders();
