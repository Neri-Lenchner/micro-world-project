// Fills the catalog with demo products so the Browse page isn't empty.
// Run with: pnpm --filter @nltech/catalog seed
// Safe to run again: it only deletes and re-creates the demo seller's products.
import {dal} from "./dal";

const DEMO_SELLER_ID = 0; // Real users start at id 1, so 0 never clashes with a real account.
const DEMO_SELLER_EMAIL = "demo@microworld.com";

// The last column is a file name on Wikimedia Commons (free-licensed photos of the actual kind of item).
type SeedProduct = [title: string, description: string, price: number, category: string, condition: string, commonsFile: string];

const products: SeedProduct[] = [
    ["Fender Stratocaster", "Deluxe Player series, a few light scratches, plays beautifully.", 2400, "music", "used", "Fender Stratocaster Deluxe Player Series.JPG"],
    ["Yamaha acoustic guitar", "Great beginner acoustic, comes with a soft case.", 650, "music", "used", "Yamaha FG-365SII Acoustic Guitar.jpg"],
    ["Boss DS-1 distortion pedal", "Orange classic. Works perfectly.", 180, "music", "used", "Boss-DS-1.jpg"],
    ["Digital piano 88 keys", "Weighted keys, sustain pedal included. Brand new in box.", 2900, "music", "new", "Digital-piano-423.jpg"],
    ["iPhone 13 Pro 128GB", "Battery health 87%, always in a case.", 1800, "electronics", "used", "Back of the iPhone 13 Pro.jpg"],
    ["Bose noise cancelling headphones", "QuietComfort 25, over-ear, comes with the carry case.", 750, "electronics", "used", "Bose QuietComfort 25 Acoustic Noise Cancelling Headphones with Carry Case.jpg"],
    ["LG 19 inch monitor", "LCD, works great, no dead pixels.", 250, "electronics", "used", "LG L194WT-SF LCD monitor.jpg"],
    ["Mechanical keyboard", "Clicky switches, full size.", 320, "electronics", "used", "Mechanical Keyboard.jpg"],
    ["Table lamp", "Classic lampshade, warm light.", 120, "home", "used", "Lamp with a lampshade illuminated by sunlight.jpg"],
    ["Three-seat sofa", "Very comfortable, pickup only.", 1500, "home", "used", "Sofa, Couch, Studio, Rostov-on-Don, Russia.jpg"],
    ["Espresso machine", "Makes great espresso, descaled regularly.", 600, "home", "used", "Machine-espresso 01.JPG"],
    ["Hand-painted ceramic plates", "Decorative plates, never used.", 90, "home", "new", "Ceramic plates for sale in Nesebar.jpg"],
    ["Leather jacket size M", "Black, genuine leather, worn a few times.", 450, "fashion", "used", "Leather jacket.jpg"],
    ["Asics running shoes size 42", "Gel-Cumulus, barely used, too small for me.", 280, "fashion", "used", "Asics Gel-Cumulus 22.jpg"],
    ["Winter coat size L", "Warm and waterproof, with hood.", 390, "fashion", "new", "Polo Ralph Lauren winter coat jacket.jpg"],
    ["Mountain bike 26 inch", "21 gears, new tires, front suspension.", 1100, "sports", "used", "Bulls Wild Cup 1 (Modell 2010) 20100814.jpg"],
    ["Yoga mat", "Non-slip, 6mm thick.", 70, "sports", "new", "Yoga mat and water bottle in a living room.jpg"],
    ["Dumbbell set", "Several weights, great for a home gym.", 250, "sports", "used", "Colorful dumbbells of various sizes.jpg"],
    ["Harry Potter book collection", "All 7 books, English, good condition.", 220, "books", "used", "Harry Potter Tetris Shelf.jpg"],
    ["The Art of Computer Programming", "Donald Knuth, volumes 1-4B. Like new.", 800, "books", "used", "The Art of Computer Programming (vol. 1-4B)-2808.jpg"],
    ["Catan board game", "Complete, with the Legend of the Conquerors expansion.", 300, "other", "used", "PXL 20230226 231727215 Catan Legend of the Conquerors board game.jpg"],
];

// Special:FilePath redirects to a resized copy of the file (600px wide).
function commonsImageUrl(fileName: string): string {
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName.replace(/ /g, "_"))}?width=600`;
}

async function seed(): Promise<void> {
    await dal.init();
    await dal.pool.query("DELETE FROM products WHERE seller_id = ?", [DEMO_SELLER_ID]);

    for (const [title, description, price, category, condition, commonsFile] of products) {
        const imageUrl = commonsImageUrl(commonsFile);
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
