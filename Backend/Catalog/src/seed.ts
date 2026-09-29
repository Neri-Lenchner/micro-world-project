// Fills the catalog with demo products so the Browse page isn't empty.
// Run with: pnpm --filter @nltech/catalog seed
// Safe to run again: it only deletes and re-creates the demo seller's products.
import {dal} from "./dal";

const DEMO_SELLER_ID = 0; // Real users start at id 1, so 0 never clashes with a real account.
const DEMO_SELLER_EMAIL = "demo@microworld.com";

type SeedProduct = [title: string, description: string, price: number, category: string, condition: string];

const products: SeedProduct[] = [
    ["Fender Stratocaster", "Classic sunburst Strat, a few light scratches, plays beautifully.", 2400, "music", "used"],
    ["Yamaha acoustic guitar", "Great beginner acoustic, comes with a soft case.", 650, "music", "used"],
    ["Boss DS-1 distortion pedal", "Orange classic. Works perfectly.", 180, "music", "used"],
    ["Digital piano 88 keys", "Weighted keys, sustain pedal included. Brand new in box.", 2900, "music", "new"],
    ["iPhone 13 128GB", "Battery health 87%, always in a case.", 1800, "electronics", "used"],
    ["Noise cancelling headphones", "Over-ear, Bluetooth, 30h battery.", 750, "electronics", "new"],
    ["27 inch monitor", "1440p, 144Hz, no dead pixels.", 900, "electronics", "used"],
    ["Mechanical keyboard", "Brown switches, RGB, full size.", 320, "electronics", "used"],
    ["Wooden desk lamp", "Warm light, adjustable arm.", 120, "home", "new"],
    ["Three-seat sofa", "Grey fabric, very comfortable, pickup only.", 1500, "home", "used"],
    ["Coffee machine", "Espresso + milk frother, descaled regularly.", 600, "home", "used"],
    ["Set of 6 plates", "White ceramic, never used.", 90, "home", "new"],
    ["Leather jacket size M", "Black, genuine leather, worn a few times.", 450, "fashion", "used"],
    ["Running shoes size 42", "Barely used, too small for me.", 280, "fashion", "used"],
    ["Winter coat size L", "Warm and waterproof, with hood.", 390, "fashion", "new"],
    ["Mountain bike 26 inch", "21 gears, new tires, front suspension.", 1100, "sports", "used"],
    ["Yoga mat", "Non-slip, 6mm thick.", 70, "sports", "new"],
    ["Dumbbell set 2x10kg", "Adjustable plates, with case.", 250, "sports", "used"],
    ["Harry Potter box set", "All 7 books, English, good condition.", 220, "books", "used"],
    ["Clean Code", "Robert C. Martin. A few highlighted pages.", 80, "books", "used"],
    ["Board game collection", "Catan, Ticket to Ride and Carcassonne, all complete.", 300, "other", "used"],
];

async function seed(): Promise<void> {
    await dal.init();
    await dal.pool.query("DELETE FROM products WHERE seller_id = ?", [DEMO_SELLER_ID]);

    for (const [index, [title, description, price, category, condition]] of products.entries()) {
        // Placeholder photos from picsum.photos - random pictures, not of the actual item.
        const imageUrl = `https://picsum.photos/seed/microworld-${index}/600/400`;
        await dal.pool.query(
            `INSERT INTO products (title, description, price, category, \`condition\`, image_url, seller_id, seller_email)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, price, category, condition, imageUrl, DEMO_SELLER_ID, DEMO_SELLER_EMAIL]
        );
    }

    console.log(`Seeded ${products.length} demo products.`);
}

seed()
    .catch(err => {
        console.error("Seeding failed:", err);
        process.exitCode = 1;
    })
    .finally(() => dal.pool.end());
