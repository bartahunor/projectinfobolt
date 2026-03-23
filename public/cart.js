const API_URL = 'http://localhost:3000';

let cartItems = [];
async function loadCart() {
  const res = await fetch(`${API_URL}/cart`);
  const data = await res.json();
  cartItems = data.cart;
  console.log(data);

  renderCart();
  cartPrice();
}
loadCart();

function renderCart(){
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    cartItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('bg-white', 'dark:bg-slate-900', 'p-4', 'rounded-xl', 'shadow-sm', 'border', 'border-slate-200', 'dark:border-slate-800', 'flex', 'items-center', 'gap-6');
        itemDiv.innerHTML = `
            <div class="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                <img class="w-full h-full object-cover" data-alt="${item.name}" src="${item.image_url}"/>
            </div>
            <div class="flex-grow">
                <h3 class="font-semibold text-lg">${item.name}</h3>
                <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                        <button class="minus-btn px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">-</button>
                        <span class="quantity-counter px-4 py-1 font-medium border-x border-slate-200 dark:border-slate-700">${item.qty}</span>
                        <button class="plus-btn px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">+</button>
                    </div>
                    <div class="text-right">
                        <p class="item-price font-bold text-lg text-primary">${item.price * item.qty} Ft</p>
                    </div>
                </div>
            </div>`;
        cartContainer.appendChild(itemDiv);

        // id helyett class alapján keressük, az adott itemDiv-en belül
        const minusBtn = itemDiv.querySelector('.minus-btn');
        const plusBtn = itemDiv.querySelector('.plus-btn');
        const quantityCounter = itemDiv.querySelector('.quantity-counter');
        const priceEl = itemDiv.querySelector('.item-price');

        minusBtn.addEventListener('click', async () => {
            let currentValue = parseInt(quantityCounter.textContent);
            if (currentValue > 1) {
                currentValue--;
                quantityCounter.textContent = currentValue;
                priceEl.textContent = `${item.price * currentValue} Ft`;
                item.qty = currentValue;

                await fetch(`${API_URL}/cart/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: item.productId, qty: currentValue })
                });

                cartPrice();
            }
        });

        plusBtn.addEventListener('click', async () => {
            let currentValue = parseInt(quantityCounter.textContent);
            currentValue++;
            quantityCounter.textContent = currentValue;
            priceEl.textContent = `${item.price * currentValue} Ft`;
            item.qty = currentValue;

            await fetch(`${API_URL}/cart/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: item.productId, qty: currentValue })
            });

            cartPrice();
        });
    });
}

function cartPrice() {
    const taxEl = document.getElementById('tax-rate');
    const totalEl = document.getElementById('total-price');

    const ossz = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const adoAlap = Math.round(ossz * 0.73);
    const afa = Math.round(ossz * 0.27);

    totalEl.textContent = `${adoAlap} Ft`;
    taxEl.textContent = `${afa} Ft`;
}