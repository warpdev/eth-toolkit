# Viem Guide: Modern TypeScript Interface for Ethereum

This document provides an overview of viem, a TypeScript interface for Ethereum that we use in our Ethereum Developer Toolkit.

## What is Viem?

Viem is a lightweight, modular, and type-safe Ethereum library alternative to ethers.js and web3.js. It provides composable primitives for interacting with the Ethereum blockchain with better performance, smaller bundle size, and improved developer experience.

Key advantages:
- Lightweight (35kB minzipped)
- Tree-shakable (only includes what you use)
- Type-safe with TypeScript
- Comprehensive documentation
- Modular API design

## Core Concepts

### Client Types

Viem provides three main client types:

#### 1. Public Client

Used for reading blockchain data via public RPC methods (eth_blockNumber, eth_getBalance, etc.):

```typescript
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
})

// Read blockchain data
const blockNumber = await publicClient.getBlockNumber()
```

#### 2. Wallet Client

For interacting with Ethereum accounts (sending transactions, signing messages):

```typescript
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// Create account from private key
const account = privateKeyToAccount('0xYOUR_PRIVATE_KEY')

// Create wallet client
const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
})

// Send transaction
const hash = await walletClient.sendTransaction({
  to: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  value: parseEther('0.01')
})
```

#### 3. Test Client

For test environments with additional testing capabilities.

### Contract Interactions

#### Contract Instance

Create a contract instance to interact with a specific contract:

```typescript
import { getContract } from 'viem'

const contract = getContract({
  address: '0xContractAddress',
  abi: contractAbi,
  client: {
    public: publicClient,
    wallet: walletClient
  }
})

// Read contract data
const balance = await contract.read.balanceOf(['0xUserAddress'])

// Write to contract 
const hash = await contract.write.transfer(['0xRecipient', parseEther('10')])
```

### Calldata Operations

#### Decoding Calldata

Decode transaction calldata to human-readable format:

```typescript
import { decodeFunctionData } from 'viem'

const { functionName, args } = decodeFunctionData({
  abi: contractAbi,
  data: '0x70a08231000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2'
})
// Result: { functionName: 'balanceOf', args: ['0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'] }
```

#### Encoding Function Data

Create calldata from a function name and arguments:

```typescript
import { encodeFunctionData } from 'viem'

const data = encodeFunctionData({
  abi: contractAbi,
  functionName: 'transfer',
  args: ['0xRecipient', parseEther('10')]
})
// Result: '0xa9059cbb000000000000000000000000RecipientAddressWithoutPrefix00000000000000000000000000000000000000000000008ac7230489e80000'
```

### Event Handling

#### Decoding Event Logs

```typescript
import { decodeEventLog } from 'viem'

const { eventName, args } = decodeEventLog({
  abi: contractAbi,
  data: '0x0000000000000000000000000000000000000000000000000000000000000001',
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  ]
})
// Result: { eventName: 'Transfer', args: { from: '0xf39f...', to: '0xa0b8...', value: 1n } }
```

#### Getting Contract Events

```typescript
const logs = await publicClient.getContractEvents({
  abi: contractAbi,
  address: '0xContractAddress',
  eventName: 'Transfer',
  fromBlock: 16330000n,
  toBlock: 16330050n
})
```

### ABI Manipulation

#### Parsing ABIs

```typescript
import { parseAbi } from 'viem'

const abi = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
])
```

#### Working with ABI Types

```typescript
import { parseAbiItem, parseAbiParameters } from 'viem'

const abiItem = parseAbiItem('function transfer(address to, uint256 value) returns (bool)')
const parameters = parseAbiParameters('address to, uint256 value')
```

## Error Handling

```typescript
import { ContractFunctionExecutionError } from 'viem'

try {
  await contract.write.transfer(['0xRecipient', parseEther('1000')])
} catch (error) {
  if (error instanceof ContractFunctionExecutionError) {
    console.log('Contract execution error:', error.message)
  } else {
    console.error('Unknown error:', error)
  }
}
```

## Extension Pattern

Extend clients with additional functionality:

```typescript
import { createPublicClient, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'

// Create and extend wallet client with public actions
const client = createWalletClient({
  chain: mainnet,
  transport: http()
}).extend(publicActions)

// Now can use both wallet and public actions
const hash = await client.sendTransaction({ ... })
const block = await client.getBlock()
```

## Best Practices

1. **Use TypeScript** - Leverage viem's strong typing system
2. **Extend clients** rather than juggling multiple client instances
3. **Tree-shake imports** to keep bundle sizes small
4. **Use appropriate error handling** with viem's specific error types
5. **Leverage contract instances** for cleaner contract interactions
6. **Use multicall** for batching multiple read calls
7. **Properly configure chains** for network-specific behavior

## Common Utilities

- `formatEther` / `parseEther` - Convert between ETH and Wei
- `formatGwei` / `parseGwei` - Convert between Gwei and Wei
- `hexToString` / `stringToHex` - Convert between hex and UTF-8 strings
- `isAddress` - Validate Ethereum addresses
- `hashMessage` - Hash messages following Ethereum personal sign
- `recoverAddress` - Recover address from signature
- `verifyMessage` - Verify message signatures

## Resources

- [Official Documentation](https://viem.sh)
- [GitHub Repository](https://github.com/wevm/viem)
- [Examples](https://viem.sh/examples)