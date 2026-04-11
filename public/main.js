products = null;
const API_URL = 'http://localhost:3000';

window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "/pieces/header.html");
  await includeHTML("footer", "/pieces/footer.html");

  await updateCartCount();
  loadItems();
});

async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
};

async function loadItems() {
  const res = await fetch(`${API_URL}/api/items`);
  const items = await res.json();
  products = items;
  loadGrid();
}



function loadGrid() {
  let grid = document.getElementById("product-grid");
  grid.innerHTML = "";
  products.forEach(p => {
    const prodDiv = document.createElement("div");
    prodDiv.id = `product-${p.id}`;                   // ← id hozzáadva
    prodDiv.classList.add(
      "bg-white", "dark:bg-slate-900", "rounded-xl",
      "overflow-hidden", "border", "border-slate-200",
      "dark:border-slate-800", "group", "hover:shadow-xl",
      "transition-all", "duration-300"
    );
    prodDiv.innerHTML = `
      <div class="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="${p.model}" src="${p.image_url}"/>
          <div class="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Új termék</div>
          <button class="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="material-symbols-outlined text-[20px]">favorite</span>
          </button>
      </div>
      <div class="p-5">
          <div class="text-xs text-slate-400 mb-1">${p.type_name} • ${p.manufacturer_name}</div>
          <h3 class="font-bold text-lg mb-2 leading-tight">${p.model}</h3>
          <div class="flex items-center gap-1 mb-4">
              <span class="material-symbols-outlined text-yellow-400 text-sm fill-1">shelves</span>
              <span class="text-sm font-semibold">${p.quantity}db készleten</span>
          </div>
          <div class="flex items-center justify-between mt-auto">
              <span class="text-xl font-black">${p.price_huf} Ft</span>
              <button class="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-lg flex items-center justify-center transition-colors cart-btn">
                  <span class="material-symbols-outlined">add_shopping_cart</span>
              </button>
          </div>
      </div>
    `;

    const cartBtn = prodDiv.querySelector('.cart-btn');
      cartBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

        try {
          cartBtn.disabled = true;

          const res = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: p.id,
              name: p.model,
              price: p.price_huf,
              qty: 1,
              image_url: p.image_url
            }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Hiba történt');
          }

          const icon = cartBtn.querySelector('.material-symbols-outlined');
          icon.textContent = 'check';
          setTimeout(() => {
            icon.textContent = 'add_shopping_cart';
            cartBtn.disabled = false;
          }, 1500);

          console.log(`Termék hozzáadva a kosárhoz: ${p.model}, kép: ${p.image_url}`);

        } catch (err) {
          console.error('Kosár hiba:', err.message);
          cartBtn.disabled = false;
        }

        updateCartCount();
      });

    prodDiv.addEventListener("click", () => {
      window.location.href = `/product.html?id=${p.id}`;
    });
    grid.appendChild(prodDiv);
  });
}

async function updateCartCount() {
    const res = await fetch(`${API_URL}/api/cart/count`);
    const data = await res.json();
    
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    if (data.count > 0) {
        badge.textContent = data.count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}
