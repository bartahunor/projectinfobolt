const API_URL = 'http://localhost:3000';

let cartItems = [];
async function loadCart() {
  const res = await fetch(`${API_URL}/cart`);
  const data = await res.json();
  cartItems = data.cart;
  console.log(data);

  renderCart();
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
            <h3 class="font-semibold text-lg">${item.name}</h3><!---Termék neve-->
            <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
            <button class="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">-</button>
            <span class="px-4 py-1 font-medium border-x border-slate-200 dark:border-slate-700">${item.qty}</span>
            <button class="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">+</button>
            </div>
            <div class="text-right">
            <p class="font-bold text-lg text-primary">${item.price * item.qty} Ft</p><!---Termék ára-->
            </div>
            </div>`;
        cartContainer.appendChild(itemDiv);
    
    });
}