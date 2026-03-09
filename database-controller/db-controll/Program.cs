using System;
using System.Collections.Generic;
using Npgsql;

class Program
{
    static void Main()
    {
        var connectionString =
           "Host=aws-1-eu-west-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.qeeonjcudonodvskbcru;Password=ZQ1ZkIENYa5N6MRI;SSL Mode=Require;Trust Server Certificate=true";

        using var conn = new NpgsqlConnection(connectionString);

        try
        {
            conn.Open();
            Console.WriteLine("Csatlakozva az adatbázishoz!");

            while (true)
            {
                Console.WriteLine("\n1 - Termékek listázása");
                Console.WriteLine("2 - Új termék hozzáadása");
                Console.WriteLine("3 - Termék módosítása");
                Console.WriteLine("4 - Termék törlése");
                Console.WriteLine("0 - Kilépés");

                var choice = Console.ReadLine();

                if (choice == "1")
                    ListProducts(conn);
                else if (choice == "2")
                    InsertProduct(conn);
                else if (choice == "3")
                    UpdateProduct(conn);
                else if (choice == "4")
                    DeleteProduct(conn);
                else if (choice == "0")
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Hiba: " + ex.Message);
        }
    }

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

    static void InsertProduct(NpgsqlConnection conn)
    {
        var types = GetLookupTable(conn, "product_types");
        Console.WriteLine("\nElérhető termék típusok:");
        foreach (var (id, name) in types)
            Console.WriteLine($"{id} - {name}");
        Console.Write("Írd be a type_id-t (UUID): ");
        var typeIdInput = Console.ReadLine();

        var manufacturers = GetLookupTable(conn, "manufacturers");
        Console.WriteLine("\nElérhető gyártók:");
        foreach (var (id, name) in manufacturers)
            Console.WriteLine($"{id} - {name}");
        Console.Write("Írd be a manufacturer_id-t (UUID): ");
        var manufacturerIdInput = Console.ReadLine();

        if (!Guid.TryParse(typeIdInput, out var typeId))
        {
            Console.WriteLine("Érvénytelen type_id!");
            return;
        }
        if (!Guid.TryParse(manufacturerIdInput, out var manufacturerId))
        {
            Console.WriteLine("Érvénytelen manufacturer_id!");
            return;
        }

        Console.Write("Modell neve: ");
        var model = Console.ReadLine();

        Console.Write("Ár (Ft): ");
        var price = int.Parse(Console.ReadLine() ?? "0");

        Console.Write("Rövid leírás: ");
        var description = Console.ReadLine();

        Console.Write("Kép URL: ");
        var image = Console.ReadLine();

        Console.WriteLine($"Beszúrás: type_id={typeId}, manufacturer_id={manufacturerId}, model={model}, price={price}");

        var sql = @"INSERT INTO products 
                (id, type_id, manufacturer_id, model, price_huf, short_description, image_url)
                VALUES (gen_random_uuid(), @type_id, @manufacturer_id, @model, @price, @desc, @image)";

        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("type_id", typeId);
        cmd.Parameters.AddWithValue("manufacturer_id", manufacturerId);
        cmd.Parameters.AddWithValue("model", model);
        cmd.Parameters.AddWithValue("price", price);
        cmd.Parameters.AddWithValue("desc", description);
        cmd.Parameters.AddWithValue("image", image);

        cmd.ExecuteNonQuery();

        Console.WriteLine("Termék sikeresen hozzáadva!");
    }

    static void UpdateProduct(NpgsqlConnection conn)
    {
        Console.Write("Add meg a módosítandó termék ID-ját: ");
        var id = Console.ReadLine();

        Console.Write("Új modell név: ");
        var model = Console.ReadLine();

        Console.Write("Új ár: ");
        var price = int.Parse(Console.ReadLine() ?? "0");

        Console.Write("Új leírás: ");
        var desc = Console.ReadLine();

        var sql = @"UPDATE products 
                    SET model = @model, 
                        price_huf = @price, 
                        short_description = @desc
                    WHERE id = @id";

        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("model", model);
        cmd.Parameters.AddWithValue("price", price);
        cmd.Parameters.AddWithValue("desc", desc);
        cmd.Parameters.AddWithValue("id", Guid.Parse(id));

        int rows = cmd.ExecuteNonQuery();

        if (rows > 0)
            Console.WriteLine("Termék módosítva!");
        else
            Console.WriteLine("Nem található ilyen ID!");
    }

    static void DeleteProduct(NpgsqlConnection conn)
    {
        Console.Write("Add meg a törlendő termék ID-ját: ");
        var id = Console.ReadLine();

        var sql = "DELETE FROM products WHERE id = @id";

        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", Guid.Parse(id));

        int rows = cmd.ExecuteNonQuery();

        if (rows > 0)
            Console.WriteLine("Termék törölve!");
        else
            Console.WriteLine("Nem található ilyen ID!");
    }

    static List<(string id, string name)> GetLookupTable(NpgsqlConnection conn, string tableName)
    {
        var list = new List<(string, string)>();
        var sql = $"SELECT id, name FROM {tableName} ORDER BY name";

        using var cmd = new NpgsqlCommand(sql, conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add((reader["id"].ToString()!, reader["name"].ToString()!));
        }
        reader.Close();
        return list;
    }
}