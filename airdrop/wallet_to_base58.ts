import bs58 from 'bs58'
import prompt from 'prompt'

(async () => {
    prompt.start()

    console.log('Enter your wallet array:');
    const { privkey } = await prompt.get(['privkey']);

    const wallet = bs58.encode(Buffer.from(JSON.parse(privkey as string)));

    console.log(`Your base58-encoded private key is:\n${wallet}`);
})()