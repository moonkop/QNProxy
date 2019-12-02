const WebSocket = require('ws');//引入模块
let requestPool = {};
let requestId = 0;
let buildRequest=(clientId,request)=>{
    let obj = {client: clientId,id: requestId++,request:JSON.stringify(request)};
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
        currentClientID++
        wsClients[clientId] = ws;
        console.log(' wsClient connected',clientId);
        ws.on('message',function incoming(req){
            req = JSON.parse(req);
            if (req.category == 'LOG'){
                console[req.type].apply(null,req.content)
                return;
            }
            console.log('wsClient:',req);
            let request = buildRequest(clientId,req);
            if (wsServerInst){
                wsServerInst.send(JSON.stringify(request));
            }else{
                console.log('server 未连接');
            }
        });
    }
);

wsServer.on('connection',function connection(ws){
    wsServerInst = ws;
    console.log('wsServer connected');
    ws.on('message',function incoming(message){
        message = JSON.parse(message);
        console.log('wsServer: incoming',message);
        wsClients[message.client].send(JSON.stringify(message));
    });
});

