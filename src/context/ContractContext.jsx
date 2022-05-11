import { useState, useEffect, createContext } from 'react'
import { ethers } from 'ethers'

import palTokenAbi from '../abi/PalToken.json'
import palPoolAbi from '../abi/PalPool.json'
import erc20Abi from '../abi/erc20.json'

import tokenList from '../constants/tokenList.json'

export const ContractContext = createContext()

export const ContractContextProvider = ({ children }) => {
    const { ethereum } = window
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()

    const [currentAccount, setCurrentAccount] = useState('')
    const [currentBalance, setCurrentBalance] = useState(0)

    /****** PalPool Contract Interactions *******/

    const getContract = (address, abi) => new ethers.Contract(address, abi, signer)

    const hexToDecimalString = (num) => ethers.utils.formatUnits(num, 18)

    const hexToDecimalNum = (num) => parseFloat( hexToDecimalString(num) )

    const getTokenBalance = async (tokenAddress) => {
        if (!currentAccount) return 0

        try {
            // Get contract
            const contract = getContract(tokenAddress, erc20Abi)

            // Get user's balance of token
            const balance = hexToDecimalNum( await contract.balanceOf(currentAccount) )

            return balance

        } catch (err) {
            console.log("Error @ getTokenBalance()")
            console.error(err)

            return 0
        }
    }

    const getTokenSymbol = async (tokenAddress) => {
        try {
            // Get contract
            const contract = getContract(tokenAddress, erc20Abi)

            // Get token's symbol
            const symbol = await contract.symbol()

            return symbol

        } catch (err) {
            console.log("Error @ getTokenSymbol()")
            console.error(err)

            return ""
        }
    }

    const getTotalBorrowed = async (poolAddress) => {
        try {
            // Get contract
            const contract = getContract(poolAddress, palPoolAbi)

            // Get current total amount of funds borrowed from the Pool (in wei)
            const totalBorrowed = hexToDecimalNum( await contract.totalBorrowed() )

            return totalBorrowed

        } catch (err) {
            console.log("Error @ getTotalBorrowed()")
            console.error(err)
            return 0
        }
        
    }

    const getTotalSupply = async (poolAddress) => {
        try {
            // Get contract
            const palPoolContract = getContract(poolAddress, palPoolAbi)
            
            // Get amount of underlying token in the Pool (in wei)
            const underlyingBalance = hexToDecimalNum( await palPoolContract.underlyingBalance() )

            // Get current total amount of funds borrowed from the Pool (in wei)
            const totalBorrowed = hexToDecimalNum( await palPoolContract.totalBorrowed() )

            // Get current amount in the Pool’s Reserve (in wei)
            const totalReserve = hexToDecimalNum( await palPoolContract.totalReserve() )

            // Calculate Total Supply
            const totalSupply = underlyingBalance + totalBorrowed - totalReserve

            return totalSupply

        } catch (err) {
            console.log("Error @ getTotalSupply()")
            console.error(err)
            return 0
        }
        
    }

    const getActiveLoans = async (poolAddress) => {
        try {
            // Get contract
            const palPoolContract = getContract(poolAddress, palPoolAbi)

            // Get list of all the Loans
            const allLoans = await palPoolContract.getLoansPools()

            const numLoans = allLoans.length
            let activeLoans = 0

            // For each loan, get 'Borrow Data' & check if loan is active
            for (let i = 0; i < numLoans; i++) {
                const borrowData = await palPoolContract.getBorrowData(allLoans[i])

                if (!borrowData._closed) { 
                    activeLoans++ 
                }
            }

            // Return total number of active loans for this PalPool
            return activeLoans

        } catch (err) {
            console.log("Error @ getActiveLoans()")
            console.error(err)
            return 0
        }
    }

    const getTokenPrices = async (coinGeckoTokenId) => {
        try {

            // Fetch ETH price and price of current token
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2C${coinGeckoTokenId}&vs_currencies=usd`)
            
            // Convert response to JSON
            const data = await response.json()

            return data

        } catch (err) {
            console.log("Error @ getTokenPrices()")
            console.error(err)
            return {}
        }
    }

    const requestDeposit = async (poolAddress, amount) => {
        console.log("deposit!")
        // if (!currentAccount) return

        // try {
               // Get contract
        //     const palPoolContract = getContract(poolAddress, palPoolAbi)

        //     const num = await palPoolContract.deposit( ethers.utils.parseEther(amount.toString()) )

        //     console.log(num)

        // } catch (err) {
        //     console.log("Error @ requestDeposit()")
        //     console.error(err)
        // }
    }
    
    const requestWithdraw = () => {
        console.log("withdraw!")
    }

    /****** Connect to MetaMask *******/

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [])

    useEffect(() => {
        getBalance()
    }, [currentAccount])

    const getBalance = async () => {
        if (!currentAccount) return

        try {
            // Get balance from current account
            const balance = await provider.getBalance(currentAccount)

            // Set balance to app state
            setCurrentBalance(ethers.utils.formatEther(balance))

        } catch (err) {
            console.log("Error @ getBalance()")
            console.log(err)
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Please install metamask')

            // Request wallet
            const accounts = await ethereum.request({method: 'eth_requestAccounts'})

            // Set account
            setCurrentAccount(accounts[0])

        } catch (error) {
            console.log(error)
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert('Please install metamask')

            // Get wallet accounts
            const accounts = await ethereum.request({method: 'eth_accounts'})
            if (!accounts.length) {
                connectWallet()
                return
            }
            
            // Update app state
            setCurrentAccount(accounts[0])

        } catch (error) {
            console.log(error)
        }
    }


    return (
        <ContractContext.Provider 
            value={{ 
                currentAccount, 
                currentBalance, 
                connectWallet,
                tokenList,
                getTokenBalance,
                getTokenSymbol,
                getTotalBorrowed,
                getTotalSupply,
                getTokenPrices,
                getActiveLoans,
                requestDeposit,
                requestWithdraw
            }}>
            {children}
        </ContractContext.Provider>
    )
}