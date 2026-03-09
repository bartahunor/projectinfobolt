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


app.listen(3000, () =>
  console.log('http://localhost:3000')
)