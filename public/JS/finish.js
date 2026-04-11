const { jsPDF } = window.jspdf;
const API_URL = 'http://localhost:3000';

window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "/pieces/header.html");
  await includeHTML("footer", "/pieces/footer.html");

  await updateCartCount();
  loadOrder();
});

async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
};

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


let orderdetails = null;

async function loadOrder() {
    const res = await fetch(`${API_URL}/api/order/summary`);
    const data = await res.json();
    orderdetails = data;
    console.log(orderdetails);

    loadCustomerData();
    loadItems();
    loadPrice();
}

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

    const ossz = orderdetails.order.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const adoAlap = Math.round(ossz * 0.73);
    const afa = Math.round(ossz * 0.27);

    org.innerText = adoAlap + ' Ft';
    tax.innerText = afa + ' Ft';
    taxed.innerText = ossz + ' Ft';
}

function generatePDF() {
    // Ellenőrzés: töltődtek-e már be az adatok
    if (!orderdetails || !orderdetails.order) {
        alert('Az adatok még töltődnek, kérjük várjon!');
        return;
    }

    const order = orderdetails.order;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const primaryColor = [19, 91, 236];

    // --- FEJLÉC ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageW, 42, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('ClickTech Webshop', margin, 17);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 220, 255);
    doc.text('ELEKTRONIKUS SZÁMLA', margin, 25);

    const today = new Date().toLocaleDateString('hu-HU');
    doc.setTextColor(255, 255, 255);
    doc.text('Számlaszám: #INV-' + order.orderId, pageW - margin, 17, { align: 'right' });
    doc.text('Kelt: ' + today, pageW - margin, 25, { align: 'right' });

    // --- SZÁLLÍTÓ / VEVŐ ---
    let y = 55;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('SZÁLLÍTÓ', margin, y);
    doc.text('VEVŐ', pageW / 2 + 5, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('ClickTech Webshop Zrt.', margin, y);
    doc.text(order.firstname + ' ' + order.lastname, pageW / 2 + 5, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text('1117 Budapest, Infopark setany 1.', margin, y);
    doc.text(order.postalcode + ' ' + order.address, pageW / 2 + 5, y);

    y += 5;
    doc.text('Adószám: 12345678-2-42', margin, y);
    doc.text(order.email, pageW / 2 + 5, y);

    y += 5;
    doc.text('Bankszámla: 11700000-00000000', margin, y);

    // --- ELVÁLASZTÓ ---
    y += 10;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);

    // --- TÁBLÁZAT FEJLÉC ---
    y += 8;
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, y - 5, pageW - margin * 2, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Termék megnevezése', margin + 2, y + 1);
    doc.text('Mennyiség', pageW - 95, y + 1, { align: 'center' });
    doc.text('Egységár', pageW - 58, y + 1, { align: 'right' });
    doc.text('Összesen', pageW - margin, y + 1, { align: 'right' });

    // --- TERMÉK SOROK ---
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const colNevMax = pageW / 2 - margin;

    order.cart.forEach(function(item, index) {
        const nevLines = doc.splitTextToSize(item.name, colNevMax);
        const sorMagassag = Math.max(9, nevLines.length * 5 + 4);

        if (index % 2 === 0) {
            doc.setFillColor(251, 252, 255);
            doc.rect(margin, y - 4, pageW - margin * 2, sorMagassag, 'F');
        }

        doc.setTextColor(30, 30, 30);
        doc.text(nevLines, margin + 2, y + 1);

        const midY = y + (nevLines.length > 1 ? (nevLines.length - 1) * 2.5 : 1);
        doc.text(String(item.qty), pageW - 95, midY, { align: 'center' });
        doc.text(item.price.toLocaleString('hu-HU') + ' Ft', pageW - 58, midY, { align: 'right' });
        doc.text((item.qty * item.price).toLocaleString('hu-HU') + ' Ft', pageW - margin, midY, { align: 'right' });

        y += sorMagassag;
    });
// --- ÖSSZESÍTŐ ---
    y += 5;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
 
    const ossz = order.cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
    const adoAlap = Math.round(ossz * 0.73);
    const afa = Math.round(ossz * 0.27);
 
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text('Nettó összesen:', pageW - 72, y);
    doc.setTextColor(30, 30, 30);
    doc.text(adoAlap.toLocaleString('hu-HU') + ' Ft', pageW - margin, y, { align: 'right' });
 
    y += 8;
    doc.setTextColor(90, 90, 90);
    doc.text('ÁFA (27%):', pageW - 72, y);
    doc.setTextColor(30, 30, 30);
    doc.text(afa.toLocaleString('hu-HU') + ' Ft', pageW - margin, y, { align: 'right' });
 
    y += 3;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(pageW - 82, y, pageW - margin, y);
 
    y += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Bruttó fizetendo:', margin, y);
    doc.text(ossz.toLocaleString('hu-HU') + ' Ft', pageW - margin, y, { align: 'right' });
 

    // --- LÁBLÉC ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageH - 18, pageW, 18, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    doc.text('Ez a bizonylat elektronikusan hitelesitett, aláírás nélül is érvényes.', pageW / 2, pageH - 10, { align: 'center' });
    doc.text('2026 ClickTech Webshop Zrt.', pageW / 2, pageH - 5, { align: 'center' });

    doc.save('szamla_' + order.orderId + '.pdf');
}

// Globálisan elérhetővé tétel a HTML onclick számára
window.generatePDF = generatePDF;