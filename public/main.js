products = null;

async function loadItems() {
  const res = await fetch('/api/items');
  const items = await res.json();
  products = items;
  loadGrid();
}
loadItems();


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
              <button class="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-lg flex items-center justify-center transition-colors">
                  <span class="material-symbols-outlined">add_shopping_cart</span>
              </button>
          </div>
      </div>
    `;

    prodDiv.addEventListener("click", () => {
      window.location.href = `/product.html?id=${p.id}`;
    });
    grid.appendChild(prodDiv);
  });
}