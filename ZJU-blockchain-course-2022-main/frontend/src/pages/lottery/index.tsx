import {Button, Image} from 'antd';
import {Header} from "../../asset";
import {useEffect, useState} from 'react';
import {ClubDAOContract, myERC20Contract,myERC721Contract, web3} from "../../utils/contracts";
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const LotteryPage = () => {

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [accountAdd,setAccountAdd] = useState(0)
    const [accountVoteLeft,setAccountVoteLeft] = useState(0)
    const [rProposalName, setrProposalName] = useState('')
    const [proposalAgree, setProposalAgree] = useState(0)
    const [proposalDisagree, setProposalDisagree] = useState(0)
    const [proposalFinalResult, setProposalFinalResult] = useState('')
    const [proposalTime, setProposalTime] = useState(0)
    const [time, setTime] = useState(0)

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getLotteryContractInfo = async () => {
            if (ClubDAOContract) {
                /*const ma = await lotteryContract.methods.manager().call()
                setManagerAccount(ma)
                const pn = await lotteryContract.methods.getPlayerNumber().call()
                setPlayerNumber(pn)
                const pa = await lotteryContract.methods.PLAY_AMOUNT().call()
                setPlayAmount(pa)
                const ta = await lotteryContract.methods.totalAmount().call()
                setTotalAmount(ta)*/
            } else {
                alert('Contract not exists.')
            }
        }

        getLotteryContractInfo()
    }, [])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                addProposalTimes()
                voteProposalLeftTimes()
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    //领取空投
    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.airdrop().send({
                    from: account
                })
                alert('You have claimed ClubCoin.')
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                voteProposalLeftTimes()
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    //获取当前时间
    const getTime = () => {
        setTime(Date.parse(new Date().toString())/1000)             
        return Date.parse(new Date().toString())/1000
    }

    //获取用户发起提案次数
    const addProposalTimes = async () =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract) {
            try {
                const thisAccountAdd = await ClubDAOContract.methods.getAddProposalTimes(account).call()
                setAccountAdd(thisAccountAdd)
            } catch (error: any) {
                alert('Cannot read proposal.')
            }
        } else {
            alert('Contract not exists.')
        }
    }

    //获取用户剩余投票次数
    const voteProposalLeftTimes = async () =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract) {
            try {
                const thisAccountVote = await ClubDAOContract.methods.getVoteProposalTimes(account).call()
                
                if (thisAccountVote >= 5){
                    setAccountVoteLeft(0)
                }
                else {
                    setAccountVoteLeft(5 - thisAccountVote)
                }
                
                //setAccountVoteLeft(thisAccountVote)
            } catch (error: any) {
                alert('Cannot read proposal.')
            }
        } else {
            alert('Contract not exists.')
        }
    }

     //发起提案（参数：提案名称） 
    const addProposal = async (proposalName:string) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(ClubDAOContract.options.address,2500).send({
                    from: account
                })
                await ClubDAOContract.methods.addProposal(proposalName, getTime()).send({
                    from: account
                })
                alert('You add a proposal successfully.')
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                addProposalTimes()
            } catch (error: any) {
                alert('Cannot add proposal.')
            }
        } else {
            alert('Contract not exists.')
        }
    }

    //读取提案（参数:提案编号）
    const readProposal = async (proposalIndexR:number) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract) {
            try {
                const thisProposalName = await ClubDAOContract.methods.getProposalName(proposalIndexR).call()
                setrProposalName(thisProposalName)
            } catch (error: any) {
                alert('Cannot read proposal.')
            }
        } else {
            alert('Contract not exists.')
        }
    }

    //投票提案（参数：提案编号） 
    const voteProposal = async (vote:number , proposalIndexA:number) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(ClubDAOContract.options.address,1000).send({
                    from: account
                })

                await ClubDAOContract.methods.voteProposal(vote, proposalIndexA, getTime(),account).send({
                    from: account
                })
                alert('You vote for a proposal successfully.')
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                voteProposalLeftTimes()
            } catch (error: any) {
                alert('Cannot vote for proposal.')
            }
        } else {
            alert('Contract not exists.')
        }
    }

    //读取提案当前得票（参数：提案编号）
    const nowProposalAgree = async (proposalIndexN:number) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract) {
            try {
                const thisProposalAgree = await ClubDAOContract.methods.getProposalAgree(proposalIndexN).call()
                setProposalAgree(thisProposalAgree)
            } catch (error: any) {
                alert('Cannot read proposal result.')
            }
        } else {
            alert('Contract not exists.')
        }
    }
    const nowProposalDisagree = async (proposalIndexN:number) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract) {
            try {
                const thisProposalDisagree = await ClubDAOContract.methods.getProposalDisagree(proposalIndexN).call()
                setProposalDisagree(thisProposalDisagree)
            } catch (error: any) {
                alert('Cannot read proposal result.')
            }
        } else {
            alert('Contract not exists.')
        }
    }

    //刷新提案结果（参数：提案编号）
    const updateProposalResult = async (proposalIndexU:number) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract) {
            try {
                const thisProposalFinalResult = await ClubDAOContract.methods.updateProposalResult(proposalIndexU, getTime()).call()
                setProposalFinalResult(thisProposalFinalResult)
            } catch (error: any) {
                alert('Proposal is still voting.')
            }
        } else {
            alert('Contract not exists.')
        }
    }

    //领取提案通过的奖励（参数：提案编号）
    const getProposalReward = async (proposalIndexG:number) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract && myERC20Contract) {
            try{
                await ClubDAOContract.methods.getProposalReward(proposalIndexG).send({
                    from: account
                })
            }catch (error: any) {
                alert('You have gotten the reward. Or you are not the proposer.')
            }
            updateProposalResult(proposalIndexG)
            if(proposalFinalResult == "Pass"){
                try {
                    await myERC20Contract.methods.reward().send({
                        from: account
                    })
                    alert('You get the reward for a passing proposal.')
                    const ab = await myERC20Contract.methods.balanceOf(account).call()
                    setAccountBalance(ab)
                } catch (error: any) {
                    alert('Cannot get the reward.')
                }
            }
            else{
                alert('Proposal is not passed.')
            }
        }else {
            alert('Contract not exists.')
        }
    }

    //领取纪念品奖励
    const getBonus = async () =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract && myERC721Contract) {
            try {
                await ClubDAOContract.methods.getBonus().send({
                    from: account
                })
                alert('You get the bonus.')
            } catch (error: any) {
                alert('You get the bonus before or add proposals less than three.')
            }
        } else {
            alert('Contract not exists.')
        }
    }

    
    //读取提案剩余时间
    const getProposalTime = async (proposalIndexT:number) =>{  
        if (ClubDAOContract) {
            try {
                //const thisStartTime = await ClubDAOContract.methods.getStartTime(proposalIndexT).call()
                const endTime = await ClubDAOContract.methods.getEndTime(proposalIndexT).call()
                if (endTime > time){
                    setProposalTime(endTime - time)
                }
                else {
                    setProposalTime(0)
                }
            } catch (error: any) {
                alert('Cannot get time.')
            }
        } else {
            alert('Contract not exists.')
        }
    }


    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    let proposalName = ""   //提案名
    let proposalIndexR = 0  //编号：用于读取提案
    let proposalIndexA = 0  //编号：用于支持提案
    let proposalIndexD = 0  //编号：用于反对提案
    let proposalIndexN = 0  //编号：用于读取提案当前结果
    let proposalIndexU = 0  //编号：用于刷新提案
    let proposalIndexG = 0  //编号：用于获得提案奖励
    let proposalIndexT = 0  //编号：用于读取时间

    const addProposal_ = async () =>{
        await addProposal(proposalName)
    };
    const readProposal_ = async () =>{
        await readProposal(proposalIndexR)
    };
    const agreeProposal_ = async () =>{
        await voteProposal(1,proposalIndexA)
    };
    const disagreeProposal_ = async () =>{
        await voteProposal(0,proposalIndexD)
    };
    const nowProposalResult_ = async () =>{
        await nowProposalAgree(proposalIndexN)
        await nowProposalDisagree(proposalIndexN)
    };
    const updateProposalResult_ = async () =>{
        await updateProposalResult(proposalIndexU)
    };
    /*
    const finalProposalResult_ = async () =>{
        await finalProposalResult(proposalIndexE)
    };
    */
    //读取提案剩余时间
    const getProposalTime_ = async () =>{
        await getTime()
        await getProposalTime(proposalIndexT)
    }
    //领取提案通过的奖励
    const getProposalReward_ = async () =>{
        await getProposalReward(proposalIndexG)
    };
    //领取纪念品（发3次提案）
    const getBonus_ = async () =>{
        await getBonus()
    }
    /*const readBonusID_ = async () =>{
        await readBonusID()
    }*/

    return (
        <div className='container'>
            <Image
                width='100%'
                height='150px'
                preview={false}
                src={Header}
            />
            <div className='main'>
                <h1>学生社团DEMO</h1>
                <Button onClick={onClaimTokenAirdrop}>领取社团币空投</Button>
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>发起提案次数：{accountAdd}</div>
                    <div>剩余投票次数：{accountVoteLeft}</div>
                    <div>当前用户拥有社团币数量：{account === '' ? 0 : accountBalance}</div>
                </div>
                <div>发起提案：2500社团币/次  为社团发展贡献你的idea!</div>
                <div>提案通过可获得5000社团币奖励，累计三次发起提案还可以获得纪念品奖励！</div>
                提案<input onChange={(event)=>proposalName = event.target.value}/>
                <Button onClick={addProposal_}>发起提案</Button>
                <div></div>
                <div>输入提案编号，读取现有提案！</div>
                编号：<input onChange={(event)=>proposalIndexR = +event.target.value}/>
                <Button onClick={readProposal_}>读取提案</Button>  提案名：{rProposalName}
                <div></div>
                <div>投票提案：1000社团币/次  为社团发展贡献你的想法！</div>
                编号：<input onChange={(event)=>proposalIndexA = +event.target.value}/>
                <Button onClick={agreeProposal_}>同意提案</Button>
                <div></div>
                编号：<input onChange={(event)=>proposalIndexD = +event.target.value}/>
                <Button onClick={disagreeProposal_}>反对提案</Button>
                <div></div>
                <div>输入提案编号，读取提案状态！</div>
                编号：<input onChange={(event)=>proposalIndexN = +event.target.value}/>
                <Button onClick={nowProposalResult_}>当前票数</Button>  支持：{proposalAgree}  反对：{proposalDisagree}
                <div></div>
                编号：<input onChange={(event)=>proposalIndexT = +event.target.value}/>
                <Button onClick={getProposalTime_}>剩余时间</Button>    提案剩余时间：{proposalTime}
                <div></div>
                <div>刷新提案，查看投票结果，提案通过还可以领取奖励！</div>
                编号：<input onChange={(event)=>proposalIndexU = +event.target.value}/>
                <Button onClick={updateProposalResult_}>刷新提案</Button>    最终结果：{proposalFinalResult} 
                <div></div>
                编号：<input onChange={(event)=>proposalIndexG = +event.target.value}/>
                <Button onClick={getProposalReward_}>领取提案奖励</Button>
                <div></div>
                <div>累计三次发起提案可以领取纪念品奖励，感谢你对社团发展的贡献！</div>
                奖励：<Button onClick={getBonus_}>领取纪念品</Button>
                <div></div>
            </div>
        </div>
    )
}

export default LotteryPage

//                <div></div>
//编号：<input onChange={(event)=>proposalIndexE = +event.target.value}/>
//<Button onClick={finalProposalResult_}>提案结果</Button>  最终结果：{proposalFinalResult}
//                <input type="number" onChange={(event)=>proposalIndex = event.target.value}/>

    /*读取提案最终结果（参数：提案编号）
    const finalProposalResult = async (proposalIndexE:number) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract) {
            try {
                const thisProposalFinalResult = await ClubDAOContract.methods.getProposalFinalResult(proposalIndexE, getTime()).call()
                setProposalFinalResult(thisProposalFinalResult)
            } catch (error: any) {
                alert('Cannot read proposal result.')
            }
        } else {
            alert('Contract not exists.')
        }
    }*/

        /*//辅助调试：读取提案开始时间
    const getStartTime = async (proposalIndexT:number) =>{  
        if (ClubDAOContract) {
            try {
                const thisStartTime = await ClubDAOContract.methods.getStartTime(proposalIndexT).call()
                setStartTime(thisStartTime)
            } catch (error: any) {
                alert('Cannot get time.')
            }
        } else {
            alert('Contract not exists.')
        }
    }*/

    /*读取提案信息
    const getProposalInfo = async () => {
        if (ClubDAOContract) {
            try {
                const proposalIndex = await ClubDAOContract.methods.getProposalIndex().call({from: account})
                const proposalIndexs = proposalIndex.map((item: number) => +item)
                const proposalsInfo = await Promise.all(proposalIndexs.map(async (index:number) => {
                    try {
                        const proposalInfo = await ClubDAOContract.methods.getProposalInformation(index).call({from: account})
                        return {
                                index:index,
                                proposer:proposalInfo[0],
                                startTime:proposalInfo[1],
                                endTime:proposalInfo[2],
                                content:proposalInfo[3],
                                finish:proposalInfo[4]
                            }
                        } catch (error: any) {
                            alert('Update Contract Error!')
                        }
                    }))
                    console.log(proposalsInfo)
                    setproposal(proposalsInfo.reverse())
                } catch (error: any) {
                    alert('Update Contracts Error!')
                }
            } else {
                alert('Update Contract Error!!')
            }
        }
        //自动更新
        useEffect(() => {
            if (account !== '') {
                getProposalInfo()
            }
        },[account])
        */

            /*//反对提案（参数：提案编号） 
    const disagreeProposal = async (proposalIndexD:number) =>{  
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (ClubDAOContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(ClubDAOContract.options.address,1000).send({
                    from: account
                })

                await ClubDAOContract.methods.disagreeProposal(proposalIndexD, getTime()).send({
                    from: account
                })
                alert('You vote for a proposal successfully.')
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                voteProposalLeftTimes()
            } catch (error: any) {
                alert('Cannot vote for proposal.')
            }
        } else {
            alert('Contract not exists.')
        }
    }*/