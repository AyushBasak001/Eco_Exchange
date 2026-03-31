import {db} from "../utils/db.js";

export async function confirmOrderHelper(orderId) {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // Fetch order
        const { rows: orderRows } = await client.query(
            `SELECT product_id, quantity, status
             FROM orders WHERE id=$1`,
            [orderId]
        );

        if (orderRows.length === 0)
            throw new Error("Order not found");

        const order = orderRows[0];

        if (order.status !== "PLACED")
            throw new Error("Only PLACED orders can be confirmed");

        // Reduce stock
        await client.query(
            `UPDATE product
             SET quantity_available = quantity_available - $1
             WHERE id=$2`,
            [order.quantity, order.product_id]
        );

        // Update status
        await client.query(
            `UPDATE orders
             SET status='CONFIRMED'
             WHERE id=$1`,
            [orderId]
        );

        // Insert payment record
        await client.query(
            `INSERT INTO payment (order_id)
             VALUES ($1)
             ON CONFLICT (order_id) DO NOTHING`,
            [orderId]
        );

        await client.query("COMMIT");
        client.release();
        return { success: true };

    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        client.release();
        throw err;
    }
}

export async function cancelOrderHelper(orderId) {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // Fetch order
        const { rows: orderRows } = await client.query(
            `SELECT product_id, quantity, status
             FROM orders WHERE id=$1`,
            [orderId]
        );

        if (orderRows.length === 0)
            throw new Error("Order not found");

        const order = orderRows[0];

        if (!["PLACED", "CONFIRMED"].includes(order.status))
            throw new Error("Order cannot be cancelled");

        // Fetch payment
        const { rows: payRows } = await client.query(
            `SELECT payment_status FROM payment WHERE order_id=$1`,
            [orderId]
        );

        const paymentStatus = payRows.length ? payRows[0].payment_status : null;

        // Restock only if CONFIRMED
        if (order.status === "CONFIRMED") {
            await client.query(
                `UPDATE product
                 SET quantity_available = quantity_available + $1
                 WHERE id=$2`,
                [order.quantity, order.product_id]
            );
        }

        // Update order
        await client.query(
            `UPDATE orders
             SET status='CANCELLED'
             WHERE id=$1`,
            [orderId]
        );

        // Payment correction
        if (paymentStatus === "SUCCESS") {
            await client.query(
                `UPDATE payment
                 SET payment_status='REFUNDED'
                 WHERE order_id=$1`,
                [orderId]
            );
        } else if (paymentStatus === "PENDING") {
            await client.query(
                `UPDATE payment
                 SET payment_status='FAILED'
                 WHERE order_id=$1`,
                [orderId]
            );
        }

        await client.query("COMMIT");
        client.release();
        return { success: true };

    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        client.release();
        throw err;
    }
}