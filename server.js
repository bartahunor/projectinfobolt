import express from 'express'
import cors from 'cors'
import sql from './db.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.get('/api/items', async (req, res) => {
  const data = await sql`
    SELECT
      products.*,
      product_types.name AS type_name,
      manufacturers.name AS manufacturer_name
    FROM products
    JOIN product_types ON products.type_id = product_types.id
    JOIN manufacturers ON products.manufacturer_id = manufacturers.id
  `
  res.json(data)
  console.log(data)
})

app.get('/api/items/:id', async (req, res) => {
  const { id } = req.params; // ← az URL-ből jön, nem globális változóból

  const data = await sql`
    SELECT
      products.*,
      product_types.name AS type_name,
      manufacturers.name AS manufacturer_name,
      product_specs.spec_name AS specname,
      product_specs.spec_value AS specvalue
    FROM products
    JOIN product_types ON products.type_id = product_types.id
    JOIN manufacturers ON products.manufacturer_id = manufacturers.id
    JOIN product_specs ON products.id = product_specs.product_id
    WHERE products.id = ${id}
  `

  if (data.length === 0) {
    return res.status(404).json({ error: 'A termék nem található' });
  }

  const product = {
    ...data[0],                          // ← termék adatok az első sorból
    specs: data.map(row => ({            // ← összes spec külön tömbként
      name: row.specname,
      value: row.specvalue
    }))
  };

  res.json(product);
})


/* ------------ CART ------------- */
let cart = []; // globális kosár

app.post('/cart/add', (req, res) => {
  const { productId, name, price, qty = 1, image_url } = req.body;

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, name, price, qty, image_url });
  }
  console.log(`Kosár frissítve: ${name} (${qty}db)`);
  res.json({ cart });
});

app.get('/cart', (req, res) => {
  res.json({ cart });
});

app.post('/cart/remove', (req, res) => {
  cart = cart.filter(item => item.productId !== req.body.productId);
  res.json({ cart });
});

app.post('/cart/clear', (req, res) => {
  cart = [];
  res.json({ cart });
});

app.post('/cart/update', (req, res) => {
  const { productId, qty } = req.body;

  if (qty < 1) {
    return res.status(400).json({ error: 'A mennyiség nem lehet kisebb 1-nél' });
  }

  const item = cart.find(item => item.productId === productId);
  if (!item) {
    return res.status(404).json({ error: 'A termék nincs a kosárban' });
  }

  item.qty = qty;
  res.json({ cart });
});

/* -------------- ORDER ------------ */
let lastOrder = null  // ← új változó

app.post('/api/order', async (req, res) => {
    const { firstname, lastname, email, address, postalcode, cardnum, expiredate, cvc } = req.body

    if (!firstname || !lastname || !email || !address || !postalcode || !cardnum || !expiredate || !cvc) {
        return res.status(400).json({ success: false, message: 'Hiányzó adatok!' })
    }

    try {
        const result = await sql`
            INSERT INTO orders (firstname, lastname, email, address, postalcode, cart)
            VALUES (
                ${firstname},
                ${lastname},
                ${email},
                ${address},
                ${postalcode},
                ${JSON.stringify(cart)}
            )
            RETURNING id
        `

        // Elmentjük a rendelés adatait lekérés előtt
        lastOrder = {
            orderId: result[0].id,
            firstname,
            lastname,
            email,
            address,
            postalcode,
            cart: [...cart]  // másolat, ne a referencia
        }


        res.status(201).json({
            success: true,
            message: 'Rendelés sikeresen leadva!',
            orderId: result[0].id
        })

    } catch (error) {
        console.error('❌ Rendelés mentési hiba:', error)
        res.status(500).json({ success: false, message: 'Szerver hiba történt!' })
    }
})

app.get('/api/order/summary', (req, res) => {
    if (!lastOrder) {
        return res.status(404).json({ success: false, message: 'Nincs rendelési adat!' })
    }

    const orderData = { ...lastOrder }
    lastOrder = null
    cart = []

    res.json({ success: true, order: orderData })
})


app.listen(3000, () =>
  console.log('http://localhost:3000')
)