let order = JSON.parse(localStorage.getItem("order"));


let box = document.getElementById("order-box");


if(order){

box.innerHTML = `

<h2>Customer Details</h2>

<p>Name: ${order.customerName}</p>

<p>Phone: ${order.phone}</p>

<p>Address: ${order.address}</p>
<p>
💳 Payment Method:
${order.payment}
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
<span id="order-status">
${order.status || "Pending 🟡"}
</span>
</p>
${(order.status || "Pending 🟡") === "Pending 🟡" ? 
`
<button onclick="cancelOrder()" class="cancel-btn">
Cancel Pending Order ❌
</button>
`
:
""
}
`;

}
function cancelOrder(){

localStorage.removeItem("order");

box.innerHTML = "Order cancelled successfully ❌";

}
