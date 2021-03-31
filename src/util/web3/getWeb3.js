import Web3 from 'web3'
import {
  store
} from '../../store'
import {
  Message
} from 'element-ui'
import pollWeb3 from './pollWeb3'

async function installWeb3() {
  var web3js = window.web3
  var web3Provider
  if (window.ethereum) {
    try {
      web3Provider = window.ethereum
      // Request user authorization
      await window.ethereum.enable()
    } catch (error) {
      // When the user is not authorized
      store.commit('updateIsInstallMeta', true)
      store.commit('updateCoinbase', '')
      showMessage('User denied account access', 'error')
      return
    }
  } else if (typeof web3js !== 'undefined') { // old MetaMask Legacy dapp browsers...
    web3Provider = window.web3.currentProvider
  } else {
    store.commit('updateIsInstallMeta', false)
    store.commit('updateCoinbase', '')
    showMessage('Please install metamask or use imtokenApp browser', 'error')
    return
  }
  return new Web3(web3Provider)
}

async function getWeb3() {
  var web3 = await installWeb3()
  if (!web3) {
    return
  }
  store.commit('updateIsInstallMeta', true)
  await web3.eth.net.getId((error, netWorkId) => {
    if (error || !netWorkId) {
      showMessage('Failed to obtain public chain ID, please refresh and try again', 'error')
      store.commit('updateCoinbase', '')
      return
    } else {
      // console.log('netWorkId=', netWorkId, typeof (netWorkId))
      store.commit('updateNetWorkId', (netWorkId).toString())
    }
  })
  await web3.eth.getCoinbase((error, coinbase) => {
    // console.log('coinbase=', coinbase)
    if (error || !coinbase) {
      showMessage('Unable to get the address, please unlock metamask or create an address', 'error')
      window.ethereum.send('eth_requestAccounts').then((coin) => {
        // console.log('result =', coin.result)
        store.commit('updateCoinbase', coin.result[0])
      }).catch((err) => {
        // console.log('err =', err)
        showMessage(err.message, 'error')
        store.commit('updateCoinbase', '')
      })
    } else {
      store.commit('updateCoinbase', coinbase)
    }
  })
  pollWeb3(web3)
}

const showMessage = function (message, type) {
  Message({
    showClose: true,
    duration: 2000,
    message: message,
    type: type
  })
}

export {
  installWeb3,
  getWeb3
}
