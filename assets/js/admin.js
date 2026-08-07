let order = JSON.parse(localStorage.getItem("order"));

let box = document.getElementById("admin-order-box");


if(order){

box.innerHTML = `

<h2>Customer Details</h2>

<p>Name: ${order.customerName}</p>

<p>Phone: ${order.phone}</p>

<p>Address: ${order.address}</p>
<p>
💳 Payment:
<span class="payment-badge ${order.payment.replace(/\s+/g,'-')}">
${order.payment}
</span>
</p>

<h2>Products</h2>

${Object.keys(order.products).map(product => {

return `
<p>
${product}
-
PKR ${order.products[product].price}
x
${order.products[product].quantity}
</p>
`

}).join("")}


<p>
Status:
${order.status || "Pending 🟡"}
</p>


<button onclick="cancelAdminOrder()">
Cancel Order ❌
</button>

`;

}


function cancelAdminOrder(){

let order = JSON.parse(localStorage.getItem("order"));

order.status = "Cancelled ❌";

localStorage.setItem("order", JSON.stringify(order));

box.innerHTML = "Order cancelled by admin ❌";

}