import React, { useState, useEffect } from "react";
import fetch from './api/customerData';
import ReactTable from 'react-table';
import "./App.css";
import _ from 'lodash';
import 'react-table/react-table.css'

// This function takes the Mocked data and returns each reward points for each
// transaction in JSON Object format
function rewardPointsCalculator(mockData) {
  const listOfMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pointsPerTransaction = mockData.map(transaction=> {
    let points = 0;
    let above100 = transaction.amt - 100;
    
    if (above100 > 0) {
      // A customer receives 2 points for every dollar spent over $100 in each transaction
      points += (above100 * 2);
    }    
    if (transaction.amt > 50) {
      // plus 1 point for every dollar spent over $50 in each transaction
      points += 50;      
    }
    // extracting the month from the Mock data
    const month = new Date(transaction.transactionDt).getMonth();
    return {...transaction, points, month};
  });

  let byCustomer = {};
  let totalPointsByCustomer = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let {customerId, name, month, points} = pointsPerTransaction;   
    if (!byCustomer[customerId]) {
      byCustomer[customerId] = [];      
    }    
    let temp = 0;
    if (!totalPointsByCustomer[customerId]) {
      temp = totalPointsByCustomer[name] ? totalPointsByCustomer[name] : 0
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] = temp + points;
    if (byCustomer[customerId][month]) {
      byCustomer[customerId][month].points += points;
      byCustomer[customerId][month].monthNumber = month;
      byCustomer[customerId][month].numTransactions++;      
    }
    else {
      
      byCustomer[customerId][month] = {
        customerId,
        name,
        monthNumber:month,
        month: listOfMonths[month],
        numTransactions: 1,        
        points
      }
    }    
  });
  let finalResultForCustomer = [];
  for (var customerKey in byCustomer) {    
    byCustomer[customerKey].forEach(row=> {
      finalResultForCustomer.push(row);
    });    
  }
  console.log("🚀 ~ file: App.js ~ line 65 ~ rewardPointsCalculator ~ totalPointsByCustomer", totalPointsByCustomer)
  let totalByCustomer = [];
  for (customerKey in totalPointsByCustomer) {    
    totalByCustomer.push({
      name: customerKey,
      points: totalPointsByCustomer[customerKey]
    });    
  }
  return {
    summaryByCustomer: finalResultForCustomer,
    pointsPerTransaction,
    totalPointsByCustomer:totalByCustomer
  };
}

function App() {
  const [transactionsData, setTransactionsData] = useState(null);
  
  const columns = [
    {
      Header:'Customer Name',
      accessor: 'name'      
    },    
    {
      Header:'Month',
      accessor: 'month'
    },
    {
      Header: "Number of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header:'Points Gained',
      accessor: 'points'
    }
  ];
  const totalRewardPointsByCustomer = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Points',
      accessor: 'points'
    }
  ]

  function getIndividualTransactions(row) {
    let byCustomerMonth = _.filter(transactionsData.pointsPerTransaction, (tRow)=>{    
      return row.original.customerId === tRow.customerId && row.original.monthNumber === tRow.month;
    });
    return byCustomerMonth;
  }

  useEffect(() => { 
    fetch().then((data)=> {             
      const results = rewardPointsCalculator(data);
      console.log("🚀 ~ file: App.js ~ line 119 ~ fetch ~ results", results)
      setTransactionsData(results);
    });
  },[]);

  if (transactionsData == null) {
    return <div>Loading...</div>;   
  }

  return transactionsData == null ?
    <div>Loading...</div> 
      :    
    <div>      
      
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Points Rewards System Totals by Customer Months</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              className="-striped -highlight"
              data={transactionsData.summaryByCustomer}
              defaultPageSize={5}
              columns={columns}
              SubComponent={row => {
                return (
                  <div>
                    
                      {getIndividualTransactions(row).map(tran=>{
                        return <div className="container" key={tran.transactionDt}>
                          <div className="row">
                            <div className="col-8">
                              <strong>Transaction Date:</strong> {tran.transactionDt} - <strong>$</strong>{tran.amt} - <strong>Points: </strong>{tran.points}
                            </div>
                          </div>
                        </div>
                      })}                                    

                  </div>
                )
              }}
              />             
            </div>
          </div>
        </div>
        
        <div className="container">    
          <div className="row">
            <div className="col-10">
              <h2>Points Rewards System Totals By Customer</h2>
            </div>
          </div>      
          <div className="row">
            <div className="col-8">
              <ReactTable
                className="-striped -highlight"
                data={transactionsData.totalPointsByCustomer}
                columns={totalRewardPointsByCustomer}
                defaultPageSize={5}                
              />
            </div>
          </div>
        </div>      
    </div>
  ;
}

export default App;
