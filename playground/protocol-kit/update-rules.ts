import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import Safe, { EthersAdapter, SigningMethod } from '@safe-global/protocol-kit'
import { OperationType, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import fs from 'fs';


dotenv.config()

const { URL } = process.env
const { PK } = process.env
const { SAFE_ACCOUNT } = process.env

const NodeDriverAuthAddress = "0xd100ae0000000000000000000000000000000000";
// This file can be used to play around with the Safe Core SDK
// The script creates, signs and executes a transaction for an existing 1/1 Safe

interface Config {
  RPC_URL: string
  /** Private key of a signer owning the Safe */
  SIGNER_ADDRESS_PRIVATE_KEY: string
  /** Address of a 1/1 Safe */
  SAFE_ADDRESS: string
}

const config: Config = {
  RPC_URL: URL!,
  SIGNER_ADDRESS_PRIVATE_KEY: PK!,
  SAFE_ADDRESS: SAFE_ACCOUNT!
}

async function main() {
  const provider = new ethers.JsonRpcProvider(config.RPC_URL)
  const signer = new ethers.Wallet(config.SIGNER_ADDRESS_PRIVATE_KEY, provider)

  // Create EthAdapter instance
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer
  })

  // Create Safe instance
  const safe = await Safe.create({
    ethAdapter,
    safeAddress: config.SAFE_ADDRESS
  })

  let callData = prepareUpdateNetworkRulesCall("rules.json");

  console.log('Creating transaction with Safe:')
  console.log(' - Address: ', await safe.getAddress())
  console.log(' - ChainID: ', await safe.getChainId())
  console.log(' - Version: ', await safe.getContractVersion())
  console.log(' - Threshold: ', await safe.getThreshold(), '\n')

  // Create transaction
  const safeTransactionData: SafeTransactionDataPartial = {
    to: NodeDriverAuthAddress,
    value: '0', // 0.001 ether
    data: callData,
    operation: OperationType.Call
  }

  let safeTransaction
  try {
    safeTransaction = await safe.createTransaction({ transactions: [safeTransactionData] })
  } catch (err) {
    console.log('`createTransaction` failed:')
    console.log(err)
    return
  }

  console.log('Created the Safe transaction.')

  let signedSafeTransaction
  try {
    // Sign the safeTransaction
    signedSafeTransaction = await safe.signTransaction(safeTransaction, SigningMethod.ETH_SIGN)
  } catch (err) {
    console.log('`signTransaction` failed:')
    console.log(err)
    return
  }

  console.log('Signed the transaction.')

  let result
  try {
    // Execute the signed transaction
    result = await safe.executeTransaction(signedSafeTransaction)
  } catch (err) {
    console.log('`executeTransaction` failed:')
    console.log(err)
    return
  }

  console.log('Succesfully executed the transaction:')
  console.log(' - Tx hash: ', result.hash)
}

function prepareUpdateNetworkRulesCall(rulesPath : string) {
    // load contents of rulesPath file and convert it to bytes
    const rules = fs.readFileSync(rulesPath);
    var rulesBytes = new Uint8Array(rules)
    var iface = new ethers.Interface(NodeDriverAuthAbi)
    var calldata = iface.encodeFunctionData("updateNetworkRules", [rulesBytes]);
    return calldata;
}


const NodeDriverAuthAbi = [{
    "constant": false,
    "inputs": [{"internalType": "bytes", "name": "diff", "type": "bytes"}],
    "name": "updateNetworkRules",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}];


main()