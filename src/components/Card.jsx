import { useState, useContext } from "react"
import { ContractContext } from '../context/ContractContext'
import TabGroup from "./TabGroup"
import CardContent from "./CardContent"

const Card = () => {
    const { currentAccount, connectWallet } = useContext(ContractContext) || {}

    const [activeTab, setActiveTab] = useState(0)
    
    const tabs = ["Pools", "Dashboard"]
    const stats2 = [
        {
            cardTitle: "palUNI Pool",
            statsHeading: "Pool Stats",
            statsLabels: ["Total Supply", "Total Borrowed", "Active Loans", "Minimum Borrow Period"]
        },
        {
            cardTitle: "Dashboard",
            statsHeading: "Your Stats",
            statsLabels: ["Balance", "Conversion", "Your Share of the Pool", "Current Borrow Rate"]
        }
    ]


  return (
    <div className="main-container">

        <TabGroup tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        <CardContent 
            stats={stats2[activeTab]} 
            isWalletConnected={currentAccount && true}
            connectWallet={connectWallet}
        />

    </div>
  )
}

export default Card