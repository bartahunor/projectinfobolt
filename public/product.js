const API_URL = 'http://localhost:3000';

window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "/pieces/header.html");
  await includeHTML("footer", "/pieces/footer.html");

  loadProduct();
});

async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
};

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const res = await fetch(`/api/items/${id}`);
    const product = await res.json();

    console.log(product);

    const prodPic = document.getElementById('prod-pic');
    prodPic.style.backgroundImage = `url("${product.image_url}")`;
    prodPic.setAttribute('data-alt', product.name);

    document.getElementById('page-name').textContent = product.model;
    document.getElementById('price').textContent = `${product.price_huf} Ft`;
    document.getElementById('prod-name').textContent = product.model;
    document.getElementById('orginal-price').textContent = `${Math.round(product.price_huf * 1.25)} Ft`;
    document.getElementById('prod-desc').textContent = product.short_description;
    document.getElementById('spec-name-one').textContent = product.specs[0].name;
    document.getElementById('spec-value-one').textContent = product.specs[0].value;
    document.getElementById('spec-name-two').textContent = product.specs[1].name;
    document.getElementById('spec-value-two').textContent = product.specs[1].value;
    document.getElementById('spec-name-three').textContent = product.specs[2].name;
    document.getElementById('spec-value-three').textContent = product.specs[2].value;
    document.getElementById('prodnum').textContent = "Cikkszám: " + product.id;

    document.getElementById('add-to-cart').addEventListener('click', addToCart);
}

const minusBtn = document.getElementById('minus-btn');
const plusBtn = document.getElementById('plus-btn');
const quantityCounter = document.getElementById('quantity-counter');

minusBtn.addEventListener('click', () => {
    let currentValue = parseInt(quantityCounter.value);
    if (currentValue > 1) {
        quantityCounter.value = currentValue - 1;
    }
});

plusBtn.addEventListener('click', () => {
    let currentValue = parseInt(quantityCounter.value);
    quantityCounter.value = currentValue + 1;
});

async function addToCart() {
  const id = document.getElementById('prodnum').textContent.split(': ')[1];
  const name = document.getElementById('prod-name').textContent;
  const priceText = document.getElementById('price').textContent;
  const price = parseInt(priceText.replace(' Ft', ''));
  const qty = parseInt(quantityCounter.value);
  const image_url = document.getElementById('prod-pic').getAttribute('data-alt');

  try {
    

    const res = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: id,
        name: name,
        price: price,
        qty: qty,
        image_url: image_url
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Hiba történt');
    }

    console.log(`Termék hozzáadva a kosárhoz: ${name} (${qty} db), kép: ${image_url}`);
  } catch (err) {
    console.error('Kosár hiba:', err.message);
    
  }
}