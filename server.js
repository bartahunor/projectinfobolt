import express from 'express'
import cors from 'cors'
import sql from './db.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// SELECT
app.get('/api/items', async (req, res) => {
  const data = await sql`select * from products`
  res.json(data)
})


app.listen(3000, () =>
  console.log('http://localhost:3000')
)