# NEBULA DUEL
... zero player game built on Cartesi.

![image](frontend/public/HomePage.png)

Nebula duel is built for persons that love the thrills and entertainment of the gaming world. Players get to purchase their favorite warriors, create duels or join already created ones. At the end of each duel, only one winner emerges.


## COMPONENTS OF NEBULADUEL
#### Backend bulit with rust and deployed on Cartesi (Base network).
#### Frontend Built with react and a complex integration with 3d models.
#### Relayer built with nodejs and ethers.


## User interaction flow:
- Users basically interact with the frontend by signing a transaction with their wallets. they only need to sign this transactions hence they do not pay gas fees for that.
- Their signed transactions are sent to out backend which verifies the signatures then relays these transactions to out smart contract on BASE Sepolia (Input box contract).
- Information relayed to our dapp is picked up by the Cartesi Node and sent to out logic implementation on cartesi where teh execution is carried out before being sent back to the Base.
- Information on out frontend are picked up from our subgraph made available by cartesi.

![image](frontend/public/purchase_characters.png)

**How to get started**

## Create profile

Players can create profiles seamlessly on the platform simply by connecting a wallet and then navigating to the `profile` page and passing in: <br/>
i. Name ( can be nickname ) <br/>
ii. Preferred avatar

Note that this process requires the player to sign a transaction, so wait for wallet to pop up, then sign and wait for the transaction to be completed on-chain. <br/>
Upon a successful registration, 1000 points are minted to each player for use to purchase his/her preferred warriors.
<br/>
<br/>


## Buy warriors

Every player needs at least three warriors for the duels. Warriors are player characters with various attributes and qualities that are used for engaging in duels.
Every warrior has attributes: health, strength and attack in different degrees. The cost for each warrior is a reflection of the attributes it possesses. 

To purchase a warrior, go to your profile page, select the preferred warriors and then buy. **NOTE** Every player gets free 1000 points after profile creation to purchase characters, and when the 1000 points are exhausted the player can buy more points using the $nebular token. 
<br/>
<br/>

## Create duel

Players can create new duel or join already created duels. To create a new duel:

i. Go to the homepage, click on PLAY NOW <br/>
ii. From the modal that'll pop up, select `create duel`. <br/>
iii. Select your warriors, sign the transaction and continue.

<br/>
<br/>


## Join duel

i. Click on PLAY NOW <br/>
ii. Click on `join duel`. <br/>
iii. Select your warriors, select a strategy, sign the transaction and continue.

<br/>

When in the duel arena, click on `start` button for the duel to begin.
<br/>
<br/>
At the end of each duel, one player wins. The winning characters add to their experience and points, and the higher the points the more valuable the characters are. Such valuable characters can be sold for $nebular token on the platform (the marketplace will be implemented in the v2). The $nebular token is an ERC20 token with real value.

<br/>
<br/>

### Developers

Bugs reports and suggestions:
If you discover a bug or would like to suggest a feature, please open an issue in the repository.



## OTHER IMAGES 

### PURCHASE CHARACTERS
![image](frontend/public/purchase_characters.png)


### CREATE DUELS
![image](frontend/public/create_duel.png)


### VIEW AVAILABLE DUELS
![image](frontend/public/Available_duels.png)


### BATTLE
![image](frontend/public/battle.png)

