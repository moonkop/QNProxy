const WebSocket = require('ws');//引入模块
let requestPool = {};
let requestId = 0;
let buildRequest=(clientId,request)=>{
    let obj = {client: clientId,id: requestId++,request};
    requestPool[obj.id] = obj;
    return obj;
}
const wsServer = new WebSocket.Server({port: 12354});//创建一个WebSocketServer的实例，监听端口8080
const wsClient = new WebSocket.Server({port: 12355});

let wsClients={};
let currentClientID = 0;
let wsServerInst = undefined;
wsClient.on('connection',
    function connection(ws){
        let clientId = currentClientID;
        clientId++
        wsClients[clientId] = ws;
        console.log(' wsClient connected',ws,clientId);
        ws.on('message',function incoming(message){
            console.log('wsClient: %s',message);
            let request = buildRequest(clientId,message);
            if (wsServerInst){
                wsServerInst.send(JSON.stringify(request));
            }else{
                console.log('server 未连接');
            }
        });//当收到消息时，在控制台打印出来，并回复一条信息
    });

wsServer.on('connection',function connection(ws){
    wsServerInst = ws;
    console.log('wsServer connected',wsServerInst);
    ws.on('message',function incoming(message){
        console.log('wsServer: %s',message);
        message = JSON.parse(message);
        wsClients[message.client].send(JSON.stringify(message));
    });//当收到消息时，在控制台打印出来，并回复一条信息
});

