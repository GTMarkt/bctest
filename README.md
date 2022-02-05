# INTRODUCTION
<hr>
These codes are a complete set of blockchain and its support modules, such as block creator, validator, peer-to-peer, and many more!
I originally got this from Udemy courses, but when I tried to combine with another tutorial, comparisons show that the code from
another sources are slightly different and make no differences in performance, instead, Udemy's in my opinion much more perfect, since
this one also included with test for the modules and files inside it.

Originally, created for the academic purpose, but will be publicly available for people who wants to study more about blockchain 
or quick base code of a new blockchain and to make your own new cryptocurrency.

This version needs more improvement and development later on. Any changes, suggestions or improvements are welcome.

Note: I do not own the license of this code. Refer to Udemy's course: 
<br>

# EXPLANATION
<hr>
These files will give you a simple code of how to build cryptocurrencies yourself, based on NodeJS and paired together with ExpressJS.
<br>

## PREPARATION
You will need:
* Internet connection
* Postman (find out more [HERE](https://www.postman.com/))
* Your favorite code editor
* Your favorite terminal/shell
* NodeJS (make sure npm also recognized in your terminal)
<br>

## RUNNING THE PROGRAM
1. In the root path of the folder, try to run your terminal
2. Change the directory of the terminal into the pu-chain folder, example:
```
cd D:/<PATH_TO_PU_CHAIN>
```
Make sure the terminal is now in the root folder. For me, Windows Command Prompt has shown me:
```
PS C:\Users\Guest\Desktop\pu-chain>
```
3. Next, type "npm install" and hit ENTER. Wait for all modules to finish installed
4. If you are done with step number 3, proceed to type "npm run test" to check. Make sure all test run successfully,
if not, please contact me as soon as possible, I will try to fix the bug
5. Open at least two terminals. Make sure both of them are in the position of the pu-coin folder (see steps 1-2)
6. For the first terminal, run "npm run dev"
7. For the second terminal, depend on what type of terminal you use, you need to type different commands. If you use:
   - Windows CMD: "set HTTP_PORT=3002 && set P2P_PORT=5001 && set PEERS=ws://localhost:5001 && npm run dev"
   - Bash-based: "HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev"
   and run it
8. Using Postman, open 4 new tabs
   - First tab, set the request to "GET" and type the address to "localhost:3002/public-key". Here, we want to get
     the recipient's address wallet from the 1st peer "point-of-view" (since we only establish 2 peers). Hit SEND and
     copy the result of the encryption
   - Second tab, set the request to "POST" and type in the address "localhost:3001/transact". Then, in the Body > raw, set
     type to JSON and type
     ```
     {
     "recipient": "PASTE_THE_PREVIOUS_LONG_KEY_HERE",
     "amount": ANY_AMOUNT_LESS_THAN_500
     }
     ```
     for me, I did this:
     ```
     {
     "recipient": "041052a0bc815f72587693eb01c6db31e0e840b0cf8e178d3b30d6c164801a5ff2e98ef7536f7ae2011e84c363f57ba112a
                        93ff9f276ef7c237b7f9aa6ac4e6a2c",
     "amount": 50
     }
     ```
     if done, hit SEND (preferable multiple times and make sure you don't exceed 500 in total!). Here, we could see
     the sender's transactions and balance after doing transactions.
   - Third tab, set the request type to "GET" and the address to "localhost:3002/transactions" and hit SEND once. What we
     see here is the result of pending transactions in the pool, waiting for the miner to verify and hash it, so the miners
     will add it to our chain of blocks (we call it blockchain)
   - Fourth tab, set the request to "GET" and the address to "localhost:3002/mine-transactions". Here, we see the result
     of the transactions that were mined by the miners on the third tab and just now were appended to our chain. The pool 
     will also be empty since all pending transactions have been appended to chain. You could check it yourself by reperform
     the third tab.
9. Done. You performed basic operation of the blockchain. Feel free to explore more into the world of blockchain-cryptocurrency

## NOTES
* Any suggestions, edits and suggestions are preferred via pull request
* You are free to edit this code locally in your workspace. This is only for base "shape" of the code
* Any changes will be written in changelog
<br>