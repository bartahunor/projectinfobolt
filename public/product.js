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
}