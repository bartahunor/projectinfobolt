async function loadItems() {
  const res = await fetch('/api/items')
  const items = await res.json()

  console.log(items)
}
loadItems()