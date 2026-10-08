import {dal} from "./dal";
import {secureService} from "./secure-service";
import {DEMO_USERS, DEMO_PASSWORD} from "@nltech/demo-data";

export async function seed(): Promise<void> {
    const [[{count}]] = await dal.pool.query<any[]>("SELECT COUNT(*) AS count FROM users");
    if (count > 0) {
        console.log("Users table already has data - skipping demo seed.");
        return;
    }

    const passwordHash = await secureService.hash(DEMO_PASSWORD);
    // Insert in this exact order so AUTO_INCREMENT hands out ids 1/2/3 matching DEMO_USERS.
    for (const user of [DEMO_USERS.alice, DEMO_USERS.bob, DEMO_USERS.carol]) {
        await dal.pool.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [user.email, passwordHash]);
    }
    console.log("Seeded 3 demo users (alice, bob, carol).");
}
