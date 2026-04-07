import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mode = process.argv[2] || 'public';
const seedFile = path.join(__dirname, '..', 'seeds', `${mode}.json`);
const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

async function clearTables() {
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of ['favorites','order_items','orders','listing_images','listings','categories','addresses','users']) {
    await pool.query(`TRUNCATE TABLE ${table}`);
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function main() {
  await clearTables();

  const userIdByEmail = new Map();
  const categoryIdBySlug = new Map();
  const listingIdBySlug = new Map();

  for (const user of seed.users) {
    const hash = await bcrypt.hash(user.password, 10);
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [user.email, hash, user.firstName, user.lastName, user.role, user.phone || null, user.isActive ? 1 : 0]
    );
    userIdByEmail.set(user.email, result.insertId);
  }

  for (const category of seed.categories) {
    const [result] = await pool.execute(
      `INSERT INTO categories (name, slug, description, image_url, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [category.name, category.slug, category.description || '', category.imageUrl || '', category.isActive ? 1 : 0]
    );
    categoryIdBySlug.set(category.slug, result.insertId);
  }

  for (const listing of seed.listings) {
    const [result] = await pool.execute(
      `INSERT INTO listings (seller_id, category_id, title, slug, description, item_type, brand_or_series, condition_label,
       grading_company, grade_value, price, shipping_fee, quantity_available, status, cover_image_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userIdByEmail.get(listing.sellerEmail),
        categoryIdBySlug.get(listing.categorySlug),
        listing.title,
        listing.slug,
        listing.description,
        listing.itemType,
        listing.brandOrSeries,
        listing.conditionLabel,
        listing.gradingCompany || null,
        listing.gradeValue || null,
        listing.price,
        listing.shippingFee,
        listing.quantityAvailable,
        listing.status,
        listing.coverImageUrl || ''
      ]
    );
    listingIdBySlug.set(listing.slug, result.insertId);
  }

  for (const favorite of seed.favorites) {
    await pool.execute('INSERT INTO favorites (user_id, listing_id, created_at) VALUES (?, ?, NOW())', [
      userIdByEmail.get(favorite.userEmail),
      listingIdBySlug.get(favorite.listingSlug)
    ]);
  }

  for (const order of seed.orders) {
    const [result] = await pool.execute(
      `INSERT INTO orders (buyer_id, seller_id, order_number, status, subtotal, shipping_total, grand_total,
       shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country,
       tracking_number, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userIdByEmail.get(order.buyerEmail),
        userIdByEmail.get(order.sellerEmail),
        order.orderNumber,
        order.status,
        order.subtotal,
        order.shippingTotal,
        order.grandTotal,
        order.shipping.fullName,
        order.shipping.line1,
        order.shipping.line2 || '',
        order.shipping.city,
        order.shipping.state,
        order.shipping.postalCode,
        order.shipping.country,
        order.trackingNumber || null
      ]
    );
    for (const item of order.items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, listing_id, listing_title_snapshot, condition_snapshot, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [result.insertId, listingIdBySlug.get(item.listingSlug), item.title, item.conditionLabel, item.unitPrice, item.quantity, item.lineTotal]
      );
    }
  }

  console.log(`Seeded ${mode} dataset`);
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
