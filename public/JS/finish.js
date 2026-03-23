const API_URL = 'http://localhost:3000';

let orderdetails = [];

async function loadOrder() {
    const res = await fetch(`${API_URL}/api/order/summary`);
    const data = await res.json();
    orderdetails = data;
    console.log(orderdetails);

    loadCustomerData();
    loadItems();
    loadPrice();
}
loadOrder();

function loadCustomerData() {
    const address = document.getElementById('address');
    const name = document.getElementById('customer-name');
    name.innerText = orderdetails.order.firstname + ' ' + orderdetails.order.lastname;
    address.innerText = orderdetails.order.postalcode + ' ' + orderdetails.order.address;
}

function loadItems() {
    const ordertable = document.getElementById('ordered-items');
    ordertable.innerHTML = '';
    orderdetails.order.cart.forEach(i => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-4">
                <p class="font-medium text-slate-900 dark:text-white">${i.name}</p>
            </td>
            <td class="py-4 text-center text-slate-600 dark:text-slate-400">${i.qty}</td>
            <td class="py-4 text-right text-slate-600 dark:text-slate-400">${i.price} Ft</td>
            <td class="py-4 text-right font-medium text-slate-900 dark:text-white">${i.qty * i.price} Ft</td>
        `;
        ordertable.appendChild(tr);
    });
}

function loadPrice() {
    const org = document.getElementById('original-price');
    const tax = document.getElementById('tax-rate');
    const taxed = document.getElementById('taxed-price');

    // orderdetails.order.cart alapján számol, nem cartItems
    const ossz = orderdetails.order.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const adoAlap = Math.round(ossz * 0.73);
    const afa = Math.round(ossz * 0.27);

    org.innerText = adoAlap + ' Ft';
    tax.innerText = afa + ' Ft';
    taxed.innerText = ossz + ' Ft';
}