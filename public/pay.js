const API_URL = 'http://localhost:3000';

let cartItems = [];
async function loadCart() {
  const res = await fetch(`${API_URL}/cart`);
  const data = await res.json();
  cartItems = data.cart;
  console.log(data);

  cartPrice();
}
loadCart();

function cartPrice() {
    const taxEl = document.getElementById('tax-rate');
    const totalEl = document.getElementById('total-price');

    const ossz = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const adoAlap = Math.round(ossz * 0.73);
    const afa = Math.round(ossz * 0.27);

    totalEl.textContent = `${adoAlap} Ft`;
    taxEl.textContent = `${afa} Ft`;
}


function validateForm() {
    const firstname = document.getElementById('firstname')
    const lastname = document.getElementById('lastname')
    const email = document.getElementById('email')
    const address = document.getElementById('address')
    const postalcode = document.getElementById('postalcode')
    const cardnum = document.getElementById('cardnum')
    const expiredate = document.getElementById('expiredate')
    const cvc = document.getElementById('cvc')

    const errorLabel = document.getElementById('error-msg')
    const errorIcon = document.getElementById('error-icon')

    function showError(msg) {
        errorLabel.textContent = msg
        errorLabel.classList.remove('hidden')
        errorIcon.classList.remove('hidden')
    }

    function hideError() {
        errorLabel.classList.add('hidden')
        errorIcon.classList.add('hidden')
    }

    // Üres mező ellenőrzés
    const fields = [firstname, lastname, email, address, postalcode, cardnum, expiredate, cvc]
    if (fields.some(f => !f.value.trim())) {
        showError('Kérlek tölts ki minden mezőt!')
        return false
    }

    // Név — csak betű és szóköz
    const nevRegex = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/
    if (!nevRegex.test(firstname.value.trim())) {
        showError('A vezetéknév csak betűket tartalmazhat!')
        return false
    }
    if (!nevRegex.test(lastname.value.trim())) {
        showError('A keresztnév csak betűket tartalmazhat!')
        return false
    }

    // Email formátum
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value.trim())) {
        showError('Kérlek adj meg egy érvényes e-mail címet! (pl. nev@domain.hu)')
        return false
    }

    // Irányítószám — 4 számjegy
    const irsRegex = /^\d{4}$/
    if (!irsRegex.test(postalcode.value.trim())) {
        showError('Az irányítószám 4 számjegyből áll! (pl. 6763)')
        return false
    }

    // Kártyaszám — 16 számjegy, lehet szóközzel elválasztva
    const cardRegex = /^(\d{4}\s?){4}$/
    if (!cardRegex.test(cardnum.value.trim())) {
        showError('A kártyaszám 16 számjegyből áll! (pl. 0000 0000 0000 0000)')
        return false
    }

    // Lejárati dátum — HH/ÉÉ formátum
    const expRegex = /^(0[1-9]|1[0-2])\s?\/\s?(\d{2})$/
    const expMatch = expiredate.value.trim().match(expRegex)
    if (!expMatch) {
        showError('A lejárati dátum formátuma: HH / ÉÉ (pl. 08 / 27)')
        return false
    }
    // Lejárt-e?
    const now = new Date()
    const expMonth = parseInt(expMatch[1])
    const expYear = parseInt('20' + expMatch[2])
    if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
        showError('A megadott kártya lejárt!')
        return false
    }

    // CVC — pontosan 3 számjegy
    const cvcRegex = /^\d{3}$/
    if (!cvcRegex.test(cvc.value.trim())) {
        showError('A CVC kód 3 számjegyből áll!')
        return false
    }

    hideError()
    return true
}

document.getElementById('order-btn').addEventListener('click', async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const orderData = {
        firstname: document.getElementById('firstname').value.trim(),
        lastname: document.getElementById('lastname').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        postalcode: document.getElementById('postalcode').value.trim(),
        cardnum: document.getElementById('cardnum').value.trim(),
        expiredate: document.getElementById('expiredate').value.trim(),
        cvc: document.getElementById('cvc').value.trim()
    }

    try {
        const res = await fetch(`${API_URL}/api/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })

        const data = await res.json()

        if (data.success) {
            sessionStorage.setItem('orderId', data.orderId)
            window.location.href = 'finish_order.html'
        } else {
            const errorLabel = document.getElementById('error-msg')
            const errorIcon = document.getElementById('error-icon')
            errorLabel.textContent = data.message
            errorLabel.classList.remove('hidden')
            errorIcon.classList.remove('hidden')
        }

    } catch (error) {
        console.error('❌ Hiba:', error)
    }
})