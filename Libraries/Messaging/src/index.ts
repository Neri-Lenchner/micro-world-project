import amqp, {Channel, ChannelModel} from "amqplib";

class Messaging {
    private connection?: ChannelModel;
    private channel?: Channel;

    public async connect(url: string): Promise<void> {
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
    }

    public async publish(queue: string, message: object): Promise<void> {
        const channel = this.requireChannel();
        await channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }

    public async consume(queue: string, handler: (message: any) => Promise<void>): Promise<void> {
        const channel = this.requireChannel();
        await channel.assertQueue(queue);
        await channel.consume(queue, (msg) => {
            if (!msg) return;
            handler(JSON.parse(msg.content.toString()))
                .then(() => channel.ack(msg))
                .catch((err) => {
                    console.error(`Failed handling message from queue "${queue}":`, err);
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
