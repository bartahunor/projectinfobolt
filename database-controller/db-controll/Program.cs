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
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("╔══════════════════════════════════════╗");
                Console.WriteLine("║           TERMÉKKEZELŐ MENÜ          ║");
                Console.WriteLine("╠══════════════════════════════════════╣");
                Console.ResetColor();
                Console.WriteLine("\n1 - Termékek listázása");
                Console.WriteLine("2 - Új termék hozzáadása");
                Console.WriteLine("3 - Termék módosítása");
                Console.WriteLine("4 - Termék törlése");
                Console.WriteLine();
                Console.WriteLine("5 - Új gyártó hozzáadása");
                Console.WriteLine("6 - Új termék típus hozzáadása");
                Console.WriteLine("7 - Gyártó törlése");
                Console.WriteLine("8 - Termék típus törlése");
                Console.WriteLine();
                Console.WriteLine("0 - Kilépés");
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("╚══════════════════════════════════════╝");
                Console.ResetColor();
                Console.Write("Választás: ");
                var choice = Console.ReadLine();

                if (choice == "1")
                    ListProducts(conn);
                else if (choice == "2")
                    InsertProduct(conn);
                else if (choice == "3")
                    UpdateProduct(conn);
                else if (choice == "4")
                    DeleteProduct(conn);
                else if (choice == "5")
                    InsertManufacturer(conn);
                else if (choice == "6")
                    InsertProductType(conn);
                else if (choice == "7")
                    DeleteManufacturer(conn);
                else if (choice == "8")
                    DeleteProductType(conn);
                else if (choice == "0")
                    break;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Hiba: " + ex.Message);
        }
    }

    static void InsertManufacturer(NpgsqlConnection conn)
    {
        Console.Write("Gyártó neve: ");
        var name = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(name))
        {
            Console.WriteLine("A név nem lehet üres!");
            return;
        }

        var sql = "INSERT INTO manufacturers (id, name) VALUES (gen_random_uuid(), @name)";
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("name", name);
        cmd.ExecuteNonQuery();

        Console.WriteLine("Gyártó sikeresen hozzáadva!");
    }

    static void InsertProductType(NpgsqlConnection conn)
    {
        Console.Write("Termék típus neve: ");
        var name = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(name))
        {
            Console.WriteLine("A név nem lehet üres!");
            return;
        }

        var sql = "INSERT INTO product_types (id, name) VALUES (gen_random_uuid(), @name)";
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("name", name);
        cmd.ExecuteNonQuery();

        Console.WriteLine("Termék típus sikeresen hozzáadva!");
    }

    static void ListProducts(NpgsqlConnection conn)
    {
        var cmd = new NpgsqlCommand("SELECT id, model, price_huf, quantity FROM products ORDER BY model", conn);
        using var reader = cmd.ExecuteReader();

        var rows = new List<(string id, string model, string price, string quantity)>();

        while (reader.Read())
        {
            rows.Add((
                reader["id"].ToString()!,
                reader["model"].ToString()!,
                reader["price_huf"].ToString()!,
                reader["quantity"].ToString()!
            ));
        }
        reader.Close();

        if (rows.Count == 0)
        {
            Console.WriteLine("Nincsenek termékek az adatbázisban.");
            return;
        }

        int idWidth = Math.Max(2, rows.Max(r => r.id.Length));
        int modelWidth = Math.Max(6, rows.Max(r => r.model.Length));
        int priceWidth = Math.Max(3, rows.Max(r => r.price.Length));
        int quantityWidth = Math.Max(8, rows.Max(r => r.quantity.Length));

        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("\n--- Termékek ---");
        Console.ResetColor();
        Console.WriteLine("{0,-" + idWidth + "} | {1,-" + modelWidth + "} | {2," + priceWidth + "} | {3," + quantityWidth + "}", "ID", "Modell", "Ár (Ft)", "Mennyiség");
        Console.WriteLine(new string('-', idWidth + modelWidth + priceWidth + quantityWidth + 9));

        foreach (var row in rows)
        {
            Console.WriteLine("{0,-" + idWidth + "} | {1,-" + modelWidth + "} | {2," + priceWidth + "} | {3," + quantityWidth + "}", row.id, row.model, row.price, row.quantity);
        }
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

        Console.Write("Mennyiség: ");
        var quantity = int.Parse(Console.ReadLine() ?? "0");

        Console.Write("Rövid leírás: ");
        var description = Console.ReadLine();

        Console.Write("Kép URL: ");
        var image = Console.ReadLine();

        // --- Új termék mentése ---
        var sql = @"INSERT INTO products 
                (id, type_id, manufacturer_id, model, price_huf, quantity, short_description, image_url)
                VALUES (gen_random_uuid(), @type_id, @manufacturer_id, @model, @price, @quantity, @desc, @image)
                RETURNING id";

        Guid newProductId;
        using (var cmd = new NpgsqlCommand(sql, conn))
        {
            cmd.Parameters.AddWithValue("type_id", typeId);
            cmd.Parameters.AddWithValue("manufacturer_id", manufacturerId);
            cmd.Parameters.AddWithValue("model", model);
            cmd.Parameters.AddWithValue("price", price);
            cmd.Parameters.AddWithValue("quantity", quantity);
            cmd.Parameters.AddWithValue("desc", description);
            cmd.Parameters.AddWithValue("image", image);

            newProductId = (Guid)cmd.ExecuteScalar();
        }

        Console.WriteLine("Termék sikeresen hozzáadva!");

        // --- 3 Spec megadása ---
        for (int i = 1; i <= 3; i++)
        {
            Console.Write($"{i}/3 Specifikus adat neve: ");
            var specName = Console.ReadLine();
            if (string.IsNullOrWhiteSpace(specName))
            {
                Console.WriteLine("A spec név nem lehet üres!");
                i--; // újra kérjük ugyanazt a spec-et
                continue;
            }

            Console.Write($"{i}/3 Specifikus adat értéke: ");
            var specValue = Console.ReadLine();
            if (string.IsNullOrWhiteSpace(specValue))
            {
                Console.WriteLine("A spec értéke nem lehet üres!");
                i--; // újra kérjük ugyanazt a spec-et
                continue;
            }

            // --- Spec mentése ---
            var sqlSpec = @"INSERT INTO product_specs (id, product_id, spec_name, spec_value)
                        VALUES (gen_random_uuid(), @product_id, @spec_name, @spec_value)";
            using var cmdSpec = new NpgsqlCommand(sqlSpec, conn);
            cmdSpec.Parameters.AddWithValue("product_id", newProductId);
            cmdSpec.Parameters.AddWithValue("spec_name", specName);
            cmdSpec.Parameters.AddWithValue("spec_value", specValue);
            cmdSpec.ExecuteNonQuery();
        }

        Console.WriteLine("Spec-ek sikeresen hozzáadva a termékhez!");
    }


    // --- Helper metódusok ---
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

    static List<string> GetSpecNames(NpgsqlConnection conn)
    {
        var list = new List<string>();
        var sql = "SELECT DISTINCT spec_name FROM product_specs ORDER BY spec_name";
        using var cmd = new NpgsqlCommand(sql, conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(reader["spec_name"].ToString()!);
        }
        reader.Close();
        return list;
    }



    static List<(string id, string name, string value)> GetAllSpecs(NpgsqlConnection conn)
    {
        var list = new List<(string, string, string)>();
        var sql = "SELECT id, spec_name, spec_value FROM product_specs ORDER BY spec_name";
        using var cmd = new NpgsqlCommand(sql, conn);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add((reader["id"].ToString()!, reader["spec_name"].ToString()!, reader["spec_value"].ToString()!));
        }
        reader.Close();
        return list;
    }

    // --- A te eredeti Update/Delete metódusaid maradnak változatlanul ---
    static void UpdateProduct(NpgsqlConnection conn)
    {
        Console.Write("Add meg a módosítandó termék ID-ját: ");
        var id = Console.ReadLine();

        Console.Write("Új modell név: ");
        var model = Console.ReadLine();

        Console.Write("Új ár: ");
        var price = int.Parse(Console.ReadLine() ?? "0");

        Console.Write("Új mennyiség: ");
        var quantity = int.Parse(Console.ReadLine() ?? "0");

        Console.Write("Új leírás: ");
        var desc = Console.ReadLine();

        var sql = @"UPDATE products 
                    SET model = @model, 
                        price_huf = @price, 
                        quantity = @quantity,
                        short_description = @desc
                    WHERE id = @id";

        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("model", model);
        cmd.Parameters.AddWithValue("price", price);
        cmd.Parameters.AddWithValue("quantity", quantity);
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

    static void DeleteManufacturer(NpgsqlConnection conn)
    {
        var manufacturers = GetLookupTable(conn, "manufacturers");
        Console.WriteLine("\nElérhető gyártók:");
        foreach (var m in manufacturers)
            Console.WriteLine($"{m.id} - {m.name}");

        Console.Write("Add meg a törlendő gyártó ID-ját: ");
        var idInput = Console.ReadLine();

        if (!Guid.TryParse(idInput, out var id))
        {
            Console.WriteLine("Érvénytelen ID!");
            return;
        }

        var sql = "DELETE FROM manufacturers WHERE id = @id";
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);

        int rows = cmd.ExecuteNonQuery();

        if (rows > 0)
            Console.WriteLine("Gyártó törölve!");
        else
            Console.WriteLine("Nem található ilyen ID!");
    }

    static void DeleteProductType(NpgsqlConnection conn)
    {
        var types = GetLookupTable(conn, "product_types");
        Console.WriteLine("\nElérhető termék típusok:");
        foreach (var t in types)
            Console.WriteLine($"{t.id} - {t.name}");

        Console.Write("Add meg a törlendő termék típus ID-ját: ");
        var idInput = Console.ReadLine();

        if (!Guid.TryParse(idInput, out var id))
        {
            Console.WriteLine("Érvénytelen ID!");
            return;
        }

        var sql = "DELETE FROM product_types WHERE id = @id";
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);

        int rows = cmd.ExecuteNonQuery();

        if (rows > 0)
            Console.WriteLine("Termék típus törölve!");
        else
            Console.WriteLine("Nem található ilyen ID!");
    }
}