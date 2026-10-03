import amqp, {Channel, ChannelModel} from "amqplib";

class Messaging {
    private connection?: ChannelModel;
    private channel?: Channel;

    public async connect(url: string): Promise<void> {
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
    }

    // Each topic is a fanout exchange, not a bare queue - a topic with two consumers (e.g.
    // Catalog and Analytics both listening for "order.created") must give each of them their
    // own copy of every message. A bare queue would instead make them "competing consumers"
    // and RabbitMQ would round-robin messages between them, silently dropping half the work
    // each one does - that's a real bug this project hit once already.
    public async publish(topic: string, message: object): Promise<void> {
        const channel = this.requireChannel();
        await channel.assertExchange(topic, "fanout");
        channel.publish(topic, "", Buffer.from(JSON.stringify(message)));
    }

    // Each call gets its own exclusive, auto-deleting queue bound to the topic's exchange -
    // this process's private copy of the stream. It only sees messages published while it's
    // connected; there's no replay of anything published before it subscribed.
    public async consume(topic: string, handler: (message: any) => Promise<void>): Promise<void> {
        const channel = this.requireChannel();
        await channel.assertExchange(topic, "fanout");
        const {queue} = await channel.assertQueue("", {exclusive: true});
        await channel.bindQueue(queue, topic, "");
        await channel.consume(queue, (msg) => {
            if (!msg) return;
            handler(JSON.parse(msg.content.toString()))
                .then(() => channel.ack(msg))
                .catch((err) => {
                    console.error(`Failed handling message from topic "${topic}":`, err);
                    channel.nack(msg, false, false);
                });
        });
    }

    private requireChannel(): Channel {
        if (!this.channel) throw new Error("Messaging.connect() must be called before publish/consume");
        return this.channel;
    }
}

export const messaging = new Messaging();
