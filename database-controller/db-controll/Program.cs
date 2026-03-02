using System;
using Npgsql;

class Program
{
    static void Main()
    {
        // 1️⃣ Connection string
        var connectionString = "Host=xyz.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true;";

        using var conn = new NpgsqlConnection(connectionString);

        try
        {
            conn.Open();
            Console.WriteLine("Csatlakozva az adatbázishoz!");

            while (true)
            {
                Console.WriteLine("\n1 - Termékek listázása");
                Console.WriteLine("2 - Új termék hozzáadása");
                Console.WriteLine("0 - Kilépés");

                var choice = Console.ReadLine();

                if (choice == "1")
                {
                    ListProducts(conn);
                }
                else if (choice == "2")
                {
                    InsertProduct(conn);
                }
                else if (choice == "0")
                {
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Hiba: " + ex.Message);
        }
    }

    // 2️⃣ Termékek listázása
    static void ListProducts(NpgsqlConnection conn)
    {
        var cmd = new NpgsqlCommand("SELECT id, model, price_huf FROM products", conn);
        using var reader = cmd.ExecuteReader();

        Console.WriteLine("\n--- Termékek ---");
        while (reader.Read())
        {
            Console.WriteLine($"{reader["id"]} | {reader["model"]} | {reader["price_huf"]} Ft");
        }
        reader.Close();
    }

    // 3️⃣ Új termék hozzáadása
    static void InsertProduct(NpgsqlConnection conn)
    {
        Console.Write("Modell neve: ");
        var model = Console.ReadLine();

        Console.Write("Ár (Ft): ");
        var price = int.Parse(Console.ReadLine() ?? "0");

        Console.Write("Rövid leírás: ");
        var description = Console.ReadLine();

        var sql = "INSERT INTO products (id, model, price_huf, short_description, image_url) " +
                  "VALUES (gen_random_uuid(), @model, @price, @desc, 'no-image')";

        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("model", model);
        cmd.Parameters.AddWithValue("price", price);
        cmd.Parameters.AddWithValue("desc", description);

        cmd.ExecuteNonQuery();

        Console.WriteLine("Termék sikeresen hozzáadva!");
    }
}
