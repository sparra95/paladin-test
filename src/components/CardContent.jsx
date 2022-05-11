import { useState, useEffect, useContext } from 'react'
import { ContractContext } from '../context/ContractContext'
import tokens from '../constants/tokenList.json'

const CardContent = ({ stats }) => {
    const { 
        currentAccount, 
        connectWallet, 
        getTokenBalance, 
        getTokenSymbol, 
        getTotalBorrowed, 
        getTotalSupply,
        getTokenPrices, 
        getActiveLoans,
        requestDeposit,
        requestWithdraw
    } = useContext(ContractContext) || {}

    const [isApproved, setIsApproved] = useState(false)
    const [amount, setAmount] = useState(0)
    const [currentToken, setCurrentToken] = useState(0)
    const [balance, setBalance] = useState(0)
    const [symbol, setSymbol] = useState('')
    const [palTokenSymbol, setPalTokenSymbol] = useState('')
    const [totalBorrowed, setTotalBorrowed] = useState(0)
    const [totalBorrowedFormatted, setTotalBorrowedFormatted] = useState('-')
    const [totalSupply, setTotalSupply] = useState(0)
    const [totalSupplyFormatted, setTotalSupplyFormatted] = useState('-')
    const [activeLoans, setActiveLoans] = useState(0)

    const formatEth = async (value_ETH) => {
        try {
            // Get prices of ETH, and currentToken (using Ethereum mainnet contract addresses)
            const prices = await getTokenPrices(tokens[currentToken].COINGECKO_ID)

            // Convert value from ETH to USD
            const value_USD = value_ETH * prices.ethereum.usd
            
            // Convert value from USD to token
            const token = tokens[currentToken].COINGECKO_ID
            const tokenSymbol = tokens[currentToken].NAME
            const value_TOKEN = value_USD * prices[token].usd

            // Format values
            const convertValue = (n) => {
                if (n < 1e3) return n;
                if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "k";
                if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
                if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
                if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
            }

            // Return formatted string
            return `${convertValue(value_TOKEN)} ${tokenSymbol} / $${convertValue(value_USD)}`

        } catch (err) {
            console.log("Error @ formatEth()")
            console.error(err)
            return "-"
        }

    }

    useEffect(() => {
        const handleTokenChange = async () => {
            // No need for try/catch since errors are handled by Promises

            // User's balance of current token
            setBalance( await getTokenBalance(tokens[currentToken].TOKEN_KOVAN_CONTRACT_ADDRESS) )

            // Symbol for current token
            setSymbol( await getTokenSymbol(tokens[currentToken].TOKEN_KOVAN_CONTRACT_ADDRESS) )

            // Symbol for current token's corresponding PalToken 
            setPalTokenSymbol( await getTokenSymbol(tokens[currentToken].PAL_TOKEN_CONTRACT_ADDRESS) )

            // Total amount borrowed from the PalPool
            const _totalBorrowed = await getTotalBorrowed(tokens[currentToken].PAL_POOL_CONTRACT_ADDRESS)
            setTotalBorrowed( _totalBorrowed )
            setTotalBorrowedFormatted( await formatEth( _totalBorrowed ) )

            // Total supply of the PalPool
            const _totalSupply = await getTotalSupply(tokens[currentToken].PAL_POOL_CONTRACT_ADDRESS)
            setTotalSupply( _totalSupply )
            setTotalSupplyFormatted( await formatEth( _totalSupply ) )

            // Total number of active loans from the PalPool
            setActiveLoans( await getActiveLoans(tokens[currentToken].PAL_POOL_CONTRACT_ADDRESS) )
        }

        handleTokenChange()

    }, [currentToken])

    const CommitButton = () => {
        return stats.cardTitle.toLowerCase().includes("dashboard")
        ? <button onClick={() => requestWithdraw( tokens[currentToken].TOKEN_KOVAN_CONTRACT_ADDRESS, balance )} className="card-btn">WITHDRAW</button> 
        : <button onClick={() => requestDeposit( tokens[currentToken].TOKEN_KOVAN_CONTRACT_ADDRESS, balance )} className="card-btn">DEPOSIT</button>
    }

    return (
        <div className="card">
            {/** Title */}
            <h3 className="card-title">{stats.cardTitle.toLowerCase().includes('pool')? `${palTokenSymbol} Pool`: "Dashboard"}</h3>

            <div className="card-balance-container">
                <div className="card-balance-select">
                    {/** Select Token */}
                    <select value={currentToken} onChange={(e) => setCurrentToken(e.target.value)}>
                        {tokens?.map((token, index) => 
                            <option key={token.NAME + index} value={index}>
                                {token.NAME}
                            </option>
                        )}
                    </select>

                    <button onClick={() => setAmount(balance)}>MAX</button>

                    {/** Select Amount of Token */}
                    <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                {/** Token Balance */}
                <p>Balance: {`${balance} ${symbol}`}</p>
            </div>

            {stats.cardTitle.toLowerCase().includes('pool')?

                /** POOL STATS */
                <div className="card-stats-container">
                    <div className="stats-item-row stats-title">
                        {stats.statsHeading}
                    </div>
                    <div className="stats-item-row">
                        <p>Total Supply</p>
                        <p>{totalSupplyFormatted}</p>
                    </div>
                    <div className="stats-item-row">
                        <p>Total Borrowed</p>
                        <p>{totalBorrowedFormatted}</p>
                    </div>
                    <div className="stats-item-row">
                        <p>Active Loans</p>
                        <p>{activeLoans}</p>
                    </div>
                    <div className="stats-item-row">
                        <p>Minimum Borrow Period</p>
                        <p>7 days</p>
                    </div>

                </div> :

                /** DASHBOARD */
                <div className="card-stats-container">
                    <div className="stats-item-row stats-title">
                        {stats.statsHeading}
                    </div>
                    <div className="stats-item-row">
                        <p>Balance</p>
                        <p>-</p>
                    </div>
                    <div className="stats-item-row">
                        <p>Conversion</p>
                        <p>-</p>
                    </div>
                    <div className="stats-item-row">
                        <p>Your Share of the Pool</p>
                        <p>-</p>
                    </div>
                    <div className="stats-item-row">
                        <p>Current Borrow Rate</p>
                        <p>-</p>
                    </div>

                </div>
            }

            {/** Submit Button */}
            {!currentAccount
            ? <button onClick={() => connectWallet()} className="card-btn">CONNECT TO A WALLET</button>
            : !isApproved
                ? <button disabled={amount > balance} onClick={() => setIsApproved(true)} className="card-btn">APPROVE</button> 
                : <CommitButton />
            }

        </div>
    )
}

export default CardContent