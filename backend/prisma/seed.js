import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Nettoyage ─────────────────────────────────────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123", 12);
  const userPassword = await bcrypt.hash("User1234", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@shop.com",
      password: adminPassword,
      role: "admin",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Alice Martin",
      email: "alice@example.com",
      password: userPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Bob Dupont",
      email: "bob@example.com",
      password: userPassword,
    },
  });

  console.log(
    `✅ Users: admin@shop.com (Admin123) | alice@example.com (User1234)`,
  );

  // ── Catégories ────────────────────────────────────────────────────────────
  const [tshirts, pants, accessories] = await Promise.all([
    prisma.category.create({ data: { name: "T-Shirts", slug: "t-shirts" } }),
    prisma.category.create({ data: { name: "Pants", slug: "pants" } }),
    prisma.category.create({
      data: { name: "Accessories", slug: "accessories" },
    }),
  ]);

  console.log(`✅ Categories: T-Shirts, Pants, Accessories`);

  // ── Produits ──────────────────────────────────────────────────────────────
  const products = await Promise.all([
    // T-Shirts
    prisma.product.create({
      data: {
        name: "Classic White T-Shirt",
        description: "100% organic cotton, relaxed fit",
        price: 29.99,
        stock: 150,
        categoryId: tshirts.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Striped Navy T-Shirt",
        description: "Cotton blend, slim fit",
        price: 34.99,
        stock: 80,
        categoryId: tshirts.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Graphic Print Tee",
        description: "Oversized fit, unisex",
        price: 39.99,
        stock: 60,
        categoryId: tshirts.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "V-Neck Essential",
        description: "Soft modal blend",
        price: 27.99,
        stock: 200,
        categoryId: tshirts.id,
      },
    }),
    // Pants
    prisma.product.create({
      data: {
        name: "Slim Chino Pants",
        description: "Stretch cotton, 4 colors",
        price: 79.99,
        stock: 90,
        categoryId: pants.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Wide-Leg Trousers",
        description: "Linen blend, summer edition",
        price: 89.99,
        stock: 45,
        categoryId: pants.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cargo Pants",
        description: "Durable ripstop fabric",
        price: 99.99,
        stock: 30,
        categoryId: pants.id,
      },
    }),
    // Accessories
    prisma.product.create({
      data: {
        name: "Canvas Tote Bag",
        description: "Heavy duty, 15L capacity",
        price: 24.99,
        stock: 300,
        categoryId: accessories.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Wool Beanie",
        description: "Merino wool, one size",
        price: 34.99,
        stock: 120,
        categoryId: accessories.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Leather Belt",
        description: "Full-grain leather, silver buckle",
        price: 49.99,
        stock: 5,
        categoryId: accessories.id,
      },
    }), // Low stock
  ]);

  console.log(`✅ Products: ${products.length} created`);

  // ── Commandes ─────────────────────────────────────────────────────────────
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: "delivered",
      total: 64.98,
      stripePaymentId: "pi_test_seed_001",
      items: {
        create: [
          { productId: products[0].id, quantity: 2, unitPrice: 29.99 },
          { productId: products[7].id, quantity: 1, unitPrice: 24.99 }, // Tote Bag — ajusté
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      status: "paid",
      total: 79.99,
      stripePaymentId: "pi_test_seed_002",
      items: {
        create: [{ productId: products[4].id, quantity: 1, unitPrice: 79.99 }],
      },
    },
  });

  console.log(
    `✅ Orders: ${order1.id.slice(-8)} (delivered), ${order2.id.slice(-8)} (paid)`,
  );
  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin : admin@shop.com  / Admin123");
  console.log("   User  : alice@example.com / User1234");
  console.log("   User  : bob@example.com   / User1234");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
