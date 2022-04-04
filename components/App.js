import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import StartUpDapp from '../abis/StartUpDapp.json';
import Main from './Main';

class App extends Component {

  async componentWillMount() {
    await this.loadweb3()
    await this.loadBlockchainData()

  }
  async loadweb3() {
    //let ethereum = window.ethereum;
    if (!window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  async loadBlockchainData() {
    const web3 = window.web3
    console.log(web3)
    //load account
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId();
    console.log("network ID" + networkId);
    const networkData = StartUpDapp.networks[networkId]
    console.log("here is the network Data",networkData);
    if(networkData) {
      const startUpDapp = web3.eth.Contract(StartUpDapp.abi, networkData.address)
      this.setState({ startUpDapp });
      console.log(startUpDapp);
      const startupCount = await startUpDapp.methods.startupCount().call()
      //console.log("amount of startups"+startupCount.toString());
      this.setState({ startupCount });
      // Load startups
      for (var i = 1; i <= startupCount; i++) {
        const startup = await startUpDapp.methods.startups(i).call();
        this.setState({
          startups: [...this.state.startups, startup]
        });
      }
      this.setState({ loading: false})
    } else {
      window.alert('Smart contract not deployed to detected network.');

    }
  }
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      startupCount: 0,
      startups: [],
      loading: true,
      //startUpDappContract: {}
    }
    this.requestFunding = this.requestFunding.bind(this)
    this.fundStartup = this.fundStartup.bind(this)
  }

  requestFunding(startupDescription, startupAmount) {
    this.setState({ loading: true });
    this.state.startUpDapp.methods.requestFunding(startupDescription, startupAmount).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }
  

  fundStartup(startupId, startupAmount) {
    this.setState({ loading: true })
    this.state.startUpDapp.methods.fundStartup(startupId).send({ from: this.state.account, value: startupAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
       <div className="container-fluid mt-5">
         <div className="row">
           <main role="main" className="col-lg-12 d-flex">
             {this.state.loading 
              ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div> 
              : <Main 
                startups={this.state.startups}
                requestFunding={this.requestFunding}
                fundStartup={this.fundStartup} />
              }
             
           </main>
         </div>
       </div>
     </div>
    );
  }
}

export default App;
