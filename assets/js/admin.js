let orders = JSON.parse(localStorage.getItem("orders")) || [];

let box = document.getElementById("admin-order-box");

if(orders.length === 0){

    box.innerHTML = "<h2>No active orders.</h2>";

}else{

    box.innerHTML = "";

    orders.forEach(function(order, index){

        box.innerHTML += `

        <div class="admin-order-card">

        <h2>Order #${index + 1}</h2>

        <p><strong>Name:</strong> ${order.customerName}</p>

        <p><strong>Phone:</strong> ${order.phone}</p>

        <p><strong>Address:</strong> ${order.address}</p>

        <p>
        <strong>Payment:</strong>
        <span class="payment-badge ${order.payment ? order.payment.replace(/\s+/g,'-') : ''}">
        ${order.payment || "Not Selected"}
        </span>
        </p>

        <h3>Products</h3>

        ${Object.keys(order.products).map(product => {

            return `
            <p>
            ${product}
            -
            PKR ${order.products[product].price}
            ×
            ${order.products[product].quantity}
            </p>
            `;

        }).join("")}

        <p>
        <strong>Status:</strong>
        ${order.status || "Pending 🟡"}
        </p>
${order.status !== "Confirmed ✅" ? `
<button class="confirm-btn" onclick="confirmOrder(${index})">
✅ Confirm
</button>
` : ""}

${order.status === "Pending 🟡" ? `
<button class="confirm-btn" onclick="confirmOrder(${index})">
✅ Confirm
</button>
` : ""}

${order.status === "Confirmed ✅" ? `
<button class="process-btn" onclick="processOrder(${index})">
📦 Processing
</button>
` : ""}

${order.status === "Processing 📦" ? `
<button class="ship-btn" onclick="shipOrder(${index})">
🚚 Ship
</button>
` : ""}

${order.status === "Shipped 🚚" ? `
<button class="deliver-btn" onclick="deliverOrder(${index})">
✅ Deliver
</button>
` : ""}

<button class="cancel-btn" onclick="cancelAdminOrder(${index})">
❌ Cancel
</button>

        <hr>

        </div>

        `;

    });

}
function confirmOrder(index){

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders[index].status = "Confirmed ✅";
orders[index].notification = "🎉 Your order has been confirmed and is now being prepared.";
    localStorage.setItem("orders", JSON.stringify(orders));

    location.reload();

}
function cancelAdminOrder(index){

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.splice(index,1);

    localStorage.setItem("orders", JSON.stringify(orders));

    location.reload();

}
function confirmOrder(index){

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders[index].status = "Confirmed ✅";

    orders[index].notification = "🎉 Your order has been confirmed and is now being prepared.";

    localStorage.setItem("orders", JSON.stringify(orders));

    location.reload();

}


function processOrder(index){

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders[index].status = "Processing 📦";

    orders[index].notification = "📦 Your order is now being prepared.";

    localStorage.setItem("orders", JSON.stringify(orders));

    location.reload();

}


function shipOrder(index){

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders[index].status = "Shipped 🚚";

    orders[index].notification = "🚚 Your order has been shipped and is on the way!";

    localStorage.setItem("orders", JSON.stringify(orders));

    location.reload();

}


function deliverOrder(index){

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders[index].status = "Delivered ✅";

    orders[index].notification = "✅ Your order has been delivered. Thank you for shopping with MH CUBES!";

    localStorage.setItem("orders", JSON.stringify(orders));


    // Remove order after 5 minutes
    setTimeout(function(){

        let updatedOrders = JSON.parse(localStorage.getItem("orders")) || [];

        updatedOrders.splice(index, 1);

        localStorage.setItem(
            "orders",
            JSON.stringify(updatedOrders)
        );

    }, 300000);


    location.reload();

}
function logoutOwner(){


document.querySelector(".orders").innerHTML = `

<h1>🔐 Logging Out...</h1>

<p style="text-align:center;font-size:20px;">
Returning to Owner Login
</p>

<div class="loader"></div>

`;



setTimeout(function(){

localStorage.removeItem("adminAccess");

window.location.href="owner-login.html";


},2000);


}