export function asyncQueue<T>(method: (item: T) => Promise<void>) {
    const requestQueue: T[] = [];

    // Function to process update requests in the queue
    const processQueue = async () => {
        while (requestQueue.length > 0) {
            const item = requestQueue.shift()!;
            async function push() {
                method(item);
            }
            push();
        }
    };

    // Add to queue and start processing if it's the first request
    const pushToQueue = (item: T) => {
        requestQueue.push(item);
        if (requestQueue.length === 1) processQueue();
    };

    return {
        pushToQueue,
    };
}
