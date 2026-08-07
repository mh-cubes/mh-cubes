let orders = JSON.parse(localStorage.getItem("orders")) || [];

let box = document.getElementById("order-box");

if(orders.length === 0){

    box.innerHTML = "<h2>No active orders.</h2>";

}else{

    box.innerHTML = "";

    orders.forEach(function(order, index){

        box.innerHTML += `

        <div class="customer-order-card">

        <h2>Order #${index + 1}</h2>

        <p><strong>Name:</strong> ${order.customerName}</p>

        <p><strong>Phone:</strong> ${order.phone}</p>

        <p><strong>Address:</strong> ${order.address}</p>

        <p>
        <strong>Payment:</strong>
        ${order.payment || "Not Selected"}
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

        ${
            !order.status || order.status === "Pending 🟡"
            ?
            `<button onclick="cancelCustomerOrder(${index})">
            Cancel Pending Order ❌
            </button>`
            :
            ""
        }

        <hr>

        </div>

        `;

    });

}

function cancelCustomerOrder(index){

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.splice(index,1);

    localStorage.setItem("orders", JSON.stringify(orders));

    location.reload();

}
if(order.notification){

let toast = document.getElementById("order-toast");

toast.innerText = order.notification;

toast.classList.add("show");

setTimeout(function(){

toast.classList.remove("show");

},4000);

order.notification = "";

localStorage.setItem("orders", JSON.stringify(orders));

}