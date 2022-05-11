import { useContext } from "react"
import { ContractContext } from "../context/ContractContext"
import logo from "../assets/paladin_logo.png"

const Navbar = () => {
    const { currentAccount, currentBalance, connectWallet } = useContext(ContractContext) || {}

    return (
        <nav>
            <img className="logo" src={logo} alt="Paladin logo" />

            {currentAccount ?
                <div className="account-info">
                    <p className="balance">{currentBalance !== null || currentBalance !== undefined? currentBalance + " ETH" : "ETH Balance"}</p>
                    <p className="address">{`${currentAccount.slice(0, 6)}...${currentAccount.slice(currentAccount.length -4)}`}</p>
                </div>
                :
                <button onClick={() => connectWallet()} className="nav-btn">Connect Wallet</button>
            }
        </nav>
    )
}

export default Navbar