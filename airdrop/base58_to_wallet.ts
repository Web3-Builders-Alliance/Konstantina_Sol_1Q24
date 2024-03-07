import bs58 from 'bs58'
import prompt from 'prompt'

(async () => {
    prompt.start()

    console.log('Enter base58 private key:');
    const { privkey } = await prompt.get(['privkey']);

    const wallet = bs58.decode(privkey as string);

    console.log(`Your wallet file is:\n[${wallet}]`);
})()