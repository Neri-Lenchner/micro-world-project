export const DEMO_PASSWORD = "Demo1234!";

export interface DemoUser {
    id: number;
    email: string;
}

// Fixed ids rely on Auth's users table being empty when seeded (AUTO_INCREMENT starts at 1)
// and on Auth's seed inserting these three in exactly this order.
export const DEMO_USERS = {
    alice: {id: 1, email: "alice@microworld.com"} as DemoUser, // seller, owns products 1-14
    bob: {id: 2, email: "bob@microworld.com"} as DemoUser,     // buyer only
    carol: {id: 3, email: "carol@microworld.com"} as DemoUser, // seller, owns products 15-21
};

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface DemoOrderSeed {
    id: number;                 // fixed id - relies on Order's orders table being empty
    productId: number;          // positional id into Catalog's seed product list (1-indexed, AUTO_INCREMENT order)
    productTitle: string;
    price: number;
    buyer: DemoUser;
    seller: DemoUser;
    status: OrderStatus;
    createdAtDaysAgo: number;
    paidAtDaysAgo?: number;
    shippedAtDaysAgo?: number;
    deliveredAtDaysAgo?: number;
    cancelledAtDaysAgo?: number;
}

const {alice, bob, carol} = DEMO_USERS;

// Every downstream seed (Payment/Notification/Analytics) derives its rows from this one list,
// so an order's status history only has to be described once.
export const DEMO_ORDERS: DemoOrderSeed[] = [
    {id: 1, productId: 1,  productTitle: "Fender Stratocaster",              price: 2400, buyer: bob, seller: alice, status: "DELIVERED", createdAtDaysAgo: 18, paidAtDaysAgo: 17, shippedAtDaysAgo: 12, deliveredAtDaysAgo: 9},
    {id: 2, productId: 5,  productTitle: "iPhone 13 Pro 128GB",              price: 1800, buyer: bob, seller: alice, status: "SHIPPED",   createdAtDaysAgo: 14, paidAtDaysAgo: 13, shippedAtDaysAgo: 8},
    {id: 3, productId: 19, productTitle: "Harry Potter book collection",     price: 220,  buyer: bob, seller: carol, status: "PAID",      createdAtDaysAgo: 9,  paidAtDaysAgo: 8},
    {id: 4, productId: 6,  productTitle: "Bose noise cancelling headphones", price: 750,  buyer: bob, seller: alice, status: "PAID",      createdAtDaysAgo: 6,  paidAtDaysAgo: 5},
    {id: 5, productId: 20, productTitle: "The Art of Computer Programming",  price: 800,  buyer: bob, seller: carol, status: "CANCELLED", createdAtDaysAgo: 5,  cancelledAtDaysAgo: 5},
    {id: 6, productId: 16, productTitle: "Mountain bike 26 inch",            price: 1100, buyer: bob, seller: carol, status: "PENDING",   createdAtDaysAgo: 1},
    {id: 7, productId: 21, productTitle: "Catan board game",                 price: 300,  buyer: bob, seller: carol, status: "SHIPPED",   createdAtDaysAgo: 3,  paidAtDaysAgo: 3, shippedAtDaysAgo: 1},
];

// Bob's watchlist - product 20 is deliberately both an order (cancelled) and still watched,
// a small realistic touch ("tried to buy it, got declined, still keeping an eye on it").
export const DEMO_WATCHLIST: {user: DemoUser; productId: number; addedDaysAgo: number}[] = [
    {user: bob, productId: 2,  addedDaysAgo: 16},
    {user: bob, productId: 9,  addedDaysAgo: 11},
    {user: bob, productId: 17, addedDaysAgo: 7},
    {user: bob, productId: 20, addedDaysAgo: 4},
];

export function daysAgo(n: number): Date {
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
