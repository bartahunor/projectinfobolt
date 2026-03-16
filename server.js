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


app.listen(3000, () =>
  console.log('http://localhost:3000')
)