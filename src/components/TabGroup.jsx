const TabGroup = ({tabs, activeTab, setActiveTab}) => {

  return (
    <div className="tabs-container">
        {tabs.map((name, index) => 
          <button key={index + name} onClick={(e) => setActiveTab(index)} className={`tab ${activeTab === index? "active-tab" : ""}`}>
            {name}
          </button>
        )}
    </div>
  )
}

export default TabGroup